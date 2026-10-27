console.log("Function 113", context);

const TAUX_TEMPLATE_ID = "d6fed3d1-3dd3-4c1b-8316-cd60ad256e41";
const STATUS_ACTIF = "Actif";

/* helpers */

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

const getDocumentById = async (documentID) => {
  const response = await api({ local: true }).post("document/id", {
    ids: [documentID],
  });

  console.log("getDocumentById response", response);

  return response?.data?.documents?.[0] || null;
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });
    console.log("responseupdatedoc", response);
    return response?.status || null; //Changé pour juste check le code 204
  } catch (error) {
    console.error("Failed to update document:", error);
    return null;
  }
};

/* main */

const main = async () => {
  try {
    showPopupLoading("Enregistrement...");

    const documentID = getCurrentDocumentId(docData);

    if (!documentID) {
      throw new Error("ID du formulaire introuvable.");
    }

    const currentDocument = await getDocumentById(documentID);

    if (!currentDocument) {
      throw new Error("Document introuvable via API.");
    }

    const currentStatus = docData.STATUS;

    console.log("STATUS API:", currentStatus);

    const localDocData = {
      ...docData,
      Taux_Montant: formatTauxMontant(docData?.Taux_Montant),
    };

    const documentToUpdate = {
      data: JSON.stringify(localDocData),
      status: currentStatus,
      active: true,
      template: {
        templateId: TAUX_TEMPLATE_ID,
      },
      documentID,
    };
    console.log("doctoupdate", documentToUpdate);

    const updatedDocument = await updateDocument(documentToUpdate);

    console.log("updateddoc", updatedDocument);
    if (updatedDocument !== 204) {
      throw new Error("La mise à jour du taux a échoué.");
    }

    hidePopupLoading();
    showSuccessBanner("Taux enregistré.");
  } catch (err) {
    hidePopupLoading();
    console.error("Erreur Function 113", err);
    showErrorBanner(err?.message || "Erreur lors de l'enregistrement.");
  }
};

return main();
