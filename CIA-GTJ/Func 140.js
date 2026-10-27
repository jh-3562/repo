console.log("Fonction 140", context);

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
      preventNotify: "DOCUMENT",
    });

    if (!response) throw new Error("Failed to update document");

    return response?.data?.document || null;
  } catch (error) {
    console.error("Failed to update document:", error);
    throw error;
  }
};

const main = async () => {
  try {
    const confirmedPopup = await showPopupConfirmation(
      "Supprimer",
      "Êtes-vous sûr de vouloir supprimer ce document ?",
    );
    if (!confirmedPopup) return;

    showPopupLoading("Suppression en cours...");

    await updateDocument({
      data: formatDataAPI(docData),
      status: "Supprimé",
      active: false,
      template: { templateId: docData.FORMLAYOUTID },
      documentID: docData.FORMID,
    });

    showSuccessBanner("Document supprimé avec succès.");
    window.location.reload();
  } catch (error) {
    showErrorBanner("Erreur lors de la suppression.");
    console.error(error);
  } finally {
    hidePopupLoading();
  }
};

main();
