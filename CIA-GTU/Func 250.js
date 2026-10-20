console.log("Function 250", context);

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
