console.log("Créer un transport planifié depuis un modèle", context);

const getSourceId = () => {
  const fromContext =
    context &&
    (context.id ||
      context.documentId ||
      (context.row && context.row.id) ||
      (context.document && context.document.id));
  if (fromContext) return fromContext;

  const active =
    typeof store !== "undefined" &&
    store.pageContentStore &&
    store.pageContentStore.active;
  if (Array.isArray(active)) return active[0] || null;
  return active || null;
};

const getSource = async () => {
  const sourceId = getSourceId();
  if (sourceId) {
    const response = await api({ local: true }).post("document/id", {
      ids: [sourceId],
    });
    const source = response.data.documents[0];
    if (!source) throw new Error(`Formulaire introuvable : ${sourceId}`);
    return {
      data: typeof source.data === "string" ? JSON.parse(source.data) : source.data,
      templateId:
        (source.template && source.template.templateId) ||
        source.templateId ||
        source.template_id,
    };
  }

  const currentDocData =
    (context && context.docData) ||
    (typeof docData !== "undefined" ? docData : null);
  if (!currentDocData || typeof currentDocData !== "object") {
    throw new Error("Formulaire source introuvable dans le contexte du bouton");
  }
  return {
    data: currentDocData,
    templateId: currentDocData["FORMLAYOUTID"],
  };
};

const getRequestedDate = () => {
  const dataTransport =
    typeof store !== "undefined" &&
    store.pageContentStore &&
    store.pageContentStore.processData &&
    store.pageContentStore.processData[0] &&
    store.pageContentStore.processData[0].edits;
  const dateValue = dataTransport && dataTransport["Dates_DateTransport"];
  const date = String(dateValue || "").trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error("Veuillez choisir une date valide dans Dates_DateTransport");
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    throw new Error("La date choisie dans Dates_DateTransport n’existe pas");
  }

  return date;
};

const showPlanifieSuccessToast = (message) => {
  let toast = document.getElementById("copyPlanifieSuccessBanner");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copyPlanifieSuccessBanner";
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      min-width: 300px;
      height: 50px;
      padding: 0 20px;
      background: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    `;

    const checkmark = document.createElement("span");
    checkmark.textContent = "✓";
    checkmark.style.cssText = "margin-right: 10px; color: green;";

    const text = document.createElement("span");
    text.textContent = message;

    const progress = document.createElement("div");
    progress.id = "copyPlanifieSuccessProgress";
    progress.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      height: 5px;
      width: 0;
      background: green;
    `;

    toast.append(checkmark, text, progress);
    document.body.appendChild(toast);
  } else {
    toast.style.display = "flex";
  }

  const progress = document.getElementById("copyPlanifieSuccessProgress");
  let width = 0;
  progress.style.width = "0%";
  clearInterval(toast._copyPlanifieProgressTimer);
  toast._copyPlanifieProgressTimer = setInterval(() => {
    width += 2;
    progress.style.width = `${Math.min(width, 100)}%`;
    if (width >= 100) {
      clearInterval(toast._copyPlanifieProgressTimer);
      toast.style.display = "none";
    }
  }, 100);
};

const createPlanifieCopy = async () => {
  const source = await getSource();

  if (!source.data || typeof source.data !== "object" || Array.isArray(source.data)) {
    throw new Error("Les données du formulaire source sont invalides");
  }

  const date = getRequestedDate();
  const templateId = source.data["FORMLAYOUTID"] || source.templateId;
  if (!templateId) {
    throw new Error("Identifiant du modèle (FORMLAYOUTID) introuvable");
  }

  const data = { ...source.data };
  delete data.FORMID;
  delete data.NUMBER;
  data.Dates_DateTransport = date;
  data["Dates_TypeRéc"] = "Une seule fois";
  data["Dates_Récurrence"] = "false";
  data.DateTime_Start = `${date}T00:00:00`;
  data.DateTime_End = `${date}T23:59:59`;
  data.STATUS = "PLANIFIÉ";

  const document = {
    data: JSON.stringify(data),
    status: "PLANIFIÉ",
    active: true,
    template: { templateId },
  };

  await api({ local: true }).post("document", { document });
  console.log("Copie planifiée créée; le modèle original est conservé");
  showPlanifieSuccessToast("Le transport planifié a été créé avec succès.");
};

createPlanifieCopy().catch((error) => {
  console.error("Erreur lors de la création du transport planifié :", error);
});
