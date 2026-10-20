console.log("Fonction 49 - Auto remplir Destination avec Depart", context);

const different =
  docData?.Demande_TransportTransportRetourAdresseDestinationEstDifferente ===
  "true";

const get = (o, k) => o?.[k];
const result = {};

// ----- Adresse complète -----
const depart = get(
  docData,
  "Demande_TransportTransportSimpleAdresseCompleteDepart",
);
if (depart && !different) {
  result["Demande_TransportTransportRetourAdresseCompleteDestination"] = depart;
}

// ----- Latitude -----
const latDepart = get(docData, "TransportSysteme_LatitudeDepart");
if (latDepart && !different) {
  result["TransportSysteme_LatitudeDestinationRetour"] = latDepart;
}

// ----- Longitude -----
const lngDepart = get(docData, "TransportSysteme_LongitudeDepart");
if (lngDepart && !different) {
  result["TransportSysteme_LongitudeDestinationRetour"] = lngDepart;
}

// ----- Nom du lieu -----
const nomLieu = get(docData, "Demande_TransportTransportSimpleNomLieuDepart");
if (nomLieu && !different) {
  result["Demande_TransportTransportRetourNomLieuDestination"] = nomLieu;
}

// ----- Type d'adresse -----
const typeAdresse = get(docData, "Demande_TypeAdresseDepart");
if (typeAdresse && !different) {
  result["Demande_TypeAdresseRetourDestination"] = typeAdresse;
}

const Ville = get(docData, "Demande_TransportTransportSimpleNomVilleDepart");
if (Ville && !different) {
  result["Demande_TransportTransportRetourNomVilleDestination"] = Ville;
}

// ----- Unité de prise en charge -----
const unite = get(
  docData,
  "Demande_TransportTransportSimpleUnitePriseEnChargeDepart",
);
if (unite && !different) {
  result["Demande_TransportTransportRetourUnitePriseEnChargeArrivee"] = unite;
}

// ----- Numéro d'adresse -----
const numAdresse = get(
  docData,
  "Demande_TransportTransportSimpleNumeroAdresseDepart",
);
if (numAdresse && !different) {
  result["Demande_TransportTransportRetourNumeroAdresseArrivee"] = numAdresse;
}

// ----- Téléphone 1 -----
const tel1 = get(
  docData,
  "Demande_TransportTransportSimpleNumeroTelephone1Depart",
);
if (tel1 && !different) {
  result["Demande_TransportTransportRetourNumeroTelephone1Arrivee"] = tel1;
}

// ----- Téléphone 2 -----
const tel2 = get(
  docData,
  "Demande_TransportTransportSimpleNumeroTelephone2Depart",
);
if (tel2 && !different) {
  result["Demande_TransportTransportRetourNumeroTelephone2Arrivee"] = tel2;
}

return result;
