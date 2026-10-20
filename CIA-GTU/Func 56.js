console.log("Fonction 56", context);

const FIELD_DEP = "Demande_TransportTransportSimpleHeureDepartSouhaitee";
const FIELD_ARR = "Demande_TransportTransportSimpleHeureArriveeSouhaite";
const FIELD_PICKUP = "Demande_TransportTransportSimpleHeurePriseEnCharge";
const FIELD_RDV = "Demande_TransportsimpleHeuredErendezVous";
const FIELD_DUR = "TransportSysteme_DureeTrajetAller";
const FIELD_DUR_RETURN = "TransportSysteme_DureeTrajetRetour";
const FIELD_UNITE = "Demande_AccompagnateurHeure";

const DATE_DEP = "Demande_TransportTransportSimpleDateTransportDepart";
const DATE_ARR = "Demande_TransportTransportSimpleDateTransportArrivee";

const FIELD_MOTIF = "Demande_TypeDeTransport2";
const FIELD_ADDRESS = "Demande_TransportTransportSimpleAdresseCompleteDepart";
const FIELD_ADDRESS_DESTINATION =
  "Demande_TransportTransportSimpleAdresseCompleteDestination";
const FIELD_LATITUDE = "Demande_TransportTransportSimpleLatitudeDepart";
const FIELD_LONGITUDE = "Demande_TransportTransportSimpleLongitudeDepart";
const FIELD_SAME_USER_ADDRESS = "Demande_MemeAdresseUsager";
const FIELD_USER_LATITUDE = "Systeme_LatitudeAdresseCleint";
const FIELD_USER_LONGITUDE = "Systeme_LongitudeAdresseClient";

const FORMLAYOUT_PARAM_OPTIM = "e371bcfb-1eba-4f0e-aeac-a528b22667e5";
const FIELD_VILLE_DEPART_AERIEN =
  "Demande_TransportTransportSimpleNomVilleDepart";
const FIELD_ADRESSE_DESTINATION_AERIEN =
  "Demande_TransportTransportSimpleAdresseCompleteDestination";
const FIELD_ADRESSE_ATTERRISSAGE_RETOUR = "TransportAerien_AdresseAtterissage";
const FIELD_VILLE_DESTINATION_RETOUR =
  "Demande_TransportRoutierVilleDeDestination";

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
    console.error("debugParam - Failed to fetch document IDs:", error);
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
    console.error("debugParam - Failed to fetch documents:", error);
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

const getVilleFromAdresse = (adresse) => {
  if (!has(adresse)) return null;
  const parts = String(adresse)
    .split(",")
    .map((part) => part.trim());
  return parts[1] || null;
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
      tempsParMobilite: Object.create(null),
      penalitesParMois: Object.create(null),
      penalitesParVille: Object.create(null),
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
    if (temps) {
      const totalMinutes = temps.Embarquement + temps.Debarquement;
      embDebMinutes += totalMinutes;
    }
  }
  const dateDepart =
    docData?.["Demande_TransportTransportSimpleDateTransportDepart"];
  const moisDepart = getMoisFromDate(dateDepart);
  const penalitePercentMois = paramOptim.penalitesParMois[moisDepart] || 0;

  const villeDepart =
    docData?.["Demande_TransportTransportSimpleNomVilleDepart"];
  const villeDestination =
    docData?.["Demande_TransportTransportSimpleNomVilleDestination"];

  const penaliteVilleDepart = getPenaliteVille(paramOptim, villeDepart);
  const penaliteVilleDestination = getPenaliteVille(
    paramOptim,
    villeDestination,
  );

  return {
    ...paramOptim,
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
  const minsFloor5 = Math.floor(mins / 5) * 5;
  const m = ((minsFloor5 % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mn = m % 60;
  return `${pad2(h)}:${pad2(mn)}`;
};

const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";

const changed = (k) => {
  const uk = context?.updatedKeys || context?.updatedField || [];
  if (Array.isArray(uk)) return uk.includes(k);
  return uk === k || context?.inputKey === k;
};

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

const setHeureUniteFromPickup = (pickupHHMM, dateDep) => {
  const pickupMin = toMinutes(pickupHHMM);
  if (!Number.isFinite(pickupMin) || !has(dateDep)) return;
  const heureUnite = toHHMM(pickupMin - 15);
  setField(FIELD_UNITE, `${dateDep}T${heureUnite}:00`);
};

const getAutomaticRecalculationChoice = () => {
  const arrivalChanged =
    changed(FIELD_ARR) ||
    changed(DATE_ARR) ||
    context?.inputKey === FIELD_ARR ||
    context?.inputKey === DATE_ARR;

  return arrivalChanged ? "depart" : "arrivee";
};

const computeHeuresAerien = (choice, paramOptim, result) => {
  const isRetourAerien =
    docData?.["DemandeTransportInformationsTransportRetour"] === true ||
    String(docData?.["DemandeTransportInformationsTransportRetour"] ?? "")
      .trim()
      .toLowerCase() === "true";
  const fieldDuration = isRetourAerien
    ? "TransportSysteme_DureeTrajetAtterissage"
    : "TransportSysteme_DureeTrajetAller";
  const villeDepart = isRetourAerien
    ? getVilleFromAdresse(docData?.[FIELD_ADRESSE_ATTERRISSAGE_RETOUR])
    : docData?.[FIELD_VILLE_DEPART_AERIEN];
  const villeDestination = isRetourAerien
    ? docData?.[FIELD_VILLE_DESTINATION_RETOUR]
    : getVilleFromAdresse(docData?.[FIELD_ADRESSE_DESTINATION_AERIEN]);
  const duration = Number.parseInt(docData?.[fieldDuration], 10);

  if (!Number.isFinite(duration) || duration < 0) return false;

  const embDebMinutes = getEmbDebMinutes(paramOptim);
  const dateDepart = docData?.[DATE_DEP] || docData?.[DATE_ARR];
  const penalitePercentMois = getPenalitePercentMois(paramOptim, dateDepart);
  const penaliteVilleDepart = getPenaliteVille(paramOptim, villeDepart);
  const penaliteVilleDestination = getPenaliteVille(
    paramOptim,
    villeDestination,
  );
  const adjustedDuration = Math.round(
    duration +
      duration * (penalitePercentMois / 100) +
      (duration / 2) * (penaliteVilleDepart / 100) +
      (duration / 2) * (penaliteVilleDestination / 100),
  );

  if (penalitePercentMois || penaliteVilleDepart || penaliteVilleDestination) {
    setField(fieldDuration, String(adjustedDuration));
  }

  if (choice === "arrivee") {
    const departure = toMinutes(docData?.[FIELD_DEP]);
    if (!Number.isFinite(departure)) return false;

    const arrival = departure + adjustedDuration + embDebMinutes;
    setField(FIELD_ARR, toHHMM(arrival));

    if (has(docData?.[DATE_DEP])) {
      if (arrival % 1440 < departure % 1440) {
        const nextDate = addDays(docData[DATE_DEP], 1);
        if (nextDate) setField(DATE_ARR, nextDate);
      } else if (!has(docData?.[DATE_ARR])) {
        setField(DATE_ARR, docData[DATE_DEP]);
      }
    }
  } else {
    const arrival = toMinutes(docData?.[FIELD_ARR]);
    if (!Number.isFinite(arrival)) return false;

    const departure = arrival - adjustedDuration - embDebMinutes;
    setField(FIELD_DEP, toHHMM(departure));

    if (has(docData?.[DATE_ARR])) {
      const departureWrapped = ((departure % 1440) + 1440) % 1440;
      if (departureWrapped > arrival % 1440) {
        const previousDate = addDays(docData[DATE_ARR], -1);
        if (previousDate) setField(DATE_DEP, previousDate);
      } else if (!has(docData?.[DATE_DEP])) {
        setField(DATE_DEP, docData[DATE_ARR]);
      }
    }
  }

  return Object.keys(result).length > 0;
};

const flattenCollectionsForSave = (data) => {
  const flattened = { ...(data || {}) };

  Object.keys(flattened).forEach((key) => {
    const value = flattened[key];
    if (!Array.isArray(value)) return;

    value.forEach((row, index) => {
      Object.keys(row || {}).forEach((subKey) => {
        flattened[`${subKey}|${index + 1}`] = row[subKey];
      });
    });

    flattened[key] = String(value.length);
  });

  return flattened;
};

const saveComputedDocument = async (result) => {
  const documentId = String(docData?.FORMID || "").trim();
  if (!documentId || documentId === "0" || !Object.keys(result).length) {
    return;
  }

  const savedData = flattenCollectionsForSave({
    ...docData,
    ...result,
  });

  await api({ local: true }).put("document", {
    document: {
      documentID: documentId,
      data: JSON.stringify(savedData),
      status: docData?.STATUS,
      active: true,
      template: {
        templateId: docData?.FORMLAYOUTID,
      },
    },
    preventNotify: "DOCUMENT",
  });
};

const fillCoordinates = async () => {
  const latitude = docData?.[FIELD_LATITUDE];
  const longitude = docData?.[FIELD_LONGITUDE];
  const needsTransportCoordinates = !has(latitude) || !has(longitude);
  const sameUserAddress = docData?.[FIELD_SAME_USER_ADDRESS] === "true";
  const needsUserCoordinates =
    sameUserAddress &&
    (!has(docData?.[FIELD_USER_LATITUDE]) ||
      !has(docData?.[FIELD_USER_LONGITUDE]));

  if (!needsTransportCoordinates && !needsUserCoordinates) {
    return false;
  }

  const address = String(docData?.[FIELD_ADDRESS] ?? "").trim();
  if (!address || typeof google === "undefined") {
    return false;
  }

  try {
    const sessionToken = new google.maps.places.AutocompleteSessionToken();
    const { suggestions = [] } =
      await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
        {
          input: address,
          sessionToken,
          locationRestriction: new google.maps.LatLngBounds(
            new google.maps.LatLng(46.7, -79.75),
            new google.maps.LatLng(49.1, -76.0),
          ),
        },
      );

    const prediction = suggestions[0]?.placePrediction;
    if (!prediction) {
      return false;
    }

    const place = prediction.toPlace();
    await place.fetchFields({ fields: ["location"] });
    const resolvedLatitude = place.location?.lat();
    const resolvedLongitude = place.location?.lng();

    if (
      !Number.isFinite(resolvedLatitude) ||
      !Number.isFinite(resolvedLongitude)
    ) {
      return false;
    }

    if (!has(latitude)) {
      setField(FIELD_LATITUDE, resolvedLatitude);
    }
    if (!has(longitude)) {
      setField(FIELD_LONGITUDE, resolvedLongitude);
    }
    if (sameUserAddress) {
      if (!has(docData?.[FIELD_USER_LATITUDE])) {
        setField(FIELD_USER_LATITUDE, resolvedLatitude);
      }
      if (!has(docData?.[FIELD_USER_LONGITUDE])) {
        setField(FIELD_USER_LONGITUDE, resolvedLongitude);
      }
    }

    return true;
  } catch (error) {
    console.error(
      "debugParam - Impossible de récupérer les coordonnées:",
      error,
    );
    return false;
  }
};

const fillTravelDuration = async () => {
  if (has(docData?.[FIELD_DUR])) {
    return false;
  }

  const origin = String(docData?.[FIELD_ADDRESS] ?? "").trim();
  const destination = String(docData?.[FIELD_ADDRESS_DESTINATION] ?? "").trim();

  if (!origin || !destination || typeof google === "undefined") {
    return false;
  }

  try {
    const directions = await new Promise((resolve, reject) => {
      new google.maps.DirectionsService().route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (route, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            resolve(route);
          } else {
            reject(new Error(`Google Maps API error: ${status}`));
          }
        },
      );
    });

    const durationSeconds = directions?.routes?.[0]?.legs?.reduce(
      (total, leg) => total + (Number(leg.duration?.value) || 0),
      0,
    );
    const durationMinutes = Math.round(durationSeconds / 60);

    if (durationMinutes > 0) {
      setField(FIELD_DUR, durationMinutes);
      return true;
    }
  } catch (error) {
    console.error(
      "debugParam - Impossible de calculer la durée du trajet:",
      error,
    );
  }

  return false;
};

const main = async () => {
  const isAerien = docData?.["Demande_ModeDeTransport"] === "Aérien";

  if (isAerien) {
    const paramOptim = await getParamOptimAdjustments();
    const result = {};
    const choice = getAutomaticRecalculationChoice();
    const computed = computeHeuresAerien(choice, paramOptim, result);

    if (computed) {
      try {
        await saveComputedDocument(result);
      } catch (error) {
        console.error(
          "debugParam - Échec de la sauvegarde automatique aérienne :",
          error,
        );
        showErrorBanner(
          "Les valeurs aériennes ont été calculées, mais n'ont pas pu être sauvegardées.",
        );
      }
    }

    callback({ data: computed ? result : {} });
    return;
  }

  const [coordinatesComputed, durationComputed] = await Promise.all([
    fillCoordinates(),
    fillTravelDuration(),
  ]);
  let computed = coordinatesComputed || durationComputed;

  const durMinBrut = Number.parseInt(
    docData?.[FIELD_DUR] ?? docData?.[FIELD_DUR_RETURN],
    10,
  );

  const motif = String(docData?.[FIELD_MOTIF] || "").trim();
  const isRdv =
    motif === "Rendez-vous médical" ||
    motif === "RDV médicaux" ||
    motif === "Rendez-vous personnel";

  const dateDepart = docData?.[DATE_DEP];
  const sourceTime = isRdv ? docData?.[FIELD_RDV] : docData?.[FIELD_PICKUP];
  const sourceMinutes = has(sourceTime) ? toMinutes(sourceTime) : NaN;

  const durOk = Number.isFinite(durMinBrut) && durMinBrut >= 0;
  const canComputeSchedule =
    durOk && Number.isFinite(sourceMinutes) && has(dateDepart);

  if (canComputeSchedule) {
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

    let departure;
    let arrival;
    let pickupForUnite;

    if (isRdv) {
      departure = sourceMinutes - 15 - durMin - embDebMinutes;
      arrival = departure + durMin + embDebMinutes;

      pickupForUnite = toHHMM(departure - 15);
      setField(FIELD_PICKUP, pickupForUnite);
    } else {
      pickupForUnite = toHHMM(sourceMinutes);
      departure = sourceMinutes + 15;
      arrival = departure + durMin + embDebMinutes;
    }

    setField(FIELD_DEP, toHHMM(departure));
    setField(FIELD_ARR, toHHMM(arrival));

    setHeureUniteFromPickup(pickupForUnite, dateDepart);

    setField("TEMPORARY_HeureSimpleLockHint", isRdv ? "arrivee" : "depart");
    computed = true;

    if (!has(docData?.[DATE_ARR])) {
      setField(DATE_ARR, dateDepart);
    }
  }

  if (computed) {
    try {
      await saveComputedDocument(result);
    } catch (error) {
      console.error("debugParam - Échec de la sauvegarde automatique :", error);
      showErrorBanner(
        "Les valeurs ont été calculées, mais n'ont pas pu être sauvegardées.",
      );
    }
  }

  callback({ data: computed ? result : {} });
};

main();
