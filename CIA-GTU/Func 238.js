console.log("Fonction 238", context);

const searchValue = docData[inputKey] || "";
const BASE_FILTERS = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Utilisateur",
    type: "TEXT",
  },
  { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
  {
    key: "Utilisateur_Role",
    operator: "EQUALS",
    value: "Chauffeur",
    type: "TEXT",
  },
];

const FILTER_PRENOM = [
  ...BASE_FILTERS,
  {
    key: "Utilisateur_Prenom",
    operator: "CONTAINS",
    value: searchValue,
    type: "TEXT",
  },
];
const FILTER_NOM = [
  ...BASE_FILTERS,
  {
    key: "Utilisateur_Nom",
    operator: "CONTAINS",
    value: searchValue,
    type: "TEXT",
  },
];

const getDocumentIds = async (apiFilters) => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return res?.data?.ids;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des ids :${error}`);
  }
};

const getDocuments = async (ids) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: ids,
    });

    return response?.data?.documents;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des documents :${error}`);
  }
};

const suggestionField = (data) => {
  return [
    {
      key: "NomCompletChauffeurTransporteur",
      name: "Nom complet du chauffeur",
      value: `${data.Utilisateur_Prenom} ${data.Utilisateur_Nom}`,
    },
  ];
};

const main = async () => {
  let suggestions = {
    suggestions: { [inputKey]: [] },
  };

  if (searchValue.trim()) {
    const [idsByPrenom, idsByNom] = await Promise.all([
      getDocumentIds(FILTER_PRENOM),
      getDocumentIds(FILTER_NOM),
    ]);

    const ids = [...new Set([...idsByPrenom, ...idsByNom])];
    if (ids.length !== 0) {
      const documents = await getDocuments(ids);
      documents.forEach((document) => {
        document.data = JSON.parse(document.data);
      });

      suggestions.suggestions[inputKey] = documents.map((document) => {
        return {
          title: `${document.data.Utilisateur_Prenom} ${document.data.Utilisateur_Nom}`,
          fields: suggestionField(document.data),
        };
      });
    }
  }

  callback(suggestions);
};

main();
