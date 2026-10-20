console.log("Fonction 108", context);

const Oxygenodependant = docData["Demande_MemeAdresseUsager"];

const result = {
  Demande_TransportTransportSimpleNumeroTelephone1Depart: "",
  Demande_TransportTransportSimpleNumeroTelephone2Depart: "",
  Demande_TransportTransportSimpleAdresseCompleteDepart: "",
  Demande_TransportTransportSimpleNomVilleDepart: "",
  Demande_TransportTransportSimpleUnitePriseEnChargeDepart: "",
};

if (Oxygenodependant === "true") {
  result.Demande_TransportTransportSimpleNomLieuDepart = "Domicile";
  result.Demande_TypeAdresseDepart = "Domicile";
  result.Demande_TransportTransportSimpleAdresseCompleteDepart =
    docData.Identite_Adresse;
  result.Demande_TransportTransportSimpleNomVilleDepart =
    docData.Identite_Ville;
  result.Demande_TransportTransportSimpleNumeroAdresseDepart =
    docData.Identite_Appartement;
  result.Demande_TransportTransportRetourAdresseCompleteDestination =
    docData.Identite_Adresse;
  result.Demande_TransportTransportRetourNomVilleDestination =
    docData.Identite_Ville;
  result.Demande_TransportTransportRetourNumeroAdresseArrivee =
    docData.Identite_Appartement;
  result.Demande_TransportTransportSimpleNumeroTelephone1Depart =
    docData.Identite_Telephone;
  result.Demande_TransportTransportSimpleNumeroTelephone2Depart =
    docData.Identite_Poste;

  result.TransportSysteme_LongitudeDepart =
    docData.Systeme_LongitudeAdresseClient;
  result.TransportSysteme_LatitudeDepart =
    docData.Systeme_LatitudeAdresseCleint;
  result.TransportSysteme_LatitudeDestinationRetour =
    docData.Systeme_LongitudeAdresseClient;
  result.TransportSysteme_LongitudeDestinationRetour =
    docData.Systeme_LatitudeAdresseCleint;
}

return result;
