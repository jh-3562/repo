console.log("Function10", context);

const TEMPLATE_ID = "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e";

const safeStr = (v) => String(v ?? "").trim();
const safeNumber = (v) => Number(v ?? 0);

const highlightFields = (keys) => {
  (keys || []).forEach((k) => {
    const el = document.getElementById(k);
    if (el) {
      el.style.outline = "2px solid #e74c3c";
      el.style.borderColor = "#e74c3c";
      el.addEventListener(
        "input",
        () => {
          el.style.outline = "";
          el.style.borderColor = "";
        },
        { once: true },
      );
    }
  });
};

const validateRAMQ = (value) => {
  if (!value) return false;
  return /^[A-Z]{4} [0-9]{4} [0-9]{4}$/.test(safeStr(value));
};

const DataCollection = (key, array) => {
  const result = {};
  const itemCount = array?.length || 0;

  (array || []).forEach((obj, index) => {
    Object.keys(obj || {}).forEach((k) => {
      result[`${k}|${index + 1}`] = obj[k];
    });
  });

  result[key] = String(itemCount);
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, k) => {
    if (!keys.includes(k)) result[k] = obj[k];
    return result;
  }, {});

const formatDataAPI = (data) => {
  let out = { ...(data || {}) };

  Object.keys(out).forEach((k) => {
    if (Array.isArray(out[k])) {
      out = { ...out, ...DataCollection(k, out[k]) };
    }
  });

  return JSON.stringify(excludeKeys(out, ["FORMID", "NUMBER"]));
};

const extractApiError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.response?.data?.title ||
  err?.message ||
  "Erreur inconnue";

const redirectToForm = (formId) => {
  window.open(`donnees/${formId}`, "_self", "noopener,noreferrer");
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

const checkNumeroAssuranceExiste = async (
  typeIdentification,
  numeroAssurance,
) => {
  if (!numeroAssurance) return false;

  // Seul "Sans assurance privée" n'a pas de numéro à vérifier
  if (typeIdentification === "Sans assurance privée") {
    return false;
  }

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Usager",
      type: "TEXT",
    },
    {
      key: "Identite_TypeIdentification",
      operator: "EQUALS",
      value: typeIdentification,
      type: "TEXT",
    },
  ];

  if (typeIdentification === "RAMQ") {
    filters.push({
      key: "Identite_RAMQ",
      operator: "EQUALS",
      value: numeroAssurance,
      type: "TEXT",
    });
  } else if (typeIdentification === "Carte santé d'une autre province") {
    filters.push({
      key: "Identite_NumeroAssuranceMaladie",
      operator: "EQUALS",
      value: numeroAssurance,
      type: "TEXT",
    });
  } else if (
    typeIdentification === "Assurance privée canadienne" ||
    typeIdentification === "Assurance privée étrangère"
  ) {
    filters.push({
      key: "Identite_NumeroCarteAssurance",
      operator: "EQUALS",
      value: numeroAssurance,
      type: "TEXT",
    });
  } else {
    return false;
  }

  const ids = await getDocumentIDsByFilters(filters);
  return ids.length > 0;
};

async function main() {
  console.log("docData :", docData);

  if (isValidDocument(t, docData)) {
    return;
  }
  const documentNumber = safeNumber(docData.NUMBER);
  const isCreate = documentNumber === 0 ? true : false;
  const documentId = safeStr(docData.FORMID);

  if (isCreate) {
    const typeIdentification = safeStr(docData.Identite_TypeIdentification);

    let numeroAssurance = "";
    if (typeIdentification === "RAMQ") {
      numeroAssurance = safeStr(docData.Identite_RAMQ);
    } else if (typeIdentification === "Carte santé d'une autre province") {
      numeroAssurance = safeStr(docData.Identite_NumeroAssuranceMaladie);
    } else if (
      typeIdentification === "Assurance privée canadienne" ||
      typeIdentification === "Assurance privée étrangère"
    ) {
      numeroAssurance = safeStr(docData.Identite_NumeroCarteAssurance);
    }

    const existeDeja = await checkNumeroAssuranceExiste(
      typeIdentification,
      numeroAssurance,
    );

    if (existeDeja) {
      showCustomPopup({
        title: "Numéro d'assurance déjà existant",
        commentHTML:
          "Le numéro d'assurance inscrit est déjà associé à un usager dans la base de données. Veuillez corriger le numéro d'assurance si une erreur de saisie s'est produite.",
        buttons: [
          {
            name: "Ok",
            backgroundColor: "#1C5420",
            color: "#ffffff",
            onClick: () => {},
          },
        ],
      });
      return;
    }
  }

  if (!isCreate && !documentId) {
    showErrorBanner("Impossible de mettre à jour: FORMID manquant.");
    return;
  }
  const statusDoc = isCreate ? "Actif" : docData.STATUS;

  const documentPayload = {
    data: formatDataAPI(docData),
    status: statusDoc,
    active: true,
    template: { templateId: TEMPLATE_ID },
    ...(isCreate ? {} : { documentID: documentId }),
  };

  showPopupLoading(
    isCreate ? "Création de l'usager..." : "Mise à jour de l'usager...",
  );

  try {
    const res = isCreate
      ? await api({ local: true }).post("document", {
          document: documentPayload,
          preventNotify: "FULL",
        })
      : await api({ local: true }).put("document", {
          document: documentPayload,
          preventNotify: "FULL",
        });

    hidePopupLoading();

    console.log("API response:", res);

    showSuccessBanner(isCreate ? "Usager créé." : "Usager mis à jour.");

    setTimeout(() => {
      redirectToForm(res?.data?.id || documentId);
    }, 700);
  } catch (err) {
    hidePopupLoading();
    console.log("API ERROR:", err);
    showErrorBanner(
      `${isCreate ? "Erreur lors de la création" : "Erreur lors de la mise à jour"}:\n${extractApiError(err)}`,
    );
  }
}

main();

