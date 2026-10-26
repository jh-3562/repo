console.log("Function139", context);

// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((key) => {
      let newKey = `${key}|${index + 1}`;
      result[newKey] = obj[key];
    });
  });
  result[key] = itemCount.toString();
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});

const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(excludeKeys(data, ["FORMID", "NUMBER"]));
};

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// function to show the popup loading
const showPopup = () => {
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
      <div style="
        background-color: white; 
        padding: 20px; 
        border-radius: 5px; 
        display: flex; 
        flex-direction: column; 
        align-items: center;
      ">
        
        <h1 style="
          color: #C70000; 
          font-weight: bold; 
          font-size: 120%;
          align-self: flex-start;
        ">Attention !</h1>

        <div>Un chevauchement a été détecté, voulez-vous tout de même poursuivre?</div>

        <!-- CONTENEUR FLEX POUR LES DEUX BOUTONS -->
        <div style="
          display: flex; 
          flex-direction: row; 
          gap: 15px; 
          margin-top: 20px;
        ">

          <button id="continuePopupBtn" style="
            border: 2px solid #3498db; 
            background-color: #3498db; 
            color: #FFFFFF; 
            width: 80px; 
            height: 35px; 
            border-radius: 10px;
          ">Ok</button>

          <button id="closePopupBtn" style="
            border: 2px solid #F00A0A; 
            background-color: #F00A0A; 
            color: #FFFFFF; 
            width: 80px; 
            height: 35px; 
            border-radius: 10px;
          ">Retour</button>

        </div>

      </div>
    `,
  );
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};
// constant document to save the form
const documentPayload = {
  data: formatDataAPI(docData),
  status: "Enregistrée",
  active: true,
  template: { templateId: "cd81267c-4a6b-451b-846f-22999f0be1f5" },
  documentID: docData.FORMID,
};

console.log("DOCUMENT", documentPayload);

// function that updates the form
const updateForm = async () => {
  try {
    // update the form
    const response = api({ local: true }).put("document", {
      document: documentPayload,
      preventNotify: "FULL",
    });
  } catch (error) {
    console.log("Erreur lors de l`ajout du client");
  }
};

const verifyAvailabilityForDay = async () => {
  const date = docData.Planification_Date;
  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Disponibilité",
      type: "TEXT",
    },
    {
      key: "PrénomSelected",
      operator: "EQUALS",
      value: docData.PrénomSelected,
      type: "TEXT",
    },
    {
      key: "NomFormMission",
      operator: "EQUALS",
      value: docData.NomFormMission,
      type: "TEXT",
    },
    {
      key: "DateDeNaissance",
      operator: "EQUALS",
      value: docData.DateDeNaissance,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistrée",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];
  console.log(
    "---------------------------AVAILABILITIES---------------------------",
  );
  const res = await recurrence.getDocuments(apiFilters, [date, date], api);
  console.log("recurrence.getDocuments", res);

  //parse the info
  const parsedData = res.data.documents.map((documentDispo) =>
    JSON.parse(documentDispo.data),
  );

  const newStart = docData.Planification_HeureDébut;
  const newEnd = docData.Planification_HeureFin;
  return { parsedData, newStart, newEnd };
};

const hasTimeConflict = (newStart, newEnd, existingForms) => {
  for (const form of existingForms) {
    const existingStart = form.Planification_HeureDébut;
    const existingEnd = form.Planification_HeureFin;

    // Convertir les heures en objets Date pour comparaison
    const startA = new Date(`1970-01-01T${newStart}:00`);
    const endA = new Date(`1970-01-01T${newEnd}:00`);
    const startB = new Date(`1970-01-01T${existingStart}:00`);
    const endB = new Date(`1970-01-01T${existingEnd}:00`);
    console.log("START A , END A", startA, endA);
    console.log("START B, END B ", startB, endB);
    // Vérifie s'il y a un chevauchement
    if (startA < endB && endA > startB) {
      console.log("TRUE");
      return true;
    }
  }
  return false;
};

const proceed = async () => {
  hidePopupLoading();
  updateForm();
  navigateBack();
};

const main = async () => {
  const { parsedData, newStart, newEnd } = await verifyAvailabilityForDay();
  const conflict = hasTimeConflict(newStart, newEnd, parsedData);
  if (conflict) {
    console.warn(
      "Un conflit a été détecté, veuillez-modifier les heures de disponibilité",
    );
    showPopup();
    const closePopupButton = document.getElementById("closePopupBtn");
    const continuePopupBtn = document.getElementById("continuePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
    if (continuePopupBtn) {
      continuePopupBtn.addEventListener("click", proceed);
    }
  } else {
    updateForm();
    navigateBack();
  }
};

window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  main();
}
