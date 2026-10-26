console.log("Function 9", context);

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "BÉNÉFICIAIRE",
    type: "TEXT",
  },
  {
    key: "Nom",
    operator: "EQUALS",
    value: docData.NomFormMission,
    type: "TEXT",
  },
  {
    key: "Prénom",
    operator: "EQUALS",
    value: docData.PrénomSelected,
    type: "TEXT",
  },
  {
    key: "Prénom",
    operator: "EQUALS",
    value: docData.PrénomSelected,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

if (docData.DateDeNaissance) {
  apiFilters.push({
    key: "DateDeNaissance",
    operator: "EQUALS",
    value: docData.DateDeNaissance,
    type: "TEXT",
  });
}

// async functions
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.log("Aucun bénéficiaire trouvé");
    }

    return ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw error;
  }
};

const getAutocompleteSuggestions = async (ids) => {
  const res2 = await api({ local: true }).post("document/id", { ids });

  const documents = res2?.data?.documents;
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    throw new Error("Erreur lors de la récupération des documents.");
  }

  // JSON conversion of each document
  const allAddresses = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        console.warn(
          "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
          doc,
        );
        return null;
      }

      try {
        return JSON.parse(doc.data);
      } catch (e) {
        console.warn("Impossible de parser un document d'adresse :", doc, e);
        return null;
      }
    })
    .filter((d) => d !== null);

  return allAddresses;
};

function filterEmailsFields(start, obj) {
  const result = {};
  for (const key in obj) {
    if (key.startsWith(start)) {
      result[key] = obj[key];
    }
  }
  return result;
}

function transformToEmailObjects(obj) {
  const emails = {};

  for (const key in obj) {
    const parts = key.split("|"); // Découpe le format "E-mails|X|Key|Y"
    const emailIndex = parts[3]; // Index de l'email (ex: 1 ou 2)

    if (!emails[emailIndex]) {
      emails[emailIndex] = {}; // Initialise l'objet si absent
    }

    // Ajoute la clé complète et la valeur dans l'objet correspondant
    emails[emailIndex][key.split("|").slice(0, 3).join("|")] = obj[key];
  }

  // Retourne une liste avec un élément vide au début
  const result = Object.values(emails);
  return result;
}

const addCollection = async (allAddresses) => {
  const input = inputKey;
  const collections = [
    "E-mails",
    "Téléphones",
    "Contacts supplémentaires",
    "AdressePreférées",
  ];

  //récupère que le premier élément de allAddresses
  const address = allAddresses[0];

  const data = {};

  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];

    const goodAddress = filterEmailsFields(collection + "|", address);

    const goodFormatAddress = transformToEmailObjects(goodAddress);

    // Ajout au résultat global
    data[collection] = goodFormatAddress;
  }

  const collection = "AdressePreférées|100|Adresse";
  const collectionDeno = "AdressePreférées|200|Dénomination";
  const suggestions = [];
  const suggestions1 = [];
  const adresseSuggestions = [];
  const collectionLength = data.AdressePreférées.length;
  for (let i = 0; i < collectionLength; i++) {
    const adresse = data.AdressePreférées[i][`${collection}`];
    const denomination = data.AdressePreférées[i][`${collectionDeno}`];
    if (adresse) {
      suggestions1.push({
        title: adresse,
        fields: [
          {
            key: "Dénomination",
            value: denomination ?? "",
            name: "Dénomination",
          },
          {
            key: "VilleDépart",
            value: data.AdressePreférées[i]["AdressePreférées|530|Ville"] ?? "",
            name: "Ville",
          },
          {
            key: "CodePostalDépart",
            value:
              data.AdressePreférées[i]["AdressePreférées|520|Code_postal"] ??
              "",
            name: "Code postal",
          },
          {
            key: "CC_Latitude",
            name: "Latitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|800|Latitude"] ?? "",
          },
          {
            key: "CC_Longitude",
            name: "Longitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|810|Longitude"] ?? "",
          },
        ],
      });

      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "CC_Destinations|110|Dénomination",
            value: denomination ?? "",
            name: "Dénomination",
          },
          {
            key: "CC_Destinations|530|Ville",
            value: data.AdressePreférées[i]["AdressePreférées|530|Ville"] ?? "",
            name: "Ville",
          },
          {
            key: "CC_Destinations|520|Code_postal",
            value:
              data.AdressePreférées[i]["AdressePreférées|520|Code_postal"] ??
              "",
            name: "Code postal",
          },
          {
            key: "CC_Destinations|800|Latitude",
            name: "Latitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|800|Latitude"] ?? "",
          },
          {
            key: "CC_Destinations|900|Longitude",
            name: "Longitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|810|Longitude"] ?? "",
          },
        ],
      });

      adresseSuggestions.push({
        title: adresse,
      });
    }
    // cas pour gérer la collection ici
  }

  if (input === "PrénomSelected" || input === "NomFormMission") {
    // Appel du callback une seule fois avec toutes les données
    callback({
      data: data,
      suggestions: {
        CC_AdresseDépart: suggestions1,
        "CC_Destinations|100|Adresse": suggestions,
        Contact_AdresseRésidence: adresseSuggestions,
      },
    });
  } else {
    // Appel du callback une seule fois avec toutes les données
    callback({
      suggestions: {
        CC_AdresseDépart: suggestions1,
        "CC_Destinations|100|Adresse": suggestions,
        Contact_AdresseRésidence: adresseSuggestions,
      },
    });
  }
};

// main
const main = async () => {
  // Vérification préalable : s'assurer qu'un bénéficiaire a été sélectionné
  // L'IdentifiantMission sert de preuve que la sélection est complète et valide
  if (!docData.IdentifiantMission || docData.IdentifiantMission.trim() === "") {
    console.log(
      "Aucun bénéficiaire sélectionné - IdentifiantMission manquant ou vide",
    );
    return;
  }

  // step 1: Retrieving ids according to filters
  console.log("Fetching suggestion IDs with filters:", apiFilters);
  //const ids = (await getSuggestionsIds()).slice(0, 10);
  const ids = [];
  ids.push(docData?.IdentifiantMission);
  console.log("Retrieved IDs:", ids);
  // step 2: Retrieving documents by their IDs
  const filteredSuggestions = await getAutocompleteSuggestions(ids);
  console.log("filteredSuggestions", filteredSuggestions);

  //step3 add collection
  if (filteredSuggestions.length !== 0) {
    await addCollection(filteredSuggestions);
  }
};

main();
