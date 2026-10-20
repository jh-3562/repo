console.log("Fonction 152", context);

const MemeAdresse = docData["Demande_MemeAdresseUsagerRetour"];

const result = {
  Demande_TransportTransportSimpleNumeroTelephone1Arrivee: "",
  Demande_TransportTransportSimpleNumeroTelephone2Arrivee: "",
  Demande_TransportTransportSimpleAdresseCompleteDestination: "",
  Demande_TransportTransportSimpleNomVilleDestination: "",
  Demande_TransportTransportSimpleUnitePriseEnChargeArrivee: "",
};

if (MemeAdresse === "true") {
  result.Demande_TransportTransportSimpleNomLieuDestination = "Domicile";
  result.Demande_TypeAdresseDestination = "Domicile";
  result.Demande_TransportTransportSimpleAdresseCompleteDestination =
    docData.Identite_Adresse;
  result.Demande_TransportTransportSimpleNomVilleDestination =
    docData.Identite_Ville;
  result.Demande_TransportTransportSimpleNumeroAdresseArrivee =
    docData.Identite_Appartement;

  result.Demande_TransportTransportSimpleNumeroTelephone1Arrivee =
    docData.Identite_Telephone;
  result.Demande_TransportTransportSimpleNumeroTelephone2Arrivee =
    docData.Identite_Poste;

  result.TransportSysteme_LongitudeDestination =
    docData.Systeme_LongitudeAdresseClient;
  result.TransportSysteme_LongitudeDepartRetour =
    docData.Systeme_LongitudeAdresseClient;
  result.TransportSysteme_LatitudeDestination =
    docData.Systeme_LatitudeAdresseCleint;
  resultTransportSysteme_LatitudeDepartRetour =
    docData.Systeme_LatitudeAdresseCleint;
}

return result;
