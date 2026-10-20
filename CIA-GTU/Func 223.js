console.log("Fonction 223", context);

const Demandeadressememe =
  docData["Demande_MemeAdresseUsagerRetourDestination"];

const result = {
  Demande_TransportTransportRetourNomLieuDestination: false,
  Demande_TypeAdresseRetourDestination: true,
  Demande_TransportTransportRetourAdresseCompleteDestination: false,
  Demande_TransportTransportRetourNomVilleDestination: false,
};

if (Demandeadressememe === "true") {
  result.Demande_TransportTransportRetourNomLieuDestination = true;
  result.Demande_TransportTransportRetourAdresseCompleteDestination = true;
  result.Demande_TransportTransportRetourNomVilleDestination = true;
}

return result;
