// console.log("Function 535", context);

// const SEARCH_FIELD = "Contrainte|2|NomClient";
// const TARGET_FIELD = "StopoverLocations|50|NomClient";
// const COLLECTION_NAME = "StopoverLocations";

// const STOPOVER_FIELDS_CONFIG = [
//   {
//     sourceKey: "Domicile_Adresse",
//     targetKey: "StopoverLocations|100|Address",
//     name: "Adresse",
//   },
//   {
//     sourceKey: "LongitudeClient",
//     targetKey: "StopoverLocations|2000|Longitude",
//     name: "Longitude",
//   },
//   {
//     sourceKey: "LatitudeClient",
//     targetKey: "StopoverLocations|3000|Latitude",
//     name: "Latitude",
//   },
// ];

// const getFieldValue = (data, fullKey) => {
//   if (!data) {
//     return "";
//   }

//   const shortKey = fullKey.split("|").pop();

//   if (data[fullKey] !== undefined) {
//     return data[fullKey];
//   }

//   if (data[shortKey] !== undefined) {
//     return data[shortKey];
//   }

//   const matchingKey = Object.keys(data).find(
//     (key) =>
//       key.endsWith(`|${shortKey}`) ||
//       key.endsWith(`|${shortKey}|1`),
//   );

//   return matchingKey ? data[matchingKey] : "";
// };

// const collectionName = inputKey.split("|")[0];

// const sourceData =
//   indexItemChange === undefined
//     ? docData
//     : docData?.[collectionName]?.[indexItemChange] ?? docData;

// const searchValue =
//   getFieldValue(sourceData, TARGET_FIELD) ||
//   getFieldValue(docData, TARGET_FIELD);

// console.log("Champ déclenché :", inputKey);
// console.log("Source utilisée :", sourceData);
// console.log("Valeur recherchée :", searchValue);

// const getClientInfo = async () => {
//   const filters = [
//     {
//       key: "FORMLAYOUTNAME",
//       operator: "EQUALS",
//       value: "Client",
//       type: "TEXT",
//     },
//     {
//       key: "STATUS",
//       operator: "EQUALS",
//       value: "ACTIF",
//       type: "TEXT",
//     },
//     {
//       key: SEARCH_FIELD,
//       operator: "CONTAINS",
//       value: searchValue,
//       type: "TEXT",
//     },
//   ];

//   const idsResponse = await api({ local: true }).post(
//     "document/id/filter",
//     {
//       filters,
//     },
//   );

//   const ids = idsResponse?.data?.ids?.slice(0, 15) || [];

//   if (ids.length === 0) {
//     return [];
//   }

//   const documentsResponse = await api({ local: true }).post(
//     "document/id",
//     {
//       ids,
//     },
//   );

//   return (
//     documentsResponse?.data?.documents?.map((document) =>
//       JSON.parse(document.data),
//     ) || []
//   );
// };

// const buildSuggestions = (documents) => {
//   return documents.map((document) => ({
//     title: document[SEARCH_FIELD],

//     fields: STOPOVER_FIELDS_CONFIG.map(
//       ({ sourceKey, targetKey, name }) => ({
//         key: targetKey,
//         name,
//         value: document[sourceKey] ?? "",
//       }),
//     ),
//   }));
// };

// const removeExistingStopovers = (suggestions) => {
//   const existingNames = (
//     docData?.[COLLECTION_NAME] || []
//   )
//     .map((item) => getFieldValue(item, TARGET_FIELD))
//     .filter(Boolean);

//   return suggestions.filter(
//     (suggestion) =>
//       !existingNames.includes(suggestion.title),
//   );
// };

// const main = async () => {
//   if (!searchValue || !String(searchValue).trim()) {
//     callback({
//       suggestions: {
//         [TARGET_FIELD]: [],
//       },
//     });

//     return;
//   }

//   try {
//     const documents = await getClientInfo();

//     let suggestions = buildSuggestions(documents);

//     suggestions = removeExistingStopovers(suggestions);

//     console.log("Suggestions Stopover :", suggestions);

//     callback({
//       suggestions: {
//         [TARGET_FIELD]: suggestions,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Erreur lors de la recherche des clients pour StopoverLocations :",
//       error,
//     );

//     callback({
//       suggestions: {
//         [TARGET_FIELD]: [],
//       },
//     });
//   }
// };

// main();


console.log("Function 535", context);

const SEARCH_FIELD = "Contrainte|2|NomClient";
const TARGET_FIELD = "StopoverLocations|50|NomClient";
const COLLECTION_NAME = "StopoverLocations";

const STOPOVER_FIELDS_CONFIG = [
  {
    sourceKey: "Domicile_Adresse",
    targetKey: "StopoverLocations|100|Address",
    name: "Adresse",
  },
  {
    sourceKey: "LongitudeClient",
    targetKey: "StopoverLocations|2000|Longitude",
    name: "Longitude",
  },
  {
    sourceKey: "LatitudeClient",
    targetKey: "StopoverLocations|3000|Latitude",
    name: "Latitude",
  },
];

const sourceData =
  indexItemChange === undefined
    ? docData
    : docData?.[COLLECTION_NAME]?.[indexItemChange] ?? docData;

const searchValue = sourceData?.[inputKey] || "";

console.log("Champ déclenché :", inputKey);
console.log("Source utilisée :", sourceData);
console.log("Valeur recherchée :", searchValue);

const getClientInfo = async () => {
  const filters = [
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
  ];

  if (searchValue.trim()) {
    filters.push({
      key: SEARCH_FIELD,
      operator: "CONTAINS",
      value: searchValue.trim(),
      type: "TEXT",
    });
  }

  const idsResponse = await api({ local: true }).post(
    "document/id/filter",
    {
      filters,
    },
  );

  const ids = idsResponse?.data?.ids?.slice(0, 15) || [];

  if (ids.length === 0) {
    return [];
  }

  const documentsResponse = await api({ local: true }).post(
    "document/id",
    {
      ids,
    },
  );

  return (
    documentsResponse?.data?.documents?.map((document) =>
      JSON.parse(document.data),
    ) || []
  );
};

const buildSuggestions = (documents) => {
  return documents.map((document) => ({
    title: document[SEARCH_FIELD],

    fields: STOPOVER_FIELDS_CONFIG.map(
      ({ sourceKey, targetKey, name }) => ({
        key: targetKey,
        name,
        value: document[sourceKey] ?? "",
      }),
    ),
  }));
};

const removeExistingStopovers = (suggestions) => {
  const existingNames = (
    docData?.[COLLECTION_NAME] || []
  )
    .map((item) => item[TARGET_FIELD])
    .filter(Boolean);

  return suggestions.filter(
    (suggestion) =>
      !existingNames.includes(suggestion.title),
  );
};

const main = async () => {
  try {
    const documents = await getClientInfo();

    let suggestions = buildSuggestions(documents);

    suggestions = removeExistingStopovers(suggestions);

    console.log("Suggestions Stopover :", suggestions);

    callback({
      suggestions: {
        [TARGET_FIELD]: suggestions,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la recherche des clients pour StopoverLocations :",
      error,
    );

    callback({
      suggestions: {
        [TARGET_FIELD]: [],
      },
    });
  }
};

main();

