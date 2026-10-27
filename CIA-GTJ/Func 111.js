console.log("Function 111", context);

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
  return String(value || "").trim().toLowerCase();
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

const getTauxIds = async () => {
  const resIds = await api({ local: true }).post("document/id/filter", {
    filters: [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Taux",
        type: "TEXT"
      }
    ]
  });

  console.log("resIds", resIds);

  return resIds?.data?.ids || [];
};

const getDocumentsByIds = async (ids = []) => {
  if (!ids.length) return [];

  const resDocs = await api({ local: true }).post("document/id", {
    ids: ids
  });

  console.log("resDocs", resDocs);

  return resDocs?.data?.documents || [];
};

const updateDocumentMany = async (documents = []) => {
  if (!documents.length) return;

  return await api({ local: true }).put("document/Many", {
    documents: documents
  });
};

/* main */

const activerTauxActuel = async () => {
  try {
    showPopupLoading("Activation...");

    const currentId = docData?.FORMID;

    if (!currentId) {
      throw new Error("Impossible de trouver l'id du formulaire actuel.");
    }

    const currentCombinationKey = getCombinationKey(docData);

    if (!currentCombinationKey) {
      throw new Error("Combinaison de taux invalide.");
    }

    const ids = await getTauxIds();

    if (!ids.length) {
      throw new Error("Aucun formulaire Taux trouvé.");
    }

    const docs = await getDocumentsByIds(ids);
    const documentsToUpdate = [];

    for (const doc of docs) {
      const docId =
        doc.FORMID ||
        doc.FormID ||
        doc.formID ||
        doc.id ||
        doc.documentID;

      if (!docId) continue;

      const currentData = safeParse(doc.data);
      const oldCombinationKey = getCombinationKey(currentData);

      if (oldCombinationKey !== currentCombinationKey) continue;
      if (String(docId) !== String(currentId) && doc.status !== STATUS_ACTIF && doc.metaData?.STATUS !== STATUS_ACTIF) continue;

      documentsToUpdate.push({
        documentID: docId,
        data: JSON.stringify(currentData),
        status: String(docId) === String(currentId) ? STATUS_ACTIF : STATUS_INACTIF,
        active: true,
        template: {
          templateId: TAUX_TEMPLATE_ID
        }
      });
    }

    console.log("documentsToUpdate", documentsToUpdate);

    if (!documentsToUpdate.some(d => String(d.documentID) === String(currentId))) {
      throw new Error("Le taux actuel n'a pas ete retrouve dans les documents accessibles.");
    }
    await updateDocumentMany(documentsToUpdate);

    hidePopupLoading();
    showSuccessBanner("Le taux actuel est maintenant actif.");

    setTimeout(() => {
      history.back();
    }, 1000);

  } catch (err) {
    hidePopupLoading();
    console.error("Erreur activation taux", err);
    showErrorBanner(err?.message || "Erreur lors de l'activation du taux.");
  }
};

return activerTauxActuel();
