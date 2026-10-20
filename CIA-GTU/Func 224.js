console.log("Fonction 224", context);

const MemeAdresse = docData["Demande_MemeAdresseUsagerRetourDestination"];

const result = {
  Demande_TransportTransportRetourNumeroTelephone1Arrivee: "",
  Demande_TransportTransportRetourNumeroTelephone2Arrivee: "",
  Demande_TransportTransportRetourAdresseCompleteDestination: "",
  Demande_TransportTransportRetourNomVilleDestination: "",
  Demande_TransportTransportRetourUnitePriseEnChargeArrivee: "",
};

if (MemeAdresse === "true") {
  result.Demande_TransportTransportRetourNomLieuDestination = "Domicile";
  result.Demande_TypeAdresseRetourDestination = "Domicile";
  result.Demande_TransportTransportRetourAdresseCompleteDestination =
    docData.Identite_Adresse;
  result.Demande_TransportTransportRetourNomVilleDestination =
    docData.Identite_Ville;
  result.Demande_TransportTransportSimpleNumeroAdresseArrivee =
    docData.Identite_Appartement;

  result.Demande_TransportTransportRetourNumeroTelephone1Arrivee =
    docData.Identite_Telephone;
  result.Demande_TransportTransportRetourNumeroTelephone2Arrivee =
    docData.Identite_Poste;

  result.TransportSysteme_LongitudeDestinationRetour =
    docData.Systeme_LongitudeAdresseClient;
  result.TransportSysteme_LongitudeDepartRetour =
    docData.Systeme_LongitudeAdresseClient;
  result.TransportSysteme_LatitudeDestinationRetour =
    docData.Systeme_LatitudeAdresseCleint;
  result.TransportSysteme_LatitudeDepartRetour =
    docData.Systeme_LatitudeAdresseCleint;
}

return result;
