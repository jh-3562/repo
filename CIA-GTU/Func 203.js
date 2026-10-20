console.log("Function 203", context);

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }

    return result;
  }, {});

const createUpdateDocument = (data, templateId, status, docID) => {
  return {
    data: data,
    status: status,
    active: true,
    template: { templateId: templateId },
    documentID: docID,
  };
};

const updateDocument = async (doc) => {
  try {
    await api({ local: true }).put("document", { document: doc });
  } catch (e) {
    console.error(e);
  }
};

const dataCollection = (key, array) => {
  const result = {};
  (array || []).forEach((obj, index) => {
    Object.keys(obj || {}).forEach((currentKey) => {
      result[`${currentKey}|${index + 1}`] = obj[currentKey];
    });
  });
  result[key] = String(array?.length || 0);
  return result;
};

const formatDataAPI = (data) => {
  let out = { ...(data || {}) };
  Object.keys(out).forEach((k) => {
    if (Array.isArray(out[k])) {
      out = { ...out, ...dataCollection(k, out[k]) };
    }
  });
  return JSON.stringify(excludeKeys(out, ["FORMID", "NUMBER"]));
};

const main = async () => {
  const confirmedPopup = await showPopupConfirmation(
    "Rendre inactif",
    "Êtes-vous sûr de vouloir rendre cet utilisateur inactif?",
  );
  if (!confirmedPopup) return;
  else showPopupLoading("Mise à jour en cours...");

  try {
    await updateDocument(
      createUpdateDocument(
        formatDataAPI(docData),
        docData.FORMLAYOUTID,
        "Inactif",
        docData.FORMID,
      ),
    );
    hidePopupLoading();
    showSuccessBanner("Utilisateur rendu inactif.");
  } catch (error) {
    showErrorBanner(error.message);
    hidePopupLoading();
  }
};

main();
