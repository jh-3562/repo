console.log("Fonction 36", context);

const get = (o, k) => o?.[k];

const provenance          = get(docData, "Demande_TransportDetailsDemandeProvenanceUsager");
const typeTransport       = get(docData, "Demande_TransportDetailsDemandeTypeTransport") || null;
const survClinique        = get(docData, "Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport");
const positionTransport   = get(docData, "Demande_TransportMobiliteUsagerPositionTransport");

const result = {};

// Base: CH / CHSLD (ou CHLSD) + type ≠ Hors région + SurvClinique = Non
const isProvenanceCH = ["CH", "CHSLD", "CHLSD"].includes(provenance);
const baseOk = isProvenanceCH && typeTransport !== "Hors région" && survClinique === "Non";

if (baseOk) {
  if (positionTransport === "De confort") {
    // -> Primaire = Taxi
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Taxi/Transport alternatif";
    
  } else {
    // -> Primaire = Adapté, Alternatif1 = AMB
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Transport adapté";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = "Ambulance";
   
  }
}

return result;
