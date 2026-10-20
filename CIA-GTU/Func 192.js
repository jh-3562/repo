console.log("Fonction 192", context);

const FORMLAYOUTID_DEMANDES = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const updateDocuments = async (documentsToUpdate) => {
  try {
    const response = await api({ local: true }).put("document/Many", {
      documents: documentsToUpdate,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to update documents:", error);
    return [];
  }
};

const main = async () => {
  const checkedDemandesResponse = store.pageContentStore.checked;
  if (!checkedDemandesResponse.length) {
    showErrorBanner("Veuillez sélectionner au moins une demande");
    return;
  }

  showPopupLoading("Confirmation de la demande en cours...");
  const documentsToUpdate = checkedDemandesResponse.map((doc) => {
    return {
      data: JSON.stringify({}),
      status: "Confirmée",
      active: true,
      template: { templateId: FORMLAYOUTID_DEMANDES },
      documentID: doc,
    };
  });

  const updated = await updateDocuments(documentsToUpdate);
  if (updated) {
    showSuccessBanner("Les demandes ont étées confirmées avec succès!");
  } else {
    showErrorBanner("Erreur lors de la confirmation des demandes");
  }
  hidePopupLoading();
};

main();
