console.log("Function 112", context);

(async () => {
  try {
    showPopupLoading("Mise à jour...");

    const TEMPLATE_ID = "d6fed3d1-3dd3-4c1b-8316-cd60ad256e41";

    const documentID =
      docData?.FORMID ;

    if (!documentID) {
      throw new Error("ID du formulaire introuvable.");
    }

    await api({ local: true }).put("document/Many", {
      documents: [
        {
          documentID: documentID,
          data: JSON.stringify(docData), // on garde toute la data
          status: "Inactif",
          active: true,
          template: {
            templateId: TEMPLATE_ID
          }
        }
      ]
    });

    hidePopupLoading();
    showSuccessBanner("Formulaire mis Inactif.");

  } catch (e) {
    hidePopupLoading();
    console.error(e);
    showErrorBanner("Erreur lors de la mise à jour.");
  }
})();
