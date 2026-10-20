console.log("fonction 136", context);

// --------------------- Utils ---------------------
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

const safeJson = (s) => {
  try {
    return typeof s === "string" ? JSON.parse(s) : (s || {});
  } catch {
    return {};
  }
};

const todayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const addDaysUTC = (d, n) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};

const isoDate = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
};

const parseIso = (s) => {
  if (isEmpty(s)) return null;
  const d = new Date(String(s).slice(0, 10));
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const uniqueSorted = (arr) => Array.from(new Set(arr)).sort();

const parseMulti = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String).map((x) => x.trim()).filter(Boolean);

  const s = String(v).trim();
  if (!s) return [];

  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(String).map((x) => x.trim()).filter(Boolean);
    } catch {}
  }

  return s
    .split(/[\|\n,;]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
};

const frenchDayToIndex = (day) => {
  const map = {
    Dimanche: 0,
    Lundi: 1,
    Mardi: 2,
    Mercredi: 3,
    Jeudi: 4,
    Vendredi: 5,
    Samedi: 6
  };
  return map[String(day || "").trim()] ?? null;
};

const weekIndexFromStart = (start, current) => {
  const diffDays = Math.floor((current - start) / (24 * 60 * 60 * 1000));
  return Math.floor(diffDays / 7);
};

const getDocId = (doc) => doc?.documentID || doc?.key || doc?.rowID || "?";

const getMotherNumber = (motherDoc, motherData) => {
  const candidates = [
    motherDoc?.number,
    motherData?.number,
    motherData?.Number,
    motherData?.SystemeCache_Nombre,
    motherData?.SystemeCache_Numero,
    motherData?.Demande_Number,
    motherData?.Demande_Numero,
  ];

  const found = candidates.find((x) => !isEmpty(x));
  return isEmpty(found) ? "" : String(found).trim();
};

// --------------------- API helpers ---------------------
const apiPost = async (url, body) => {
  try {
    return await api({ local: true }).post(url, body);
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Unknown API error";
    throw new Error(`POST ${url} failed: ${msg}`);
  }
};

const apiPut = async (url, body) => {
  try {
    return await api({ local: true }).put(url, body);
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Unknown API error";
    throw new Error(`PUT ${url} failed: ${msg}`);
  }
};

const getDocumentsByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const r = await apiPost("document/id", { ids });
  return (Array.isArray(r?.data?.documents) && r.data.documents) || [];
};

// --------------------- Fetch recurrence mothers ---------------------
const getDemandeRecurrenceMothersEnTraitement = async () => {
  const filters = [
    { key: "FORMLAYOUTNAME", operator: "EQUALS", value: "Demande", type: "TEXT" },
    { key: "STATUS", operator: "EQUALS", value: "En traitement", type: "TEXT" },
    { key: "Demande_TransportInformationTransportAvecReccurence", operator: "EQUALS", value: "true", type: "TEXT" },
  ];

  const r1 = await apiPost("document/id/filter", { filters });
  const ids = (Array.isArray(r1?.data?.ids) && r1.data.ids) || [];
  if (ids.length === 0) return [];
  return await getDocumentsByIds(ids);
};

// --------------------- Occurrence computation ---------------------
const computeOccurrencesInWindow = (data, windowStartIso, windowEndIso) => {
  if (String(data?.Demande_TransportInformationTransportAvecReccurence || "").trim() !== "true") return [];

  const freq = String(data?.Demande_TransportInformationTransportFrequence || "").trim();
  const results = [];

  if (freq === "Journées fixes") {
    const fixedDates = parseMulti(data?.Demande_TransportInformationTransportJourneesFixes);

    for (const raw of fixedDates) {
      const d = parseIso(raw);
      if (!d) continue;

      const iso = isoDate(d);
      if (windowStartIso <= iso && iso <= windowEndIso) results.push(iso);
    }

    return uniqueSorted(results);
  }

  if (freq === "Hebdomadaire" || freq === "Aux 2 semaines") {
    const startRec = parseIso(data?.Demande_TransportInformationTransportDateDebutReccurence);
    const endRec = parseIso(data?.Demande_TransportInformationTransportDateFinReccurence);
    if (!startRec || !endRec) return [];

    const days = parseMulti(data?.Demande_TransportInformationTransportJourneesApplicables)
      .map(frenchDayToIndex)
      .filter((x) => x !== null);

    if (days.length === 0) return [];

    const wStart = parseIso(windowStartIso);
    const wEnd = parseIso(windowEndIso);

    const scanStart = new Date(Math.max(startRec.getTime(), wStart.getTime()));
    const scanEnd = new Date(Math.min(endRec.getTime(), wEnd.getTime()));

    let cur = new Date(scanStart);
    while (cur <= scanEnd) {
      const dow = cur.getUTCDay();
      if (days.includes(dow)) {
        if (freq === "Sem") {
          results.push(isoDate(cur));
        } else {
          const w = weekIndexFromStart(startRec, cur);
          if (w % 2 === 0) results.push(isoDate(cur));
        }
      }
      cur = addDaysUTC(cur, 1);
    }

    return uniqueSorted(results);
  }

  return [];
};

// --------------------- Mother exceptions (dedupe) ---------------------
const getMotherExceptions = (motherData) => uniqueSorted(parseMulti(motherData?.TransportSysteme_Exception));

const setMotherExceptions = (motherData, dates) => {
  motherData.TransportSysteme_Exception = uniqueSorted(dates).join("|");
};

// --------------------- Child document shaping ---------------------
const applyOccurrenceDates = (childData, occIso) => {
  childData.Demande_TransportTransportSimpleDateTransportDepart = occIso;
  childData.Demande_TransportTransportSimpleDateTransportArrivee = occIso;

  const hasRetour =
    childData?.DemandeTransportInformationsTransportRetour === true ||
    String(childData?.DemandeTransportInformationsTransportRetour || "").trim().toLowerCase() === "true" ||
    !isEmpty(childData?.Demande_TransportTransportRetourAdresseCompleteDepart) ||
    !isEmpty(childData?.Demande_TransportTransportRetourAdresseCompleteDestination);

  if (hasRetour) {
    childData.Demande_TransportTransportRetourDateTransportDepart = occIso;
    childData.Demande_TransportTransportRetourDateTransportArrivee = occIso;
  } else {
    childData.Demande_TransportTransportRetourDateTransportDepart = "";
    childData.Demande_TransportTransportRetourDateTransportArrivee = "";
  }
};

const stripRecurrenceFieldsOnChild = (childData) => {
  childData.Demande_TransportInformationTransportAvecReccurence = "false";
  childData.Demande_TransportInformationTransportFrequence = "";
  childData.Demande_TransportInformationTransportJourneesApplicables = "";
  childData.Demande_TransportInformationTransportJourneesFixes = "";
  childData.Demande_TransportInformationTransportDateDebutReccurence = "";
  childData.Demande_TransportInformationTransportDateFinReccurence = "";
};

// --------------------- Create occurrences + update mothers ---------------------
const createOccurrencesAndUpdateMothers = async (eligible) => {
  const motherUpdates = new Map();

  let createdDemandes = 0;

  for (const item of eligible) {
    const motherDoc = item.motherDoc;
    const motherId = getDocId(motherDoc);
    const motherData = item.motherData;
    const occDates = item.occurrencesToCreate;
    const motherNumber = item.motherNumber;

    if (!motherUpdates.has(motherId)) {
      motherUpdates.set(motherId, { motherDoc, motherData, addedDates: [] });
    }
    motherUpdates.get(motherId).addedDates.push(...occDates);

    const existingExceptions = getMotherExceptions(motherData);
    let seq = existingExceptions.length;

    for (const occIso of occDates) {
      seq += 1;

      const childData = structuredClone(motherData);

      childData.TransportSysteme_IdReccurence = motherId;
      childData.TransportSysteme_Exception = "";

      if (!isEmpty(motherNumber)) {
        childData.SystemeCache_Nombre = `${motherNumber}.${seq}`;
      }

      applyOccurrenceDates(childData, occIso);
      stripRecurrenceFieldsOnChild(childData);

      const demandeDoc = {
        data: JSON.stringify(childData),
        status: "Soumise",
        active: true,
        template: motherDoc?.template,
      };

      const rCreate = await apiPost("document", {
        document: demandeDoc,
        preventNotify: "FULL",
      });

      const childId = rCreate?.data?.id || null;
      if (!childId) throw new Error("Création de la demande enfant échouée (id manquant)");

      createdDemandes += 1;
    }
  }

  const docsToUpdate = [];
  for (const [, pack] of motherUpdates.entries()) {
    const srcDoc = pack.motherDoc;
    const srcData = structuredClone(pack.motherData);

    const existing = getMotherExceptions(srcData);
    const merged = uniqueSorted(existing.concat(pack.addedDates));
    setMotherExceptions(srcData, merged);

    docsToUpdate.push({
      documentID: srcDoc.documentID,
      status: srcDoc.status,
      active: srcDoc.active !== false,
      template: srcDoc.template,
      data: JSON.stringify(srcData),
    });
  }

  if (docsToUpdate.length > 0) {
    await apiPut("document/Many", { documents: docsToUpdate });
  }

  return { createdDemandes };
};

// --------------------- MAIN ---------------------
const main = async () => {
  const confirmed = await showPopupConfirmation(
    "Confirmation",
    "Êtes-vous sûr d'exécuter cette action ?",
    "Oui",
    "Non"
  );

  if (!confirmed) return;

  showPopupLoading("Génération des occurrences en cours...");

  try {
    const wStart = todayUTC();
    const wEnd = addDaysUTC(wStart, 15);

    const startIso = isoDate(wStart);
    const endIso = isoDate(wEnd);

    const docs = await getDemandeRecurrenceMothersEnTraitement();

    const eligible = [];

    for (const doc of docs) {
      const motherData = safeJson(doc?.data);

      const occAll = computeOccurrencesInWindow(motherData, startIso, endIso);
      if (occAll.length === 0) continue;

      const existingExceptions = getMotherExceptions(motherData);
      const occToCreate = occAll.filter((d) => !existingExceptions.includes(d));
      if (occToCreate.length === 0) continue;

      eligible.push({
        motherDoc: doc,
        motherData,
        motherNumber: getMotherNumber(doc, motherData),
        occurrencesToCreate: occToCreate,
      });
    }

    const result = eligible.length > 0
      ? await createOccurrencesAndUpdateMothers(eligible)
      : { createdDemandes: 0 };

    hidePopupLoading();

    showSuccessBanner(
      `Terminé. Demandes créées: ${result.createdDemandes}`
    );

    if (typeof callback === "function") {
      callback({
        ok: true,
        window: { start: startIso, end: endIso },
        mothersMatched: docs.length,
        mothersEligible: eligible.length,
        demandesCreated: result.createdDemandes,
      });
    }
  } catch (e) {
    hidePopupLoading();
    showErrorBanner(e?.message || "Erreur inconnue");
    if (typeof callback === "function") {
      callback({ ok: false, error: e?.message || "Erreur inconnue" });
    }
  }
};

main();
