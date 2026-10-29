const main = async () => {
  if (isValidDocument(t, docData)) {
    return;
  }
  try {
    const newData = {
      data: formatDataAPI_FASTER(docData),
      status: docData?.statusAvantAttente || "Confirmée",
      active: true,
      template: { templateId: docData.FORMLAYOUTID },
      documentID: docData.FORMID,
    };

    await updateManyDocuments_FASTER(api, [newData]);
    await navigateBack();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
main();

