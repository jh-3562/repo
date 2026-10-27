console.log("function 58", context);

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const deleteDocument = async (doc) => {
  try {
    const res = await api({ local: true }).put("document", {
      document: doc,
    });

    return res?.data?.documents || [];
  } catch (error) {
    console.error("Failed to delete documents:", error);
    return [];
  }
};

const main = async () => {
  const input = store?.pageContentStore?.active?.[0];
  console.log("input", input);

  const doc = await getDocumentsByIDs([input]);
  console.log("doc", doc);
  if (doc.length !== 1) return;
  const docToSave = {
    data: doc[0].data,
    status: "Annulé",
    active: true,
    template: { templateId: "7d19c79c-8a4a-418c-8d1a-89d0139ecb00" },
    documentID: input,
  };

  const res = await deleteDocument(docToSave);
  console.log("res", res);
  if (!docData.FORMID) window.location.reload();
};

main();
