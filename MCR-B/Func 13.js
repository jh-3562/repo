console.log("Function 13", context);

// Constants
const addressInput = "PriseEnCharge_VéhiculeUtilisé";
const addressValue = docData[inputKey];

// Mission planning date (used only for archived vehicles)
const planificationDate = docData.Planification_Date
  ? new Date(docData.Planification_Date)
  : null;

// Filters for registered vehicles
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

// Filters for archived vehicles
const apiFiltersArchived = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Archivé",
    type: "TEXT",
  },
];

// Fetch vehicle IDs
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    const resArchived = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersArchived,
    });

    const ids = res?.data?.ids || [];
    const archivedIds = resArchived?.data?.ids || [];

    return [...ids, ...archivedIds];
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return [];
  }
};

// Build autocomplete suggestions
const getAutocompleteSuggestions = async (ids) => {
  const res = await api({ local: true }).post("document/id", { ids });
  const documents = res?.data?.documents;

  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const vehicles = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(doc.data);
      } catch {
        return null;
      }

      if (doc.status === "Enregistré") {
        return parsed;
      }

      if (
        doc.status === "Archivé" &&
        planificationDate &&
        parsed.VehiculeArchivage
      ) {
        const archivageDate = new Date(parsed.VehiculeArchivage);
        if (!isNaN(archivageDate) && archivageDate > planificationDate) {
          console.log('YES!');
          return parsed;
        }
      }

      return null;
    })
    .filter(Boolean);

  return vehicles.map((vehicle) => ({
    title: vehicle.Ident_Libellé,
  }));
};

// Main
const main = async () => {
  const ids = await getSuggestionsIds();

  if (ids.length === 0) {
    callback({
      options: {
        PriseEnCharge_VéhiculeUtilisé: [{}],
      },
    });
    return;
  }

  const suggestions = await getAutocompleteSuggestions(ids.slice(0, 10));

  suggestions.sort((a, b) =>
    a.title.localeCompare(b.title, "fr", {
      numeric: true,
      sensitivity: "base",
    })
  );

  const options = suggestions.map((item) => ({
    key: item.title,
    value: item.title,
    text: item.title,
    items: null,
  }));

  callback({
    options: {
      PriseEnCharge_VéhiculeUtilisé: options,
    },
  });
};

main();
``