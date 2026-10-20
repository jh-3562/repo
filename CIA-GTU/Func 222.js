console.log("Function 222", context);

const demandeTemplateId = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const RAPPEL_STATUS = "Recherche en cours";

const getDocumentsFromId = async (ids) => {
  const res = await api({ local: true }).post("document/id", { ids });
  const documents = res?.data?.documents;
  return documents.map((doc) => ({
    data: JSON.parse(doc.data),
    metaData: {
      FORMID: doc.metaData["FORMID"],
      STATUS: doc.metaData["STATUS"],
      FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
    },
  }));
};

const updateDemande = (demandeFormID, champsCommuns, DEMANDE_STATUS_ACTUEL) => {
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
  const demandeFormID = store?.pageContentStore?.active?.[0];

  if (!demandeFormID) {
    showErrorBanner("Aucun document sélectionné.");
    return;
  }

  const docs = await getDocumentsFromId([demandeFormID]);
  const data = { ...docs[0].data, STATUS: docs[0].metaData.STATUS };
  const formlayoutId = docs[0].metaData.FORMLAYOUTID;
  const DEMANDE_STATUS_ACTUEL = docs[0].metaData.STATUS || "Soumise";

  showPopupLoading("Mise à jour en cours...");

  try {
    const updateData = {
      Demande_StatutAccompagnateur: RAPPEL_STATUS,
    };

    await updateDemande(demandeFormID, updateData, DEMANDE_STATUS_ACTUEL);
    hidePopupLoading();
    showSuccessBanner("Statut mis à jour.");
    window.location.reload();
  } catch (error) {
    showErrorBanner(error.message);
    hidePopupLoading();
  }
};

main();
