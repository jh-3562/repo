console.log("Fonction 66", context);

const FIELD_DEP = "Demande_TransportTransportRetourHeureDepartSouhaitee";
const FIELD_ARR = "Demande_TransportTransportRetourHeureArriveeSouhaite";
const FIELD_DUR = "TransportSysteme_DureeTrajetRetour";

const DATE_DEP = "Demande_TransportTransportRetourDateTransportDepart";
const DATE_ARR = "Demande_TransportTransportRetourDateTransportArrivee";

const FORMLAYOUT_PARAM_OPTIM = "e371bcfb-1eba-4f0e-aeac-a528b22667e5";

const MOIS_NOMS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const EQUIPEMENT_KEY_MAP = {
  Demande_TransportEBIPAP: "BiPAP",
  Demande_TransportECanne: "Canne",
  Demande_TransportUCanne: "Canne",
  Demande_Cviere: "Civière-chaise",
  Demande_TransportUFauteuilBariatiqueU: "Fauteuil bariatrique",
  Demande_TransportTFauteuilBariatiqueT: "Fauteuil bariatrique",
  Demande_TransportUFauteuilMotoriseU: "Fauteuil motorisé",
  Demande_TransportUFauteuilMultiPositionU: "Fauteuil multiposition",
  Demande_TransportTFauteuilMultiPositionT: "Fauteuil multiposition",
  Demande_TransportUFauteuilStandardU: "Fauteuil roulant standard",
  Demande_TransportTFauteuilStandardT: "Fauteuil roulant standard",
  Demande_TransportFauteuilStandardE: "Fauteuil roulant standard",
  Isolettte: "Isolette",
  Demande_TransportUMachette: "Marchette",
  Demande_TransportEMachette: "Marchette",
  Demande_TransportTMatelasImmobilisateur: "Matelas immobilisateur",
  "Moniteur+DéfibrilateurT": "Moniteur défibrillateur",
  "Moniteur+Défibrilateur": "Moniteur défibrillateur",
  Demande_TransportEOxygene: "Oxygène (E)",
  Demande_TransportEOxygeneT: "Oxygène (E)",
  Demande_TransportAutreEquipements: "Oxygène (M)",
  Demande_TransportAutreEquipementsPompeVolumetrique: "Pompe volumétrique",
  Demande_TransportAutreEquipementsOxygeneTigeSolute: "Soluté ou médicament IV",
  Demande_ToileLevier: "Toile de levier",
};

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });
    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const getMoisFromDate = (dateStr) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || "").trim());
  if (!m) return null;
  const moisIndex = Number(m[2]) - 1;
  return MOIS_NOMS[moisIndex] || null;
};

const getPenaliteVille = (paramOptim, villeNom) => {
  if (!villeNom) return 0;
  return paramOptim.penalitesParVille[villeNom] || 0;
};

const normalizeParamOptim = (data) => {
  const tempsParMobilite = Object.create(null);
  const penalitesParMois = Object.create(null);
  const penalitesParVille = Object.create(null);

  for (let i = 1; i <= Number(data["Temps_EmbDeb"] || 0); i++) {
    const mobilite = data[`Temps_EmbDeb|3|Mobilite|${i}`];
    if (mobilite) {
      tempsParMobilite[mobilite] = {
        Embarquement: Number(data[`Temps_EmbDeb|1|Embarquement|${i}`]) || 0,
        Debarquement: Number(data[`Temps_EmbDeb|2|Debarquement|${i}`]) || 0,
      };
    }
  }
  for (let i = 1; i <= Number(data["Penalite_TempsAppli"] || 0); i++) {
    const mois = data[`Penalite_TempsAppli|1|Mois|${i}`];
    if (mois) {
      penalitesParMois[mois] =
        Number(data[`Penalite_TempsAppli|2|Penalite|${i}`]) || 0;
    }
  }
  for (let i = 1; i <= Number(data["PenaliteSecteur_Ville"] || 0); i++) {
    const ville = data[`PenaliteSecteur_Ville|1|Ville|${i}`];
    if (ville) {
      penalitesParVille[ville] =
        Number(data[`PenaliteSecteur_Ville|2|Penalite|${i}`]) || 0;
    }
  }

  return { ...data, tempsParMobilite, penalitesParMois, penalitesParVille };
};

const getParamOptimAdjustments = async () => {
  const equipementsCoches = new Set();
  Object.entries(EQUIPEMENT_KEY_MAP).forEach(([key, equipementName]) => {
    if (docData?.[key] === "true") {
      equipementsCoches.add(equipementName);
    }
  });

  const ids = await getDocumentIDsByFilters([
    {
      key: "FORMLAYOUTID",
      operator: "EQUALS",
      value: FORMLAYOUT_PARAM_OPTIM,
      type: "TEXT",
    },
    { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
  ]);

  if (!ids.length) {
    return {
      embDebMinutes: 0,
      penalitePercentMois: 0,
      penaliteVilleDepart: 0,
      penaliteVilleDestination: 0,
    };
  }

  const docs = await getDocumentsByIDs(ids);
  const paramOptim = normalizeParamOptim(JSON.parse(docs[0]?.data || "{}"));

  let embDebMinutes = 0;
  for (const equipement of equipementsCoches) {
    const temps = paramOptim.tempsParMobilite[equipement];
    if (temps) embDebMinutes += temps.Embarquement + temps.Debarquement;
  }

  const dateDepart =
    docData?.["Demande_TransportTransportRetourDateTransportDepart"];
  const moisDepart = getMoisFromDate(dateDepart);
  const penalitePercentMois = paramOptim.penalitesParMois[moisDepart] || 0;

  const villeDepart =
    docData?.["Demande_TransportTransportRetourNomVilleDepart"];
  const villeDestination =
    docData?.["Demande_TransportTransportRetourNomVilleDestination"];

  const penaliteVilleDepart = getPenaliteVille(paramOptim, villeDepart);
  const penaliteVilleDestination = getPenaliteVille(
    paramOptim,
    villeDestination,
  );

  return {
    embDebMinutes,
    penalitePercentMois,
    penaliteVilleDepart,
    penaliteVilleDestination,
  };
};

const pad2 = (n) => String(n).padStart(2, "0");
const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!m) return NaN;
  const h = Number(m[1]),
    mn = Number(m[2]);
  if (h < 0 || h > 23 || mn < 0 || mn > 59) return NaN;
  return h * 60 + mn;
};
const toHHMM = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60),
    mn = m % 60;
  return `${pad2(h)}:${pad2(mn)}`;
};
const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";
const changed = (k) => {
  const uk = context?.updatedKeys || context?.updatedField || [];
  if (Array.isArray(uk)) return uk.includes(k);
  return uk === k || context?.inputKey === k;
};

// dates
const parseDate = (s) => {
  if (!has(s)) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!isNaN(d.getTime())) return d;
  }
  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
};
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDays = (s, n) => {
  const d = parseDate(s);
  if (!d) return null;
  d.setDate(d.getDate() + n);
  return fmtDate(d);
};

const result = {};
const setField = (key, value) => {
  const cur = docData?.[key];
  if (cur !== value) {
    if (docData) docData[key] = value;
    result[key] = value;
  }
};

const main = async () => {
  const depStr = docData?.[FIELD_DEP];
  const arrStr = docData?.[FIELD_ARR];
  const durMinBrut = Number.parseInt(docData?.[FIELD_DUR], 10);

  const depMin = has(depStr) ? toMinutes(depStr) : NaN;
  const arrMin = has(arrStr) ? toMinutes(arrStr) : NaN;
  const durOk = Number.isFinite(durMinBrut) && durMinBrut >= 0;
  const hasValidTime = Number.isFinite(depMin) || Number.isFinite(arrMin);
  if (!durOk || !hasValidTime) {
    return;
  }

  const {
    embDebMinutes,
    penalitePercentMois,
    penaliteVilleDepart,
    penaliteVilleDestination,
  } = await getParamOptimAdjustments();
  const durMin = Math.round(
    durMinBrut +
      durMinBrut * (penalitePercentMois / 100) +
      (durMinBrut / 2) * (penaliteVilleDepart / 100) +
      (durMinBrut / 2) * (penaliteVilleDestination / 100),
  );
  let computed = false;

  {
    if (Number.isFinite(depMin) && !Number.isFinite(arrMin)) {
      // calcule l'arrivée à partir du départ + durée
      const sum = depMin + durMin + embDebMinutes;
      setField(FIELD_ARR, toHHMM(sum));
      computed = true;

      if (has(depStr) && has(docData?.[DATE_DEP])) {
        // passage à J+1 ?
        if (sum % 1440 < depMin % 1440) {
          const next = addDays(docData[DATE_DEP], 1);
          if (next) setField(DATE_ARR, next);
        } else if (!has(docData?.[DATE_ARR])) {
          setField(DATE_ARR, docData[DATE_DEP]);
        }
      }
    } else if (!Number.isFinite(depMin) && Number.isFinite(arrMin)) {
      // calcule le départ à partir de l'arrivée - durée
      const diff = arrMin - durMin - embDebMinutes;
      setField(FIELD_DEP, toHHMM(diff));
      computed = true;

      if (has(arrStr) && has(docData?.[DATE_ARR])) {
        // passage à J-1 ?
        const depWrap = ((diff % 1440) + 1440) % 1440;
        if (depWrap > arrMin % 1440) {
          const prev = addDays(docData[DATE_ARR], -1);
          if (prev) setField(DATE_DEP, prev);
        } else if (!has(docData?.[DATE_DEP])) {
          setField(DATE_DEP, docData[DATE_ARR]);
        }
      }
    } else if (Number.isFinite(depMin) && Number.isFinite(arrMin)) {
      if (changed(FIELD_DEP)) {
        // priorité au départ modifié
        const sum = depMin + durMin + embDebMinutes;
        setField(FIELD_ARR, toHHMM(sum));
        computed = true;

        if (has(docData?.[DATE_DEP])) {
          if (sum % 1440 < depMin % 1440) {
            const next = addDays(docData[DATE_DEP], 1);
            if (next) setField(DATE_ARR, next);
          } else if (!has(docData?.[DATE_ARR])) {
            setField(DATE_ARR, docData[DATE_DEP]);
          }
        }
      } else if (changed(FIELD_ARR)) {
        // priorité à l'arrivée modifiée
        const diff = arrMin - durMin - embDebMinutes;
        setField(FIELD_DEP, toHHMM(diff));
        computed = true;

        if (has(docData?.[DATE_ARR])) {
          const depWrap = ((diff % 1440) + 1440) % 1440;
          if (depWrap > arrMin % 1440) {
            const prev = addDays(docData[DATE_ARR], -1);
            if (prev) setField(DATE_DEP, prev);
          } else if (!has(docData?.[DATE_DEP])) {
            setField(DATE_DEP, docData[DATE_ARR]);
          }
        }
      } else {
        // rien de « changé » détecté => recalcule l’arrivée depuis le départ
        const sum = depMin + durMin + embDebMinutes;
        setField(FIELD_ARR, toHHMM(sum));
        computed = true;

        if (has(docData?.[DATE_DEP])) {
          if (sum % 1440 < depMin % 1440) {
            const next = addDays(docData[DATE_DEP], 1);
            if (next) setField(DATE_ARR, next);
          } else if (!has(docData?.[DATE_ARR])) {
            setField(DATE_ARR, docData[DATE_DEP]);
          }
        }
      }
    }
  }

  callback({ data: computed ? result : {} });
};

main();
