console.log("Fonction 204", context);

const AdresseDifferente =
  docData.Demande_TransportTransportRetourAdresseDestinationEstDifferente;

const result = {
  Demande_TransportTransportRetourAdresseCompleteDestination: "",
  Demande_TransportTransportRetourNomLieuDestination: "",
  Demande_TransportTransportRetourNomVilleDestination: "",
  Demande_TransportTransportRetourUnitePriseEnChargeArrivee: "",
  Demande_TransportTransportRetourNumeroAdresseArrivee: "",
  Demande_TransportTransportRetourNumeroTelephone1Arrivee: "",
  Demande_TransportTransportRetourNumeroTelephone2Arrivee: "",
};
const isDifferente = AdresseDifferente === "true";

if (!isDifferente) {
  result.Demande_TransportTransportRetourAdresseCompleteDestination =
    docData?.Demande_TransportTransportSimpleAdresseCompleteDepart;
  result.Demande_TransportTransportRetourNomLieuDestination =
    docData?.Demande_TransportTransportSimpleNomLieuDepart;
  result.Demande_TransportTransportRetourNomVilleDestination =
    docData?.Demande_TransportTransportSimpleNomVilleDepart;
  result.Demande_TransportTransportRetourUnitePriseEnChargeArrivee =
    docData?.Demande_TransportTransportSimpleUnitePriseEnChargeDepart;
  result.Demande_TransportTransportRetourNumeroAdresseArrivee =
    docData?.Demande_TransportTransportSimpleNumeroAdresseDepart;
  result.Demande_TransportTransportRetourNumeroTelephone1Arrivee =
    docData?.Demande_TransportTransportSimpleNumeroTelephone1Depart;
  result.Demande_TransportTransportRetourNumeroTelephone2Arrivee =
    docData?.Demande_TransportTransportSimpleNumeroTelephone2Depart;
}

return result;
