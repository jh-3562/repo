console.log("Fonction 213", context);

const isAmbulance =
  docData.Demande_MoyenTransportVersAeroport === "Ambulance";
  
const isAerien = docData.Demande_ModeDeTransport === "Aérien";

return {
  Demande_Priorite: (isAerien && isAmbulance) ? "true" : null,

  Demande_PrioritéP2: (isAerien && isAmbulance) ? null : null,
  Demande_PrioritéP5: (isAerien && isAmbulance) ? null : null,
  Demande_PrioritéP6: (isAerien && isAmbulance) ? null : null,
  Demande_PrioritéP8: (isAerien && isAmbulance) ? null : null
};
