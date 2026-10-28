console.log("Function 509", context);

const sourceData = indexItemChange === undefined ? docData : docData.Contrainte[indexItemChange];

const fields = {
  keyFieldOnchange: inputKey,
  dataFieldOnchange: sourceData[inputKey],
  targetSearchField: "Contrainte|1|Chauffeur",
};

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
    value: "ACTIF",
    type: "TEXT",
  },
  {
    key: fields.targetSearchField,
    operator: "CONTAINS",
    value: fields.dataFieldOnchange,
    type: "TEXT",
  }
];

const FIELDS_CONFIG = [
  { key: "Chauffeur_Adresse", name: "Adresse chauffeur" },
  { key: "Chauffeur_email", name: "Courriel Chauffeur" },
  { key: "DestinationChauffeur", name: "Destinations" },
  { key: "TypeVehicule", name: "document de véhicule" },
  { key: "TypeVéhicule2", name: "Type de véhicule 2" },
  { key: "LongitudeChauffeur", name: "Longitude du chauffeur" },
  { key: "LatitudeChauffeur", name: "Latitude du chauffeur" },
  { key: "ModeleRemuneration", name: "Modèle de rémunération" }
];

// Async functions to get the Chauffeurs infos
const getChauffeurInfo = async () => {
  try {
    // Fetches IDs
    const idsRes = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = idsRes?.data?.ids.slice(0, 15) || [];

    // Fetches documents using IDs
    const res = await api({ local: true }).post("document/id", { ids });

    const documents = res?.data?.documents.map((doc) => {
      return JSON.parse(doc.data);
    });
    return documents;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw error;
  }
};

// Build suggestions from fetched documents
const buildSuggestions = (docs, client) => {
  const result = docs.map((doc) => {

    const contraintesCha = contraintesChauffeur(doc);
      // Exclude chauffeurs who have the current client in their contraintes
    if (contraintesCha.includes(client)) {
        return null;
    }

    const suggestion = {
      title: doc[fields.targetSearchField]
    };

    // Only add fields when indexItemChange is undefined
    if (indexItemChange === undefined) {
      suggestion.fields = FIELDS_CONFIG.map(({ key, name }) => ({
        key,
        name,
        value: doc[key] ?? ""
      }));
    }
    return suggestion;
  });

  return result.filter(Boolean);
}

// Remove suggestions that already exist in Contrainte
const removeExistingConstraints = (suggestions) => {
  const existingNames = docData['Contrainte'].map(c => c[fields.targetSearchField]);
  return suggestions.filter(s => !existingNames.includes(s.title));
}

// Extract contraintes for Chauffeur
const contraintesChauffeur = (dataParsed) => {
    const count = Number(dataParsed["Contrainte"]) || 0;
    const contraintes = []; 

    for (let i = 1; i <= count; i++) {
        contraintes.push(dataParsed[`Contrainte|2|NomClient|${i}`]);
    }
    return contraintes;
}

// Main
const main = async () => {
  const documents = await getChauffeurInfo();
  const client = docData["Contrainte|2|NomClient"]
  let suggestions = buildSuggestions(documents, client);
  suggestions = removeExistingConstraints(suggestions).slice(0, 10);


  callback({
  suggestions: {
    [fields.targetSearchField] : suggestions,
  },
  });
  console.log(suggestions);
};

main();