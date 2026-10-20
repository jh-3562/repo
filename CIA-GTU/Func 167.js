console.log("Function 167", context);

const isRetour =
  docData?.DemandeTransportInformationsTransportRetour === "true";

return {
  Demande_MoyenTransportVersDestination: isRetour ? true : null,
  Demande_MoyenTransportVersAeroport: isRetour ? null : true,
  Demande_SuggestionTransRoutierVersAeroportPrimaire: isRetour ? null : true,
  Demande_SuggestionTransRoutierVersAeroportAlt: isRetour ? null : true,
  Demande_SuggestionTransRoutierVersAeroportAlt2: isRetour ? null : true,
};
