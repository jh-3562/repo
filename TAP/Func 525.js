console.log("Function 525", context);

const TRANSPORT_FORMLAYOUTID = "6d75ae79-ced2-4a83-a41e-da016f27e530";
const client = docData["Contrainte|2|NomClient"];
const dates = store?.pageContentStore?.processData?.[0]?.edits?.IntervalleDate;

const headerMap = {
  Dates_DateTransport: "Date",
  Etablissement_Adresse: "Adresse de départ",
  EtablissementDest_Adresse: "Adresse destination",
  Dons_client: "Contribution parts d'usager",
  VoyageBlanc: "Voyage Blanc",
};

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Transport",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "CONFIRMÉ",
    type: "TEXT",
  },
  {
    key: "Contrainte|2|NomClient",
    operator: "EQUALS",
    value: client,
    type: "TEXT",
  },
  {
    key: "Dates_DateTransport",
    operator: "BETWEEN",
    value: dates,
    type: "DATE",
  },
];

const downloadXLSX = (url, filename = "Résumé.pdf") => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToPDF = async (tableData, title = "", totals = {}) => {
  const {
    totalKmCalcul,
    totalDonsClient,
    totalPrixTotalite,
    totalVoyageBlanc,
  } = totals;

  const request = {
    sheets: [
      {
        name: "Feuil1",
        datas: [
          JSON.stringify({
            Title: title,
            totalKmCalcul,
            totalDonsClient,
            totalPrixTotalite,
            totalVoyageBlanc,
          }),
        ],
        sheetNames: ["Tournée"],
        tableDatas: [[tableData]],
      },
    ],
  };

  try {
    const res = await api({ local: true }).post(
      `/document/download/sheets/MontantTotalClient/pdf/Feuille`,
      request,
    );

    return res.data.fileUrl;
  } catch (error) {
    console.error(
      "Erreur lors de la création du PDF:",
      error.response?.data || error,
    );
  }
};

const formatToAPI = (tournees) => {
  const headers = [
    "Dates_DateTransport",
    "Etablissement_Adresse",
    "EtablissementDest_Adresse",
    "Dons_client",
    "VoyageBlanc",
  ];

  const replacer = (key, value) => value ?? "";
  const rows = tournees.map((docData) =>
    headers.map((fieldKey) => {
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

const buildRowsData = async (forms) => {
  const rowsData = [];

  let totalKmCalcul = 0;
  let totalDonsClient = 0;
  let totalPrixTotalite = 0;
  let totalVoyageBlanc = 0;

  let hasKmCalcul = false;
  let hasDonsClient = false;
  let hasPrixTotalite = false;

  const safeNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  for (const f of forms) {
    if (!f || !f.data) continue;

    const kmCalcul = safeNumber(f.data?.["Km_pour_calcul_de_la_totalite"]);
    const donsClient = safeNumber(f.data?.["Dons_client"]);
    const prixTotalite = safeNumber(f.data?.["Prix_totalite"]);
    let voyageBlanc = "Non";

    if (kmCalcul !== null) {
      totalKmCalcul += kmCalcul;
      hasKmCalcul = true;
    }

    if (donsClient !== null) {
      totalDonsClient += donsClient;
      hasDonsClient = true;
    }

    if (prixTotalite !== null) {
      totalPrixTotalite += prixTotalite;
      hasPrixTotalite = true;
    }

    if (f.data?.["VoyageBlanc"] == "true") {
      voyageBlanc = "Oui";
      totalVoyageBlanc++;
    }

    const rowData = {
      Dates_DateTransport: f.data?.["Dates_DateTransport"] ?? "",
      Etablissement_Adresse: f.data?.["Etablissement_Adresse"] ?? "",
      EtablissementDest_Adresse: f.data?.["EtablissementDest_Adresse"] ?? "",
      Dons_client: f.data?.["Dons_client"] ?? "",
      VoyageBlanc: voyageBlanc,
    };

    rowsData.push(rowData);
  }

  rowsData.sort(
    (a, b) => new Date(a.Dates_DateTransport) - new Date(b.Dates_DateTransport),
  );

  const totals = {
    totalKmCalcul: hasKmCalcul ? Number(totalKmCalcul.toFixed(2)) : "",
    totalDonsClient: hasDonsClient ? Number(totalDonsClient.toFixed(2)) : "",
    totalPrixTotalite: hasPrixTotalite
      ? Number(totalPrixTotalite.toFixed(2))
      : "",
    totalVoyageBlanc,
  };

  return { rowsData, totals };
};

const main = async () => {
  //console.log("Transports – fetching", { dates, apiFilters });
  const docs = await getDocuments(apiFilters);
  //console.log("Transports docs", docs);

  const parClient = Object.groupBy(
    docs,
    (doc) => doc.data["Contrainte|2|NomClient"] ?? "AUCUN",
  );

  const results = [];

  for (const [clientNom, forms] of Object.entries(parClient)) {
    const { rowsData, totals } = await buildRowsData(forms);

    const tablePayload = formatToAPI(rowsData);

    const pdfTitle = clientNom ? `${clientNom}` : "Résumé";

    const pdfUrl = await convertToPDF(tablePayload, pdfTitle, totals);

    if (pdfUrl) {
      const filename = `Résumé_${clientNom}_${dates}.pdf`;

      downloadXLSX(pdfUrl, filename);

      results.push({
        Client: clientNom,
        type: "pdf",
        url: pdfUrl,
      });
    }
  }

  return results;
};

main();
