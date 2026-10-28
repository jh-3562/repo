console.log("Function 402", context);

const strTransportFormLayoutID = "6d75ae79-ced2-4a83-a41e-da016f27e530";
const strTransportDeGroupeFormLayoutID = "de3bc87f-64fd-409b-a7bb-fcd9a505650c";

const PREPAIE =
  store?.pageContentStore?.processData?.["0"]?.edits?.CheckboxPrepaie ===
  "true";

const headerMap = {
  Dates_DateTransport: "Date",
  Description: "Description",
  "Total distance": "Distance totale",
  TotalChauffeur: "Montant total",
  TotalPartUsager: "Total des parts d'usager",
  MontantVerserChauffeur: "Montant à verser chauffeur",
  TotalRenumerationVoyageBlanc : "Voyage blanc"
};

const downloadXLSX = (url, filename = "Tournee.pdf") => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToPDF = async (tableData, title = "", totals = {}) => {
  const {
    distanceTotale,
    montantTotal,
    totalPartsUsager,
    montantVerserChauffeur,
  } = totals;

  const request = {
    sheets: [
      {
        name: "Feuil1",
        datas: [
          `{'Title': '${title}', 'distanceTotale': '${distanceTotale}', 'montantTotal': '${montantTotal}', 'totalPartsUsager': '${totalPartsUsager}', 'montantVerserChauffeur': '${montantVerserChauffeur}'}`,
        ],
        sheetNames: ["Tournée"],
        tableDatas: [[tableData]],
      },
    ],
  };

  try {
    const res = await api({ local: true }).post(
      "/document/download/sheets/FeuilleDeBenevole/pdf/Feuille",
      request,
    );
    const url = res.data.fileUrl;
    return url;
  } catch (error) {
    console.error("Erreur lors de la création du PDF: ", error);
  }
};

const formatToAPI = (tournees) => {
  const headers = [
    "Dates_DateTransport",
    "Description",
    "Total distance",
    "TotalChauffeur",
    "TotalPartUsager",
    "MontantVerserChauffeur",
    "TotalRenumerationVoyageBlanc",
  ];
  const replacer = (key, value) => value ?? "";
  const rows = tournees.map((docData) =>
    headers.map((fieldKey) => {
      if (fieldKey === "Description") {
        return docData[fieldKey] || "";
      }
      return JSON.stringify(docData[fieldKey], replacer).replace(/"/g, "");
    }),
  );

  return {
    headers: headers.map((k) => headerMap[k]),
    rows,
  };
};

const getDocuments = async (arrApiFilters) => {
  const filterResponseData = await api({ local: true }).post(
    "document/id/filter",
    { filters: arrApiFilters },
  );

  if (filterResponseData.status !== 200) {
    throw new Error("Problem during document/id/filter api call");
  }

  const arrFormIds = filterResponseData.data.ids;

  const documentResponseData = await api({ local: true }).post("document/id", {
    ids: arrFormIds,
  });

  if (documentResponseData.status !== 200) {
    throw new Error("Problem during document/id api call");
  }

  return documentResponseData.data.documents.map((doc) => ({
    ...doc,
    data: JSON.parse(doc.data),
  }));
};

const dates = store?.pageContentStore?.processData?.[0]?.edits?.IntervalleDate;

const apiFiltersTournee = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Tournée",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "SUPPRIMÉE",
    type: "TEXT",
  },
  {
    key: "Dates_DateTransport",
    operator: "BETWEEN",
    value: dates,
    type: "DATE",
  },
];

const formatTourneeDescription = (
  transportDescriptions,
  transportDeGroupeDescriptions,
) => {
  let result = "";

  if (transportDescriptions && transportDescriptions.length > 0) {
    result += "Transports clients :\n";
    transportDescriptions.forEach((desc) => {
      result += `${desc}\n`;
    });
    result += "\n";
  }

  if (
    transportDeGroupeDescriptions &&
    transportDeGroupeDescriptions.length > 0
  ) {
    result += "Transports de groupe :\n";
    transportDeGroupeDescriptions.forEach((desc) => {
      result += `${desc}\n`;
    });
  }

  return result.trim();
};

const getTourneeDescription = async (driverName, date) => {
  const apiFiltersTransports = [
    {
      key: "FORMLAYOUTID", // key from DB Field
      operator: "IN", // operatorNK from DB Operator
      value: strTransportFormLayoutID + "|" + strTransportDeGroupeFormLayoutID,
      type: "TEXT", // FieldTypeNk from DB FieldType
    },
    {
      key: "STATUS", // key from DB Field
      operator: "IN", // operatorNK from DB Operator
      value: "SOUMIS|PLANIFIÉ|CONFIRMÉ",
      type: "TEXT", // FieldTypeNk from DB FieldType
    },
    {
      key: "Dates_DateTransport",
      operator: "EQUALS",
      value: date,
      type: "DATE",
    },
    {
      key: "Contrainte|1|Chauffeur",
      operator: "EQUALS",
      value: driverName,
      type: "TEXT",
    },
  ];

  const transports = await getDocuments(apiFiltersTransports);

  const transportDescriptions = [];
  const transportDeGroupeDescriptions = [];

  for (const t of transports) {
    const formLayoutID = t.metaData.FORMLAYOUTID;

    if (formLayoutID === strTransportFormLayoutID) {
      const clientName =
        t.data["Contrainte|2|NomClient"] +
        "\n" +
        t.data.EtablissementDest_Adresse +
        "\n";

      if (clientName && !transportDescriptions.includes(clientName)) {
        transportDescriptions.push(clientName);
      }
    } else if (formLayoutID === strTransportDeGroupeFormLayoutID) {
      const description = t.data["DescriptionTA"];

      if (description && !transportDeGroupeDescriptions.includes(description)) {
        transportDeGroupeDescriptions.push(description);
      }
    }
  }

  return formatTourneeDescription(
    transportDescriptions,
    transportDeGroupeDescriptions,
  );
};

const buildRowsData = async (forms, chauffeurName) => {
  const rowsData = [];

  let totalDistance = 0;
  let totalChauffeur = 0;
  let totalPartUsager = 0;
  let totalVerserChauffeur = 0;

  let hasDistance = false;
  let hasChauffeur = false;
  let hasPartUsager = false;
  let hasVerserChauffeur = false;

  // Fonction utilitaire : renvoie un nombre ou null si invalide
  const safeNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  for (const f of forms) {
    if (!f || !f.data) continue;

    const description = await getTourneeDescription(
      chauffeurName,
      f.data?.["Dates_DateTransport"],
    );

    const distance = safeNumber(f.data?.["Total distance"]);
    const chauffeur = safeNumber(f.data?.["TotalChauffeur"]);
    const partUsager = safeNumber(f.data?.["TotalPartUsager"]);
    const verserChauffeur = safeNumber(f.data?.["MontantVerserChauffeur"]);

    // Comptabilise uniquement les valeurs valides
    if (distance !== null) {
      totalDistance += distance;
      hasDistance = true;
    }
    if (chauffeur !== null) {
      totalChauffeur += chauffeur;
      hasChauffeur = true;
    }
    if (partUsager !== null) {
      totalPartUsager += partUsager;
      hasPartUsager = true;
    }
    if (verserChauffeur !== null) {
      totalVerserChauffeur += verserChauffeur;
      hasVerserChauffeur = true;
    }

	rowsData.push({
		Dates_DateTransport: f.data?.["Dates_DateTransport"] ?? "",
		Description: description,
		"Total distance": PREPAIE ? "" : (distance ?? ""),
		TotalChauffeur: PREPAIE ? "" : (chauffeur ?? ""),
		TotalPartUsager: partUsager ?? "",
		MontantVerserChauffeur: PREPAIE ? "" : (verserChauffeur ?? ""),
		TotalRenumerationVoyageBlanc:
			PREPAIE ? "" : (f.data?.["TotalRenumerationVoyageBlanc"] ?? "")
	});
  }

  rowsData.sort(
    (a, b) => new Date(a.Dates_DateTransport) - new Date(b.Dates_DateTransport),
  );

  // Totaux : on ne met une valeur que si au moins une donnée existe
  const totals = PREPAIE
    ? {
        distanceTotale: "",
        montantTotal: "",
        totalPartsUsager: hasPartUsager
          ? Number(totalPartUsager.toFixed(2))
          : "",
        montantVerserChauffeur: "",
      }
    : {
        distanceTotale: hasDistance ? Number(totalDistance.toFixed(2)) : "",
        montantTotal: hasChauffeur ? Number(totalChauffeur.toFixed(2)) : "",
        totalPartsUsager: hasPartUsager
          ? Number(totalPartUsager.toFixed(2))
          : "",
        montantVerserChauffeur: hasVerserChauffeur
          ? Number(totalVerserChauffeur.toFixed(2))
          : "",
      };

  return { rowsData, totals };
};

const main = async () => {
  //console.log("Tournée – fetching", { dates, apiFiltersTournee });
  const docs = await getDocuments(apiFiltersTournee);
  //console.log("Tournée docs", docs);

  const byChauffeur = Object.groupBy(
    docs,
    (doc) => doc.data["Contrainte|1|Chauffeur"] ?? "— Sans chauffeur —",
  );

  const results = [];

  for (const [chauffeurName, forms] of Object.entries(byChauffeur)) {
    const { rowsData, totals } = await buildRowsData(forms, chauffeurName);

    const tablePayload = formatToAPI(rowsData);

    const pdfTitle = chauffeurName
      ? `Feuille de paye du bénévole de ${chauffeurName}`
      : "Feuille de paye du bénévole";

    const pdfUrl = await convertToPDF(tablePayload, pdfTitle, totals);

    //console.log(`PDF pour ${chauffeurName}: ${pdfUrl}`);

    if (pdfUrl) {
      const filename = PREPAIE
        ? `Tournee_${chauffeurName}_prepaie.pdf`
        : `Tournee_${chauffeurName}.pdf`;

      downloadXLSX(pdfUrl, filename);

      results.push({
        Chauffeur: chauffeurName,
        type: "pdf",
        url: pdfUrl,
      });
    }
  }

  if (results.length > 0) {
    await api().post(
      N8N_LINK_ENVOYER_FEUILLE + `?date=${dates}&type=tournee`,
      results,
    );
  } else {
    console.log("Aucun PDF généré, POST final non effectué.");
  }
  return results;
};

main();
