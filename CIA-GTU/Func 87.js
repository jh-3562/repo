console.log("Fonction 87", context);

const typeTransport = docData.Demande_TypeDeTransport2;

const SHOW_RENDEZ_VOUS =
  typeTransport === "Rendez-vous médical" ||
  typeTransport === "Rendez-vous personnel "
    ? true
    : null;

const SHOW_DE_A =
  docData.Demande_TransportSimplePossibiliteDeModifierRV === "Oui"
    ? true
    : null;

return {
  Demande_TransportsimpleHeuredErendezVous: SHOW_RENDEZ_VOUS,
  Demande_TransportSimplePossibiliteDeModifierRV: SHOW_RENDEZ_VOUS,

  Demande_TransportSimpleDe: SHOW_DE_A,
  Demande_TransportSimpleA: SHOW_DE_A,
};
