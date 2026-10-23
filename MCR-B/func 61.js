console.log("Function 61", context);

const disponibilite = docData.Planification_Disponiblité;
// if disponibilité value is disponible checkbox is true
if (disponibilite === "Disponible") {
  return { AfficherSurTimelineDisponible: true };
} else {
  return { AfficherSurTimelineDisponible: false };
}
