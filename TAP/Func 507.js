console.log("Function 507", context);

// VARAIBLES
const apifilters = [
  {
    key: "FormIDRecurrence",
    operator: "EQUALS",
    value: docData["FORMID"],
    type: "TEXT",
  },
];

const recurrenceToSuppress = {
  data: JSON.stringify({}),
  status: "SUPPRIMÉ",
  active: true,
  template: { templateId: docData["FORMLAYOUTID"] },
  documentID: docData["FORMID"],
};

// SYNC FUNCTION
const getOccurrenceDocumentsToSuppress = (occurrences) => {
  return occurrences.map((occurrence) => {
    return {
      data: JSON.stringify({}),
      status: "SUPPRIMÉ",
      active: true,
      template: { templateId: docData["FORMLAYOUTID"] },
      documentID: occurrence.documentID,
    };
  });
};

// ASYNC FUNCTION
const { getDocuments, updateDocuments } = fasterApi(api({ local: true })); // API defined in a static file

// MAIN
const main = async () => {
  showPopupLoading("Suppretion de la récurrence");
  try {
    const occurrences = await getDocuments(apifilters);
    const canDelete = !occurrences.some((obj) => obj.status === "EXPORTÉ(E)");

    if (canDelete) {
      const occurencesToSuppress = await getOccurrenceDocumentsToSuppress(
        occurrences
      );

      const documentsToSuppress = [
        ...occurencesToSuppress,
        recurrenceToSuppress,
      ];
      console.log("documentsToSuppress", documentsToSuppress);
      await updateDocuments(documentsToSuppress);

      // redirect
      redirectToViewGroup();
    } else {
      console.log("Suppression impossible, contient des occurrences exportées");
      showErrorBanner(
        "Suppression impossible, contient des occurrences exportées"
      );
    }
    hidePopupLoading();
  } catch (error) {
    console.log("Error during function 507 :", error);
  }
};
main();
