// Bloc identique dans les fonctions 83, 122, 126 et 142 : le modifier partout à la fois.
const OCCURRENCE_TEMPLATE_ID = "0e44171d-1616-4a50-9b36-aff4d998c4a5";

// Une seule création d'occurrences à la fois dans la page (double clic, bouton relancé).
const runOneOccurrenceTaskAtATime = (task) => {
  const previous = window.mcrOccurrenceQueue || Promise.resolve();
  const current = previous.then(task);
  window.mcrOccurrenceQueue = current.catch(() => {});
  return current;
};

const getOccurrenceSourceId = (form) => {
  const source = form?.sourceForm;
  if (!source || !form.occurrenceDate) return null;
  return "rowID" in source ? source.key : source.documentID;
};

const getOccurrenceDate = (occurrence) => {
  try {
    return JSON.parse(occurrence.data).Planification_Date;
  } catch {
    return null;
  }
};

const toExistingOccurrence = (doc) => ({
  ...doc,
  documentID: doc.documentID || doc.metaData?.FORMID,
  number: doc.number ?? doc.metaData?.NUMBER,
  status: doc.status ?? doc.metaData?.STATUS,
  doesExist: true,
});

const getOccurrencesOfSource = async (sourceId) => {
  const filters = [
    { key: "FORMLAYOUTNAME", operator: "EQUALS", value: "Mission", type: "TEXT" },
    { key: "IdentifiantFormulaireRécurrence", operator: "EQUALS", value: sourceId, type: "TEXT" },
    { key: "STATUS", operator: "NOTIN", value: "Supprimé(e)", type: "TEXT" },
  ];
  const idsResponse = await api({ local: true }).post("document/id/filter", { filters });
  const ids = idsResponse?.data?.ids || [];
  if (!ids.length) return [];
  const docsResponse = await api({ local: true }).post("document/id", { ids });
  return (docsResponse?.data?.documents || []).map(toExistingOccurrence);
};

const getOccurrencesBySource = async (forms) => {
  const sourceIds = [...new Set(forms.map(getOccurrenceSourceId).filter(Boolean))];
  const lists = await Promise.all(sourceIds.map(getOccurrencesOfSource));
  return Object.fromEntries(sourceIds.map((id, index) => [id, lists[index]]));
};

const findOccurrencesOnSameDate = (occurrencesBySource, form) =>
  (occurrencesBySource[getOccurrenceSourceId(form)] || []).filter(
    (occurrence) => getOccurrenceDate(occurrence) === form.occurrenceDate,
  );

// On garde la plus ancienne occurrence valide ; les Draft ne sont gardés qu'en dernier recours.
const pickOccurrenceToKeep = (occurrences) => {
  const byNumber = [...occurrences].sort((a, b) => Number(a.number) - Number(b.number));
  return byNumber.find((occurrence) => occurrence.status !== "Draft") || byNumber[0];
};

const removeDuplicateOccurrences = async (occurrences) => {
  const occurrenceToKeep = pickOccurrenceToKeep(occurrences);
  const duplicates = occurrences.filter((o) => o.documentID !== occurrenceToKeep.documentID);
  if (!duplicates.length) return occurrenceToKeep;

  await api({ local: true }).put("document/Many", {
    documents: duplicates.map((duplicate) => ({
      documentID: duplicate.documentID,
      status: "Supprimé(e)",
      active: true,
      template: { templateId: OCCURRENCE_TEMPLATE_ID },
    })),
  });
  console.warn("Occurrences en double retirées :", duplicates.map((d) => d.number));
  return occurrenceToKeep;
};

const keepOnlyOneOccurrencePerDate = async (createdForms) => {
  const occurrencesBySource = await getOccurrencesBySource(createdForms);
  const result = [];
  for (const form of createdForms) {
    const sameDate = getOccurrenceSourceId(form)
      ? findOccurrencesOnSameDate(occurrencesBySource, form)
      : [];
    result.push(sameDate.length > 1 ? await removeDuplicateOccurrences(sameDate) : form);
  }
  return result;
};

// Remplace recurrence.createFormsIfNeeded : réutilise l'occurrence déjà créée et retire les doublons.
const createOccurrencesWithoutDuplicates = (forms) =>
  runOneOccurrenceTaskAtATime(async () => {
    let alreadyCreated = {};
    try {
      alreadyCreated = await getOccurrencesBySource(forms);
    } catch (error) {
      console.error("Vérification des occurrences existantes impossible :", error);
    }

    const result = [];
    const formsToCreate = [];
    for (const form of forms) {
      const validOccurrences = findOccurrencesOnSameDate(alreadyCreated, form).filter(
        (occurrence) => occurrence.status !== "Draft",
      );
      if (validOccurrences.length) result.push(pickOccurrenceToKeep(validOccurrences));
      else formsToCreate.push(form);
    }
    if (!formsToCreate.length) return result;

    const createdForms = await recurrence.createFormsIfNeeded(formsToCreate, api);
    try {
      result.push(...(await keepOnlyOneOccurrencePerDate(createdForms)));
    } catch (error) {
      console.error("Retrait des occurrences en double impossible :", error);
      result.push(...createdForms);
    }
    return result;
  });
/******************* FIN ANTI-DOUBLONS */
