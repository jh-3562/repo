console.log("Fonction 52 ", context);

const different =
  docData?.Demande_TransportTransportRetourAdresseDepartEstDifferente ===
  "true";

const get = (o, k) => o?.[k];
const result = {};

// ----- Adresse -----
const destinationSimple = get(
  docData,
  "Demande_TransportTransportSimpleAdresseCompleteDestination",
);
if (destinationSimple && !different) {
  result["Demande_TransportTransportRetourAdresseCompleteDepart"] =
    destinationSimple;
}

// ----- Latitude -----
const latDestination = get(docData, "TransportSysteme_LatitudeDestination");
if (latDestination && !different) {
  result["TransportSysteme_LatitudeDepartRetour"] = latDestination;
}

// ----- Longitude -----
const lngDestination = get(docData, "TransportSysteme_LongitudeDestination");
if (lngDestination && !different) {
  result["TransportSysteme_LongitudeDepartRetour"] = lngDestination;
}

// ----- Nom du lieu -----
const nomLieuDest = get(
  docData,
  "Demande_TransportTransportSimpleNomLieuDestination",
);
if (nomLieuDest && !different) {
  result["Demande_TransportTransportRetourNomLieuDepart"] = nomLieuDest;
}

// ----- Type d'adresse -----
const typeAdresse = get(docData, "Demande_TypeAdresseDestination");
if (typeAdresse && !different) {
  result["Demande_TypeAdresseRetourDepart"] = typeAdresse;
}

// ----- Unité de prise en charge -----
const uniteDest = get(
  docData,
  "Demande_TransportTransportSimpleUnitePriseEnChargeArrivee",
);
if (uniteDest && !different) {
  result["Demande_TransportTransportRetourUnitePriseEnChargeDepart"] =
    uniteDest;
}

const Ville = get(
  docData,
  "Demande_TransportTransportSimpleNomVilleDestination",
);
if (Ville && !different) {
  result["Demande_TransportTransportRetourNomVilleDepart"] = Ville;
}
// ----- Numéro d'adresse -----
const numAdresseDest = get(
  docData,
  "Demande_TransportTransportSimpleNumeroAdresseArrivee",
);
if (numAdresseDest && !different) {
  result["Demande_TransportTransportRetourNumeroAdresseDepart"] =
    numAdresseDest;
}

// ----- Téléphone 1 -----
const tel1Dest = get(
  docData,
  "Demande_TransportTransportSimpleNumeroTelephone1Arrivee",
);
if (tel1Dest && !different) {
  result["Demande_TransportTransportRetourNumeroTelephone1Depart"] = tel1Dest;
}

// ----- Téléphone 2 -----
const tel2Dest = get(
  docData,
  "Demande_TransportTransportSimpleNumeroTelephone2Arrivee",
);
if (tel2Dest && !different) {
  result["Demande_TransportTransportRetourNumeroTelephone2Depart"] = tel2Dest;
}

return result;
