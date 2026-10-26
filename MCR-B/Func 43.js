console.log("Function 43", context);

// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
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

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

const showPopupLoading = (loadingMessage) => {
  createOrUpdateElement(
    "loadingPopup",
    "div",
    `
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        `,
    `
          <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
            <div>${loadingMessage}</div>
            <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
          </div>
        `
  );
  if (!document.getElementById("spinnerStyle")) {
    let style = document.createElement("style");
    style.id = "spinnerStyle";
    style.innerHTML = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
    document.head.appendChild(style);
  }
};

const formatDispobilite = (dispo, date) => {
  const documents = dispo.data.documents;

  const formatedDocuments = [];

  documents.forEach((doc) => {
    const data = JSON.parse(doc.data);

    console.log("data", data);

    const exceptions = data.Exception_Récurrence
      ? data.Exception_Récurrence.split("|").map(
          (date) => new Date(date).toISOString().split("T")[0]
        )
      : [];

    if (exceptions.includes(date)) {
      return;
    }
    if (
      data.IdentifiantFormulaireRécurrence &&
      data.Planification_Date === date
    ) {
      const newData = {
        ...data,
        Planification_Récurrence: "Une seule fois",
      };
      formatedDocuments.push({
        ...doc,
        data: JSON.stringify(newData),
      });
    } else if (data.Planification_Récurrence === "Une seule fois") {
      formatedDocuments.push({
        ...doc,
      });
    } else if (data.Planification_Récurrence === "Par semaine") {
      const day = getWeekday(date);
      const days = data.Planification_Répéter.split("|");

      if (days.includes(day)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    } else if (data.Planification_Récurrence === "Par jour spécifique") {
      const days = data.Planification_MultiDate.split("|");
      if (days.includes(date)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    }
  });

  return {
    ...dispo,
    data: {
      ...dispo.data,
      documents: formatedDocuments,
    },
  };
};

// function that gets the date entered
function getDate() {
  const processData =
    store.pageContentStore.processData[0].edits.TrouverChauffeurDate;
  return processData;
}

// function that gets the area
function getArea() {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
}

const getWeekday = (dateStr) => {
  // Split the input and parse integers
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create a Date object (note: month is 0-indexed in JS)
  const date = new Date(year, month - 1, day);

  // Days of the week
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  // Return corresponding day
  return days[date.getDay()];
};

const resultDate = getDate();
const resultMcr = getArea();

const rangeDateDebut = "0001-01-01|" + resultDate;
const rangeDateFin = resultDate + "|9999-12-31";

// filters definition
const driversAPIFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire",
    type: "TEXT",
  },
  { key: "Maison", operator: "EQUALS", value: resultMcr, type: "TEXT" },
  { key: "STATUS", operator: "EQUALS", value: "Enregistré", type: "TEXT" },
];

const availabilitiesAPIFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  { key: "Maison", operator: "EQUALS", value: resultMcr, type: "TEXT" },
  {
    key: "Planification_Disponiblité",
    operator: "IN",
    value: "Disponible|Indisponible",
    type: "TEXT",
  },
  { key: "STATUS", operator: "EQUALS", value: "Enregistrée", type: "TEXT" },
];

// function that gets every availability
async function getAvailability(apiFilters, resultDate) {
  const dispo = await recurrence.getDocuments(
    apiFilters,
    [resultDate, resultDate],
    api
  );
  return dispo;
}

// function that gets
async function getDrivers(apiFilters) {
  const res2 = await api({ local: true }).post("document/id/filter", {
    filters: apiFilters,
  });
  // list of driver IDS
  const listeIds = res2.data.ids;
  // returns every driver info
  return await api({ local: true }).post("document/id", { ids: listeIds });
}

// function to process drivers and compares with avail
function processDrivers(res3, listeDispoID) {
  // list to stock driver with availabilty and no avail
  let driverWithAvail = [];
  let driverNoAvail = [];

  // gets every driver id individually and stocks it in correct list
  res3.data.documents.forEach((document) => {
    const dataFormID = document.documentID;
    console.log("CHAUFFEUR sans dispo ", driverNoAvail);
    if (listeDispoID.includes(dataFormID)) {
      driverWithAvail.push(dataFormID);
    } else {
      driverNoAvail.push(dataFormID);
    }
  });
  console.log("CHAUFFEUR AVEC DISPO ", driverWithAvail);

  return { driverWithAvail, driverNoAvail };
}

// Fonction pour extraire les identifiants des disponibilités
function extractAvailabilityIds(res5) {
  let listeDispoID = [];
  res5.data.documents.forEach((documentDispo) => {
    const dataDispo = JSON.parse(documentDispo.data);
    const dataDisponibilite = dataDispo.IdentifiantDispo;
    listeDispoID.push(dataDisponibilite);
  });
  console.log("LISTE DES DISPO ", listeDispoID);
  return listeDispoID;
}

// Function that generates docs and updates them
function generateDocuments(driverWithAvail, driverNoAvail) {
  const uncheckedChauff = driverWithAvail.map((id) => ({
    documentID: id,
    data: JSON.stringify({ AfficherDansListeAppel: "false" }),
    status: "Enregistré",
    active: true,
    template: { templateId: "7c6d6132-ca2b-411c-86e9-baaaa130faa3" },
  }));

  const checkedChauff = driverNoAvail.map((id) => ({
    documentID: id,
    data: JSON.stringify({ AfficherDansListeAppel: "true" }),
    status: "Enregistré",
    active: true,
    template: { templateId: "7c6d6132-ca2b-411c-86e9-baaaa130faa3" },
  }));

  return [...uncheckedChauff, ...checkedChauff];
}

// main function
async function main() {
  showPopupLoading("Chargement en cours..."); // Affiche la popup de chargement

  try {
    // API calls to get avail and drivers
    const [res5, res3] = await Promise.all([
      getAvailability(availabilitiesAPIFilters, resultDate),
      getDrivers(driversAPIFilters),
    ]);
    console.log("res5", res5);
    console.log("res3", res3);

    // Extract availability IDs
    const listeDispoID = extractAvailabilityIds(res5);
    const { driverWithAvail, driverNoAvail } = processDrivers(
      res3,
      listeDispoID
    );

    // Generate and update documents
    const docUpdate = generateDocuments(driverWithAvail, driverNoAvail);

    // Update the documents
    const res6 = await api({ local: true }).put("document/Many", {
      documents: docUpdate,
    });
    console.log("res6", res6);
  } catch (error) {
    console.error("Error API", error);
  } finally {
    hidePopupLoading(); // Cache la popup de chargement une fois terminé (succès ou erreur)
  }
}

// main function call
main();
