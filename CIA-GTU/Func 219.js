console.log("Function 219", context);
const demandeFormID = docData.FORMID;
const demandeTemplateId = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const RAPPEL_STATUS = "Recherche en cours";

const DEMANDE_STATUS_ACTUEL =
  docData.DemandeStatus || docData.TEMPORARY_STATUS || "Draft";

const updateDemande = (champsCommuns) => {
  const document = {
    documentID: demandeFormID,
    template: { templateId: demandeTemplateId },
    active: true,
    status: DEMANDE_STATUS_ACTUEL,
    data: JSON.stringify(champsCommuns),
  };

  return api({ local: true }).put("document", { document });
};

const main = async () => {
  showPopupLoading("Mise à jour en cours...");

  try {
    const updateData = {
      Demande_StatutAccompagnateur: RAPPEL_STATUS,
    };

    await updateDemande(updateData);
    hidePopupLoading();
    showSuccessBanner("Statut mis à jour.");
    window.location.reload();
  } catch (error) {
    showErrorBanner(error.message);
    hidePopupLoading();
  }
};

main();
