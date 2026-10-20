console.log("Fonction 35", context);

const get  = (o, k) => o?.[k];
const norm = (v) => String(v ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const provenance        = get(docData, "Demande_TransportDetailsDemandeProvenanceUsager");
const typeTransport     = get(docData, "Demande_TransportDetailsDemandeTypeTransport") || null;
const survClinique      = get(docData, "Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport");
const positionTransport = norm(get(docData, "Demande_TransportMobiliteUsagerPositionTransport"));

const result = {};

if (["CH", "CHSLD"].includes(provenance) && typeTransport === "Oui") {
  if (survClinique === "Oui") {
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "EVAQ";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = null;
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = null;
  } else if (survClinique === "Non") {
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "DASH";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = "Transport adapté";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = "Ambulance";
  }
}

if (["CH", "CHSLD"].includes(provenance) && typeTransport == "Non" && survClinique === "Oui") {
  result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Transport adapté";
  result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = "Ambulance";
  result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = null;
}

if (["CH", "CHSLD"].includes(provenance) && typeTransport == "Non" && survClinique === "Non") {
  if (docData.Demande_TransportMobiliteUsagerBesoinAideMobilite != "Oui") {
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Taxi/Transport alternatif";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = null;
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = null;
  } else {
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Transport adapté";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = "Ambulance";
    result.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = null;
  }
}

return result;
