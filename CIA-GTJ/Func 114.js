console.log("Function 114", context);

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

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

const main = async () => {
  console.log("context :", context);

  const clickedFormId = store.pageContentStore?.active[0];

  const interpretedForm = store.pageContentStore.prepareDataRows.find(
    (row) => row.rowID === clickedFormId,
  );

  console.log("clicked on form :", interpretedForm);

  if (!interpretedForm) {
    console.error("Aucune donnée trouvée pour l'ID :", clickedFormId);
    return;
  }

  // Use the existing row/document directly
  const url_id =
    interpretedForm.documentID ||
    interpretedForm.key ||
    interpretedForm.rowID;

  if (!url_id) {
    console.error("Impossible de trouver un identifiant valide.");
    return;
  }

  const url = new URL(window.location.href);
  const segments = url.pathname.split("/");

  const section = segments[1];

  url.pathname = `/${section}/${url_id}`;

  window.location.href = url.toString();
};

main();
