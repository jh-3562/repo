console.log("Function 117", context);

const createDocument = async (documentToCreate) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: documentToCreate,
    });

    return response?.data || null;
  } catch (error) {
    console.error("Failed to create document:", error);
    return null;
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

const main = async () => {
  if (!isValidDocument(t, docData)) {
    try {
      const documentToCreate = {
        data: formatDataAPI(docData),
        status: "Actif",
        active: true,
        template: { templateId: "43ed55a2-0f07-4dc8-8ea2-9de2375a5c4f" },
      };
      const result = await createDocument(documentToCreate);

      if (result?.id) {
        window.location.href = "/facturation";
      } else {
        showErrorBanner("Création échouée : id manquant.");
      }
    } catch (e) {
      console.log("Error :", e);
      showErrorBanner("Erreur lors de la création du transporteur");
    }
  }
};

main();
