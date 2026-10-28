console.log("Function 476", context);

const getRecurrenceInfo = (documentData) => {
  let tarifDebut, tarifFin;
  let isJourOnly = false;
  let isJourSpecifique = false;
  let isParSemaine = false;

  // --- Une seule fois ---
  if (
    documentData.Dates_TypeRéc === "Une seule fois" ||
    documentData.Dates_TypeRéc === "Occurrence" ||
    !documentData.Dates_TypeRéc
  ) {
    tarifDebut = `0001-12-31|${documentData.Dates_DateTransport}`;
    tarifFin = `${documentData.Dates_DateTransport}|9999-12-31`;
    isJourOnly = true;
  }
  // --- Recurrence par jour spécifique ---
  else if (documentData.Dates_TypeRéc === "Par jour spécifique") {
    const dateSplit = documentData.Dates_Multidates.split("|").map(
      (date) => new Date(date.trim()),
    );

    const minDate = new Date(Math.min(...dateSplit));
    const maxDate = new Date(Math.max(...dateSplit));

    const minDatetoString = minDate.toISOString().split("T")[0];
    const maxDatetoString = maxDate.toISOString().split("T")[0];
    console.log("Date la plus ancienne :", minDatetoString);
    console.log("Date la plus récente :", maxDatetoString);
    tarifDebut = `0001-12-31|${minDatetoString}`;
    tarifFin = `${maxDatetoString}|9999-12-31`;
    isJourSpecifique = true;
  }
  // --- Recurrence par semaine ---
  else {
    const debut = documentData.Dates_DebutRec;
    const fin = documentData.Dates_FinRec;
    tarifDebut = `0001-12-31|${debut}`;
    tarifFin = `${fin}|9999-12-31`;
    isParSemaine = true;
  }
  return { tarifDebut, tarifFin, isJourOnly, isJourSpecifique, isParSemaine };
};

// Async functions to get the Tarifs infos
const getTauxInfo = async (documentData) => {
  const { tarifDebut, tarifFin } = getRecurrenceInfo(documentData);

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Formule de rémunération",
      type: "TEXT",
    },
    {
      key: "tauxChauffeurStartDate",
      operator: "BETWEEN",
      value: tarifDebut,
      type: "DATE",
    },
    {
      key: "tauxChauffeurEndDate",
      operator: "BETWEEN",
      value: tarifFin,
      type: "DATE",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Actif",
      type: "TEXT",
    },
  ];

  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;
    const res2 = await api({ local: true }).post("document/id", { ids });
    const documents = res2?.data?.documents;
    return documents;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des documents :",
      error.message,
    );
    return [];
  }
};

// Main
let taux, tauxkm;
const main = async () => {
  const { isJourOnly, isJourSpecifique, isParSemaine } =
    getRecurrenceInfo(docData);
  if (
    (isJourOnly && docData.Dates_DateTransport) ||
    (isJourSpecifique && docData.Dates_Multidates) ||
    (isParSemaine && docData.Dates_DebutRec && docData.Dates_FinRec)
  ) {
    let documents = [];
    const modele = docData.ModeleRemuneration;
    const normalizedModele = modele
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, ""); // replaces accents from letters e.g. bénévole -> benevole
    if (modele) {
      const unfilteredDocs = await getTauxInfo(docData);
      documents = unfilteredDocs.filter((doc) => {
        const parsed = JSON.parse(doc.data);
        console.log("parsed.ModeleRemuneration", parsed.ModeleRemuneration);
        const normalizedModeleRemuneration =
          parsed?.ModeleRemuneration?.normalize("NFD")?.replace(
            /\p{Diacritic}/gu,
            "",
          ) ?? "";
        return (
          normalizedModeleRemuneration.toUpperCase() ===
          normalizedModele.toUpperCase()
        );
      });
    } else {
      documents = await getTauxInfo(docData);
    }

    //Show suggestions
    const suggestions = documents.map((document) => {
      const data = JSON.parse(document.data);
      tauxkm = data.TAUX_KM_Chauffeur;
      taux = data.Libellé;
      taux = data.Libellé;
      const fields = [
        {
          key: "TAUX_KM_Chauffeur",
          value: data.TAUX_KM_Chauffeur || "",
          name: "Taux Chauffeur ($/km)",
        },
        {
          key: "CalculPrixTransportGroupe",
          value: data.CalculPrixTransportGroupe || "",
          name: "Type de rémunération - Chauffeur",
        },
        {
          key: "MinimumPriceRenumeration",
          value: data.MinimumPriceRenumeration || "",
          name: "Prix minimum ($)",
        },
      ];
      return { title: data.Libellé, fields };
    });
    callback({
      suggestions: {
        TauxChauffeur: suggestions,
      },
    });
  } else {
    callback({
      suggestions: [],
    });
  }
};

main();
