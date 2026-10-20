console.log("Fonction 111", context);

const isAmbulance =
  docData.ChoixTransport === "Ambulance";

return {
  Demande_Priorite: isAmbulance ? "true" : null,

  Demande_PrioritéP2: isAmbulance ? null : null,
  Demande_PrioritéP5: isAmbulance ? null : null,
  Demande_PrioritéP6: isAmbulance ? null : null,
  Demande_PrioritéP8: isAmbulance ? null : null
};
