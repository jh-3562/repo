console.log("Fonction 53 - Dates/Heures départ/arrivée ", context);

const ABITIBI_FORMLAYOUTID_TRANSPORTEUR = "3c0b9af1-fb35-4ee9-bcc7-394aa9a580a1";
const ABITIBI_FORMLAYOUTID_ADRESSES_FREQUENTES = "57b370ea-db0d-432c-adbc-3bae18ba0f59";
const ABITIBI_FORMLAYOUTID_DEMANDE = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const ABITIBI_FORMLAYOUTID_PARAMETRES_OPTIMISATION = "e371bcfb-1eba-4f0e-aeac-a528b22667e5";
const ABITIBI_FORMLAYOUTID_CLIENT = "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e";

const get = (o,k) => o?.[k];
const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";
const changed = (k) => {
  const uk = context?.updatedKeys || context?.updatedField || [];
  if (Array.isArray(uk)) return uk.includes(k);
  return uk === k || context?.inputKey === k;
};

const H_DEP    = "Demande_TransportTransportSimpleHeureDepartSouhaitee";
const H_ARR    = "Demande_TransportTransportSimpleHeureArriveeSouhaite";

switch (docData.FORMLAYOUTID) {
  case ABITIBI_FORMLAYOUTID_TRANSPORTEUR:
  case ABITIBI_FORMLAYOUTID_ADRESSES_FREQUENTES:
  case ABITIBI_FORMLAYOUTID_DEMANDE:
  case ABITIBI_FORMLAYOUTID_PARAMETRES_OPTIMISATION:
  case ABITIBI_FORMLAYOUTID_CLIENT: {
    const result = {};

    

    // ===== HEURES =====
    const hDep = get(docData, H_DEP), hArr = get(docData, H_ARR);
    const hDepFilled = has(hDep), hArrFilled = has(hArr);

    let heureLock = get(docData, "TEMPORARY_HeureSimpleLockSource");
    const heureHint = get(docData, "TEMPORARY_HeureSimpleLockHint");

    if (!has(heureLock)) {
      if (has(heureHint)) {
        heureLock = heureHint;                    // priorité au hint
        result.TEMPORARY_HeureSimpleLockSource = heureLock;
        result.TEMPORARY_HeureSimpleLockHint = "";
      } else if (hDepFilled && !hArrFilled) {
        heureLock = "depart";
        result.TEMPORARY_HeureSimpleLockSource = "depart";
      } else if (!hDepFilled && hArrFilled) {
        heureLock = "arrivee";
        result.TEMPORARY_HeureSimpleLockSource = "arrivee";
      } else if (hDepFilled && hArrFilled) {
        if (changed(H_ARR)) {
          heureLock = "arrivee";
          result.TEMPORARY_HeureSimpleLockSource = "arrivee";
        } else if (changed(H_DEP)) {
          heureLock = "depart";
          result.TEMPORARY_HeureSimpleLockSource = "depart";
        }
      }
    }

    let roHeureDep = false, roHeureArr = false;
    if (heureLock === "depart") {
      roHeureDep = false; roHeureArr = true;
      if (!hDepFilled) { result.TEMPORARY_HeureSimpleLockSource = ""; roHeureArr = false; }
    } else if (heureLock === "arrivee") {
      roHeureArr = false; roHeureDep = true;
      if (!hArrFilled) { result.TEMPORARY_HeureSimpleLockSource = ""; roHeureDep = false; }
    } else {
      if (hDepFilled && !hArrFilled) roHeureArr = true;
      else if (!hDepFilled && hArrFilled) roHeureDep = true;
    }

    // Les heures calculées restent toujours en lecture seule.
    result[H_DEP] = true;
    result[H_ARR] = true;

    return result;
  }
}
