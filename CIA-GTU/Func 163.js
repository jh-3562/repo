console.log("Fonction 163", context);

const isRoutier = docData.Demande_ModeDeTransport === "Routier";
const isAerien = docData.Demande_ModeDeTransport === "Aérien";
return {
  Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport:
    isRoutier ? null : true,
  Demande_SurveillanceClinique: isRoutier ? true : null,
  Demande_TransportMobiliteUsagerPositionTransport: isAerien ? null : true,
  EMPTY: isAerien ? null : true,
  Demande_SuggestionTransRoutierVersAeroportPrimaire: isAerien ? true : null,
  Demande_SuggestionTransRoutierVersAeroportAlt: isAerien ? true : null,
  Demande_SuggestionTransRoutierVersAeroportAlt2: isAerien ? true : null,
};
