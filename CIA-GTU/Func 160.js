console.log("Fonction 160", context);

const Demandeadressememe = docData["Demande_MemeAdresseUsager"];
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
  Demande_TransportTransportSimpleNomLieuDepart: false,
  Demande_TypeAdresseDepart: true,
  Demande_TransportTransportSimpleAdresseCompleteDepart: false,
  Demande_TransportTransportSimpleNomVilleDepart: false,
};

if (Demandeadressememe === "true") {
  result.Demande_TransportTransportSimpleNomLieuDepart = true;
  result.Demande_TransportTransportSimpleAdresseCompleteDepart = true;
  result.Demande_TransportTransportSimpleNomVilleDepart = true;
}

return result;
