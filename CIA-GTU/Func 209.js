console.log("Fonction 209", context);

const AdresseDifferente =
  docData.Demande_TransportTransportRetourAdresseDepartEstDifferente;

const result = {
  Demande_TransportTransportRetourAdresseCompleteDepart: "",
  Demande_TransportTransportRetourNomLieuDepart: "",
  Demande_TypeAdresseRetourDepart: "",
  Demande_TransportTransportRetourNomVilleDepart: "",
  Demande_TransportTransportRetourUnitePriseEnChargeDepart: "",
  Demande_TransportTransportRetourNumeroAdresseDepart: "",
  Demande_TransportTransportRetourNumeroTelephone1Depart: "",
  Demande_TransportTransportRetourNumeroTelephone2Depart: "",
};
const isDifferente = AdresseDifferente === "true";

if (!isDifferente) {
  result.Demande_TransportTransportRetourAdresseCompleteDepart =
    docData.Demande_TransportTransportSimpleAdresseCompleteDestination;
  result.Demande_TransportTransportRetourNomLieuDepart =
    docData.Demande_TransportTransportSimpleNomLieuDestination;
  result.Demande_TypeAdresseRetourDepart =
    docData.Demande_TypeAdresseDestination;
  result.Demande_TransportTransportRetourNomVilleDepart =
    docData.Demande_TransportTransportSimpleNomVilleDestination;
  result.Demande_TransportTransportRetourUnitePriseEnChargeDepart =
    docData.Demande_TransportTransportSimpleUnitePriseEnChargeArrivee;
  result.Demande_TransportTransportRetourNumeroAdresseDepart =
    docData.Demande_TransportTransportSimpleNumeroAdresseArrivee;
  result.Demande_TransportTransportRetourNumeroTelephone1Depart =
    docData.Demande_TransportTransportSimpleNumeroTelephone1Arrivee;
  result.Demande_TransportTransportRetourNumeroTelephone2Depart =
    docData.Demande_TransportTransportSimpleNumeroTelephone2Arrivee;
  result.TransportSysteme_LatitudeDepart =
    docData.Systeme_LatitudeAdresseCleint;
  result.TransportSysteme_LongitudeDepart =
    docData.Systeme_LongitudeAdresseClient;
}

return result;
