// console.log("Function 298 -search tarifs", context);

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

  // Mêmes lignes que les suggestions de tarif de la fonction 93
  return documents.map((doc) => {
    const data = doc.data || {};
    const fields = [
      {
        key: "CalculPrix_CalculKilomètrage",
        value: data.CalculPrix_CalculKilomètrage || "",
        name: "Calcul du kilométrage",
      },
      {
        key: "CalculPrix_NbKMCouvertForfaitPriseEnCharge",
        value: data.CalculPrix_NbKMCouvertForfaitPriseEnCharge || "",
        name: "Nombre de km couverts par le forfait de prise en charge",
      },
      {
        key: "CalculPrix_PrixForfaitPriseEnChargeEuro",
        value: data.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
        name: "Prix du forfait de prise en charge en euros",
      },
      {
        key: "CalculPrix_PrixMiniEuro",
        value: data.CalculPrix_PrixMiniEuro || "",
        name: "Prix minimum en euros",
      },
      {
        key: "CalculPrix_PrixParKmEuro",
        value: data.CalculPrix_PrixParKmEuro || "",
        name: "Prix par km en euros",
      },
    ];
    return { title: data.CE_CatégorieMission || "", fields };
  });
};

// Mêmes critères que buildTarifFilters de la fonction 93
const buildTarifFilters = (categoryValue, planificationDate) => {
  if (!planificationDate || !categoryValue) {
    return [];
  }

  return [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Tarif",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "NOTEQUALS",
      value: "Supprimé(e)",
      type: "TEXT",
    },
    {
      key: "CE_DébutDeValidité",
      operator: "BETWEEN",
      value: `0001-12-31|${planificationDate}`,
      type: "DATE",
    },
    {
      key: "CE_FinDeValidité",
      operator: "BETWEEN",
      value: `${planificationDate}|9999-12-31`,
      type: "DATE",
    },
    {
      key: "Catégorie",
      operator: "CONTAINS",
      value: categoryValue,
      type: "TEXT",
    },
  ];
};

const sortTarifsByPriority = (tarifDocuments) => {
  const getPriority = (doc) => {
    const priority = Number(doc?.data?.Tarif_Priorite);
    return Number.isFinite(priority) ? priority : 0;
  };

  return [...tarifDocuments].sort((a, b) => getPriority(b) - getPriority(a));
};

const getTarifName = (doc) =>
  (doc?.data?.CE_CatégorieMission || "").toLowerCase();

const selectTarifsToSuggest = (tarifDocuments, input) => {
  const search = input.trim().toLowerCase();
  const isExactTarif = tarifDocuments.some(
    (doc) => getTarifName(doc) === search,
  );
  // Un tarif déjà choisi garde toute la liste ouverte, comme un menu déroulant
  if (isExactTarif) {
    return tarifDocuments;
  }
  return tarifDocuments.filter((doc) => getTarifName(doc).includes(search));
};

async function main() {
  const planificationDate = docData?.Planification_Date;
  const categorie = docData?.Catégorie || "";
  const input = docData?.[inputKey] || "";

  const tarifFilters = buildTarifFilters(categorie, planificationDate);
  const tarifDocuments = sortTarifsByPriority(
    tarifFilters.length > 0 ? await getDocuments(tarifFilters) : [],
  );
  const suggestions = buildSuggestions(
    selectTarifsToSuggest(tarifDocuments, input),
  );

  // console.log("Suggestions:", suggestions);

  callback({
    suggestions: {
      [inputKey]: suggestions,
    },
  });
}

main();
