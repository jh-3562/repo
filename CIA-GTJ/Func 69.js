console.log("Function 69", context);

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

const showSuccessBanner = (successMessage) => {
  const successBanner = createOrUpdateElement(
    "successBanner",
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
      <div style="margin-right: 10px; color: green;">&#10003;</div><div>${successMessage}</div>https://web.nadeau-dev.fastercom.io/commandes
      <div id="successBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: green; height: 5px; width: 0%;"></div>
    `,
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
  }, 55); // La barre progresse sur 5 secondes
};

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
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

// function to show the popup loading
const showPopupLoading = (message) => {
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
                <div>${message}</div>
                <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
              </div>
            `,
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

// async function
const getIds = async (filters) => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: filters,
    });

    return res?.data?.ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des ids :", error);
    throw error;
  }
};

// Fonction pour récupérer les documents à partir de leur ID
const getDocumentsFromId = async (id) => {
  try {
    const res = await api({ local: true }).post(`document/id`, { ids: id });
    const documents = res?.data?.documents;

    if (!documents) {
      throw new Error(`Erreur lors de la récupération du document`);
    }

    return documents.map((doc) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du document :`, error);
    throw error;
  }
};

// Création du corps de la mise à jour d'un document
const createUpdateDocument = (data, templateId, status, docID) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId: templateId },
    documentID: docID,
  };
};

const updateManyDocuments = async (docs) => {
  try {
    await api({ local: true }).put("document/Many", { documents: docs });
  } catch (error) {
    console.error("Error in updateManyDocuments:", error);
    throw error;
  }
};

const main = async () => {
  if (!isValidDocument(t, docData)) {
    try {
      showPopupLoading("Enregistrement en cours...");

      const doc = (await getDocumentsFromId([docData.FORMID]))[0];
      let status = doc.STATUS;

      const updateDoc = {
        data: formatDataAPI(docData),
        status: status,
        active: true,
        template: { templateId: doc.FORMLAYOUTID },
        documentID: doc.FORMID,
      };
      console.log("Update Document:", updateDoc);
      try {
        await updateManyDocuments([updateDoc]);
        window.location.href = "/donnees/Donnees_Transporteur";
      } catch (error) {
        console.error("Error updating document:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in main function:", error);
      showErrorBanner("Une erreur s'est produite lors de la sauvegarde.");
    } finally {
      hidePopupLoading();
    }
  }
};

main();
