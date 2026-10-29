console.log("Function134", context);
let backgroundColor;
if (docData.SystemeCache_StatutTransportAller === "Actif") {
  backgroundColor = "#C9DCEE";
}
 
if (docData.SystemeCache_StatutTransportAller === "Inactif") {
  backgroundColor = "#E4E4DA";
}
if (docData.SystemeCache_StatutTransportAller === "Soumise") {
  backgroundColor = "#C7F9CC";
}

if (docData.SystemeCache_StatutTransportAller === "Draft") {
  backgroundColor = "#EDEDED";
} 

if (docData.SystemeCache_StatutTransportAller ==="Assignée"){
 backgroundColor = "#C7F9CC"; 
}
if (docData.SystemeCache_StatutTransportAller === "Non-assignée"){
  backgroundColor = "#eedec9ff";
}

if (docData.SystemeCache_StatutTransportAller === "Planifiée") {
  backgroundColor = "#C5CFF6";
}
if (docData.SystemeCache_StatutTransportAller === "Confirmée") {
  backgroundColor = "#E5CBE6";
}
if (docData.SystemeCache_StatutTransportAller === "En route") {
  backgroundColor = "#F7E6A3";
}
if (docData.SystemeCache_StatutTransportAller === "Complétée") {
  backgroundColor = "#C9DFC3";
}
if (docData.SystemeCache_StatutTransportAller === "Annulée") {
  backgroundColor = "#F0C5C5";
}
if (docData.SystemeCache_StatutTransportAller === "Appariée") {
  backgroundColor = "#E9E3B7";
}
if (docData.SystemeCache_StatutTransportAller === "Payée") {
  backgroundColor = "#CCC6A1";
}
if (docData.SystemeCache_StatutTransportAller === "Remboursée") {
  backgroundColor = "#B1B398";
}
if (docData.SystemeCache_StatutTransportAller === "Non-Complétée") {
  backgroundColor = "#F1E1D6";
}
if (docData.SystemeCache_StatutTransportAller === "Refusée") {
  backgroundColor = "#E6D9CB";
}
return { backgroundColor: backgroundColor };
