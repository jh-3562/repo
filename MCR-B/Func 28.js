console.log("Function 28", context);

// Async functions
const getSuggestionsIds = async (MAISON) => {
  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "VÉHICULE",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: MAISON,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistré",
      type: "TEXT",
    },
  ];
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.warn("Aucun ID trouvé pour le filtre 'ADRESSE'.");
      return [];
    }

    return ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return [];
  }
};

const getAutocompleteSuggestions = async (ids, titleFieldName) => {
  const res2 = await api({ local: true }).post("document/id", { ids });

  const documents = res2?.data?.documents;
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    console.warn("Erreur lors de la récupération des documents.");
    return [];
  }

  // JSON conversion of each document
  const allAddresses = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        console.warn(
          "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
          doc
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

  return allAddresses.map((addr) => {
    return {
      title: addr[titleFieldName],
    };
  });
};

// Main function
const addOption = async (fieldName, MAISON, titleFieldName) => {
  // Step 1: Retrieving ids according to filters
  const ids = await getSuggestionsIds(MAISON);

  // If no ids found, return an empty option to reset the field
  if (ids.length === 0) {
    callback({
      options: {
        [fieldName]: [{}],
      },
    });
    return;
  }
  // Step 2: Retrieving documents by their IDs
  const filteredSuggestions = await getAutocompleteSuggestions(
    ids.slice(0, 10),
    titleFieldName
  );

  // Trier les suggestions par ordre alphabétique (lettres et chiffres)
  filteredSuggestions.sort((a, b) => {
    return a.title.localeCompare(b.title, "fr", {
      numeric: true,
      sensitivity: "base",
    });
  });

  console.log("filteredSuggestions", filteredSuggestions);

  // Step 3: Generating options for the field
  const options = filteredSuggestions.map((item) => ({
    key: item.title, // Using 'title' as the unique key
    value: item.title, // Associated value
    text: `${item.title}`, // Displayed text
    items: null, // No sub-options
  }));

  // Step 4: Returning suggestions via callback
  callback({
    options: {
      [fieldName]: options,
    },
  });
};

const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
};

const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

const MAISON = mcrDictionary[AREA];

switch (FORMLAYOUTNAME) {
  case "Mission":
    addOption("PriseEnCharge_VéhiculeUtiliséRetour", MAISON, "Ident_Libellé");
    addOption("PriseEnCharge_VéhiculeUtilisé", MAISON, "Ident_Libellé");
    break;
  case "Facture":
    break;
  case "Véhicule":
    break;
  case "Volontaire":
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    addOption("PriseEnCharge_VéhiculeUtilisé", MAISON, "Ident_Libellé");
    break;
  case "Bénéficiaire":
    break;
  default:
    break;
}
