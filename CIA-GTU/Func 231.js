console.log("Fonction 231", context);
const searchValue = docData[inputKey] || "";

const linkedFields = {
  Demande_TransportIdentificationDemandeurPrenomDemandeur: "Utilisateur_Prenom",
  Demande_TransportIdentificationDemandeurNomDemandeur: "Utilisateur_Nom",
};

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Utilisateur",
    type: "TEXT",
  },
  {
    key: linkedFields[inputKey],
    operator: "CONTAINS",
    value: searchValue,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Actif",
    type: "TEXT",
  },
  {
    key: "Utilisateur_Role",
    operator: "EQUALS",
    value: "Département",
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

const suggestionFields = (data) => {
  return [
    {
      key: "Demande_TransportIdentificationDemandeurPrenomDemandeur",
      name: "Prénom du demandeur",
      value: data.Utilisateur_Prenom,
    },
    {
      key: "Demande_TransportIdentificationDemandeurNomDemandeur",
      name: "Nom du demandeur",
      value: data.Utilisateur_Nom,
    },
    {
      key: "Demande_TransportIdentificationDemandeurTelephoneDemandeur",
      name: "Téléphone du demandeur",
      value: data.Utilisateur_Telephone,
    },
    {
      key: "Demande_TransportIdentificationDemandeurPoste",
      name: "Poste",
      value: data.Utilisateur_Poste,
    },
    {
      key: "Demande_TransportIdentificationDemandeurCourrielDemandeur",
      name: "Titre d'emploi",
      value: data.Demande_TransportIdentificationDemandeurCourrielDemandeur,
    },
  ];
};

const main = async () => {
  let suggestions = {
    suggestions: { [inputKey]: [] },
  };

  if (searchValue.trim()) {
    const ids = await getDocumentIds(apiFilters);
    if (ids.length !== 0) {
      const documents = await getDocuments(ids);
      documents.forEach((document) => {
        document.data = JSON.parse(document.data);
      });

      suggestions.suggestions[inputKey] = documents.flatMap((document) => {
        return {
          title: document.data[linkedFields[inputKey]],
          fields: suggestionFields(document.data),
        };
      });
    }
  }

  callback(suggestions);
};

main();
