console.log("Fonction 531", context);

const Id = store.pageContentStore.active?.[0] ?? null;
console.log("Document actif", Id);

const templateId = "6d75ae79-ced2-4a83-a41e-da016f27e530";

const documentToUpdate = {
  data: JSON.stringify({
    startStopNumber: "",
    startStopNumberRetour: "",
    endStopNumber: "",
    endStopNumberRetour: "",
    stopoverStopNumber: ""
  }),
  status: "VOYAGE BLANC",
  active: true,
  template: { templateId: templateId },
  documentID: Id,
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });

    return response?.data?.document || null;
  } catch (error) {
    console.error("Failed to update document:", error);
    return null;
  }
};

updateDocument(documentToUpdate);