// console.log("Function search categories", context);

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    // console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post('document/id', {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    // console.error("Failed to fetch documents:", error);
    return [];
  }
};

const getDocuments = async (apiFilters) => {
  const documentIDs = await getDocumentIDsByFilters(apiFilters);
  if (documentIDs.length === 0) {
    return [];
  }

  const documents = await getDocumentsByIDs(documentIDs);
  return documents.map((doc) => {
    doc.data = JSON.parse(doc.data);
    return doc;
  });
};

const buildSuggestions = (documents) => {
  if (!documents || documents.length === 0) {
    return [];
  }

  return documents.map((doc) => {
    // console.log("Document:", doc);
    const data = doc.data;
    const fields = [
      {
        key: 'Categorie_Number',
        value: doc.number || '',
        name: 'Numéro de la catégorie',
      },
      {
        key: 'Date de début',
        value: data.Categorie_DateDebut || '',
        name: 'Date de début',
      },
      {
        key: 'Date de fin',
        value: data.Categorie_DateFin || '',
        name: 'Date de fin',
      },
      {
        key: 'Categorie_StatMission',
        value: data.Categorie_StatMission || '',
        name: 'Catégorie statistique des missions',
      },
      ...(data.Categorie_StatMissionTPMR
        ? [
            {
              key: 'Categorie_StatMissionTPMR',
              value: data.Categorie_StatMissionTPMR,
              name: 'Catégorie statistique des missions TPMR (si différente)',
            },
          ]
        : []),
      {
        key: 'Categorie_StatFacture',
        value: data.Categorie_StatFacture || '',
        name: 'Catégorie statistique des factures',
      },
      {
        key: 'Categorie_Priorite',
        value: data.Categorie_Priorite || '',
        name: 'Niveau de priorité',
      },
    ];
    return { title: data.Categorie_Nom, fields };
  });
};

const sortSuggestionsByPriority = (suggestions) => {
  const priorityOrder = ['0', '1', '2', '3', '4', '5'];
  const priorityIndex = new Map(priorityOrder.map((priority, index) => [priority, index]));

  return [...suggestions].sort((a, b) => {
    const aPriority = String(
      a?.fields?.find((field) => field.key === 'Categorie_Priorite')?.value ?? ''
    );
    const bPriority = String(
      b?.fields?.find((field) => field.key === 'Categorie_Priorite')?.value ?? ''
    );

    const aRank = priorityIndex.has(aPriority)
      ? priorityIndex.get(aPriority)
      : Number.MAX_SAFE_INTEGER;
    const bRank = priorityIndex.has(bPriority)
      ? priorityIndex.get(bPriority)
      : Number.MAX_SAFE_INTEGER;

    return bRank - aRank;
  });
};

async function main() {
  const debutValidite = docData?.CE_DébutDeValidité;
  const finValidite = docData?.CE_FinDeValidité;
  const input = docData?.Catégorie || '';

  // console.log("Input value:", input);

  const filters = [
    {
      key: 'FORMLAYOUTNAME',
      operator: 'EQUALS',
      value: 'Catégorie',
      type: 'TEXT',
    },
    {
      key: 'Categorie_Nom',
      operator: 'CONTAINS',
      value: input,
      type: 'TEXT',
    },
    {
      key: 'STATUS',
      operator: 'EQUALS',
      value: 'Enregistré',
      type: 'TEXT',
    },
    ...(debutValidite
      ? [
          {
            key: 'Categorie_DateDebut',
            operator: 'BETWEEN',
            value: `2000-01-01|${debutValidite || new Date().toISOString().split('T')[0]}`,
            type: 'DATE',
          },
        ]
      : []),
    ...(finValidite
      ? [
          {
            key: 'Categorie_DateFin',
            operator: 'BETWEEN',
            value: `${finValidite || new Date().toISOString().split('T')[0]}|2199-12-31`,
            type: 'DATE',
          },
        ]
      : []),
  ];

  // console.log("Filters for fetching documents:", filters);
  const documents = await getDocuments(filters);
  // console.log("Fetched documents:", documents);
  const suggestions = sortSuggestionsByPriority(buildSuggestions(documents));

  // console.log("Suggestions:", suggestions);

  callback({
    suggestions: {
      Catégorie: suggestions,
    },
  });
}

main();
