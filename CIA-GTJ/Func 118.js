console.log("Function 118", context);

const dateToFilter = store.pageStore.filterData.Demande_DateHeureDebut;

console.log("Date to filter:", dateToFilter);

// -------------------- DATE RANGE PARSING --------------------
const [startStr, endStr] = (dateToFilter || "").split("|");

facturationStartDate = startStr ? new Date(startStr) : null;
facturationEndDate = endStr ? new Date(endStr) : null;

const startDate = new Date(startStr);
startDate.setHours(0, 0, 0, 0);

const endDate = new Date(endStr);
endDate.setHours(23, 59, 59, 999);

// -------------------- TEMPLATE IDS --------------------
const factureTemplateId = "43ed55a2-0f07-4dc8-8ea2-9de2375a5c4f";
const transportTemplateId = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";

// -------------------- API FILTERS --------------------
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Transport",
    type: "TEXT",
  },
];

// -------------------- DATE CHECK --------------------
const isDateInRange = (dateValue, start, end) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return false;

  return date >= start && date <= end;
};

// -------------------- API --------------------
const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
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
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const createDocuments = async (documentsToCreate) => {
  try {
    const response = await api({ local: true }).post("document/Many", {
      documents: documentsToCreate,
    });

    return response?.data?.docs || [];
  } catch (error) {
    console.error("Failed to create documents:", error);
    return [];
  }
};

// -------------------- UPDATE HELPERS --------------------
const createUpdateDocument = (data, templateId, status, docID) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId },
    documentID: docID,
  };
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });

    console.log("UPDATED DOCUMENT:", response?.data?.document);
    return response?.data?.document || null;
  } catch (error) {
    console.error("Failed to update document:", error);
    return null;
  }
};


// -------------------- POPUP --------------------

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDateFR = (dateStr) => {
  const date = parseLocalDate(dateStr);
  if (!date) return "";

  return date.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const startDisplay = formatDateFR(startStr);
const endDisplay = formatDateFR(endStr);

const isSameDate =
  startDisplay &&
  endDisplay &&
  startDisplay === endDisplay;

const popupMessage = isSameDate
  ? `Vous êtes sur le point de traiter les données pour le ${startDisplay}. Voulez-vous continuer ?`
  : `Vous êtes sur le point de traiter les données entre le ${startDisplay} et le ${endDisplay}. Voulez-vous continuer ?`;

const confirmDateRange = () =>
  new Promise((resolve) => {
    showCustomPopup({
      title: "Confirmation de la période de facturation",

      commentHTML: `
        <div style="font-family: sans-serif; font-size: 14px; color: #1e1e1e;">
          ${popupMessage}
        </div>
      `,

      buttons: [
        {
          name: "Retour",
          backgroundColor: "#e9ecef",
          color: "#1e1e1e",
          onClick: () => resolve(false),
        },
        {
          name: "Confirmer",
          backgroundColor: "#2f9e44",
          color: "white",
          onClick: () => resolve(true),
        },
      ],
    });
  });


// -------------------- SUCCESS BANNER --------------------

const showSuccessBanner = (message) => {
  const successBanner = createOrUpdateElement(
    "successBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 320px;
      height: 50px;
      background-color: white;
      color: #1e1e1e;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 6px;
      padding: 0 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: sans-serif;
    `,
    `
      <div style="margin-right: 10px; color: #2f9e44; font-size: 18px;">
        &#10003;
      </div>

      <div style="font-size: 14px;">
        ${message}
      </div>

      <div id="successBannerProgress"
        style="position: absolute; bottom: 0; left: 0; height: 4px; width: 0%; background-color: #2f9e44;">
      </div>
    `
  );

  let progressElement = document.getElementById("successBannerProgress");
  let width = 0;

  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      successBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 50);
};

// -------------------- MAIN --------------------
const main = async () => {


  const confirmed = await confirmDateRange();

  if (!confirmed) {
    console.log("User cancelled date confirmation");
    return [];
  }

  try {
    const documentIDs = await getDocumentIDsByFilters(apiFilters);

    if (!documentIDs.length) {
      console.log("No documents found");
      return [];
    }

    const documents = await getDocumentsByIDs(documentIDs);

    // -------------------- FILTER + SKIP ALREADY INVOICED --------------------
    const filteredData = documents
      .map((doc) => {
        try {
          const parsedData = JSON.parse(doc.data || "{}");

          const fraisRenseignes =
            parsedData.FraisRenseignes === true ||
            parsedData.FraisRenseignes === "true";

          const demandeDate = parsedData.Demande_DateHeureDebut;

          const alreadyInvoiced =
            parsedData.Operation_Facture_LienFacture &&
            parsedData.Operation_Facture_LienFacture !== "";

          if (alreadyInvoiced) {
            return null;
          }

          if (
            !fraisRenseignes ||
            !isDateInRange(demandeDate, startDate, endDate)
          ) {
            return null;
          }

          return {
            documentID: doc.documentID,

            Operation_NomDuTransporteur: parsedData.Operation_NomDuTransporteur,
            FraisRenseignes: parsedData.FraisRenseignes,
            Facturation_Facture_DateDebut: facturationStartDate,
            Facturation_Facture_DateFin: facturationEndDate,
            Operation_NomDuTransporteur: parsedData.Operation_NomDuTransporteur,
            Operation_Facture_KmCoutTotalGravier: parsedData.Operation_Facture_KmCoutTotalGravier,
            Operation_Facture_CoutAttenteTotal: parsedData.Operation_Facture_CoutAttenteTotal,
            Operation_Facture_KmCoutTotalPaves: parsedData.Operation_Facture_KmCoutTotalPaves,
            Operation_Facture_DiversTotal: parsedData.Operation_Facture_DiversTotal,
            Operation_Facture_GrandTotal: parsedData.Operation_Facture_GrandTotal,
            Facturation_Facture_NumeroFacture: parsedData.Facturation_Facture_NumeroFacture,
            Demande_DateHeureDebut: demandeDate,
          };
        } catch (err) {
          console.error("Parse error:", doc.documentID, err);
          return null;
        }
      })
      .filter(Boolean);

    console.log("Filtered:", filteredData.length);

    if (!filteredData.length) return [];

    // -------------------- CREATE FACTURES --------------------
    const documentsToCreate = filteredData.map((item) => ({
      data: JSON.stringify(item),
      status: "Actif",
      active: true,
      template: { templateId: factureTemplateId },
    }));

    const createdDocs = await createDocuments(documentsToCreate);

    const createdCount = createdDocs?.length || 0;

    const bannerMessage =
      createdCount > 0
        ? `${createdCount} facture(s) générée(s) avec succès`
        : `Aucune facture n’a été générée`;

    showSuccessBanner(bannerMessage);

    console.log("FACTURES CREATED:", createdDocs);

    // -------------------- EXTRACT UUIDS --------------------
    const factureUUIDs = (createdDocs || [])
      .map((d) => d.docID)
      .filter(Boolean);

    console.log("FACTURE UUIDS:", factureUUIDs);

    if (!factureUUIDs.length) return createdDocs;

    // -------------------- UPDATE TRANSPORTS --------------------
    for (let i = 0; i < filteredData.length; i++) {
      const transport = filteredData[i];
      const factureUUID = factureUUIDs[i] || factureUUIDs[0];
      const currentDate = new Date();

      const updatedData = {
        ...transport,
        Operation_Facture_LienFacture: `/facturation/${factureUUID}`,
        Operation_Facture_DateFacture: currentDate.toISOString(),
      };

      const documentToUpdate = createUpdateDocument(
        updatedData,
        transportTemplateId,
        "Actif",
        transport.documentID
      );

      console.log("Updating transport:", documentToUpdate);

      await updateDocument(documentToUpdate);
    }

    console.log("All transports updated with facture links.");

    return createdDocs;
  } catch (err) {
    console.error("Function 118 error:", err);
    return [];
  }
};

return main();
