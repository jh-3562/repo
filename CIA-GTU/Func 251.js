console.log("Fonction 251", context);

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

const FIELD_VILLE_DEPART_AERIEN =
  "Demande_TransportTransportSimpleNomVilleDepart";
const FIELD_ADRESSE_DESTINATION_AERIEN =
  "Demande_TransportTransportSimpleAdresseCompleteDestination";
const FIELD_ADRESSE_ATTERRISSAGE_RETOUR = "TransportAerien_AdresseAtterissage";
const FIELD_VILLE_DESTINATION_RETOUR =
  "Demande_TransportRoutierVilleDeDestination";

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

// ==== Popup de choix (Annuler / Heure de départ / Heure d'arrivée) ====

const showRecalculChoicePopup = () => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "recalculChoiceOverlay";
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; justify-content: center; align-items: center; z-index: 10000;
    `;

    const popup = document.createElement("div");
    popup.style.cssText = `
      background: white; border-radius: 10px; padding: 24px 28px;
      width: 420px; max-width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    `;

    popup.innerHTML = `
      <h3 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#000;">Paramètres de calcul modifiés</h3>
      <p style="margin:0 0 20px;font-size:14px;color:#333;">Que souhaitez-vous recalculer ?</p>
      <div style="display:flex;gap:10px;">
        <button id="recalculCancel" style="
          flex:1;padding:12px 8px;background:#F1F1F1;color:#000000;border:none;
          border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;
        ">Annuler</button>
        <button id="recalculDepart" style="
          flex:1;padding:12px 8px;background:#D0DE9F;color:#212A00;border:none;
          border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;
        ">Heure de départ</button>
        <button id="recalculArrivee" style="
          flex:1;padding:12px 8px;background:#D0DE9F;color:#212A00;border:none;
          border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;
        ">Heure d'arrivée</button>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.appendChild(popup);

    const cleanup = () => document.body.removeChild(overlay);

    document.getElementById("recalculCancel").addEventListener("click", () => {
      cleanup();
      resolve(null);
    });
    document.getElementById("recalculDepart").addEventListener("click", () => {
      cleanup();
      resolve("depart");
    });
    document.getElementById("recalculArrivee").addEventListener("click", () => {
      cleanup();
      resolve("arrivee");
    });
  });
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

const getVilleFromAdresse = (adresse) => {
  if (!has(adresse)) return null;
  const parts = String(adresse)
    .split(",")
    .map((p) => p.trim());
  return parts[1] || null;
};

const geocodeAddress = async (address) => {
  if (!has(address) || !globalThis.google?.maps?.Geocoder) return null;

  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ address: String(address) });
  const location = response?.results?.[0]?.geometry?.location;
  if (!location) return null;

  return { latitude: location.lat(), longitude: location.lng() };
};

const getDrivingDurationMinutes = async (origin, destination) => {
  if (
    !has(origin) ||
    !has(destination) ||
    !globalThis.google?.maps?.DirectionsService
  ) {
    return null;
  }

  const service = new google.maps.DirectionsService();
  const response = await service.route({
    origin: String(origin),
    destination: String(destination),
    travelMode: google.maps.TravelMode.DRIVING,
  });
  const durationSeconds = response?.routes?.[0]?.legs?.[0]?.duration?.value;
  return Number.isFinite(durationSeconds)
    ? Math.ceil(durationSeconds / 60)
    : null;
};

const refreshTransportData = async (segment, result) => {
  const prefix = `Demande_TransportTransport${segment}`;
  const fields =
    segment === "Simple"
      ? {
          origin: `${prefix}AdresseCompleteDepart`,
          destination: `${prefix}AdresseCompleteDestination`,
          latitudeOrigin: "TransportSysteme_LatitudeDepart",
          longitudeOrigin: "TransportSysteme_LongitudeDepart",
          latitudeDestination: "TransportSysteme_LatitudeDestination",
          longitudeDestination: "TransportSysteme_LongitudeDestination",
          duration: "TransportSysteme_DureeTrajetAller",
        }
      : {
          origin: `${prefix}AdresseCompleteDepart`,
          destination: `${prefix}AdresseCompleteDestination`,
          latitudeOrigin: "TransportSysteme_LatitudeDepartRetour",
          longitudeOrigin: "TransportSysteme_LongitudeDepartRetour",
          latitudeDestination: "TransportSysteme_LatitudeDestinationRetour",
          longitudeDestination: "TransportSysteme_LongitudeDestinationRetour",
          duration: "TransportSysteme_DureeTrajetRetour",
        };

  const origin = docData?.[fields.origin];
  const destination = docData?.[fields.destination];
  if (!has(origin) || !has(destination)) return;

  const [originCoordinates, destinationCoordinates, duration] =
    await Promise.all([
      geocodeAddress(origin),
      geocodeAddress(destination),
      getDrivingDurationMinutes(origin, destination),
    ]);

  const setField = (key, value) => {
    if (value === null || value === undefined) return;
    docData[key] = value;
    result[key] = value;
  };

  setField(fields.latitudeOrigin, originCoordinates?.latitude);
  setField(fields.longitudeOrigin, originCoordinates?.longitude);
  setField(fields.latitudeDestination, destinationCoordinates?.latitude);
  setField(fields.longitudeDestination, destinationCoordinates?.longitude);
  setField(fields.duration, duration);
};

const computeHeuresForSegment = (segment, choice, paramOptim, result) => {
  const FIELD_DEP = `Demande_TransportTransport${segment}HeureDepartSouhaitee`;
  const FIELD_ARR = `Demande_TransportTransport${segment}HeureArriveeSouhaite`;
  const FIELD_DUR =
    segment === "Simple"
      ? "TransportSysteme_DureeTrajetAller"
      : "TransportSysteme_DureeTrajetRetour";
  const DATE_DEP = `Demande_TransportTransport${segment}DateTransportDepart`;
  const DATE_ARR = `Demande_TransportTransport${segment}DateTransportArrivee`;
  const FIELD_VILLE_DEP = `Demande_TransportTransport${segment}NomVilleDepart`;
  const FIELD_VILLE_DEST = `Demande_TransportTransport${segment}NomVilleDestination`;
  const COORDINATE_FIELDS =
    segment === "Simple"
      ? [
          "TransportSysteme_LatitudeDepart",
          "TransportSysteme_LongitudeDepart",
          "TransportSysteme_LatitudeDestination",
          "TransportSysteme_LongitudeDestination",
        ]
      : [
          "TransportSysteme_LatitudeDepartRetour",
          "TransportSysteme_LongitudeDepartRetour",
          "TransportSysteme_LatitudeDestinationRetour",
          "TransportSysteme_LongitudeDestinationRetour",
        ];

  const setField = (key, value) => {
    const cur = docData?.[key];
    if (cur !== value) {
      if (docData) docData[key] = value;
      result[key] = value;
    }
  };

  const durMinBrut = Number.parseInt(docData?.[FIELD_DUR], 10);
  const durOk = Number.isFinite(durMinBrut) && durMinBrut >= 0;
  if (!durOk) return;

  const embDebMinutes = getEmbDebMinutes(paramOptim);

  const dateDepart = docData?.[DATE_DEP] || docData?.[DATE_ARR];
  const penalitePercentMois = getPenalitePercentMois(paramOptim, dateDepart);

  const villeDepart = docData?.[FIELD_VILLE_DEP];
  const villeDestination = docData?.[FIELD_VILLE_DEST];
  const penaliteVilleDepart = getPenaliteVille(paramOptim, villeDepart);
  const penaliteVilleDestination = getPenaliteVille(
    paramOptim,
    villeDestination,
  );

  const durMin = Math.round(
    durMinBrut +
      durMinBrut * (penalitePercentMois / 100) +
      (durMinBrut / 2) * (penaliteVilleDepart / 100) +
      (durMinBrut / 2) * (penaliteVilleDestination / 100),
  );
  if (penalitePercentMois || penaliteVilleDepart || penaliteVilleDestination) {
    setField(FIELD_DUR, String(durMin));
  }
  COORDINATE_FIELDS.forEach((key) => {
    if (has(docData?.[key])) result[key] = docData[key];
  });

  if (choice === "arrivee") {
    const depStr = docData?.[FIELD_DEP];
    if (!has(depStr)) return;
    const depMin = toMinutes(depStr);
    if (!Number.isFinite(depMin)) return;

    const sum = depMin + durMin + embDebMinutes;
    setField(FIELD_ARR, toHHMM(sum));

    if (has(docData?.[DATE_DEP])) {
      if (sum % 1440 < depMin % 1440) {
        const next = addDays(docData[DATE_DEP], 1);
        if (next) setField(DATE_ARR, next);
      } else if (!has(docData?.[DATE_ARR])) {
        setField(DATE_ARR, docData[DATE_DEP]);
      }
    }
  } else if (choice === "depart") {
    const arrStr = docData?.[FIELD_ARR];
    if (!has(arrStr)) return;
    const arrMin = toMinutes(arrStr);
    if (!Number.isFinite(arrMin)) return;

    const diff = arrMin - durMin - embDebMinutes;
    setField(FIELD_DEP, toHHMM(diff));

    if (has(docData?.[DATE_ARR])) {
      const depWrap = ((diff % 1440) + 1440) % 1440;
      if (depWrap > arrMin % 1440) {
        const prev = addDays(docData[DATE_ARR], -1);
        if (prev) setField(DATE_DEP, prev);
      } else if (!has(docData?.[DATE_DEP])) {
        setField(DATE_DEP, docData[DATE_ARR]);
      }
    }
  }
};

const computeHeuresAerienAller = (choice, paramOptim, result) => {
  const FIELD_DEP = "Demande_TransportTransportSimpleHeureDepartSouhaitee";
  const FIELD_ARR = "Demande_TransportTransportSimpleHeureArriveeSouhaite";
  const FIELD_DUR = "TransportSysteme_DureeTrajetAller";
  const DATE_DEP = "Demande_TransportTransportSimpleDateTransportDepart";
  const DATE_ARR = "Demande_TransportTransportSimpleDateTransportArrivee";
  const COORDINATE_FIELDS = [
    "TransportSysteme_LatitudeDepart",
    "TransportSysteme_LongitudeDepart",
    "TransportSysteme_LatitudeDestination",
    "TransportSysteme_LongitudeDestination",
  ];

  const setField = (key, value) => {
    const cur = docData?.[key];
    if (cur !== value) {
      if (docData) docData[key] = value;
      result[key] = value;
    }
  };

  const durMinBrut = Number.parseInt(docData?.[FIELD_DUR], 10);
  const durOk = Number.isFinite(durMinBrut) && durMinBrut >= 0;
  if (!durOk) return;

  const embDebMinutes = getEmbDebMinutes(paramOptim);

  const dateDepart = docData?.[DATE_DEP] || docData?.[DATE_ARR];
  const penalitePercentMois = getPenalitePercentMois(paramOptim, dateDepart);

  const villeDepart = docData?.[FIELD_VILLE_DEPART_AERIEN];
  const villeAeroport = getVilleFromAdresse(
    docData?.[FIELD_ADRESSE_DESTINATION_AERIEN],
  );
  const penaliteVilleDepart = getPenaliteVille(paramOptim, villeDepart);
  const penaliteVilleAeroport = getPenaliteVille(paramOptim, villeAeroport);

  const durMin = Math.round(
    durMinBrut +
      durMinBrut * (penalitePercentMois / 100) +
      (durMinBrut / 2) * (penaliteVilleDepart / 100) +
      (durMinBrut / 2) * (penaliteVilleAeroport / 100),
  );
  if (penalitePercentMois || penaliteVilleDepart || penaliteVilleAeroport) {
    setField(FIELD_DUR, String(durMin));
  }
  COORDINATE_FIELDS.forEach((key) => {
    if (has(docData?.[key])) result[key] = docData[key];
  });

  if (choice === "arrivee") {
    const depStr = docData?.[FIELD_DEP];
    if (!has(depStr)) return;
    const depMin = toMinutes(depStr);
    if (!Number.isFinite(depMin)) return;

    const sum = depMin + durMin + embDebMinutes;
    setField(FIELD_ARR, toHHMM(sum));

    if (has(docData?.[DATE_DEP])) {
      if (sum % 1440 < depMin % 1440) {
        const next = addDays(docData[DATE_DEP], 1);
        if (next) setField(DATE_ARR, next);
      } else if (!has(docData?.[DATE_ARR])) {
        setField(DATE_ARR, docData[DATE_DEP]);
      }
    }
  } else if (choice === "depart") {
    const arrStr = docData?.[FIELD_ARR];
    if (!has(arrStr)) return;
    const arrMin = toMinutes(arrStr);
    if (!Number.isFinite(arrMin)) return;

    const diff = arrMin - durMin - embDebMinutes;
    setField(FIELD_DEP, toHHMM(diff));

    if (has(docData?.[DATE_ARR])) {
      const depWrap = ((diff % 1440) + 1440) % 1440;
      if (depWrap > arrMin % 1440) {
        const prev = addDays(docData[DATE_ARR], -1);
        if (prev) setField(DATE_DEP, prev);
      } else if (!has(docData?.[DATE_DEP])) {
        setField(DATE_DEP, docData[DATE_ARR]);
      }
    }
  }
};

const computeHeuresAerienRetour = (choice, paramOptim, result) => {
  const FIELD_DEP = "Demande_TransportTransportSimpleHeureDepartSouhaitee";
  const FIELD_ARR = "Demande_TransportTransportSimpleHeureArriveeSouhaite";
  const FIELD_DUR = "TransportSysteme_DureeTrajetAtterissage";
  const DATE_DEP = "Demande_TransportTransportSimpleDateTransportDepart";
  const DATE_ARR = "Demande_TransportTransportSimpleDateTransportArrivee";
  const COORDINATE_FIELDS = [
    "TransportSysteme_LatitudeDepart",
    "TransportSysteme_LongitudeDepart",
    "TransportSysteme_LatitudeDestination",
    "TransportSysteme_LongitudeDestination",
  ];

  const setField = (key, value) => {
    const cur = docData?.[key];
    if (cur !== value) {
      if (docData) docData[key] = value;
      result[key] = value;
    }
  };

  const durMinBrut = Number.parseInt(docData?.[FIELD_DUR], 10);
  const durOk = Number.isFinite(durMinBrut) && durMinBrut >= 0;
  if (!durOk) return;

  const embDebMinutes = getEmbDebMinutes(paramOptim);

  const dateDepart = docData?.[DATE_DEP] || docData?.[DATE_ARR];
  const penalitePercentMois = getPenalitePercentMois(paramOptim, dateDepart);

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
  if (
    penalitePercentMois ||
    penaliteVilleAtterrissage ||
    penaliteVilleDestination
  ) {
    setField(FIELD_DUR, String(durMin));
  }
  COORDINATE_FIELDS.forEach((key) => {
    if (has(docData?.[key])) result[key] = docData[key];
  });

  if (choice === "arrivee") {
    const depStr = docData?.[FIELD_DEP];
    if (!has(depStr)) return;
    const depMin = toMinutes(depStr);
    if (!Number.isFinite(depMin)) return;

    const sum = depMin + durMin + embDebMinutes;
    setField(FIELD_ARR, toHHMM(sum));

    if (has(docData?.[DATE_DEP])) {
      if (sum % 1440 < depMin % 1440) {
        const next = addDays(docData[DATE_DEP], 1);
        if (next) setField(DATE_ARR, next);
      } else if (!has(docData?.[DATE_ARR])) {
        setField(DATE_ARR, docData[DATE_DEP]);
      }
    }
  } else if (choice === "depart") {
    const arrStr = docData?.[FIELD_ARR];
    if (!has(arrStr)) return;
    const arrMin = toMinutes(arrStr);
    if (!Number.isFinite(arrMin)) return;

    const diff = arrMin - durMin - embDebMinutes;
    setField(FIELD_DEP, toHHMM(diff));

    if (has(docData?.[DATE_ARR])) {
      const depWrap = ((diff % 1440) + 1440) % 1440;
      if (depWrap > arrMin % 1440) {
        const prev = addDays(docData[DATE_ARR], -1);
        if (prev) setField(DATE_DEP, prev);
      } else if (!has(docData?.[DATE_DEP])) {
        setField(DATE_DEP, docData[DATE_ARR]);
      }
    }
  }
};

const updateOneDocument_FASTER = async (
  api,
  document,
  preventNotify = "DOCUMENT",
) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: document,
      preventNotify,
    });

    return response?.data?.document || null;
  } catch (error) {
    console.log("Erreur lors de la modification du document.");
    throw error;
  }
};

const createUpdateDocument_FASTER = (data, templateId, status, docID) => {
  return {
    data: formatDataAPI_FASTER(data),
    status,
    active: true,
    template: { templateId },
    documentID: docID,
  };
};

const main = async () => {
  const isRoutier = docData?.["Demande_ModeDeTransport"] === "Routier";
  const isAerien = docData?.["Demande_ModeDeTransport"] === "Aérien";
  if (!isRoutier && !isAerien) return;

  const choice = await showRecalculChoicePopup();
  if (!choice) return;

  showPopupLoading("Recalcul des heures en cours...");

  try {
    const paramOptim = await loadParamOptim();
    const result = {};
    if (isRoutier) {
      const isAllerRetour =
        docData?.[
          "Demande_TransportInformationTransportTransportAllerRetour"
        ] === "true";

      await refreshTransportData("Simple", result);
      computeHeuresForSegment("Simple", choice, paramOptim, result);

      if (isAllerRetour) {
        await refreshTransportData("Retour", result);
        computeHeuresForSegment("Retour", choice, paramOptim, result);
      }
    } else if (isAerien) {
      const isRetourAerien =
        docData?.["DemandeTransportInformationsTransportRetour"] === "true";
      if (isRetourAerien) {
        computeHeuresAerienRetour(choice, paramOptim, result);
      } else {
        computeHeuresAerienAller(choice, paramOptim, result);
      }
    }

    const saveDocument = createUpdateDocument_FASTER(
      { ...docData, ...result },
      docData.FORMLAYOUTID,
      docData.STATUS,
      docData.FORMID,
    );

    await updateOneDocument_FASTER(context.api, saveDocument);

    showSuccessBanner("Heures recalculées avec succès.");
    window.location.reload();

    return result;
  } catch (error) {
    console.error("Erreur lors du recalcul des heures:", error);
    showErrorBanner("Une erreur est survenue lors du recalcul des heures.");
  } finally {
    hidePopupLoading();
  }
};

main();
