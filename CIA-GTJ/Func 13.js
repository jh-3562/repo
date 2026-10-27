//console.log("Function13", context);
let backgroundColor;
let color;
if (docData.STATUS === "Actif") {
  backgroundColor = "#D0EACD";
  color = "#022914";
}
if (docData.STATUS === "Inactif") {
  backgroundColor = "#F4E3C0";
  color = "#1E1400";
}
if (docData.STATUS === "Soumis") {
  backgroundColor = "#C7F9CC";
}

if (docData.STATUS === "Draft") {
  backgroundColor = "#EDEDED";
}

if (docData.STATUS === "Assignée") {
  backgroundColor = "#C7F9CC";
}
if (docData.STATUS === "Non-assigné") {
  backgroundColor = "#eedec9ff";
}

if (docData.STATUS === "Planifié") {
  backgroundColor = "#C5CFF6";
}
if (docData.STATUS === "Confirmé") {
  backgroundColor = "#E5CBE6";
}
if (docData.STATUS === "En attente d'approbation") {
  backgroundColor = "#F7E6A3";
}
if (docData.STATUS === "Complété") {
  backgroundColor = "#C9DFC3";
}
if (docData.STATUS === "Annulé") {
  backgroundColor = "#F0C5C5";
}
if (docData.STATUS === "Appariée") {
  backgroundColor = "#E9E3B7";
}
if (docData.STATUS === "Payée") {
  backgroundColor = "#CCC6A1";
}
if (docData.STATUS === "Facturée") {
  backgroundColor = "#B1B398";
}
if (docData.STATUS === "Non complétée") {
  backgroundColor = "#F1E1D6";
}
if (docData.STATUS === "Refusé") {
  backgroundColor = "#E6D9CB";
}
if (docData.STATUS === "En traitement") {
  backgroundColor = "#9CD1F5";
}
if (docData.STATUS === "Optimisée") {
  backgroundColor = "yellow";
}
if (docData.STATUS === "Optimisé") {
  backgroundColor = "#7EE8D8";
}

return { backgroundColor: backgroundColor, color: color };
