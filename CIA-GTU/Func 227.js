console.log("Fonction 227", context);
const searchValue = docData[inputKey] || "";

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Transporteur",
    type: "TEXT",
  },
  {
    key: "NomTransporteur",
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

      
      console.log(
        "Liste des transporteurs :",
        documents.map((document) => ({
          nom: document.data["NomTransporteur"],
          repartition: document.data["Répartition_Transporteur"],
        }))
      );


      suggestions.suggestions[inputKey] = documents.flatMap((document) => {
        const nomTransporteur = document.data["NomTransporteur"];
        if (!nomTransporteur.trim()) return [];
        return {
          title: nomTransporteur,
          fields: [
            {
              key: "NomTransporteurSearch",
              name: "Nom du transporteur",
              value: nomTransporteur,
            },            
            {
              key: "Répartition_Transporteur",
              name: "Nom du transporteur",
              value: nomTransporteur,
            },
          ],
        };
      });
    }
  }
  callback(suggestions);
};

main();
