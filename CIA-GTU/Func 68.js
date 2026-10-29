console.log(
  "Fonction68",
  context
);


const FILL =
  docData.Demande_TransportInformationTransportAvecReccurence === true ||
  docData.Demande_TransportInformationTransportAvecReccurence === "true";

return {
  
  TransportSysteme_IdReccurence: FILL ? docData.FORMID : null,
};

