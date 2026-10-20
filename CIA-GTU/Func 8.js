console.log(
  "Fonction 8 - onchangeDemande_TransportInformationTransportAvecReccurence SHOW FIELD",
  context
);

const SHOW =
  docData.Demande_TransportInformationTransportAvecReccurence == "true"
    ? true
    : null;

return {
  Demande_TransportInformationTransportFrequence: SHOW,
  
};
