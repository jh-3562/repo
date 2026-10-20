console.log("Fonction 95", context);

const isAerien = docData.Demande_ModeDeTransport === "Aérien";

return {
  
  DemandeTransportInformationsTransportRetour: isAerien ? true : false,
  Demande_TransportDetailsDemandeTypeTransport:isAerien ? true : null,
  Demande_MoyenTransportVersAeroport: isAerien ? true : null,
  ChoixTransportAerien: isAerien ? true : null,
  Demande_MoyenTransportVersAeroport: isAerien? true : null,
  Demande_MoyenTransportVersDestination: null,

  Demande_TransportInformationTransportTransportAllerRetour: isAerien ? null : true,
  Demande_TransportInformationTransportAvecReccurence: isAerien ? null : true,
  Demande_TransportDetailsDemandeTypeTransport2: isAerien ? null : true,
  ChoixTransport: isAerien ? null : true,
};
