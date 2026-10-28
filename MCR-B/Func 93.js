console.log("Function 93", context);
const tpmr = docData?.TPMR === "Oui";

const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
  if (typeof document === "undefined") {
    return null;
  }

  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement(tag);
    element.id = id;
    document.body.appendChild(element);
  }
  element.style = style;
  element.innerHTML = innerHTML;
  return element;
};

const showWarningBanner = (message) => {
  const warningBanner = createOrUpdateElement(
    "warningBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: #fff3cd;
      color: #856404;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border: 1px solid #ffeeba;
    `,
    `
      <div style="margin-right: 10px;">⚠️</div>
      <div>${message}</div>
      <div id="warningBannerProgress" 
           style="position: absolute; bottom: 0; left: 0; background-color: #856404; height: 4px; width: 0%;">
      </div>
    `,
  );

  if (!warningBanner) {
    return;
  }

  let progressElement = document.getElementById("warningBannerProgress");
  let width = 0;

  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      warningBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55);
};

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
    try {
      doc.data = JSON.parse(doc.data);
    } catch (error) {
      doc.data = {};
    }
    return doc;
  });
};

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

const selectAppropriateTarif = (tarifDocuments) => {
  if (!tarifDocuments || tarifDocuments.length === 0) {
    return {};
  }
  return tarifDocuments[0].data;
};

const buildTarifSuggestions = (tarifDocuments) => {
  if (!tarifDocuments || tarifDocuments.length === 0) {
    return [];
  }

  return tarifDocuments.map((document) => {
    const data = document.data || {};
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

const buildSuggestions = (documents) => {
  if (!documents || documents.length === 0) {
    return [];
  }

  return documents.map((doc) => ({
    title: doc.data?.Categorie_Nom || "",
    fields: [],
  }));
};

const sortCategoriesByPriority = (categoryDocuments) => {
  const getPriority = (doc) => {
    const priority = Number(doc?.data?.Categorie_Priorite);
    return Number.isFinite(priority) ? priority : 0;
  };

  return [...categoryDocuments].sort((a, b) => getPriority(b) - getPriority(a));
};

const getCategoryName = (doc) => (doc?.data?.Categorie_Nom || "").toLowerCase();

const findExactCategory = (categoryDocuments, input) => {
  const search = input.trim().toLowerCase();
  return categoryDocuments.find((doc) => getCategoryName(doc) === search);
};

const filterCategoriesByInput = (categoryDocuments, input) => {
  const search = input.trim().toLowerCase();
  return categoryDocuments.filter((doc) => getCategoryName(doc).includes(search));
};

async function main() {
  const debutValidite = docData?.Planification_Date;
  const finValidite = docData?.Planification_DateFin;
  const today = new Date().toISOString().split("T")[0];
  const input = docData?.Catégorie || "";

  // console.log("Input value:", input);

  const filter = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Catégorie",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistré",
      type: "TEXT",
    },
    {
      key: "Categorie_DateDebut",
      operator: "BETWEEN",
      value: `0001-01-01|${debutValidite || today}`,
      type: "DATE",
    },
    {
      key: "Categorie_DateFin",
      operator: "BETWEEN",
      value: `${finValidite || debutValidite || today}|9999-12-01`,
      type: "DATE",
    },
  ];

  const validCategories = sortCategoriesByPriority(await getDocuments(filter));
  const exactCategory = findExactCategory(validCategories, input);
  const matchingCategories = filterCategoriesByInput(validCategories, input);
  // Une catégorie déjà choisie garde toute la liste ouverte, comme un menu déroulant
  const suggestions = buildSuggestions(
    exactCategory ? validCategories : matchingCategories,
  );

  const selectedCategory =
    (exactCategory || matchingCategories[0])?.data?.Categorie_Nom || "";
  const tarifFilters = buildTarifFilters(
    selectedCategory || input,
    debutValidite,
  );
  const tarifDocuments = sortTarifsByPriority(
    tarifFilters.length > 0 ? await getDocuments(tarifFilters) : [],
  );
  const selectedPricingData = selectAppropriateTarif(tarifDocuments);
  const tarifSuggestions = buildTarifSuggestions(tarifDocuments);

  const newData = {
    ...docData,
    CE_CatégorieMission: selectedPricingData.CE_CatégorieMission || "",
    CalculPrix_CalculKilomètrage:
      selectedPricingData.CalculPrix_CalculKilomètrage || "",
    CalculPrix_NbKMCouvertForfaitPriseEnCharge:
      selectedPricingData.CalculPrix_NbKMCouvertForfaitPriseEnCharge || "",
    CalculPrix_PrixForfaitPriseEnChargeEuro:
      selectedPricingData.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
    CalculPrix_PrixMiniEuro: selectedPricingData.CalculPrix_PrixMiniEuro || "",
    CalculPrix_PrixParKmEuro:
      selectedPricingData.CalculPrix_PrixParKmEuro || "",
  };

  const prices =
    typeof calculatePrix === "function" ? calculatePrix(newData) || {} : {};

  const isDraft = docData?.STATUS === "Draft";

  callback({
    suggestions: {
      Catégorie: suggestions,
      CalculPrixBis_TarifAppliqué: tarifSuggestions,
    },
    data: isDraft
      ? {
          CalculPrixBis_TarifAppliqué:
            selectedPricingData.CE_CatégorieMission || "",
          CE_CatégorieMission: selectedPricingData.CE_CatégorieMission || "",
          CalculPrix_CalculKilomètrage:
            selectedPricingData.CalculPrix_CalculKilomètrage || "",
          CalculPrix_NbKMCouvertForfaitPriseEnCharge:
            selectedPricingData.CalculPrix_NbKMCouvertForfaitPriseEnCharge ||
            "",
          CalculPrix_PrixForfaitPriseEnChargeEuro:
            selectedPricingData.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
          CalculPrix_PrixMiniEuro:
            selectedPricingData.CalculPrix_PrixMiniEuro || "",
          CalculPrix_PrixParKmEuro:
            selectedPricingData.CalculPrix_PrixParKmEuro || "",
          ...prices,
        }
      : {},
  });
}

main();
