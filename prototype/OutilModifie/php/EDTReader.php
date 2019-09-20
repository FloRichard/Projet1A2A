<?php
header('Content-type: text/json');
require_once("iCalReader.class.php");


require_once("AdeEdtReader.class.php");
//$myAdeEdtReader = new AdeEdtReader();

//or with the whole set of arguments for settings outside of the university of Caen

$myAdeEdtReader = new AdeEdtReader(
        array(
            "proxy"=>"",
            "ade_url"=>"http://ade.unicaen.fr:80/jsp/custom/modules/plannings/anonymous_cal.jsp",
            "projectId"=>1,
            "examCodes"=>array("CTRL","Examen","Ctrl","CTP")
        )
);


$result=$myAdeEdtReader->retrieveEDT($_GET["ressource"], $_GET["format"]);
echo json_encode($result);

?>