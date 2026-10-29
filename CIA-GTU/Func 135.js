console.log("Function135", context);
let backgroundColor;
if (docData.SystemeCache_StatutTransportRetour === "Actif") {
  backgroundColor = "#C9DCEE";
}
 
if (docData.SystemeCache_StatutTransportRetour === "Inactif") {
  backgroundColor = "#E4E4DA";
}
if (docData.SystemeCache_StatutTransportRetour === "Soumise") {
  backgroundColor = "#C7F9CC";
}

if (docData.SystemeCache_StatutTransportRetour === "Draft") {
  backgroundColor = "#EDEDED";
} 

if (docData.SystemeCache_StatutTransportRetour ==="Assignée"){
 backgroundColor = "#C7F9CC"; 
}
if (docData.SystemeCache_StatutTransportRetour === "Non-assignée"){
  backgroundColor = "#eedec9ff";
}

if (docData.SystemeCache_StatutTransportRetour === "Planifiée") {
  backgroundColor = "#C5CFF6";
}
if (docData.SystemeCache_StatutTransportRetour === "Confirmée") {
  backgroundColor = "#E5CBE6";
}
if (docData.SystemeCache_StatutTransportRetour === "En route") {
  backgroundColor = "#F7E6A3";
}
if (docData.SystemeCache_StatutTransportRetour === "Complétée") {
  backgroundColor = "#C9DFC3";
}
if (docData.SystemeCache_StatutTransportRetour === "Annulée") {
  backgroundColor = "#F0C5C5";
}
if (docData.SystemeCache_StatutTransportRetour === "Appariée") {
  backgroundColor = "#E9E3B7";
}
if (docData.SystemeCache_StatutTransportRetour === "Payée") {
  backgroundColor = "#CCC6A1";
}
if (docData.SystemeCache_StatutTransportRetour === "Remboursée") {
  backgroundColor = "#B1B398";
}
if (docData.SystemeCache_StatutTransportRetour === "Non-Complétée") {
  backgroundColor = "#F1E1D6";
}
if (docData.SystemeCache_StatutTransportRetour === "Refusée") {
  backgroundColor = "#E6D9CB";
}
return { backgroundColor: backgroundColor };
