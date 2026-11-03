console.log("Fonction 594", context);

const dateLivraison =
  store.pageContentStore?.processData[0]?.edits?.DateLivraison || "";

const filters = [
  {
    key: "TypeTransport",
    operator: "EQUALS",
    value: "Transporteur Parc",
    type: "SELECT",
  },
  {
    key: "STATUS",
    operator: "IN",
    value: "Planifiée|Complétée",
    type: "SELECT",
  },
  {
    key: "DateLivraison",
    operator: "BETWEEN",
    value: `${dateLivraison}|${dateLivraison}`,
    type: "DATE",
  },
];

const template = [
  {
    FormlayoutID: "1778ee45-49cb-4cd4-82b9-28079409c629",
    templateName: "FeuilleDeLivraison",
  },
  {
    FormlayoutID: "9533ec71-941c-4b82-8873-9d285b731e29",
    typeLivraison: "LIVRAISON",
    templateName: "Bon de livraison",
  },
  {
    FormlayoutID: "9533ec71-941c-4b82-8873-9d285b731e29",
    typeLivraison: "RÉCUPÉRATION",
    templateName: "Bon de récupération",
  },
];

const DEMANDE_TEMPLATE_ID = "1778ee45-49cb-4cd4-82b9-28079409c629";
const LEGACY_TEMPLATE_NAME = "DEMANDE";
const FILE_TYPE = "PDF";
const LINE_BREAK_SEPARATOR = " | ";
const REPARE_MAX_ROWS = 12;

const safeParseJson = (raw) => {
  try {
    return JSON.parse(raw || "{}");
  } catch (error) {
    return {};
  }
};

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toStringValue = (value) => String(value ?? "").trim();

const toTemplateBoolean = (value) => {
  if (typeof value === "boolean") return value;

  const normalized = toStringValue(value).toLowerCase();
  if (["true", "1", "oui", "yes", "x"].includes(normalized)) return true;
  if (["false", "0", "non", "no", ""].includes(normalized)) return false;

  return null;
};

const normalizeKeyName = (value) =>
  toStringValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const getFirstValueByKeyAliases = (source, aliases = []) => {
  if (!source || typeof source !== "object") return "";

  const normalizedAliases = aliases
    .map((alias) => normalizeKeyName(alias))
    .filter(Boolean);

  if (normalizedAliases.length === 0) return "";

  const entries = Object.entries(source);
  for (const [key, rawValue] of entries) {
    if (!normalizedAliases.includes(normalizeKeyName(key))) continue;
    const normalizedValue = toStringValue(rawValue);
    if (normalizedValue) return normalizedValue;
  }

  return "";
};

const resolveDemandeNumber = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = toStringValue(candidate);
    if (normalized) return normalized;
  }
  return "";
};

const resolveRefCommand = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = toStringValue(candidate);
    if (normalized) return normalized;
  }
  return "";
};

const resolveRefCommandFromSources = (...sources) => {
  const aliases = [
    "RefCommand",
    "refCommand",
    "RefCommande",
    "refCommande",
    "RefCommmande",
    "ReferenceCommande",
    "ReferenceCommand",
    "NoCommande",
    "NumeroCommande",
    "NumeroDeCommande",
  ];

  for (const source of sources) {
    const directValue = getFirstValueByKeyAliases(source, aliases);
    if (directValue) return directValue;

    const editsValue = getFirstValueByKeyAliases(source?.edits, aliases);
    if (editsValue) return editsValue;
  }

  return "";
};

const extractFileUrl = (payload) => {
  if (!payload) return "";

  if (typeof payload === "string") {
    if (/^https?:\/\//i.test(payload)) return payload;
    if (payload.startsWith("/")) {
      return `${window.location.origin}${payload}`;
    }
    return "";
  }

  const candidates = [
    payload?.data?.fileUrl,
    payload?.fileUrl,
    payload?.data?.url,
    payload?.url,
    payload?.data?.downloadUrl,
    payload?.downloadUrl,
    payload?.data?.fileUrls?.[0],
    payload?.fileUrls?.[0],
    payload?.data?.urls?.[0],
    payload?.urls?.[0],
    payload?.data?.files?.[0]?.fileUrl,
    payload?.data?.files?.[0]?.url,
  ];

  const found = candidates.find(
    (value) =>
      typeof value === "string" &&
      (/^https?:\/\//i.test(value) || value.startsWith("/")),
  );

  if (!found) return "";
  return found.startsWith("/") ? `${window.location.origin}${found}` : found;
};

const triggerDownload = (fileUrl, fileName = "Document.pdf") => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getFileNameFromUrl = (path, fallback = "Document.pdf") => {
  if (!path || typeof path !== "string") return fallback;

  const cleanPath = path.split("?")[0].split("#")[0];
  const fileName = cleanPath.split("/").pop();

  return fileName || fallback;
};

const downloadAllFilesAsZip = async (fileList) => {
  if (!Array.isArray(fileList) || fileList.length === 0) {
    return;
  }

  if (typeof JSZip === "undefined") {
    throw new Error("JSZip est indisponible dans cet environnement");
  }

  const zip = new JSZip();

  for (const { path, filename } of fileList) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      zip.file(filename, blob);
    } catch (error) {
      throw new Error(
        `Erreur lors du telechargement de ${filename}: ${error?.message || error}`,
      );
    }
  }

  const date = Date.now();
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `ArchiveFeuilleDeLivraisonPDF_${date}.zip`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(url);
};

const collectIndexedValues = (
  dataObj,
  keyPrefix,
  rowArray,
  fallbackFieldName,
) => {
  if (Array.isArray(rowArray) && rowArray.length > 0) {
    const rowValues = rowArray
      .map((row) => row?.[keyPrefix] ?? row?.[fallbackFieldName])
      .filter(
        (value) =>
          value !== undefined && value !== null && String(value).trim() !== "",
      )
      .map((value) => String(value));

    if (rowValues.length > 0) return rowValues;
  }

  const indexedRegex = new RegExp(`^${escapeRegExp(keyPrefix)}\\|(\\d+)$`);

  return Object.keys(dataObj || {})
    .map((key) => {
      const match = key.match(indexedRegex);
      if (!match) return null;
      return { index: Number(match[1]), value: dataObj[key] };
    })
    .filter(
      (item) =>
        item &&
        item.value !== undefined &&
        item.value !== null &&
        String(item.value).trim() !== "",
    )
    .sort((a, b) => a.index - b.index)
    .map((item) => String(item.value));
};

const buildRepareText = (dataObj) => {
  const rows = Array.isArray(dataObj?.Repare) ? dataObj.Repare : [];
  const toRepareValues = collectIndexedValues(
    dataObj,
    "Repare|1|ToRepare",
    rows,
    "ToRepare",
  );
  const commentRepareValues = collectIndexedValues(
    dataObj,
    "Repare|2|CommentRepare",
    rows,
    "CommentRepare",
  );

  return [
    toRepareValues
      .map((value, index) => `*${index + 1}. ${value}`)
      .join(LINE_BREAK_SEPARATOR),
    commentRepareValues
      .map((value, index) => `*${index + 1}. ${value}`)
      .join(LINE_BREAK_SEPARATOR),
  ]
    .filter(Boolean)
    .join(LINE_BREAK_SEPARATOR);
};

const buildRepareIndexedData = (dataObj = {}) => {
  const rows = Array.isArray(dataObj?.Repare) ? dataObj.Repare : [];
  const toRepareValues = collectIndexedValues(
    dataObj,
    "Repare|1|ToRepare",
    rows,
    "ToRepare",
  );
  const commentRepareValues = collectIndexedValues(
    dataObj,
    "Repare|2|CommentRepare",
    rows,
    "CommentRepare",
  );

  const output = {};
  for (let index = 1; index <= REPARE_MAX_ROWS; index += 1) {
    output[`Repare|1|ToRepare|${index}`] = toStringValue(
      toRepareValues[index - 1] || "",
    );
    output[`Repare|2|CommentRepare|${index}`] = toStringValue(
      commentRepareValues[index - 1] || "",
    );
  }

  return {
    indexedData: output,
    toRepareValues,
    commentRepareValues,
  };
};

const buildRecuperationData = (source = {}) => {
  const output = {};

  for (let index = 1; index <= 10; index += 1) {
    const sourceItem = Array.isArray(source?.Recuperation)
      ? source.Recuperation[index - 1]
      : Array.isArray(source)
        ? source[index - 1]
        : null;
    const rootItem = source && typeof source === "object" ? source : {};
    const noInventaire = toStringValue(
      sourceItem?.["RecuperationFinale|1|NoInventaire"] ||
        sourceItem?.["Recuperation|1|NoInventaire"] ||
        sourceItem?.NumFinal ||
        sourceItem?.NoInventaire ||
        rootItem?.[`RecuperationFinale|1|NoInventaire|${index}`] ||
        rootItem?.[`Recuperation|1|NoInventaire|${index}`] ||
        rootItem?.[`RecuperationFinale|1|NoInventaire`] ||
        rootItem?.[`Recuperation|1|NoInventaire`] ||
        rootItem?.[`${index}L_NumFinal`] ||
        rootItem?.NoInventaire,
    );
    const description = toStringValue(
      sourceItem?.["RecuperationFinale|2|Description"] ||
        sourceItem?.["Recuperation|2|Description"] ||
        sourceItem?.NomFinal ||
        sourceItem?.Description ||
        rootItem?.[`RecuperationFinale|2|Description|${index}`] ||
        rootItem?.[`Recuperation|2|Description|${index}`] ||
        rootItem?.[`RecuperationFinale|2|Description`] ||
        rootItem?.[`Recuperation|2|Description`] ||
        rootItem?.[`${index}L_NomFinal`] ||
        rootItem?.Description,
    );
    const statut = toStringValue(
      sourceItem?.["RecuperationFinale|3|Statut"] ||
        sourceItem?.["Recuperation|3|Statut"] ||
        sourceItem?.StatutFinal ||
        sourceItem?.Statut ||
        rootItem?.[`RecuperationFinale|3|Statut|${index}`] ||
        rootItem?.[`Recuperation|3|Statut|${index}`] ||
        rootItem?.[`RecuperationFinale|3|Statut`] ||
        rootItem?.[`Recuperation|3|Statut`] ||
        rootItem?.[`${index}L_StatutFinal`] ||
        rootItem?.Statut,
    );

    output[`RecuperationFinale|1|NoInventaire|${index}`] = noInventaire;
    output[`RecuperationFinale|2|Description|${index}`] = description;
    output[`RecuperationFinale|3|Statut|${index}`] = statut;

    output[`Recuperation|1|NoInventaire|${index}`] = noInventaire;
    output[`Recuperation|2|Description|${index}`] = description;
    output[`Recuperation|3|Statut|${index}`] = statut;

    // Compatibilite route legacy DEMANDE: cles plates sans separateur '|'.
    output[`RecupNoInventaire${index}`] = noInventaire;
    output[`RecupDescription${index}`] = description;
    output[`RecupStatut${index}`] = statut;
  }

  return output;
};

const persistCalculatedFieldsForDocument = async (documentItem) => {
  const parsed = safeParseJson(documentItem?.data);

  const calculatedData = buildFeuilleDeLivraisonData(
    parsed,
    resolveDemandeNumber(
      documentItem?.NUMBER,
      documentItem?.number,
      docData?.NUMBER,
      docData?.number,
      context?.NUMBER,
      context?.number,
    ),
    resolveRefCommand(
      documentItem?.RefCommand,
      documentItem?.refCommand,
      resolveRefCommandFromSources(documentItem),
      resolveRefCommandFromSources(parsed),
      docData?.RefCommand,
      docData?.refCommand,
      resolveRefCommandFromSources(docData),
      context?.RefCommand,
      context?.refCommand,
      resolveRefCommandFromSources(context),
      resolveRefCommandFromSources(
        store?.pageContentStore?.processData?.[0],
        store?.pageContentStore?.processData?.[0]?.edits,
      ),
    ),
  );

  const mergedData = { ...parsed, ...calculatedData };

  const documentToUpdate = {
    data: JSON.stringify(mergedData),
    active: documentItem?.active ?? true,
    template: {
      templateId: documentItem?.template?.templateId || DEMANDE_TEMPLATE_ID,
    },
    documentID: documentItem?.documentID,
  };

  const currentStatus = toStringValue(
    documentItem?.status || documentItem?.STATUS,
  );

  if (currentStatus) {
    documentToUpdate.status = currentStatus;
  }

  await api({ local: true }).put("document/Many", {
    documents: [documentToUpdate],
  });
};

const buildIndexedLData = (source = {}) => {
  const output = {};
  const fields = ["NumFinal", "BIN", "NomFinal", "StatutFinal"];

  for (let index = 1; index <= 10; index += 1) {
    for (const fieldName of fields) {
      output[`${index}L_${fieldName}`] = toStringValue(
        source[`${index}L_${fieldName}`],
      );
    }
  }

  return output;
};

const buildFeuilleDeLivraisonData = (
  parsed = {},
  fallbackNumber = "",
  fallbackRefCommand = "",
) => {
  const { indexedData, toRepareValues, commentRepareValues } =
    buildRepareIndexedData(parsed);

  const demandeNumber = resolveDemandeNumber(
    parsed?.NUMBER,
    parsed?.number,
    parsed?.NoDemande,
    fallbackNumber,
  );

  const refCommand = resolveRefCommand(
    parsed?.RefCommand,
    parsed?.refCommand,
    parsed?.RefCommande,
    parsed?.refCommande,
    resolveRefCommandFromSources(parsed),
    fallbackRefCommand,
  );

  const toRepareJoined = toRepareValues
    .map((value, index) => `*${index + 1}. ${value}`)
    .join(LINE_BREAK_SEPARATOR);
  const commentRepareJoined = commentRepareValues
    .map((value, index) => `*${index + 1}. ${value}`)
    .join(LINE_BREAK_SEPARATOR);

  const donBoolean = toTemplateBoolean(parsed.Don);
  const closingFileBoolean = toTemplateBoolean(parsed.ClosingFile);
  const punaisesBoolean = toTemplateBoolean(parsed.Punaises);
  const essaiBoolean = toTemplateBoolean(parsed.Essai);
  const demandeBoolean = toTemplateBoolean(parsed.Demande);
  const reparationBoolean = toTemplateBoolean(parsed.Reparation);

  const dataPdf = {
    NUMBER: demandeNumber,
    Prenom: toStringValue(parsed.Prenom),
    Nom: toStringValue(parsed.Nom),
    NoDossier: toStringValue(parsed.NoDossier),
    DateBirth: toStringValue(parsed.DateBirth),
    Sexe: toStringValue(parsed.Sexe),
    Contact_Prenom: toStringValue(parsed.Contact_Prenom),
    Adresse: toStringValue(parsed.Adresse),
    Complement: toStringValue(parsed.Complement),
    Contact_Name: toStringValue(parsed.Contact_Name),
    Lien: toStringValue(parsed.Lien),
    Ville: toStringValue(parsed.Ville),
    CodePostal: toStringValue(parsed.CodePostal),
    Contact_Phone: toStringValue(parsed.Contact_Phone),
    Telephone: toStringValue(parsed.Telephone),
    DateLivraison: toStringValue(parsed.DateLivraison),
    Raison: toStringValue(parsed.Raison),
    ClosingFile: closingFileBoolean ?? toStringValue(parsed.ClosingFile),
    Deficience: toStringValue(parsed.Deficience),
    Intervenant: toStringValue(parsed.Intervenant),
    IntervenantFonction: toStringValue(parsed.IntervenantFonction),
    CommandDate: toStringValue(parsed.CommandDate),
    Installation: toStringValue(parsed.Installation),
    Intervenant_Phone: toStringValue(parsed.Intervenant_Phone),
    Poste: toStringValue(parsed.Poste),
    Floor: toStringValue(parsed.Floor),
    Elevator: toStringValue(parsed.Elevator),
    Stairs: toStringValue(parsed.Stairs),
    Punaises: punaisesBoolean ?? toStringValue(parsed.Punaises),
    Infos: toStringValue(parsed.Infos),
    Livraison_name: toStringValue(parsed.Livraison_name),
    Livraison_Phone: toStringValue(parsed.Livraison_Phone),
    RemarqueRecup: toStringValue(parsed.RemarqueRecup),
    RemarqueLiv: toStringValue(parsed.RemarqueLiv),
    Reparation: reparationBoolean ?? toStringValue(parsed.Reparation),
    Remarques: toStringValue(parsed.Remarques),
    TypeTransport: toStringValue(parsed.TypeTransport),
    TruckSize: toStringValue(parsed.TruckSize),
    RefCommand: refCommand,
    refCommand: refCommand,
    RefCommande: refCommand,
    Don: donBoolean ?? toStringValue(parsed.Don),
    Essai: essaiBoolean ?? toStringValue(parsed.Essai),
    Demande: demandeBoolean ?? toStringValue(parsed.Demande),
    Repare: buildRepareText(parsed),
    ...indexedData,
    ...buildRecuperationData(parsed),
    ...buildIndexedLData(parsed),
  };

  dataPdf["Repare|1|ToRepare"] = toStringValue(
    toRepareJoined || parsed["Repare|1|ToRepare"] || parsed.ToRepare,
  );
  dataPdf["Repare|2|CommentRepare"] = toStringValue(
    commentRepareJoined ||
      parsed["Repare|2|CommentRepare"] ||
      parsed.CommentRepare,
  );

  return dataPdf;
};

const mapFormidsToTemplate = (templateItems, array) => {
  const templateWithIds = templateItems.map((item) => ({ ...item, ids: [] }));

  array.forEach((form) => {
    templateWithIds.forEach((templateItem) => {
      const isMatch =
        templateItem.FormlayoutID === form.FormlayoutID &&
        (!templateItem.typeLivraison ||
          templateItem.typeLivraison === form.typeLivraison);

      if (isMatch) {
        templateItem.ids.push(form.Formid);
      }
    });
  });

  return templateWithIds;
};

const getFormIDFormlayout = (filtersToApply) => {
  return api({ local: true })
    .post("document/id/filter", { filters: filtersToApply })
    .then((res) => {
      if (!res) {
        throw new Error("Erreur au filtre");
      }

      return api({ local: true })
        .post("document/id", { ids: res?.data?.ids })
        .then((final) => {
          if (!final) {
            throw new Error("Erreur fetch id");
          }

          const idArray = final?.data?.documents.map((doc) => {
            const data = safeParseJson(doc?.data);
            return {
              Formid: doc.documentID,
              FormlayoutID: doc?.template?.templateId || "",
              typeLivraison: data?.TypeLivraisonTPN || "",
              data,
            };
          });

          console.log(idArray);
          return mapFormidsToTemplate(template, idArray);
        });
    });
};

const downloadFeuilleDeLivraison = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return;
  }

  const res = await api({ local: true }).post("document/id", { ids });
  const documents = res?.data?.documents || [];

  const demandeDocuments = documents.filter(
    (doc) => doc?.template?.templateId === DEMANDE_TEMPLATE_ID,
  );

  if (demandeDocuments.length === 0) {
    return;
  }

  const preparedDemandeDocuments = demandeDocuments;

  // Multi-doc: un ODT unique par document puis archive ZIP.
  if (preparedDemandeDocuments.length > 1) {
    const fileList = [];

    for (const doc of preparedDemandeDocuments) {
      await persistCalculatedFieldsForDocument(doc);

      const responseSingle = await api({ local: true }).post(
        `document/download/${LEGACY_TEMPLATE_NAME}/${FILE_TYPE}?&fileNameBuildKeys=TruckSize&fileNameBuildKeys=NUMBER`,
        { ids: [doc.documentID] },
      );

      const fileUrlSingle = extractFileUrl(responseSingle);

      if (!fileUrlSingle) {
        throw new Error(
          `fileUrl introuvable pour FeuilleDeLivraison (document ${doc?.documentID || "inconnu"})`,
        );
      }

      const parsed = safeParseJson(doc?.data);
      const fallbackFileName = `FeuilleDeLivraison_${resolveDemandeNumber(parsed?.NUMBER, parsed?.number, doc?.NUMBER, doc?.number, doc?.documentID, "doc")}.pdf`;
      fileList.push({
        path: fileUrlSingle,
        filename: getFileNameFromUrl(fileUrlSingle, fallbackFileName),
      });
    }

    await downloadAllFilesAsZip(fileList);

    return;
  }

  const doc = preparedDemandeDocuments[0];
  await persistCalculatedFieldsForDocument(doc);

  const response = await api({ local: true }).post(
    `document/download/${LEGACY_TEMPLATE_NAME}/${FILE_TYPE}?&fileNameBuildKeys=TruckSize&fileNameBuildKeys=NUMBER`,
    { ids: [doc.documentID] },
  );

  const fileUrl = extractFileUrl(response);

  if (!fileUrl) {
    throw new Error("fileUrl introuvable pour FeuilleDeLivraison");
  }

  window.open(fileUrl);
};

const batchPrint = async (ids, templateName) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return;
  }

  if (templateName === "FeuilleDeLivraison") {
    return downloadFeuilleDeLivraison(ids);
  }

  return api({ local: true })
    .post(
      `document/download/${templateName}/PDF?&fileNameBuildKeys=TruckSize&fileNameBuildKeys=NUMBER`,
      { ids },
    )
    .then((res) => {
      if (!res) {
        throw new Error("Erreur à l'impression");
      }

      window.open(res.data.fileUrl);
    });
};

const popupLoading = (show, success, errorMessage, loadingMessage) => {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
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
      `;
      document.body.appendChild(loadingPopup);

      if (!document.getElementById("spinnerStyle")) {
        const style = document.createElement("style");
        style.id = "spinnerStyle";
        style.innerHTML = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    loadingPopup.innerHTML = `
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
        <div>${loadingMessage}</div>
        <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
      </div>
    `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
    return;
  }

  if (loadingPopup) loadingPopup.style.display = "none";

  if (success === false && errorMessage) {
    if (!errorBanner) {
      errorBanner = document.createElement("div");
      errorBanner.id = "errorBanner";
      errorBanner.style = `
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
      `;
      document.body.appendChild(errorBanner);
    }

    errorBanner.innerHTML = `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `;
    errorBanner.style.display = "flex";

    const progressElement = document.getElementById("errorBannerProgress");
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
        errorBanner.style.display = "none";
      } else {
        width++;
        progressElement.style.width = `${width}%`;
      }
    }, 55);
  }
};

popupLoading(true, null, "Erreur à l'impression", "Impression en cours");

getFormIDFormlayout(filters)
  .then(async (array) => {
    const printPromises = array
      .filter((res) => res.ids && res.ids.length > 0)
      .map((element) => batchPrint(element.ids, element.templateName));

    return Promise.all(printPromises);
  })
  .then(() => {
    popupLoading(false, true, null, null);
  })
  .catch((error) => {
    console.error(error);
    popupLoading(false, false, error.message, null);
  });
