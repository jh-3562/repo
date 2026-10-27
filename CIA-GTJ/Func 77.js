let backgroundColor;
if (docData.Demande_StatutTransportRetour === "Actif") {
  backgroundColor = "#C9DCEE";
}
if (docData.Demande_StatutTransportRetour === "Inactif") {
  backgroundColor = "#E4E4DA";
}
if (docData.Demande_StatutTransportRetour === "Soumis") {
  backgroundColor = "#C7F9CC";
}
if (docData.Demande_StatutTransportRetour === "Draft") {
  backgroundColor = "#EDEDED";
}
if (docData.Demande_StatutTransportRetour === "Assignée") {
  backgroundColor = "#C7F9CC";
}
if (docData.Demande_StatutTransportRetour === "Non-assigné") {
  backgroundColor = "#eedec9ff";
}
if (docData.Demande_StatutTransportRetour === "Planifiée") {
  backgroundColor = "#C5CFF6";
}
if (docData.Demande_StatutTransportRetour === "Confirmée") {
  backgroundColor = "#E5CBE6";
}
if (docData.Demande_StatutTransportRetour === "En attente d'approbation") {
  backgroundColor = "#F7E6A3";
}
if (docData.Demande_StatutTransportRetour === "Complété") {
  backgroundColor = "#C9DFC3";
}
if (docData.Demande_StatutTransportRetour === "Annulé") {
  backgroundColor = "#F0C5C5";
}
if (docData.Demande_StatutTransportRetour === "Appariée") {
  backgroundColor = "#E9E3B7";
}
if (docData.Demande_StatutTransportRetour === "Payée") {
  backgroundColor = "#CCC6A1";
}
if (docData.Demande_StatutTransportRetour === "Facturée") {
  backgroundColor = "#B1B398";
}
if (docData.Demande_StatutTransportRetour === "Non complétée") {
  backgroundColor = "#F1E1D6";
}
if (docData.Demande_StatutTransportRetour === "Refusé") {
  backgroundColor = "#E6D9CB";
}
if (docData.Demande_StatutTransportRetour === "En traitement") {
  backgroundColor = "#9CD1F5";
}
return { backgroundColor: backgroundColor };
