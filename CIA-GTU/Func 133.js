console.log("Fonction 133", context);

let result = {};

const modeTransport = docData.Demande_ModeDeTransport;
const allerRetourRoutier = docData.Demande_TransportInformationTransportTransportAllerRetour;
const retourAerien = docData.DemandeTransportInformationsTransportRetour;

if (modeTransport === "Routier") {

    result.SystemeCache_AdresseDepart = docData.Demande_TransportTransportSimpleAdresseCompleteDepart;
    result.SystemeCache_AdresseDestination = docData.Demande_TransportTransportSimpleAdresseCompleteDestination;
    result.SystemeCache_TypeTransport = "Aller simple";
    result.SystemeCache_MoyenTransport = docData.ChoixTransport;
  

  if (allerRetourRoutier === "true") {
    result.SystemeCache_AdresseDepart = docData.Demande_TransportTransportSimpleAdresseCompleteDepart;
    result.SystemeCache_AdresseDestination = docData.Demande_TransportTransportRetourAdresseCompleteDestination;
    result.SystemeCache_TypeTransport = "Aller/Retour";
    result.SystemeCache_MoyenTransport = docData.ChoixTransport;
  }
}

if (modeTransport === "Aérien") {
 
    result.SystemeCache_AdresseDepart = docData.Demande_TransportTransportSimpleAdresseCompleteDepart;
    result.SystemeCache_AdresseDestination = docData.Demande_TransportTransportSimpleAdresseCompleteDestination;
    result.SystemeCache_MoyenTransport = docData.Demande_MoyenTransportVersAeroport;
    result.SystemeCache_TypeTransport = "Aller";
  

  if (retourAerien === "true") {
    result.SystemeCache_AdresseDepart = docData.TransportAerien_AdresseAtterissage;
    result.SystemeCache_AdresseDestination = docData.Demande_TransportTransportSimpleAdresseCompleteDestination;
    result.SystemeCache_MoyenTransport = docData.Demande_MoyenTransportVersAeroport;
    result.SystemeCache_TypeTransport = "Retour";
  }
}

return result;
