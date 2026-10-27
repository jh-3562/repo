console.log("Fonction 11", context);


const cocherIntervenant =
  docData.Demande_IdentificationIdentificationCocherIntervenant === true ||
  docData.Demande_IdentificationIdentificationCocherIntervenant === "true";

return {
  DemandeIdentificationIntervenant_CheckBoxPrénom: cocherIntervenant ? "true" : null,
  DemandeIdentificationIntervenant_CheckBoxNom: cocherIntervenant ? "true" : null,
  DemandeIdentificationIntervenant_CheckBoxCourriel: cocherIntervenant ? "true" : null
};
