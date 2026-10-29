console.log("Fonction129", context);

// Toujours initialiser les 3 champs à null
let result = {
  Demande_TransportDetailsDemandeTypeTransporteurPrimaire: null,
  Demande_TransportDetailsDemandeTypeTransporteurAlternatif1: null,
  Demande_TransportDetailsDemandeTypeTransporteurAlternatif2: null,
  Demande_SuggestionTransRoutierVersAeroportPrimaire: null,
  Demande_SuggestionTransRoutierVersAeroportAlt: null,
  Demande_SuggestionTransRoutierVersAeroportAlt2: null,
};

const isHorsRegion = docData?.Demande_ModeDeTransport === "Aérien"; //???
const isStable =
  docData?.Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport ===
  "Stable";
const isCouche =
  docData?.Demande_TransportMobiliteUsagerPositionTransport ===
  "Décubitus dorsal strict";
const isSurveillance = docData?.Demande_SurveillanceClinique === "Oui";
const needsAccompagnateur =
  docData?.Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur === "Oui";

const isRetour =
  docData?.DemandeTransportInformationsTransportRetour === "true";

console.log("isHorsRegion? ", isHorsRegion);
console.log("isStable? ", isStable);
console.log("isCouche? ", isCouche);
console.log("isSurveillance? ", isSurveillance);
console.log("needsAccompagnateur? ", needsAccompagnateur);

if (
  docData?.Demande_ModeDeTransport &&
  (docData?.Demande_SurveillanceClinique ||
    docData?.Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport)
) {
  // Aerien
  if (isHorsRegion) {
    if (docData?.Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport) {
      // Patient stable: oui
      if (isStable) {
        result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire =
          "Navette multipatients";
        result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 =
          "Transport médical adapté";
        result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 =
          "Ambulance";
        if (!isRetour) {
          result.Demande_SuggestionTransRoutierVersAeroportPrimaire =
            "Transport médical adapté";
          result.Demande_SuggestionTransRoutierVersAeroportAlt =
            "Taxi/Transport alternatif/Bénévole/Transport adapté";
          result.Demande_SuggestionTransRoutierVersAeroportAlt2 = "Ambulance";
        }
      }
      // Patient stable: non
      else {
        result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "EVAQ";
        result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 =
          "Avion nolisé (Doit avoir une autorisation du directeur de garde)";
        result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 =
          "Ambulance";
        if (!isRetour) {
          result.Demande_SuggestionTransRoutierVersAeroportPrimaire =
            "Ambulance";
        }
      }
    }
  }
  // Routier
  else {
    // Surveillance clinique ou traitement actif : Oui
    if (docData?.Demande_SurveillanceClinique) {
      if (isSurveillance) {
        if (docData?.Demande_TransportMobiliteUsagerPositionTransport) {
          // Decubitus dorsal stric
          if (isCouche) {
            result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire =
              "Ambulance";
          } else {
            result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire =
              "Transport médical adapté";
            result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 =
              "Ambulance";
            result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 =
              "Taxi/Transport alternatif/Bénévole/Transport adapté";
          }
        }
      }
      // Surveillance clinique ou traitement actif : Non
      else {
        if (
          docData?.Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur
        ) {
          //Besoin accompagnateur: oui
          if (needsAccompagnateur) {
            result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire =
              "Proche aidant";
            result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 =
              "Transport médical adapté";
            result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 =
              "Taxi/Transport alternatif/Bénévole/Transport adapté";
          }
          //Besoin accompagnateur: non
          else {
            result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire =
              "Proche aidant";
            result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 =
              "Taxi/Transport alternatif/Bénévole/Transport adapté";
            result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 =
              "Transport médical adapté";
          }
        }
      }
    }
  }
}

return result;

