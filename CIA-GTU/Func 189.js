console.log("Fonction 189", context);

// Helpers pour normalizer le data
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

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }

    return result;
  }, {});

const formatDataAPI = (data) => {
  let normalizedData = { ...(data || {}) };

  Object.keys(normalizedData).forEach((key) => {
    if (Array.isArray(normalizedData[key])) {
      normalizedData = {
        ...normalizedData,
        ...dataCollection(key, normalizedData[key]),
      };
    }
  });

  return JSON.stringify(excludeKeys(normalizedData, ["FORMID", "NUMBER"]));
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });

    if (response?.status === 204) return true;

    return response?.data?.document || null;
  } catch (error) {
    return null;
  }
};

const submitStatusSoumise = async () => {
  try {
    const formattedData = formatDataAPI(docData);

    const documentToUpdate = {
      data: formattedData,
      status: "Annulée",
      active: true,
      template: { templateId: "dadaf75a-cd49-4cba-8060-2ac15155478f" },
      documentID: docData.FORMID,
    };

    const updated = await updateDocument(documentToUpdate);

    if (updated) {
      // Reload current URL to stay on same page
      window.location.reload();
    } else {
      showErrorBanner("Erreur lors de la mise à jour du document");
    }
  } catch (e) {
    showErrorBanner("Erreur lors de la mise à jour du document");
  }
};

submitStatusSoumise();
