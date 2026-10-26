console.log("Function 112", context);
const status = docData.STATUS;

return status === "Brouillon"
  ? {
      BatchFacture: true,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: true,
      BatchFactureRelancerEtEnregistrer: null,
    }
  : status === "Envoyée"
  ? {
      BatchFactureRelancerEtEnregistrer: true,
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: null,
    }
  : status === "Annulée"
  ? {
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: null,
      BatchFactureRelancerEtEnregistrer: null,
    }
  : status === "Supprimé(e)"
  ? {
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: null,
      BatchFactureRelancerEtEnregistrer: null,
    }
  : {
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: true,
      sectionButtonActualiserPrix: null,
      BatchFactureRelancerEtEnregistrer: null,
    };
