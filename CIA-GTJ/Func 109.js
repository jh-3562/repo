console.log("Function 109", context);
const TAUX_TEMPLATE_ID = "d6fed3d1-3dd3-4c1b-8316-cd60ad256e41";
const STATUS_ACTIF = "Actif";
const STATUS_INACTIF = "Inactif";

/* helpers */

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalize = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const formatTauxMontant = (value) => {
  if (value == null || value === "") return "";

  const normalizedValue = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  const numberValue = Number(normalizedValue);

  if (Number.isNaN(numberValue)) return value;

  return numberValue.toFixed(2).replace(",", ".");
};

const getCurrentDocumentId = (data) => {
  return (
    data?.FORMID || data?.FormID || data?.formID || data?.id || data?.documentID
  );
};

const getCombinationKey = (data) => {
  const typeDeTaux = normalize(data?.Taux_TypeDeTaux);

  if (typeDeTaux === "au kilomètre") {
    const surface = normalize(data?.Taux_TypeDeSurface);

    if (surface === "gravier") return "km-gravier";
    if (surface === "pavé") return "km-pave";

    return "";
  }

  if (typeDeTaux === "horaire") {
    const categorie = normalize(data?.Taux_CatégorieDuTransporteur);

    if (categorie === "bénévole") return "horaire-benevole";
    if (categorie === "garda") return "horaire-garda";

    return "";
  }

  if (typeDeTaux === "repas") {
    const typeDeRepas = normalize(data?.Taux_TypeDeRepas);

    if (!typeDeRepas) return "";

    return `repas-${typeDeRepas}`;
  }

  return "";
};

const createDocument = async (templateId, dataObj, statusOverride) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: JSON.stringify(dataObj),
        status: statusOverride || STATUS_ACTIF,
        active: true,
        template: { templateId },
      },
      preventNotify: "FULL",
    });

    console.log("createDocument response", response);

    const id = response?.data?.id;
    const number = response?.data?.number ?? "";

    if (!id) {
      throw new Error("Création échouée : id manquant.");
    }

    return { id, number, raw: response?.data };
  } catch (error) {
    console.error("Failed to create document:", error);
    throw error;
  }
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });

    console.log("updateDocument response", response);

    return response?.status || null;
  } catch (error) {
    console.error("Failed to update document:", error);
    return null;
  }
};

const getTauxIds = async () => {
  const response = await api({ local: true }).post("document/id/filter", {
    filters: [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Taux",
        type: "TEXT",
      },
    ],
  });

  console.log("getTauxIds response", response);

  return response?.data?.ids || [];
};

const getDocumentsByIds = async (ids = []) => {
  if (!ids.length) return [];

  const response = await api({ local: true }).post("document/id", {
    ids,
  });

  console.log("getDocumentsByIds response", response);

  return response?.data?.documents || [];
};

const inactivateOldMatchingTaux = async (oldDocs, newCombinationKey, newId) => {
  for (const doc of oldDocs) {
    const docId = getCurrentDocumentId(doc);

    if (!docId || String(docId) === String(newId)) continue;

    const currentData = safeParse(doc.data);
    const oldCombinationKey = getCombinationKey(currentData);

    if (oldCombinationKey !== newCombinationKey) continue;

    const documentToUpdate = {
      data: JSON.stringify(currentData),
      status: STATUS_INACTIF,
      active: true,
      template: {
        templateId: TAUX_TEMPLATE_ID,
      },
      documentID: docId,
    };

    console.log("Inactivating old taux", documentToUpdate);

    const updateStatus = await updateDocument(documentToUpdate);

    if (updateStatus !== 204) {
      throw new Error("La désactivation d'un ancien taux a échoué.");
    }
  }
};

/* main */

const main = async () => {
  try {
    showPopupLoading("Création...");

    const localDocData = {
      ...docData,
      Taux_Montant: formatTauxMontant(docData?.Taux_Montant),
    };

    console.log("localDocData formatted", localDocData);

    const newCombinationKey = getCombinationKey(localDocData);

    if (!newCombinationKey) {
      throw new Error("Combinaison de taux invalide.");
    }

    const tauxResult = await createDocument(
      TAUX_TEMPLATE_ID,
      localDocData,
      STATUS_ACTIF,
    );

    console.log("Taux créé", tauxResult);

    const newId = tauxResult.id;

    const createdDocumentToUpdate = {
      data: JSON.stringify(localDocData),
      status: STATUS_ACTIF,
      active: true,
      template: {
        templateId: TAUX_TEMPLATE_ID,
      },
      documentID: newId,
    };

    const createdUpdateStatus = await updateDocument(createdDocumentToUpdate);

    if (createdUpdateStatus !== 204) {
      throw new Error("La correction du montant du nouveau taux a échoué.");
    }

    const ids = await getTauxIds();
    const oldIds = ids.filter((id) => String(id) !== String(newId));
    const oldDocs = await getDocumentsByIds(oldIds);

    await inactivateOldMatchingTaux(oldDocs, newCombinationKey, newId);

    hidePopupLoading();
    showSuccessBanner("Nouveau taux actif créé.");

    setTimeout(() => {
      history.back();
    }, 1000);
  } catch (err) {
    hidePopupLoading();
    console.error("Erreur Function 109", err);
    showErrorBanner(err?.message || "Erreur lors de la création du taux.");
  }
};

return main();
