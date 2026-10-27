let backgroundColor;
if (docData.Demande_StatutTransportAller === "Actif") {
  backgroundColor = "#C9DCEE";
}
if (docData.Demande_StatutTransportAller === "Inactif") {
  backgroundColor = "#E4E4DA";
}
if (docData.Demande_StatutTransportAller === "Soumis") {
  backgroundColor = "#C7F9CC";
}
if (docData.Demande_StatutTransportAller === "Draft") {
  backgroundColor = "#EDEDED";
}
if (docData.Demande_StatutTransportAller === "Assignée") {
  backgroundColor = "#C7F9CC";
}
if (docData.Demande_StatutTransportAller === "Non-assigné") {
  backgroundColor = "#eedec9ff";
}
if (docData.Demande_StatutTransportAller === "Planifié") {
  backgroundColor = "#C5CFF6";
}
if (docData.Demande_StatutTransportAller === "Confirmé") {
  backgroundColor = "#E5CBE6";
}
if (docData.Demande_StatutTransportAller === "En attente d'approbation") {
  backgroundColor = "#F7E6A3";
}
if (docData.Demande_StatutTransportAller === "Complété") {
  backgroundColor = "#C9DFC3";
}
if (docData.Demande_StatutTransportAller === "Annulé") {
  backgroundColor = "#F0C5C5";
}
if (docData.Demande_StatutTransportAller === "Appariée") {
  backgroundColor = "#E9E3B7";
}
if (docData.Demande_StatutTransportAller === "Payée") {
  backgroundColor = "#CCC6A1";
}
if (docData.Demande_StatutTransportAller === "Facturée") {
  backgroundColor = "#B1B398";
}
if (docData.Demande_StatutTransportAller === "Non complétée") {
  backgroundColor = "#F1E1D6";
}
if (docData.Demande_StatutTransportAller === "Refusé") {
  backgroundColor = "#E6D9CB";
}
if (docData.Demande_StatutTransportAller === "En traitement") {
  backgroundColor = "#9CD1F5";
}
return { backgroundColor: backgroundColor };
