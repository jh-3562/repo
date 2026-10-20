console.log("Fonction 186", context);

if (
  docData.STATUS === "Refusée" ||
  docData.STATUS === "Planifiée" ||
  docData.STATUS === "Confirmée"
) {
  return {
    Demande_BatchAnnulee: true,
    Demande_BatchSoumise: null,
    FormDemande_IdentificationBoutton: null,
  };
} else if (docData.STATUS === "Soumise") {
  return {
    Demande_BatchSoumise: true,
    Demande_BatchAnnulee: null,
    FormDemande_IdentificationBoutton: null,
  };
} else if (Number(docData.NUMBER) === 0) {
  return {
    Demande_BatchSoumise: null,
    Demande_BatchAnnulee: null,
    FormDemande_IdentificationBoutton: true,
  };
} else {
  return {
    Demande_BatchSoumise: null,
    Demande_BatchAnnulee: null,
    FormDemande_IdentificationBoutton: null,
  };
}

return {};
