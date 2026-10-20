console.log("Fonction 107", context);

const Acc = docData.Demande_TransportMobiliteUsagerBesoinAideMobilite === "Oui";

return {
  
  Demande_TransportMobiliteUsagerTypeAideRequis: Acc ? true : null,
  Demande_TransportFauteuilStandardE: Acc ? true : null,
  Demande_TransportUFauteuilMultiPositionU: Acc ? true : null,
  Demande_TransportTFauteuilMultiPositionT: Acc ? true : null,
  Demande_TransportUFauteuilBariatiqueU: Acc ? true : null,
  Demande_TransportTFauteuilBariatiqueT: Acc ? true : null,
  Demande_TransportUFauteuilMotoriseU: Acc ? true : null,
  Demande_TransportUFauteuilStandardU: Acc ? true : null,
  Demande_TransportTFauteuilStandardT: Acc ? true : null,
  Demande_TransportUCanne: Acc ? true : null,
  Demande_TransportECanne: Acc ? true : null,
  Demande_TransportUMachette: Acc ? true : null,
  Demande_TransportEMachette: Acc ? true : null,
  Demande_TransportUFauteuilMotoriseU: Acc ? true : null,
  Demande_Cviere: Acc ? true : null,
  Demande_TransportUFauteuilMotoriseU: Acc ? true : null,
  Demande_TransportTFauteuilBariatiqueT: Acc ? true : null,
  Demande_TransportUAmbulateur: Acc ? true : null,
  
};
