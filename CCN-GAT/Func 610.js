console.log("Fonction 610", context);

const DEMANDE_TEMPLATE_ID = "1778ee45-49cb-4cd4-82b9-28079409c629";
const TEMPLATE_NAME = "DEMANDE";
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

const resolveDemandeNumber = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = toStringValue(candidate);
    if (normalized) return normalized;
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

    // Compatibilite template: certains documents utilisent Recuperation au lieu de RecuperationFinale.
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

const buildRecuperationTableData = (source = {}) => {
  const headers = ["No d'inventaire", "Statut", "Description"];
  const rows = [];
  const normalized = buildRecuperationData(source);

  for (let index = 1; index <= 10; index += 1) {
    const noInventaire = toStringValue(
      normalized[`RecuperationFinale|1|NoInventaire|${index}`],
    );
    const statut = toStringValue(
      normalized[`RecuperationFinale|3|Statut|${index}`],
    );
    const description = toStringValue(
      normalized[`RecuperationFinale|2|Description|${index}`],
    );

    if (noInventaire || statut || description) {
      rows.push([noInventaire, statut, description]);
    }
  }

  return { headers, rows };
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

const buildFeuilleDeLivraisonData = (parsed = {}, fallbackNumber = "") => {
  const { indexedData, toRepareValues, commentRepareValues } =
    buildRepareIndexedData(parsed);

  const demandeNumber = resolveDemandeNumber(
    parsed?.NUMBER,
    parsed?.number,
    parsed?.NoDemande,
    fallbackNumber,
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
    RefCommand: toStringValue(parsed.RefCommand),
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
        width += 1;
        progressElement.style.width = `${width}%`;
      }
    }, 55);
  }
};

const resolveCurrentFormId = () => {
  return (
    docData?.FORMID ||
    docData?.formid ||
    store?.pageContentStore?.processData?.[0]?.FORMID ||
    store?.pageContentStore?.processData?.[0]?.formid ||
    store?.pageContentStore?.processData?.[0]?.documentID ||
    context?.FORMID ||
    context?.formid ||
    context?.documentID ||
    ""
  );
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const verifyPersistedRecuperationFields = async (formId, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const verifyRes = await api({ local: true }).post("document/id", {
      ids: [formId],
    });
    const verifyDoc = verifyRes?.data?.documents?.[0];
    const verifyData = safeParseJson(verifyDoc?.data);

    const keyA = toStringValue(verifyData?.["Recuperation|1|NoInventaire|1"]);
    const keyB = toStringValue(
      verifyData?.["RecuperationFinale|1|NoInventaire|1"],
    );

    if (keyA || keyB) {
      return true;
    }

    if (attempt < maxAttempts) {
      await wait(300);
    }
  }

  return false;
};

const persistCalculatedFieldsForCurrentDocument = async (formId) => {
  const res = await api({ local: true }).post("document/id", { ids: [formId] });
  const documentItem = res?.data?.documents?.[0];

  if (!documentItem) {
    throw new Error(`Document introuvable pour le FormID ${formId}`);
  }

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
  );

  const mergedData = { ...parsed, ...calculatedData };

  const documentToUpdate = {
    data: JSON.stringify(mergedData),
    active: documentItem?.active ?? true,
    template: {
      templateId: documentItem?.template?.templateId || DEMANDE_TEMPLATE_ID,
    },
    documentID: documentItem?.documentID || formId,
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

  const persisted = await verifyPersistedRecuperationFields(formId);
  if (!persisted) {
    console.warn(
      "Recuperation non relue apres update: le PDF peut etre genere avec des donnees non a jour.",
    );
  }
};

const downloadCurrentFeuilleDeLivraison = async () => {
  const formId = resolveCurrentFormId();
  if (!formId) {
    throw new Error("FormID courant introuvable");
  }

  // Ancienne API DEMANDE: le print lit les donnees du document.
  // On persiste d'abord les champs calcules (Recuperation/RecuperationFinale) pour garantir leur presence.
  await persistCalculatedFieldsForCurrentDocument(formId);

  const downloadEndpoint = `document/download/${TEMPLATE_NAME}/${FILE_TYPE}?&fileNameBuildKeys=TruckSize&fileNameBuildKeys=NUMBER`;
  const downloadPayload = { ids: [formId] };

  const response = await api({ local: true }).post(
    downloadEndpoint,
    downloadPayload,
  );

  const fileUrl = extractFileUrl(response);
  if (!fileUrl) {
    throw new Error("fileUrl introuvable pour FeuilleDeLivraison");
  }

  window.open(fileUrl);
};

popupLoading(true, null, "Erreur a l'impression", "Impression en cours");

downloadCurrentFeuilleDeLivraison()
  .then(() => {
    popupLoading(false, true, null, null);
  })
  .catch((error) => {
    console.error(error);
    popupLoading(false, false, error.message, null);
  });
