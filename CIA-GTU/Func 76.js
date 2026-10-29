console.log("Function76", context);

let backgroundColor;
let color;

if (docData.STATUS === "Actif") {
  backgroundColor = "#D0EACD";
}

if (docData.STATUS === "Inactif") {
  backgroundColor = "#F4E3C0";
}
if (docData.STATUS === "Soumise") {
  backgroundColor = "#d2f9f9";
  color = "#012834";
}

if (docData.STATUS === "Draft") {
  backgroundColor = "#F1F1F1";
  color = "#000000";
}

if (docData.STATUS === "Assignée") {
  backgroundColor = "#C7F9CC";
}
if (docData.STATUS === "En traitement") {
  backgroundColor = "#ffff00";
}
if (docData.STATUS === "Recherche en cours") {
  backgroundColor = "#FFFCD4";
}

if (docData.STATUS === "À assigner") {
  backgroundColor = "#E3FFE5";
}

if (docData.STATUS === "Planifiée") {
  backgroundColor = "#C5CFF6";
  color = "#000517";
}
if (docData.STATUS === "Confirmée") {
  backgroundColor = "#e5cbe6";
  color = "#2F012F";
}
if (docData.STATUS === "En route") {
  backgroundColor = "#F7E6A3";
  color = "#2B2100";
}
if (docData.STATUS === "Complétée") {
  backgroundColor = "#C9DFC3";
  color = "#022914";
}
if (docData.STATUS === "Annulée") {
  backgroundColor = "#F0C5C5";
  color = "#341502";
}
if (docData.STATUS === "Appariée") {
  backgroundColor = "#E9E3B7";
  color = "#2B2500";
}
if (docData.STATUS === "Payée") {
  backgroundColor = "#CCC6A1";
  color = "#2B2500";
}
if (docData.STATUS === "Facturée") {
  backgroundColor = "#B1B398";
  color = "#2B2500";
}
if (docData.STATUS === "Remboursée") {
  backgroundColor = "#B1B398";
  color = "#2B2500";
}
if (docData.STATUS === "Non-Complétée") {
  backgroundColor = "#F1E1D6";
  color = "#340203";
}
if (docData.STATUS === "Refusée") {
  backgroundColor = "#E6D9CB";
  color = "#2E1600";
}
  
if (docData.STATUS === "Attente imprévue") {
  backgroundColor = "#F9B48E";
  color = "#2B2500";
  }
  
if (docData.STATUS === "Prise en charge") {
  backgroundColor = "#C9B6E4";
  color = "#2B2500";
  }
if (docData.STATUS === "En route - Retour") {
  backgroundColor = "#9ED9D6";
  color = "#2B2500";
  }
if (docData.STATUS === "En route - Aller") {
  backgroundColor = "#A9CCEB";
  color = "#2B2500";
  }
if (docData.STATUS === "Arrivé à destination") {
  backgroundColor = "#A8DABD";
  color = "#2B2500";
  }

  
  
return { backgroundColor: backgroundColor, color: color };

