var couleur;


function afficheDate(){
var maintenant=new Date();
var jour=maintenant.getDate();
var mois=maintenant.getMonth()+1;
var an=maintenant.getFullYear();
document.write(jour,"/",mois,"/",an);
}
function getCouleur(couleurDepartement){
	couleur = couleurDepartement;
}
function getCouleurBis(){
	return location.search.substring(1,location.search.length);
}
function changerCouleur(){
		/*couleur=location.search.substring(1);
		document.write(couleur);*/
		couleurDep=location.search.substring(1,location.search.length);
		var bord = document.getElementsByTagName('header');
		bord[0].style.borderBottomColor=couleurDep;
		var bordBis = document.getElementsByClassName('toBorder');
		for(var i=0; i<bordBis.length;i++){
			bordBis[i].style.borderColor=couleurDep;
		}
}
function seDeconnecter(){
	var deconnexion = confirm("Voules-vous vous déconnecter?");
	if(deconnexion==true){
		document.location.href="PageConnexion.html"; 
	}else{

	}
}
function Apropos(){
	window.open('Apropos.html',150,150);
}
function validerResa(){
	var debut = document.getElementById("Debut");
	var deb = debut.value;
	var fin = document.getElementById("Fin");
	var f = fin.value;
	var justi = document.getElementById("Justification");
	var just = justi.value;
	if(f=="" && deb==""){
		alert("Rentrez un créneau");
	}
	else if(f==""){
		alert("Rentrez une fin de créneau");
	}
	else if(deb==""){
		alert("Rentrez un début de créneau");
	}
	else{
		if (just==""){
			var validation = confirm("Voulez-vous réserver sans justificatif ?");
			if (validation==true){
			changerCouleur();document.location='Accueil.html?'+getCouleurBis();
		}else{
			var validation = confirm("Voulez-vous réserver cette salle ?");
				if (validation==true){
				changerCouleur();document.location='Accueil.html?'+getCouleurBis();;
				}
			}

		}
	}
}
