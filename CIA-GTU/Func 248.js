console.log("Function 248", context);

const updateOneDocument_FASTER = async (
  api,
  document,
  preventNotify = "DOCUMENT",
) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: document,
      preventNotify,
    });

    return response?.data?.document || null;
  } catch (error) {
    console.log("Erreur lors de la modification du document.");
    throw error;
  }
};

const createUpdateDocument_FASTER = (data, templateId, status, docID) => {
  return {
    data: formatDataAPI_FASTER(data),
    status,
    active: true,
    template: { templateId },
    documentID: docID,
  };
};

const saveForm_FASTER = async (
  context,
  data,
  isValid = true,
  loading = true,
) => {
  const { api, t, isValidDocument } = context;

  if (isValid && isValidDocument(t, data)) return;

  loading && showPopupLoading("Enregistrement en cours");

  const saveDocument = createUpdateDocument_FASTER(
    data,
    data.FORMLAYOUTID,
    data.STATUS,
    data.FORMID,
  );

  try {
    await updateOneDocument_FASTER(api, saveDocument);
    showSuccessBanner("Document enregistré avec succès.");
  } catch (error) {
    showErrorBanner(error.message);
  } finally {
    loading && hidePopupLoading();
  }
};

const main = async () => {
  const confirmedPopup = await showPopupConfirmation(
    "Sauvegarder les modifications",
    "Souhaitez-vous sauvegarder les modifications ?",
  );
  if (!confirmedPopup) return;

  await saveForm_FASTER(context, docData);
  window.location.reload();
};

main();
