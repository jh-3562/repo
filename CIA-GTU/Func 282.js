console.log("Fonction 282", context);

const TARGET_NAME_FIELD = "Facturation_TarifCollec|1|Nom";
const TARGET_TYPE_FIELD = "Facturation_TarifCollec|2|Type";
const TARGET_PRICE_FIELD = "Facturation_TarifCollec|3|PrixUnitaire";

const getSearchedTarifName = () => {
  const tarifRow = docData.Facturation_TarifCollec?.[indexItemChange];
  return tarifRow?.[TARGET_NAME_FIELD] || "";
};

const buildTarifFilters = (tarifName) => [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "TARIFS",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Actif",
    type: "TEXT",
  },
  {
    key: "Tarif_Nom",
    operator: "CONTAINS",
    value: tarifName,
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
    console.error("Impossible de lire les données du tarif :", error);
    return null;
  }
};

const toTarifSuggestion = (tarifData) => ({
  title: tarifData.Tarif_Nom || "",
  fields: [
    {
      key: TARGET_TYPE_FIELD,
      value: tarifData.Tarif_TypeTarif || "",
      name: "Type de tarif",
    },
    {
      key: TARGET_PRICE_FIELD,
      value: tarifData.Tarif_Montant || "",
      name: "Prix unitaire",
    },
  ],
});

const findTarifSuggestions = async (tarifName) => {
  const ids = await getDocumentIds(buildTarifFilters(tarifName));
  if (ids.length === 0) return [];

  const documents = await getDocuments(ids);

  return documents
    .map(parseDocumentData)
    .filter(Boolean)
    .map(toTarifSuggestion);
};

const sendSuggestions = (suggestions) => {
  callback({
    suggestions: {
      [TARGET_NAME_FIELD]: suggestions,
    },
  });
};

const main = async () => {
  let suggestions = [];

  try {
    suggestions = await findTarifSuggestions(getSearchedTarifName());
  } catch (error) {
    console.error("Erreur lors de la récupération des tarifs :", error);
  } finally {
    // Toujours répondre au système, même en cas d'erreur, pour vider les suggestions
    sendSuggestions(suggestions);
  }
};

main();
