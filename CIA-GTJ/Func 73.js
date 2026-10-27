console.log("Fonction 73", context);

// constants
const clientInput = inputKey;
const clientValue = docData[clientInput];

// async functions
const getIds = async (filters) => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: filters,
    });

    return res?.data?.ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des ids :", error);
    throw error;
  }
};

const getDocumentsFromIds = async (ids) => {
  try {
    const res = await api({ local: true }).post(`document/id`, { ids: ids });
    const documents = res?.data?.documents;

    if (!documents) {
      throw new Error(`Erreur lors de la récupération du document`);
    }

    return documents.map((doc) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du document :`, error);
    throw error;
  }
};

// main
const main = async () => {
  try {
    let idsByName = await getIds([
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Véhicule sécurisé",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "ACTIF",
        type: "TEXT",
      },
      {
        key: "Vehicule_Identifiant",
        operator: "CONTAINS",
        value: clientValue,
        type: "TEXT",
      },
    ]);

    if (idsByName.length > 0) {
      let docs = await getDocumentsFromIds(idsByName);
      const suggestion = docs.map((doc) => {
        return {
          title: doc.Vehicule_Identifiant,
          fields: [],
        };
      });
      callback({
        suggestions: {
          [clientInput]: suggestion,
        },
      });
    }
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    showErrorBanner(`Erreur lors de la récupération des données`);
  }
};

main();
