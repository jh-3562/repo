// console.log("Function search tarifs", context);

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
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
    const response = await api({ local: true }).post("document/id", {
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
        key: "Tarif_Number",
        value: doc.number || "",
        name: "Numéro du tarif",
      },
      {
        key: "Tarif_Priorite",
        value: data.Tarif_Priorite || "",
        name: "Niveau de priorité",
      },
      {
        key: "Date de début",
        value: data.CE_DébutDeValidité || "",
        name: "Date de début",
      },
      {
        key: "Date de fin",
        value: data.CE_FinDeValidité || "",
        name: "Date de fin",
      },
      {
        key: "CalculPrix_PrixParKmEuro",
        value: data.CalculPrix_PrixParKmEuro || "",
        name: "Prix par km en euros",
      },
      {
        key: "CalculPrix_CalculKilomètrage",
        value: data.CalculPrix_CalculKilomètrage || "",
        name: "Calcul du kilométrage",
      },
      {
        key: "CalculPrix_PrixForfaitPriseEnChargeEuro",
        value: data.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
        name: "Prix du forfait de prise en charge en euros",
      },
      {
        key: "CalculPrix_NbKMCouvertForfaitPriseEnCharge",
        value: data.CalculPrix_NbKMCouvertForfaitPriseEnCharge || "",
        name: "Nombre de km couverts par le forfait de prise en charge",
      },
      {
        key: "CalculPrix_PrixMiniEuro",
        value: data.CalculPrix_PrixMiniEuro || "",
        name: "Prix minimum en euros",
      },
    ];
    return { title: data.CE_CatégorieMission, fields };
  });
};

const sortSuggestionsByPriority = (suggestions) => {
  const priorityOrder = ["0", "1", "2", "3", "4", "5"];
  const priorityIndex = new Map(
    priorityOrder.map((priority, index) => [priority, index]),
  );

  return [...suggestions].sort((a, b) => {
    const aPriority = String(
      a?.fields?.find((field) => field.key === "Tarif_Priorite")?.value ?? "",
    );
    const bPriority = String(
      b?.fields?.find((field) => field.key === "Tarif_Priorite")?.value ?? "",
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
  const debutValidite = docData?.Planification_Date;
  const finValidite = docData?.Planification_DateFin;
  const categorie = docData?.Catégorie;
  const input = docData?.[inputKey] || "";

  // console.log("Input value:", input);

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Tarif",
      type: "TEXT",
    },
    {
      key: "CE_CatégorieMission",
      operator: "CONTAINS",
      value: input,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistré",
      type: "TEXT",
    },
    {
      key: "CE_DébutDeValidité",
      operator: "BETWEEN",
      value: `0001-01-01|${debutValidite}`,
      type: "DATE",
    },
    ...(categorie
      ? [
          {
            key: "Catégorie",
            operator: "EQUALS",
            value: `${categorie}`,
            type: "TEXT",
          },
        ]
      : []),
    ...(finValidite
      ? [
          {
            key: "CE_FinDeValidité",
            operator: "BETWEEN",
            value: `${finValidite}|9999-12-31`,
            type: "DATE",
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
      [inputKey]: suggestions,
    },
  });
}

main();
