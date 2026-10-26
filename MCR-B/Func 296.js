console.log("Function 296", context);

const showErrorBanner = (errorMessage) => {
  const errorBanner = createOrUpdateElement(
    "errorBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `,
    `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
};

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

async function main() {
  const nomCategorie = docData.Categorie_Nom;
  const dateDebut = docData?.Categorie_DateDebut || "";
  const dateFin = docData?.Categorie_DateFin || "";

  if (!nomCategorie || !dateDebut || !dateFin) {
    return;
  }

  const overlapFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Catégorie",
      type: "TEXT",
    },
    {
      key: "Categorie_Nom",
      operator: "EQUALS",
      value: nomCategorie,
      type: "TEXT",
    },
    {
      key: "Categorie_DateDebut",
      operator: "LOWERTHAN",
      value: dateFin,
      type: "DATE",
    },
    {
      key: "Categorie_DateFin",
      operator: "GREATERTHAN",
      value: dateDebut,
      type: "DATE",
    },
  ];

  const documents = await getDocuments(overlapFilters);
  const currentDocId = docData.FORMID || null;

  const hasOverlap = documents.some((doc) => {
    const existingDocId = doc.FORMID || null;
    if (
      currentDocId &&
      existingDocId &&
      String(currentDocId) === String(existingDocId)
    ) {
      return false;
    }

    return true;
  });

  if (hasOverlap) {
    showErrorBanner(
      "Les dates de début et de fin chevauchent une autre période pour cette catégorie.",
    );
    callback({
      data: {
        Categorie_Nom: "",
      },
    });
  }
}

main();
