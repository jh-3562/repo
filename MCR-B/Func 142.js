console.log("Function142", context);
/***********POPUP CODE */
const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement(tag);
    element.id = id;
    document.body.appendChild(element);
  }
  element.style = style;
  element.innerHTML = innerHTML;
  return element;
};

const showErrorBanner = (errorMessage) => {
  const errorBanner = createOrUpdateElement(
    "errorBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `,
    `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
};

const showSuccessBanner = (successMessage) => {
  const successBanner = createOrUpdateElement(
    "successBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `,
    `
      <div style="margin-right: 10px; color: green;">&#10003;</div><div>${successMessage}</div>
      <div id="successBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: green; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("successBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      successBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
};

const showPopupLoading = (loadingMessage) => {
  createOrUpdateElement(
    "loadingPopup",
    "div",
    `
      position: fixed; 
      left: 0; 
      top: 0; 
      width: 100%; 
      height: 100%; 
      background-color: rgba(0,0,0,0.5); 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      z-index: 9999;
    `,
    `
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
        <div>${loadingMessage}</div>
        <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
      </div>
    `,
  );
  if (!document.getElementById("spinnerStyle")) {
    let style = document.createElement("style");
    style.id = "spinnerStyle";
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
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

const getDocumentsByFiltersWithRecurrence = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const interpretedResult = await getDocumentsByIDs(
      response?.data?.ids || [],
    );
    const result = interpretedResult.map((document) => {
      const dataParsed = JSON.parse(document.data);
      return {
        ...document,
        data: dataParsed,
      };
    });
    return result || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const generateAllOccurrences = async (dateWindow) => {
  try {
    const recurrenceDocument = {
      documentID: docData.FORMID,
      status: docData.STATUS,
      template: {
        templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5",
      },
      data: JSON.stringify(docData),
    };

    const recurrenceFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Mission",
        type: "TEXT",
      },
      {
        key: "FORMID",
        operator: "EQUALS",
        value: recurrenceDocument.documentID,
        type: "TEXT",
      },
    ];
    const interpreted = await recurrence.getDocuments(
      recurrenceFilters,
      dateWindow,
      api,
    );
    const newForms = await createOccurrencesWithoutDuplicates(
      interpreted?.data?.documents || [],
    );
    console.log("142 New Forms Created:", newForms);
  } catch (error) {
    console.error("Failed to generate occurrences:", error);
  }
};

const updateDocuments = async (documentsToUpdate) => {
  try {
    const response = await api({ local: true }).put("document/Many", {
      documents: documentsToUpdate,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to update documents:", error);
    return [];
  }
};

const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((k) => {
      result[`${k}|${index + 1}`] = obj[k];
    });
  });
  result[key] = itemCount.toString();
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});

const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(excludeKeys(data, ["FORMID", "NUMBER"]));
};

const getDateWindow = () => {
  switch (docData.Planification_Récurrence) {
    case "Par jour spécifique": {
      const dates = (docData?.Planification_MultiDate || "")
        .split("|")
        .map((date) => date.trim())
        .filter(Boolean)
        .sort();

      return dates.length
        ? [dates[0], dates[dates.length - 1]]
        : ["2000-01-01", "2222-01-01"];
    }
    case "Par semaine": {
      return [
        docData.Planification_Date || "2000-01-01",
        docData.Planification_DateFin || "2222-01-01",
      ];
    }
    default:
      return ["2000-01-01", "2222-01-01"];
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

/******************* FUNCTION CODE */

const main = async () => {
  const date = new Date(
    store.pageContentStore.processData[0].edits.DateAnnulation,
  )
    .toISOString()
    .split("T")[0];
  const dateWindow = getDateWindow();

  await generateAllOccurrences(dateWindow);

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Mission",
      type: "TEXT",
    },
    {
      key: "isOccurence",
      operator: "EQUALS",
      value: "true",
      type: "TEXT",
    },
    {
      key: "IdentifiantFormulaireRécurrence",
      operator: "EQUALS",
      value: docData.FORMID,
      type: "TEXT",
    },
    {
      key: "Planification_Date",
      operator: "BETWEEN",
      value: `${date}|${dateWindow[1]}`,
      type: "DATE",
    },
  ];

  const docs = await getDocumentsByFiltersWithRecurrence(apiFilters);
  const documents = docs.sort(
    (a, b) =>
      new Date(a?.data?.Planification_Date) -
      new Date(b?.data?.Planification_Date),
  );

  console.log("142 DOCUMENTS ", documents);

  const documentToUpdate = [];

  documentToUpdate.push({
    data: formatDataAPI({
      ...docData.data,
    }),
    status: "Annulée",
    active: true,
    template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" },
    documentID: docData.FORMID,
  });

  documents?.forEach((doc) => {
    documentToUpdate.push({
      data: formatDataAPI(doc.data),
      status: "Annulée",
      active: true,
      template: { templateId: doc.template.templateId },
      documentID: doc.metaData.FORMID,
    });
  });

  console.log("142 DOCUMENTS TO UPDATE", documentToUpdate);

  await updateDocuments(documentToUpdate);
  window.location.reload();
};

main();
