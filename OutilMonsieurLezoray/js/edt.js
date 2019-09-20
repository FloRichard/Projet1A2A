  /**
    @file edt.js
    @date October 21, 2018
      @author Olivier Lézoray
      @version 1.0
      @description
      This Javascript file contains functions useful to make queries to the AdeEdtReader webservice (see php file).
  **/
  var _date;
  /**
   * Function used to compare two elements of an array according to the date they represent
   * @param {Date}   element   the searched element
   * @param {int}   index   the index of the element to compare with
   * @param {array}   array   the array in which to search for
   * @returns {boolean} true if this is the searched element
  **/
  function cherche(element,index,array){      
    if(element.getTime()==_date.getTime()) return true;
  else return false;
  }  
  /**
   * Function used to generate the content of a div with an ADE schedule
   * @param {String}  webservice   the queried AdeEdtReader PHP Webservice
   * @param {String} _ressource   the ressource for which to retrive the schedule
   * @param {String} _format      the format of the schedule to retrieve (day or week)
   * @param {String} idOfDiv      the id of the HTML element to populate with the schedule
   * @returns {none}
  **/
  function displayEDT(webservice,_ressource,_format,idOfDiv) {        
      var tasks=[];
      var tab_jour=new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
      $.getJSON(webservice,
        {"ressource":_ressource,"format":_format},
        function(data){
          if(Array.isArray(data) && data.length>0){ 
              var days=[];
              var typeOfCours=[]; 
              var _column=0;     
            data.forEach(
              function traitement(objet) {   
                var _day=objet.jour;
                var _month=objet.mois;
                var _year=objet.annee;
                _date=new Date(_year,_month-1,_day);
                var trouve=false;
                if(days.length>0) {
                  trouve=days.findIndex(cherche);
                  if(trouve>=0) trouve=true;
                  else trouve=false;
                }
                if (days.length==0 || !trouve) {
                  days.push(_date);
                  if(days.length>1) _column++;
                }
                var cours=objet.cours;
                var typeCours=objet.typeCours;
                var salle=objet.salle;
                var enseignant=objet.enseignant;
                var hDebut=objet.hDebut;
                var hFin=objet.hFin;  
                var horaire=hDebut+"-"+hFin;
                var groupe=objet.groupe;
                var a = hDebut.split(':'); 
                var start = (+a[0]) + (+a[1]/60);
                a=hFin.split(':'); 
                var end = (+a[0]) + (+a[1]/60);
                var duration=end-start;

                var task = {
                    startTime: start,
                    duration: duration,
                    column: _column,
                    title: cours,
                    typeCours:typeCours,
                    salle:salle,
                    enseignant:enseignant,
                    horaire:horaire,
                    groupe:groupe
                  };
                tasks.push(task);               
              }
            );            
          var _headers=[];
          for(i=0; i<days.length;i++ ){
            var ladate=days[i];   
            var s=tab_jour[ladate.getDay()]+" "+ladate.getDate()+"/"+(ladate.getMonth()+1)+"/"+eval(ladate.getYear()+1900);
            _headers.push(s);
          }
            $(idOfDiv).skeduler({
              headers: _headers,
              tasks: tasks,
              cardTemplate: '<div>${title} - #${salle}</div><div>${enseignant}</div><div>${horaire}</div>',
              onClick: function (e, t) {  }
            });
            
          }
          else {
            var ladate=new Date();
            var s=tab_jour[ladate.getDay()]+" "+ladate.getDate()+"/"+(ladate.getMonth()+1)+"/"+eval(ladate.getYear()+1900);
            var _headers=[];
            _headers.push(s);
            $(idOfDiv).skeduler({
              headers: _headers,
              tasks: [],
              cardTemplate: '<div>${title} - #${salle}</div><div>${enseignant}</div>',
              onClick: function (e, t) {  }
            });
          }         
        }
      );        
  }
/**
   * Function to display the current year
   * @param {String} id the id of the html element to display the date
   * @returns {String} the current year
  **/
function displayDate(_id){
  var dt = new Date();
  dt=dt.getYear()+1900;
  $("#"+_id).html(dt);
}
/**
   * Function used to generate the content of a div with an ADE schedule for a given hour
   * @param {String}  webservice   the queried AdeEdtReader PHP Webservice
   * @param {String} _ressource   the ressource for which to retrieve the schedule
   * @param {String} _ressourceName   the name of the ressource for which to retrieve the schedule
   * @param {String} idOfDiv      the id of the HTML element to populate with the schedule
   * @returns {none}
  **/
function displayEDTOfAnHour(webservice,_ressource,_ressourceName,idOfDiv) {
  var tasks=[];
  $.getJSON(webservice,
        {"ressource":_ressource,"format":_format},
        function(data){
          if(Array.isArray(data) && data.length>0){ 
            data.forEach(
              function traitement(objet) {   
                var _day=objet.jour;
                var _month=objet.mois;
                var _year=objet.annee;
                var cours=objet.cours;
                var typeCours=objet.typeCours;
                var salle=objet.salle;
                var enseignant=objet.enseignant;
                var hDebut=objet.hDebut;
                var hFin=objet.hFin;  
                var horaire=hDebut+"-"+hFin;
                var groupe=objet.groupe;

                var task = {
                    date : _day+"/"+_month+"/"+_year,
                    title: cours,
                    typeCours:typeCours,
                    salle:salle,
                    enseignant:enseignant,
                    horaire:horaire,
                    groupe:groupe
                  };
                tasks.push(task);               
              }
            );
            var res="";
            tasks.forEach(function(task){
                res+="<li>";
                res+="<h1>"+_ressourceName+"</h1>";
                res+="<h2>"+task.horaire+" "+task.title+"</h2>";
                res+="<h3>"+task.date+" "+task.groupe+" ";
                res+=task.enseignant+" #"+task.salle+"</h3>";
                res+="</li>";
              }
            );          
            $("#"+idOfDiv).append(res);
          }
        }
      );

}
