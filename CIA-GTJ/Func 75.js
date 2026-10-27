console.log("Fonction 75", context);

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

const main = async () => {
  try {
    const match = inputKey.match(/^Demande(Aller|Retour)(D|A)_(.+)$/);
    const type = match[1]; // Aller ou Retour
    const sens = match[2]; // D ou A

    let id = await getIds([
      {
        key: "FORMLAYOUTID",
        operator: "EQUALS",
        value: "83b870bf-197a-4d47-96b0-a9df225b43b8",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "ACTIF",
        type: "TEXT",
      },
      {
        key: "Adresses_Unite",
        operator: "NOTEQUALS",
        value: 0,
        type: "TEXT",
      },
      {
        key: "Adresses_NomLocation",
        operator: "EQUALS",
        value: docData?.[`Demande${type}${sens}_NomDuLieu`],
        type: "TEXT",
      },
    ]);

    if (id.length > 0) {
      let doc = (await getDocumentsFromIds(id))[0];
      console.log("doc", doc);

      const index = Number(doc.Adresses_Unite);
      let suggestion = [];
      for (let i = 1; i <= index; i++) {
        const nom = doc[`Adresses_Unite|1|Nomdelunite|${i}`];
        suggestion.push({
          title: nom,
          fields: [],
        });
      }

      callback({
        suggestions: {
          [inputKey]: suggestion,
        },
      });
    }
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    showErrorBanner(`Erreur lors de la récupération des données`);
  }
};

main();
