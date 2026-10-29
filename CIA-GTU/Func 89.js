console.log("89", context);

// détection retour
const isRetour = String(docData?.DemandeTransportInformationsTransportRetour || "")
  .trim()
  .toLowerCase() === "true";

// choix de la date d’atterrissage
const DateAtterissage = isRetour
  ? docData.TransportAerien_Dateatterrissage2
  : docData.TransportAerien_Dateatterrissage;

let result = {};

if (DateAtterissage) {
  result.Demande_TransportTransportSimpleDateTransportArrivee = DateAtterissage;
  result.Demande_TransportTransportSimpleDateTransportDepart  = DateAtterissage;
}

console.log(result);
return result;

