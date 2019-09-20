## Description
Outil pour afficher des emploi du temps créés avec ADE

## Principe
Dans l'enseignement supérieur, le logiciel ADE est souvent utilisé pour créer les emploi du temps.
Il possède une fonctionnalité interessante qui consiste à pouvoir visualiser ses créneaux de cours dans son
logiciel favori de calendrier. Pour cela, il faut effectuer un export au format ical. L'URL générée est alors au format suivant :
http://ade.unicaen.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=2480&projectId=1&calType=ical

Dans cette URL apparait un numéro de ressource (resources=2480 dans l'exemple) et plusieurs ressources peuvent être précisées en précisant leurs numéros séparés par des virgules. Pour connaitre le numéro d'une ressource il faut le localiser dans l'URL générée par l'export d'ADE.

En exploitant cette URL il est donc possible de récupérer automatiquement l'emploi du temps d'une ressource et de l'afficher dans un document HTML. C'est ce que permet l'outil proposé. 

Pour cela, un web service nommé "EDTReader.php" est fourni. Il prend deux paramètres passés en GET :
1. le numéro de la ressource pour laquelle on veut l'emploi du temps
2. le format retenu pour l'emploi du temps (parmi "week", "day" ou "hour")
Voici le contenu du fichier PHP de ce web service :
```php
<?php
header('Content-type: text/json');
require_once("iCalReader.class.php");


require_once("AdeEdtReader.class.php");
$myAdeEdtReader = new AdeEdtReader();

//or with the whole set of arguments for settings outside of the university of Caen
/*
$myAdeEdtReader = new AdeEdtReader(
        array(
            "proxy"=>"tcp://proxy.unicaen.fr:3128",
            "ade_url"=>"http://ade.unicaen.fr:80/jsp/custom/modules/plannings/anonymous_cal.jsp",
            "projectId"=>1,
            "examCodes"=>array("CTRL","Examen","Ctrl","CTP")
        )
);
*/

$result=$myAdeEdtReader->retrieveEDT($_GET["ressource"], $_GET["format"]);
echo json_encode($result);
?>
```
Le web service repose sur l'utilisation d'une classe PHP "AdeEdtReader" qui effectue une interrogation du webservice ADE. Ce web service renvoie en réponse du JSON qui contient l'emploi du temps de la ressource pour la semaine entière à venir (week), la journée en cours (day), ou l'heure en cours (hour). Le JSON peut ensuite être récupéré en Javascript coté client et l'emploi du temps affiché dans un document HTML. La figure suivante résume le fonctionnement général d'exploitation du webservice.

### Principe de récupération puis affichage de l'EDT d'une ressource ADE
![Demo une ressource](https://git.unicaen.fr/olivier.lezoray/edt/raw/master/img/demos/SchemaRecapitulatif.png)

### Utilisation de l'outil
Pour pouvoir utiliser le webservice "EDTReader.php", il faut connaître l'URL d'interrogation du webservice d'ADE. Celle-ci peut être récupérée dans l'interface d'export d'ADE.
L'affichage de l'emploi du temps peut alors ensuite se faire de plusieurs manières : 
- statique : l'emploi du temps d'une ressource spécifique est affiché
- interactif : l'emploi du temps d'une ressource est affiché après en avoir choisi une parmi plusieurs
- dynamique : l'emploi du temps de plusieurs ressources est affiché en passant automatiquement toutes les X secondes  d'une ressource à l'autre.
- et encore plein d'autres possibilités

Ces affichages sont d'un fort intérêt pour disposer d'outils de consultation des emploi du temps, comme par exemple celui-ci :
https://www.stlo.unicaen.fr/edt/
mais également pour disposer d'outils d'affichage dynamique des emploi du temps (dans des écrans tactiles ou des écrans d'affichage). Plusieurs exemples d'utilisation sont présentés ci-dessous pour le Département MMI de l'IUT à Saint-Lô. 

Afin de permettre une utilisation simple de l'outil, des fonctions JavaScript sont fournies dans le fichier "weekSchedule.js". Elles permettent d'afficher d'un emploi du temps récupéré au format JSON par le web service "EDTReader.php" sous la forme d'une grille d'emploi du temps. Le script JavaScript ci-dessous (utilisant du JQuery) illustre cela pour afficher l'emploi d'une ressource dans une div.
```html
    <script type="text/javascript"> 		  	
	  	//sets global vars
		//the sole ADE ressource to be diplayed
		var ADERessource=2480;
		//the URL of the EDT Reader webservice
		var _webservice="https://dev-lezoray.users.greyc.fr/edt/php/EDTReader.php";
		//the format of EDT display
		var _format="week";
	  	/**
			* Initializes the whole display of the schedule
			* 
			* @returns {none}
		*/
		$(document).ready(function(){
				displayDate("_date");
				showEDT(ADERessource,"edt");
			}
		);	

	</script>
	
	<div id="edt">
	 	<!-- The div that will display the schedule -->
	</div>
``` 

## Exemples d'utilisation pour le Département MMI de l'IUT à Saint-Lô
### Affichage de l'EDT à la semaine d'une ressource spécifique
![Demo une ressource](https://git.unicaen.fr/olivier.lezoray/edt/raw/master/img/demos/displayEDTOfOneRessource.png)
### Affichage de l'EDT à la semaine avec choix de la ressource parmi plusieurs
![Demo une ressource](https://git.unicaen.fr/olivier.lezoray/edt/raw/master/img/demos/displayEDTWithChoiceOfRessource.gif)
### Affichage de l'EDT à la semaine de plusieurs ressources avec switch automatique entre elles
![Demo une ressource](https://git.unicaen.fr/olivier.lezoray/edt/raw/master/img/demos/displayEDTWithAutomaticSwitch.gif)
### Affichage de l'EDT à la journée de deux ressources simultanément avec switch automatique entre plusieurs ressources
![Demo une ressource](https://git.unicaen.fr/olivier.lezoray/edt/raw/master/img/demos/displayEDTWithTwoAutomaticSwitchByDay.gif)
### Affichage de l'EDT des créneaux horaires se déroulant actuellement, pour plusieurs ressources, avec défilement automatique
![Demo une ressource](https://git.unicaen.fr/olivier.lezoray/edt/raw/master/img/demos/displayEDTsOfCurrentHour.gif)


