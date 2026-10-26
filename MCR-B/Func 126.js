console.log("Function 126", context);
// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh
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

  // Make sure the form exists in order to be able to redirect the user to its web page.
  const existingForm = (
    await recurrence.createFormsIfNeeded([interpretedForm], api)
  )[0];

  console.log("existingForm :", existingForm);
  let url_id;
  switch (recurrence.isDocumentOrRow(existingForm)) {
    case "document":
      url_id = existingForm.documentID;
      break;
    case "row":
      url_id = existingForm.key;
      break;
    default:
      console.error(
        "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
        formatedForm,
      );
  }

  const url = new URL(window.location.href);

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split("/");

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex((seg) => seg.startsWith("mcr."));

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex];
    const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`;
    url.pathname = newPath;

    window.location.href = url.toString();
  } else {
    const section = segments[1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base sans MCR : /volontaires ou /tableaudebord
    const newPath = `/${section}/${url_id}`;
    url.pathname = newPath;

    window.location.href = url.toString();
    /*
    const apiFilters = [
      {
        key: "FORMID",
        operator: "EQUALS",
        value: url_id,
        type: "TEXT",
      },
    ];

    const res = await getDocumentIDsByFilters(apiFilters);
    console.log("res :", res);

    if (res.length > 0) {
      const documentIDs = res;
      const documents = await getDocumentsByIDs(documentIDs);
      console.log("documents :", documents);
    }

    const data = JSON.parse(documents[0].data);

    console.log("data :", data);
    console.error("Segment MCR introuvable dans l’URL.");
    */
  }
};

main();
