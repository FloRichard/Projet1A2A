<?php
/**
 * This PHP-Class can be used to make queries to an ADE server 
 *
 * PHP Version 5
 *
 * @category Webservice
 * @author   Olivier Lézoray <olivier.lezoray@unicaen.fr>
 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
 * @version  1.0
 */
require_once("iCalReader.class.php");
/**
 * AdeEdtReader class
 *
 */
class AdeEdtReader {
	private /** @type {string} */ $proxy="tcp://proxy.unicaen.fr:3128";
	private /** @type {string} */ $ade_url="http://ade.unicaen.fr:80/jsp/custom/modules/plannings/anonymous_cal.jsp";
	private /** @type {int} */ $projectId=1;
	private /** @type {string} */ $cxContext="";
	private /** @type {array} */ $examCodes=array("CTRL","Examen","Ctrl","CTP");
	private /** @type {int} */ $hourDelay=15;
	/** 
     * Creates the AdeEdtReader Object
     * 
     * @param {array}  $arguments An associate array containing the properties to be initialized
     *
     * @return Object The AdeEdtReader Object
     */ 
	public function __construct(array $arguments = array()){
		if(!empty($arguments)){
			foreach($arguments as $property=>$argument){
				if(isset($argument)) $this->{$property}=$argument;
			}
		}
		if($this->proxy!=""){
		    $aContext = array(
		        'http' => array(
		            'proxy' => $this->proxy,
		            'request_fulluri' => true,
		        ),
		    );
		    $this->cxContext = stream_context_create($aContext);
		}
	}
	/** 
     * Generic Getter
     * 
     * @param {string} $name 		A property name
     *
     * @return {string}
     */ 
	public function __get($name){
		return $this->$name;
	}
	/** 
     * Generic Setter
     * 
     * @param {string} $name 		A property name
     * @param {any}    $value 		The new property value
     *
     * @return {None}
     */
	public function __set($name, $value){
		$this->$name=$value;
	}
	/** 
     * Generic Setter
     * 
     * @param {string} 	  $ressource 	An ADE ressource ID
     * @param {string}    $format 		The format of event to be retrieved (by week or by day)
     *
     * @return {array} an array of events extracted from the iCAL of the ADE server
     */
	public function retrieveEDT($ressource,$format){
		if(!isset($ressource) || $ressource=="" || !isset($format) || $format=="") return [];
		if(($format=="day" || $format=="week" || $format=="hour")) {
	        $heureete=date("I");
	        $Today=new DateTime();
	        $Tomorrow=new DateTime();
	        $Tomorrow->modify('+1 day');
	        $adeurl=$this->ade_url . "?resources={$ressource}&projectId={$this->projectId}&calType=ical&nbWeeks=1";	        
	        $ical   = new ICal($adeurl,$this->cxContext);
	        $events = $ical->events();
	        if(sizeof($events)>0)
	            $events=$ical->sortEventsWithOrder($events);
	        $dS=new DateTime();
	        $dE=new DateTime();
	        $result=[];
	        foreach ($events as $event) {   
	            $dS->setTimestamp($ical->iCalDateToUnixTimestamp($event['DTSTART']));
	            $dE->setTimestamp($ical->iCalDateToUnixTimestamp($event['DTEND']));
	            if(!$heureete) {
	                $dS->modify('+1 hour');
	                $dE->modify('+1 hour');
	            }            
	            else {
	                $dS->modify('+2 hour');
	                $dE->modify('+2 hour');
	            }
	            
	            //restrict to the current day for formats day and hour
	            if(($format=="day" || $format=="hour") &&
	            	$Today->format('d/m/Y')!=$dS->format('d/m/Y')) continue;
	            
	            //restrict to the current hour (with +/- a possible delay) for format hour	            

	            $delay=new DateInterval("PT" . $this->hourDelay."M");
	            $start=new DateTime($Today->format('Y-m-d H:i:s'));
	        	$start->add($delay);
	            $end=new DateTime($Today->format('Y-m-d H:i:s'));
	        	$end->sub($delay);
	            if($format=="hour" && !(
			            (
			            	//the course is actually in progress
			            	strcmp($Today->format('H:i'),$dS->format('H:i'))>0
					        && strcmp($Today->format('H:i'),$dE->format('H:i'))<0
					    )
			        	||				        
						(
							//the course is about to begin
							(
								strcmp($start->format('H:i'),$dS->format('H:i'))>0 && 
								strcmp($start->format('H:i'),$dE->format('H:i'))<0
							)
							||
							//the course just finished a short time away
							(
								strcmp($end->format('H:i'),$dS->format('H:i'))>0 && 
								strcmp($end->format('H:i'),$dE->format('H:i'))<0
							)
						)
	            	)	            	
	               ) continue;




	            $tab=explode("\\n",$event['DESCRIPTION']);
	            $description=explode(" ",$tab[2]);
	            $groupe=$description[0];

	            //find the type of intervention (CM, TD or TP)
	            $typeCours="TP";
	            preg_match("/\w*CM\w*/", $groupe, $matches);
	            if (count($matches) != 0) $typeCours="CM";
	            else {
	            	preg_match("/\w*TD\w*/", $groupe, $matches);
	                if (count($matches) != 0) $typeCours="TD";
	            }
	            //verify if this an exam by searching in the summary description of the course	            
	            $cours=$event['SUMMARY'];	
	            $exams=implode("|",$this->examCodes);       
	            preg_match("/\w*($exams)\w*/", $cours, $matches);
	            if (count($matches) != 0) {
	                if ($typeCours == "CM") $typeCours="CTRL";
	                else $typeCours="CTP";
	            }	            
	            //extract the teacher of the course
	            $index=4;
	            $trouve=false;
	            while(!$trouve && $index<sizeof($tab)){
	                preg_match("/\((Export|Expo rt)\w*/", $tab[$index], $matches);
	                if (count($matches) != 0) {$trouve=true;$index--;}
	                else $index++;
	            }
	            if($index==sizeof($tab)) $enseignant="";
	            else $enseignant=$tab[$index];

	            //extract the location of the course
	            $salle=str_replace("\,",",",$event['LOCATION']);
	            //Add the event to the result
	            $result[]=array(                
	                "jour"=>$dS->format('d'),"mois"=>$dS->format('m'),"annee"=>$dS->format('Y'),
	                "cours"=>$cours,"typeCours"=>$typeCours,"groupe"=>$groupe,
	                "salle"=>$salle,"enseignant"=>$enseignant,"hDebut"=>$dS->format('H:i'),
	                "hFin"=> $dE->format('H:i'));
	                         	            
	        }
	        return $result;

	    }
	    else return [];
	}

}


?>