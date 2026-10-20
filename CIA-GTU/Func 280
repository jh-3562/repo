console.log("Function 280", context);

const TEMPLATE_ID = "e371bcfb-1eba-4f0e-aeac-a528b22667e5";
const ACTIVE_STATUS = "Actif";
const INACTIVE_STATUS = "Inactif";

const flattenCollections = (data) => {
  const flattened = { ...(data || {}) };

  Object.keys(flattened).forEach((key) => {
    const value = flattened[key];
    if (!Array.isArray(value)) return;

    value.forEach((row, index) => {
      Object.keys(row || {}).forEach((subKey) => {
        flattened[`${subKey}|${index + 1}`] = row[subKey];
      });
    });

    flattened[key] = String(value.length);
  });

  return flattened;
};

const formatDataAPI = (data) => JSON.stringify(flattenCollections(data || {}));

const getDocumentsByIDs = async (documentIDs) => {
  const response = await api({ local: true }).post("document/id", {
    ids: documentIDs,
  });

  return response?.data?.documents || [];
};

const getGeneratedDocumentNumber = async (documentID) => {
  const document = (await getDocumentsByIDs([documentID]))?.[0];
  const number = document?.number;

  return number != null && Number(number) > 0 ? Number(number) : null;
};

const createOptimizationParameter = async (data) => {
  const { FORMID, NUMBER, documentID, DOCUMENTID, ...newData } = data || {};

  const response = await api({ local: true }).post("document", {
    document: {
      data: formatDataAPI({
        ...newData,
        User_Status: ACTIVE_STATUS,
      }),
      status: ACTIVE_STATUS,
      active: true,
      template: {
        templateId: TEMPLATE_ID,
      },
    },
    preventNotify: "FULL",
  });

  const documentIDCreated =
    response?.data?.id ||
    response?.data?.documentID ||
    response?.data?.document?.documentID ||
    response?.id;

  if (!documentIDCreated) {
    throw new Error("Le paramètre d'optimisation n'a pas été créé.");
  }

  const documentNumber = await getGeneratedDocumentNumber(documentIDCreated);

  if (documentNumber == null) {
    throw new Error(
      "Le numéro du paramètre d'optimisation n'a pas été généré.",
    );
  }

  await api({ local: true }).put("document", {
    document: {
      documentID: documentIDCreated,
      data: formatDataAPI({
        ...newData,
        User_Status: ACTIVE_STATUS,
        NUMBER: documentNumber,
        SystemeCache_Nombre: String(documentNumber),
      }),
      status: ACTIVE_STATUS,
      active: true,
      template: {
        templateId: TEMPLATE_ID,
      },
    },
    preventNotify: "FULL",
  });

  return {
    id: documentIDCreated,
    number: documentNumber,
  };
};

const deactivatePreviousOptimizationParameters = async (newDocumentID) => {
  const response = await api({ local: true }).post("document/id/filter", {
    filters: [
      {
        key: "FORMLAYOUTID",
        operator: "EQUALS",
        value: TEMPLATE_ID,
        type: "TEXT",
      },
    ],
  });

  const ids = response?.data?.ids || [];
  const documents = await getDocumentsByIDs(ids);

  const updates = documents
    .filter((document) => {
      const documentID = document?.documentID || document?.DOCUMENTID;
      return documentID && documentID !== newDocumentID;
    })
    .map((document) => {
      const documentID = document.documentID || document.DOCUMENTID;
      const data =
        typeof document.data === "string"
          ? JSON.parse(document.data)
          : document.data || {};

      return {
        documentID,
        data: formatDataAPI({
          ...data,
          User_Status: INACTIVE_STATUS,
        }),
        status: INACTIVE_STATUS,
        active: true,
        template: {
          templateId: TEMPLATE_ID,
        },
      };
    });

  if (!updates.length) return;

  await api({ local: true }).put("document/Many", {
    documents: updates,
  });
};

const main = async () => {
  if (isValidDocument(t, docData)) {
    return;
  }

  showPopupLoading("Création du paramètre d'optimisation...");

  try {
    const createdParameter = await createOptimizationParameter(docData);
    await deactivatePreviousOptimizationParameters(createdParameter.id);

    showSuccessBanner(
      `Paramètre d'optimisation #${createdParameter.number} créé avec succès.`,
    );
  } catch (error) {
    console.error(
      "Erreur lors de la création du paramètre d'optimisation :",
      error,
    );
    showErrorBanner("Le paramètre d'optimisation n'a pas pu être créé.");
  } finally {
    hidePopupLoading();
  }
};

main();
