

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
        value: "Demande",
        type: "TEXT",
      },
    ]);
 
    if (idsByName.length > 0) {
      let docs = await getDocumentsFromIds(idsByName);
      console.log("docs", docs);
    }

    console.log("Full docData:", docData);

    const heureDepart =
      docData.Demande_TransportTransportSimpleHeureDepartSouhaitee;

    console.log("Heure de départ souhaitée:", heureDepart);

    return heureDepart;

  } catch (error) {
    console.error("Erreur dans la fonction main :", error);
  }
};
main();





