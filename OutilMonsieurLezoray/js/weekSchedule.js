/**
    @file weekSchedule.js
    @date October 21, 2018
      @author Olivier Lézoray
      @version 1.0
      @description
      This Javascript file contains functions useful to generate the schedule for one week.
 **/
/**
	* Generates two arrays of ADE Codes and Ressources from an organized multidimensional associative array
	* 
	* @param {array} object  A multidimensional associative array
	* @param {array} result  An array of all the ADE ressources
	* @param {array} result2 An array of all the ADE groups
	* @param {key}   key A key from the associative array
	* @param {depth} depth The depth of exploration of the multidimensional associative array 
	* @returns {none}
*/
function generateListOfRessourcesAndGroups(object,result,result2,key="",depth=0) {
    for (var i in object) {
    	var _key;
    	if(key=="") _key=i;
    	else _key=key+" "+i;
        // i  is the name of the property
        if(depth==0) result2.push(_key);
        if (typeof(object[i]) == ("object")) {
            generateListOfRessourcesAndGroups(object[i],result,result2,_key,depth+1);
            result[_key]="";
            for(var j in object[i]) {
            	result[_key]+=result[_key+" "+j]+",";
            }
	            //remove last ","
            result[_key]=result[_key].slice(0, -1);
        }
        else {
            result[_key]=""+object[i];
        }
    }
}
/**
	* Generates a set of options from _ADEGroups
	* and affects this to the div of id _theid
	*
	* @param {string} _theid  	  The select that contains the list
	* @param {array}  _ADEGroups  An array of all the ADE groups
	* @returns {none} 
*/
function generatePromotionOptions(_theid, _ADEGroups){	  		  	
	var s="<option value=\"\">Faites votre choix</option>";
	for(var i in _ADEGroups){
		s+="<option value=\""+_ADEGroups[i]+"\">"+_ADEGroups[i]+"</option>";
	}
	$('#'+_theid).html(s);
}
/**
	* Generates a set of options from the global var ADERessources
	* and affects this to the div of id #choiceOfRessource
	* 
	* @param {array}  _ADERessources  	An array of all the ADE ressources
	* @param {string} _edtid  	  		The div that contains the schedule
	* @param {string} _ressourceID  	The id of the ressource selection
	* @param {string} _promotionID  	The id of the promotion selection
	* @returns {none}
*/
function generateChoiceWithOption(_ADERessources,_edtid,_ressourceID,_promotionID){
	var _choice=$('#'+_promotionID).val();
	if(_choice=="") {
		$('#'+_ressourceID+'Label').hide();
		$('#'+_ressourceID).hide();
	}
	else {
		$('#'+_ressourceID+'Label').show();
	  	$('#'+_ressourceID).show();
	  	var s="<option value=\"\">Faites votre choix</option>";
	  	for(var i in _ADERessources){		  		
	  		if(i.search(_choice)!=-1) s+="<option value=\""+_ADERessources[i]+"\">"+i+"</option>";
	  	}
	  	$('#'+_ressourceID).html(s);
	}
	resetEDT(_edtid);
}
/**
	* Resets the whole display of the schedule (_webservice and _format are global vars)
	* 
	* @param {string} _edtid  	  	 The div that contains the schedule
	* @returns {none}
*/
function resetEDT(_edtid){
	displayEDT(_webservice,"",_format,"#"+_edtid);
}
/**
	* Shows the whole display of the schedule from the selected ressource (_webservice and _format are global vars)
	* 
	* @param {string} _ressource  The ressource to be displayed
	* @param {string} _edtid  	  The div that contains the schedule
	* @returns {none}
*/
function showEDT(_ressource,_edtid){	
	$("#"+_edtid).html("<p class=\"text-left\">Interrogation de ADE en cours, patientez<br/><img src='img/loading.gif' /></p>");
	displayEDT(_webservice,_ressource,_format,"#"+_edtid);
}	  


 