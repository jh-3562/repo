console.log("Fonction 141", context);

const main = async () => {
  try {
    showPopupLoading("Enregistrement en cours...");
    const result = await createOrUpdateDocument(
      docData.FORMLAYOUTID,
      docData.STATUS,
      docData.FORMID,
      context,
      "DOCUMENT",
    );
    if (result === undefined) {
      hidePopupLoading();
      return;
    }
    showSuccessBanner("Document enregistré avec succès.");
    window.location.reload();
  } catch (error) {
    showErrorBanner("Erreur lors de l'enregistrement.");
    console.error(error);
  } finally {
    hidePopupLoading();
  }
};

main();
