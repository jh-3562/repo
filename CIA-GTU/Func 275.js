console.log("Fonction 275", context);

const TARGET_FIELD = "Tarif_Transporteur";

const getSearchedTransporteurName = () => docData[inputKey] || "";

const buildTransporteurFilters = (transporteurName) => [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Transporteur",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Actif",
    type: "TEXT",
  },
  {
    key: "NomTransporteur",
    operator: "CONTAINS",
    value: transporteurName,
    type: "TEXT",
  },
];

const getDocumentIds = async (filters) => {
  const response = await api({ local: true }).post("document/id/filter", {
    filters,
  });

  return Object.values(response?.data?.ids || []);
};

const getDocuments = async (ids) => {
  const response = await api({ local: true }).post("document/id", { ids });
  return Object.values(response?.data?.documents || {});
};

const parseDocumentData = (document) => {
  try {
    return JSON.parse(document.data || "{}");
  } catch (error) {
    console.error("Impossible de lire les données du transporteur :", error);
    return null;
  }
};

const toTransporteurSuggestion = (transporteurData) => ({
  title: transporteurData.NomTransporteur || "",
});

const findTransporteurSuggestions = async (transporteurName) => {
  const ids = await getDocumentIds(buildTransporteurFilters(transporteurName));
  if (ids.length === 0) return [];

  const documents = await getDocuments(ids);

  return documents
    .map(parseDocumentData)
    .filter(Boolean)
    .map(toTransporteurSuggestion);
};

const sendSuggestions = (suggestions) => {
  callback({
    suggestions: {
      [TARGET_FIELD]: suggestions,
    },
  });
};

const main = async () => {
  let suggestions = [];

  try {
    suggestions = await findTransporteurSuggestions(getSearchedTransporteurName());
  } catch (error) {
    console.error("Erreur lors de la récupération des transporteurs :", error);
  } finally {
    // Toujours répondre au système, même en cas d'erreur, pour vider les suggestions
    sendSuggestions(suggestions);
  }
};

main();
