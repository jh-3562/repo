console.log("Function 126", context);
// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh
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

const main = async () => {
  console.log("context :", context);
  const clickedFormId = store.pageContentStore?.active[0];
  const interpretedForm = store.pageContentStore.prepareDataRows.find(
    (row) => row.rowID === clickedFormId,
  );

  console.log("clicked on form :", interpretedForm);
  if (!interpretedForm) {
    console.error("Aucune donnée trouvée pour l'ID :", clickedFormId);
    return;
  }

  // Make sure the form exists in order to be able to redirect the user to its web page.
  const existingForm = (
    await createOccurrencesWithoutDuplicates([interpretedForm])
  )[0];

  console.log("existingForm :", existingForm);
  let url_id;
  switch (recurrence.isDocumentOrRow(existingForm)) {
    case "document":
      url_id = existingForm.documentID;
      break;
    case "row":
      url_id = existingForm.key;
      break;
    default:
      console.error(
        "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
        formatedForm,
      );
  }

  const url = new URL(window.location.href);

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split("/");

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex((seg) => seg.startsWith("mcr."));

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex];
    const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`;
    url.pathname = newPath;

    window.location.href = url.toString();
  } else {
    const section = segments[1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base sans MCR : /volontaires ou /tableaudebord
    const newPath = `/${section}/${url_id}`;
    url.pathname = newPath;

    window.location.href = url.toString();
    /*
    const apiFilters = [
      {
        key: "FORMID",
        operator: "EQUALS",
        value: url_id,
        type: "TEXT",
      },
    ];

    const res = await getDocumentIDsByFilters(apiFilters);
    console.log("res :", res);

    if (res.length > 0) {
      const documentIDs = res;
      const documents = await getDocumentsByIDs(documentIDs);
      console.log("documents :", documents);
    }

    const data = JSON.parse(documents[0].data);

    console.log("data :", data);
    console.error("Segment MCR introuvable dans l’URL.");
    */
  }
};

main();
