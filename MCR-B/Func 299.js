const saveDocument = async (document) => {
  const isUpdate = !!document.documentID;
  const method = isUpdate ? "put" : "post";

  try {
    const response = await api({ local: true })[method]("document", {
      document,
    });
    return response?.data?.document || response?.data;
  } catch (error) {
    console.error(
      `Failed to ${isUpdate ? "update" : "create"} document:`,
      error,
    );
    throw error;
  }
};

const main = async () => {
  const isNotValid = await isValidDocument(t, docData);
  if (!isNotValid) {
    try {
      const document = {
        data: JSON.stringify(docData),
        status: "Enregistré",
        active: true,
        template: { templateId: docData.FORMLAYOUTID },
        ...(docData.STATUS !== "Draft" && { documentID: docData.FORMID }),
      };

      const savedDocument = await saveDocument(document);
      //console.log("Document saved successfully:", savedDocument);
      const area = window.location.pathname.split("/").filter(Boolean)[0];
      //console.log(`Redirecting to /${area}/véhicules/${savedDocument.id}`);
      window.location.href = `/${area}/véhicules/${savedDocument.id}`;
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  }
};

main();
