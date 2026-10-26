//console.log('Function 105', context);
let backgroundColor;
let color;
// colors for 'other' statuses
if (docData.STATUS === "Enregistré") {
  backgroundColor = "#AECFD5";
  color = "#013B4E";
}
if (docData.STATUS === "Enregistrée") {
  backgroundColor = "#AECFD5";
  color = "#013B4E";
}
if (docData.STATUS === "Modifié") {
  backgroundColor = "#e7c971";
  color = "#322300";
}
if (docData.STATUS === "Supprimé(e)") {
  backgroundColor = "#cbcbcb";
  color = "#151515";
}
if (docData.STATUS === "À facturer") {
  backgroundColor = "#E3F2EB";
  color = "#003719";
}
if (docData.STATUS === "Archivé") {
  backgroundColor = "#E3DED1";
  color = "#322300";
}
// colors for facture statues
if (docData.STATUS === "Brouillon") {
  backgroundColor = "#cfc6b1";
  color = "#322300";
}
if (docData.STATUS === "Validée") {
  backgroundColor = "#c5e3f9";
  color = "#062D4A";
}
if (docData.STATUS === "Envoi en cours") {
  backgroundColor = "#e1d8f6";
  color = "#1D0555";
}
if (docData.STATUS === "Envoyée") {
  backgroundColor = "#beb4ed";
  color = "#1D0555";
}
if (docData.STATUS === "Acquittée") {
  backgroundColor = "#98d4b3";
  color = "#003719";
}

// colors for mission statuses
if (docData.STATUS === "Draft") {
  backgroundColor = "#e1e1e1";
  color = "#151515";
}
if (docData.STATUS === "Refusée") {
  backgroundColor = "#e6c0c1";
  color = "#4A0305";
}
if (docData.STATUS === "Acceptée") {
  backgroundColor = "#c5e3f9";
  color = "#062D4A";
}
if (docData.STATUS === "Annulée") {
  backgroundColor = "#e29294";
  color = "#4A0305";
}
if (docData.STATUS === "Facturation en cours") {
  backgroundColor = "#c6e7d7";
  color = "#003719";
}
if (docData.STATUS === "Facturée") {
  backgroundColor = "#98d4b3";
  color = "#003719";
}

return { backgroundColor: backgroundColor, color: color };
