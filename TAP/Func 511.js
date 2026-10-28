console.log("Function 511", context);

const sourceData =
  indexItemChange === undefined ? docData : docData.Contrainte[indexItemChange];

const fields = {
  keyFieldOnchange: inputKey,
  dataFieldOnchange: sourceData[inputKey],
  targetSearchField: "Contrainte|2|NomClient",
};

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Client",
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
  },
];

const apiFiltersEQUALS = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Client",
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
    operator: "EQUALS",
    value: fields.dataFieldOnchange,
    type: "TEXT",
  },
];

const FIELDS_CONFIG = [
  { key: "Patient_DateNaissance", name: "Date de naissance" },
  { key: "Patient_Sexe", name: "Sexe" },
  { key: "Domicile_CodePostal", name: "Code postal" },
  { key: "Domicile_Adresse", name: "Adresse" },
  { key: "Domicile_Ville", name: "Ville" },
  { key: "Adapte_check", name: "Transport adapté" },
  { key: "Appareil_liste", name: "Appareils" },
  { key: "startDate", name: "Date début" },
  { key: "endDate", name: "Date fin" },
  { key: "Prix_transport", name: "Organisme" },
  { key: "Organisme_client", name: "Organisme" },
  { key: "Langue_parlees", name: "Langues" },
  { key: "Age", name: "Âge" },
  { key: "LatitudeClient", name: "Latitude" },
  { key: "LongitudeClient", name: "Longitude" },
  { key: "Fauteuil_Taille", name: "Taille fauteuil" },
  { key: "VehiculeNecessaire", name: "Type véhicule" },
  { key: "Telephone1", name: "Téléphone 1" },
  { key: "Telephone2", name: "Téléphone 2" },
  { key: "Accompagnement_obligatoire", name: "Accompagnement Obligatoire" },
  { key: "PrefChauffeur", name: "Préférences/Allergies" },
  { key: "NAM", name: "N.A.M" },
  { key: "Admission", name: "Admission" },
  { key: "ClientMembre", name: "Membre?" },
  { key: "CommentairesClient", name: "Comementaires Client" },
  { key: "NotesBureau", name: "Notes Bureau" },
  { key: "No_CLE", name: "No CLE" },
  { key: "Date_expiration", name: "Date d'expiration" },
];

// Async functions to get the Clients infos
const getClientInfo = async (apiFilter) => {
  try {
    // Fetches IDs
    const idsRes = await api({ local: true }).post("document/id/filter", {
      filters: apiFilter,
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

//Gets keys of Contacts collection from doc
const getContactCollecKeys = (doc) => {
  const missingKeys = Object.keys(doc[0]).filter((key) => {
    return key.includes("Contact|");
  });
  return missingKeys;
};

//Creates array of {key, value} pairs from collection fields
const getFieldsFromCollecKeys = (doc) => {
  const collecFields = [{}];
  const keys = getContactCollecKeys(doc);
  for (const key of keys) {
    const rowNum = key.slice(key.length - 1); // gets collection row number
    //if new row -> adds new entry in array
    if (Number(rowNum) > collecFields.length) {
      collecFields.push({});
    }
    const fieldName = key.slice(0, key.length - 2); // gets rid of collumn number
    collecFields[rowNum - 1][fieldName] = doc[0][key];
  }

  return collecFields;
};

// Build suggestions from fetched documents
const buildSuggestions = (docs) => {
  const result = docs.map((doc) => {
    const suggestion = {
      title: doc[fields.targetSearchField],
    };

    // Only add fields when indexItemChange is undefined
    if (indexItemChange === undefined) {
      suggestion.fields = FIELDS_CONFIG.map(({ key, name }) => ({
        key,
        name,
        value:
          key === "Prix_transport"
            ? (doc["Organisme_client"] ?? "")
            : (doc[key] ?? ""), //?? ""
      }));
    }
    console.log("Built suggestion:", suggestion);
    return suggestion;
  });
  return result;
};

// Remove suggestions that already exist in Contrainte
const removeExistingConstraints = (suggestions) => {
  console.log("Suggestions before filtering:", suggestions);
  const existingNames = docData["Contrainte"].map(
    (c) => c[fields.targetSearchField],
  );
  return suggestions.filter((s) => !existingNames.includes(s.title));
};

// Extract contraintes for Client
const contraintesClient = (dataParsed) => {
  const count = Number(dataParsed["Contrainte"]) || 0;
  const contraintes = [];
  for (let i = 1; i <= count; i++) {
    contraintes.push(dataParsed[`Contrainte|1|Chauffeur|${i}`]);
  }
  return contraintes;
};

// Extract contraintes for Chauffeur
const contraintesChauffeur = (dataParsed) => {
  const count = Number(dataParsed["Contrainte"]) || 0;
  const contraintes = [];
  console.log("Client for contraintesChauffeur:", dataParsed);
  for (let i = 1; i <= count; i++) {
    contraintes.push(dataParsed[`Contrainte|2|NomClient|${i}`]);
  }
  return contraintes;
};

// Main
const main = async () => {
  const documents = await getClientInfo(apiFilters);
  const documentsEquals = await getClientInfo(apiFiltersEQUALS);

  let suggestions = buildSuggestions(documents);
  suggestions = removeExistingConstraints(suggestions);

  if (documentsEquals.length > 0 && indexItemChange === undefined) {
    const contraintes = [];
    const contacts = getFieldsFromCollecKeys(documents);
    //   collecFields.forEach((entry) => FIELDS_CONFIG.push(entry));
    const count = Number(documentsEquals[0].Contrainte) || 0;
    for (let i = 1; i <= count; i++) {
      contraintes.push({
        "Contrainte|1|Chauffeur":
          documentsEquals[0][`Contrainte|1|Chauffeur|${i}`] || "",
        "Contrainte|2|NomClient": "",
        "Contrainte|3|Commentaire":
          documentsEquals[0][`Contrainte|3|Commentaire|${i}`] || "",
      });
    }
    console.log("Contraintes: ", contraintes);
    console.log("Contact: ", contacts);
    callback({
      data: { Contrainte: contraintes, Contact: contacts }, //, Contact: contacts
    });
  }

  callback({
    suggestions: {
      [fields.targetSearchField]: suggestions,
    },
  });
  console.log(suggestions);
};

main();