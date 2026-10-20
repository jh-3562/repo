console.log("Fonction 188", context);

const update = async () => {
  try {
    const documentToUpdate = {
      data: formatDataAPI_FASTER(docData),
      status: docData.STATUS,
      active: true,
      template: { templateId: "dadaf75a-cd49-4cba-8060-2ac15155478f" },
      documentID: docData.FORMID,
    };
    console.log("Document to update", documentToUpdate);

    return await createOneDocument(api, documentToUpdate);
  } catch (e) {
    showErrorBanner("Erreur lors de la mise à jour du document");
    return null;
  }
};

const main = async () => {
  try {
    if (!isValidDocument(t, docData)) {
      await update();
      navigateBack();
    }
  } catch (e) {
    showErrorBanner("Erreur lors de la mise à jour du document");
  }
};

main();
