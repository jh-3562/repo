console.log(
  "Fonction 32 OnchangeDemande_IdentificationIdentificationUsagerDebit ",
  context
);

const SHOW =
  docData.Demande_IdentificationIdentificationUsagerOxygenodependant == "true"
    ? true
    : false; 

return {
  Demande_IdentificationIdentificationUsagerDebit: SHOW,
  Demande_TransportAutreEquipementsDebit: SHOW,
  
};
