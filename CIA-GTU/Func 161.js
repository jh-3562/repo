console.log("Fonction 161", context);

const Demandeadressememe = docData["Demande_MemeAdresseUsagerRetour"];
const roles = store?.moduleStore?.user?.roles || [];
const isLDR = roles.includes("LISTE DE RAPPEL");

if (isLDR) {
  return {
    Demande_TransportTransportSimpleNomLieuDepart: true,
    Demande_TransportTransportSimpleNomLieuDestination: true,
    Demande_TransportTransportRetourNomLieuDepart: true,
    Demande_TransportTransportRetourNomLieuDestination: true,
    Demande_TransportTransportSimpleNomVilleDepart: true,
    Demande_TransportTransportSimpleNomVilleDestination: true,
    Demande_TransportTransportRetourNomVilleDepart: true,
    Demande_TransportTransportRetourNomVilleDestination: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeDepart: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeArrivee: true,
    Demande_TransportTransportRetourUnitePriseEnChargeDepart: true,
    Demande_TransportTransportRetourUnitePriseEnChargeArrivee: true,
  };
}

const result = {
  Demande_TransportTransportSimpleNomLieuDestination: false,
  Demande_TypeAdresseDestination: true,
  Demande_TransportTransportSimpleAdresseCompleteDestination: false,
  Demande_TransportTransportSimpleNomVilleDestination: false,
};

if (Demandeadressememe === "true") {
  result.Demande_TransportTransportSimpleNomLieuDestination = true;
  result.Demande_TransportTransportSimpleAdresseCompleteDestination = true;
  result.Demande_TransportTransportSimpleNomVilleDestination = true;
}

return result;
