console.log("Function 499", context);

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Chauffeur",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Actif",
    type: "DATE",
  },
];

let onlyOne = false;
// Async functions to get the Chauffeurs infos
const getChauffeurInfo = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;
    const res2 = await api({ local: true }).post("document/id", { ids });
    const documents = res2?.data?.documents;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error("Aucun chauffeur éligible trouvé.");
    }
    if (documents.length === 1) {
      onlyOne = true;
    }
    return documents;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des documents :",
      error.message
    );
    return [];
  }
};

// Main
const main = async () => {

    let documents = [];
    const unfilteredDocs = await getChauffeurInfo();
    documents = unfilteredDocs.filter((doc) => {
      const parsed = JSON.parse(doc.data);
      const chauffeur = parsed?.["Contrainte|1|Chauffeur"];
      return (
        chauffeur != null &&
        chauffeur
          .toString()
          .toLowerCase()
          .includes(docData["Contrainte|1|Chauffeur"]?.toString().toLowerCase())
      );
    }).slice(0, 10);

    //Show suggestions
    const suggestions = documents.map((document) => {
      const data = JSON.parse(document.data);
      let nom = data["Contrainte|1|Chauffeur"];
      const fields = [
        {
            key: "Chauffeur_Adresse",
            value: data.Chauffeur_Adresse || "",
            name: "Adresse chauffeur",
        },
        {
            key: "Chauffeur_email",
            value: data.Chauffeur_email || "",
            name: "Courriel Chauffeur",
        },
        {
            key: "DestinationChauffeur",
            value: data.DestinationChauffeur || "",
            name: "Destinations",
        },
        {
            key: "TypeVehicule",
            value: data.TypeVehicule || "",
            name: "Type de véhicule",
        },
        {
            key: "TypeVéhicule2",
            value: data.TypeVéhicule2 || "",
            name: "Type de véhicule 2",
        },
        {
            key: "LongitudeChauffeur",
            value: data.LongitudeChauffeur || "",
            name: "Longitude du chauffeur",
        },
        {
            key: "LatitudeChauffeur",
            value: data.LatitudeChauffeur || "",
            name: "Latitude du chauffeur",
        },
        {
            key: "ModeleRemuneration",
            value: data.ModeleRemuneration || "",
            name: "Modèle de rémunération",
        },
      ];
      return { title: nom, fields };
    });

    // if only one directly push the data
    if (onlyOne && docData.STATUS === "Draft") {
      const firstData = JSON.parse(documents[0].data);
      const nom = firstData["Contrainte|1|Chauffeur"];

      callback({
        data: {
          "Contrainte|1|Chauffeur": nom,
        },
      });
    } else {
      callback({
        suggestions: {
          "Contrainte|1|Chauffeur": suggestions,
        },
      });
    }
    console.log(suggestions);
};

main();
