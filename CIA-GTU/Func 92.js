console.log("Fonction 92 ", context);

// --- Champs "aller" (par défaut) ---
const FIELD_LAND_1 = "TransportAerien_Heureatterrissage";
const DATE_LAND_1 = "Demande_TransportTransportSimpleDateTransportArrivee";
const DATE_LAND_2 = "TransportAerien_Dateatterrissage2";
const DATE_TAKEOFF_DEPARTURE = "TransportAerien_Dateatterrissage";

// --- Champs "retour" (base de calcul) ---
const FIELD_LAND_2 = "TransportAerien_Heureatterrissage2";
const DATE_TAKEOFF_RETURN = "Demande_TransportAerienRetourDecollageDate";
const DATE_LANDING_RETURN = "Demande_TransportAerienRetourAtterrissage";

// --- Champs calculés (communs) ---
const FIELD_ARR = "Demande_TransportTransportSimpleHeureArriveeSouhaite";
const FIELD_DEP = "Demande_TransportTransportSimpleHeureDepartSouhaitee";

const DATE_ARR = "Demande_TransportTransportSimpleDateTransportArrivee";
const DATE_DEP = "Demande_TransportTransportSimpleDateTransportDepart";

const FIELD_VILLE_DEPART = "Demande_TransportTransportSimpleNomVilleDepart";
const FIELD_ADRESSE_DESTINATION =
  "Demande_TransportTransportSimpleAdresseCompleteDestination";

const FIELD_ADRESSE_ATTERRISSAGE_RETOUR = "TransportAerien_AdresseAtterissage";
const FIELD_VILLE_DESTINATION_RETOUR =
  "Demande_TransportRoutierVilleDeDestination";

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

const getVilleFromAdresse = (adresse) => {
  if (!has(adresse)) return null;
  const parts = String(adresse)
    .split(",")
    .map((p) => p.trim());
  return parts[1] || null;
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

  return { tempsParMobilite, penalitesParMois, penalitesParVille };
};

const loadParamOptim = async () => {
  const ids = await getDocumentIDsByFilters([
    {
      key: "FORMLAYOUTID",
      operator: "EQUALS",
      value: FORMLAYOUT_PARAM_OPTIM,
      type: "TEXT",
    },
    { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
  ]);
  if (!ids.length) return normalizeParamOptim({});
  const docs = await getDocumentsByIDs(ids);
  return normalizeParamOptim(JSON.parse(docs[0]?.data || "{}"));
};

const getEmbDebMinutes = (paramOptim) => {
  const equipementsCoches = new Set();
  Object.entries(EQUIPEMENT_KEY_MAP).forEach(([key, equipementName]) => {
    if (docData?.[key] === "true") {
      equipementsCoches.add(equipementName);
    }
  });

  if (equipementsCoches.size === 0) return 0;

  let total = 0;
  for (const equipement of equipementsCoches) {
    const temps = paramOptim.tempsParMobilite[equipement];
    if (temps) total += temps.Embarquement + temps.Debarquement;
  }
  return total;
};

const getPenalitePercentMois = (paramOptim, dateStr) => {
  const mois = getMoisFromDate(dateStr);
  if (!mois) return 0;
  return paramOptim.penalitesParMois[mois] || 0;
};

const result = {};
const setField = (key, value) => {
  const cur = docData?.[key];
  if (cur !== value) {
    if (docData) docData[key] = value;
    result[key] = value;
  }
};

// --- Détection retour ---
const isRetour =
  String(docData?.DemandeTransportInformationsTransportRetour || "")
    .trim()
    .toLowerCase() === "true";

const FIELD_DUR = isRetour
  ? "TransportSysteme_DureeTrajetAtterissage"
  : "TransportSysteme_DureeTrajetAller";

const FIELD_LAND = isRetour ? FIELD_LAND_2 : FIELD_LAND_1;
const DATE_LAND = isRetour ? DATE_LAND_2 : DATE_ARR;

const main = async () => {
  let computed = false;

  const landStr = docData?.[FIELD_LAND];
  const durMinBrut = Number.parseInt(docData?.[FIELD_DUR], 10);

  const landMin = has(landStr) ? toMinutes(landStr) : NaN;
  const durOk = Number.isFinite(durMinBrut) && durMinBrut >= 0;

  // cas de retour lieu atterissage vers lieu de dest

  if (isRetour && Number.isFinite(landMin)) {
    // Heure de prise en charge = atterrissage + 15
    const depMinsRaw = landMin + 15;
    setField(FIELD_DEP, toHHMM(depMinsRaw));

    if (has(docData?.[DATE_LAND])) {
      const landNorm = landMin % 1440;
      const depNorm = depMinsRaw % 1440;

      if (depNorm < landNorm) {
        const next = addDays(docData[DATE_LAND], +1);
        if (next) setField(DATE_DEP, next);
      } else if (!has(docData?.[DATE_DEP])) {
        setField(DATE_DEP, docData[DATE_LAND]);
      }
    }

    if (durOk) {
      const paramOptim = await loadParamOptim();
      const embDebMinutes = getEmbDebMinutes(paramOptim);

      const dateForPenalite = docData?.[DATE_LANDING_RETURN];
      const penalitePercentMois = getPenalitePercentMois(
        paramOptim,
        dateForPenalite,
      );

      const villeAtterrissage = getVilleFromAdresse(
        docData?.[FIELD_ADRESSE_ATTERRISSAGE_RETOUR],
      );
      const villeDestination = docData?.[FIELD_VILLE_DESTINATION_RETOUR];

      const penaliteVilleAtterrissage = getPenaliteVille(
        paramOptim,
        villeAtterrissage,
      );
      const penaliteVilleDestination = getPenaliteVille(
        paramOptim,
        villeDestination,
      );

      const durMin = Math.round(
        durMinBrut +
          durMinBrut * (penalitePercentMois / 100) +
          (durMinBrut / 2) * (penaliteVilleAtterrissage / 100) +
          (durMinBrut / 2) * (penaliteVilleDestination / 100),
      );

      // arrivée à destination = prise en charge + durée (avec pénalités) + embDeb
      const arrMinsRaw = depMinsRaw + durMin + embDebMinutes;
      setField(FIELD_ARR, toHHMM(arrMinsRaw));

      if (has(docData?.[DATE_DEP])) {
        const depNorm = depMinsRaw % 1440;
        const arrNorm = arrMinsRaw % 1440;
        if (arrNorm < depNorm) {
          const next = addDays(docData[DATE_DEP], +1);
          if (next) setField(DATE_ARR, next);
        } else if (!has(docData?.[DATE_ARR])) {
          setField(DATE_ARR, docData[DATE_DEP]);
        }
      }
    }

    computed = true;
    callback({ data: result });
    return;
  }

  // ======================
  // CAS ALLER : base = TransportAerien_Heureatterrissage + DATE_ARR
  // ======================
  if (Number.isFinite(landMin)) {
    const arrMinsRaw = landMin - 15;
    setField(FIELD_ARR, toHHMM(arrMinsRaw));
    setField("TEMPORARY_HeureSimpleLockHint", "arrivee");
    computed = true;

    if (has(docData?.[DATE_ARR])) {
      const wrappedToPrev =
        ((arrMinsRaw % 1440) + 1440) % 1440 > landMin % 1440;
      if (wrappedToPrev) {
        const prev = addDays(docData[DATE_ARR], -1);
        if (prev) setField(DATE_ARR, prev);
      }
    }

    if (durOk) {
      const paramOptim = await loadParamOptim();
      const embDebMinutes = getEmbDebMinutes(paramOptim);

      const dateForPenalite = docData?.[DATE_ARR] || docData?.[DATE_DEP];
      const penalitePercentMois = getPenalitePercentMois(
        paramOptim,
        dateForPenalite,
      );

      const villeDepart = docData?.[FIELD_VILLE_DEPART];
      const villeAeroport = getVilleFromAdresse(
        docData?.[FIELD_ADRESSE_DESTINATION],
      );

      const penaliteVilleDepart = getPenaliteVille(paramOptim, villeDepart);
      const penaliteVilleAeroport = getPenaliteVille(paramOptim, villeAeroport);

      const durMin = Math.round(
        durMinBrut +
          durMinBrut * (penalitePercentMois / 100) +
          (durMinBrut / 2) * (penaliteVilleDepart / 100) +
          (durMinBrut / 2) * (penaliteVilleAeroport / 100),
      );

      // départ = arrivée - durée (avec pénalités) - embDeb
      const depMinsRaw = arrMinsRaw - durMin - embDebMinutes;
      setField(FIELD_DEP, toHHMM(depMinsRaw));

      if (has(docData?.[DATE_ARR])) {
        const arrNorm = ((arrMinsRaw % 1440) + 1440) % 1440;
        const depNorm = ((depMinsRaw % 1440) + 1440) % 1440;

        if (depNorm > arrNorm) {
          const prev = addDays(docData[DATE_ARR], -1);
          if (prev) setField(DATE_DEP, prev);
        } else if (!has(docData?.[DATE_DEP])) {
          setField(DATE_DEP, docData[DATE_ARR]);
        }
      }
    }

    // Date atterrissage = date décollage + 2h
    const dateDecollage = docData?.[DATE_TAKEOFF_DEPARTURE];
    const heureDecollage = docData?.[FIELD_LAND_1];
    if (has(dateDecollage) && has(heureDecollage)) {
      const decollageDateTime = new Date(
        `${dateDecollage}T${heureDecollage}:00`,
      );
      const atterrissageDateTime = new Date(
        decollageDateTime.getTime() + 2 * 60 * 60 * 1000,
      );
      setField(DATE_LAND_2, fmtDate(atterrissageDateTime));
    }
  }

  if (computed) {
    callback({ data: result });
    callback({ data: result });
  }
};

main();
