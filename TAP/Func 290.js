// Constantes
const stopTemplateID = "A5972800-0B0A-4FE2-90BD-142187139BAD";
const tableData = store.moduleStore.tableDatas["GridStops"];
let positionActuelle = tableData?.rows ? tableData.rows.length : 0;
const validStatus = {
  soumis: "SOUMIS",
};
const { FORMID, StopArret, AjouterStop } = docData;

// Objets de données initiales
const nouvelArret = {
  AjouterStop: "",
  Stop_Raison: "",
  Stop_Heure: "",
  Stop_RaisonTransport: "",
  Stop_Destination: "",
};

const dataStopArret = {
  Stop_Type: "Arrêt",
  Stop_Raison: "",
  Stop_RaisonTransport: "",
  Dates_DateTransport: "",
  "Contrainte|1|Chauffeur": "",
  TypeVehicule: "",
  Stop_Destination: "",
  Stop_Position: "",
  StopArret: [],
  IDTransportGroupe: FORMID,
  Stop_Heure: "",
};

const dataStopDepart = {
  Stop_Type: "Départ",
  Dates_DateTransport: "",
  "Contrainte|1|Chauffeur": "",
  TypeVehicule: "",
  Stop_Destination: "",
  Stop_Position: "",
  StopArret: [],
  IDTransportGroupe: FORMID,
};

// Fonction de mise à jour des valeurs
const updateValues = (source, target) => {
  for (const key in target) {
    if (key in source) {
      target[key] = source[key];
    }
  }
};

// Fonction du passage des collections du format frontEnd au format backEnd
const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((key) => {
      let newKey = `${key}|${index + 1}`;
      result[newKey] = obj[key];
    });
  });
  result[key] = itemCount.toString();
  return result;
};

// Fonction de formatage des données pour l'API
const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) };
    }
  });
  for (let propName in data) {
    if (!data[propName]) {
      delete data[propName];
    }
  }
  return JSON.stringify(data);
};

// Fonction pour récupérer les adresses des clients
const fetchClientAddress = (IDs) => {
  return api({ local: true })
    .post(`document/id`, { ids: IDs })
    .then((res) => {
      const adresses = res?.data?.documents.map((doc) => {
        const data = JSON.parse(doc?.data);

        return {
          Formid: doc.documentID,
          Domicile_Adresse: data?.Domicile_Adresse || "",
        };
      });
      return adresses;
    });
};

// Fonction pour créer des stops
const createStops = async (data, notify) => {
  try {
    const res = await api({ local: true }).post("document", {
      document: {
        data: data,
        status: validStatus.soumis,
        active: true,
        template: { templateId: stopTemplateID },
      },
      preventNotify: notify,
    });
    if (!res) throw new Error("Erreur à la création du stop");
    return res;
  } catch (err) {
    console.error("Error", err);
    return undefined;
  }
};

// Fonction d'affichage de popup de chargement
const popupLoading = (show, success, errorMessage, loadingMessage) => {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
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
      `;
      document.body.appendChild(loadingPopup);

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
    }

    loadingPopup.innerHTML = `
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
        <div>${loadingMessage}</div>
        <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
      </div>
    `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
  } else {
    if (loadingPopup) loadingPopup.style.display = "none";
    if (success === false && errorMessage) {
      if (!errorBanner) {
        errorBanner = document.createElement("div");
        errorBanner.id = "errorBanner";
        errorBanner.style = `
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
        `;
        document.body.appendChild(errorBanner);
      }

      errorBanner.innerHTML = `
        <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
        <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
      `;
      errorBanner.style.display = "flex";

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
      }, 55);
    }
  }
};

// Processus principal
const processStops = async (callback) => {
  popupLoading(true, null, "Erreur à la création", "Ajout des stops");

  // const adressesDomiciles = await fetchClientAddress(
  //   StopArret.filter((f) => {
  //     return f["StopArret|6|FormID"];
  //   }).map((item) => item["StopArret|6|FormID"])
  // );

  const stopDepart = StopArret.filter((row) => {
    const exists = tableData.rows.find((element) => {
      return (
        element.data["StopArret|5|ID|1"] === row["StopArret|5|ID"] &&
        element?.data["Stop_Type"] === "Départ"
      );
    });
    return !(exists);
  }).map((item, index) => {
    let data = { ...dataStopDepart };
    updateValues(docData, data);
    data["Stop_Destination"] =item["StopArret|4|Adresse"]
    data["Stop_Position"] = positionActuelle + index + 1;
    data["StopArret"] = [item];
    return data;
  });

  updateValues(docData, dataStopArret);
  dataStopArret["Stop_Position"] = stopDepart.length+1+positionActuelle;

  try {
    const results = await Promise.all(
      stopDepart.map((item) => createStops(formatDataAPI(item),"FULL"))
    );
    if (results.every((element) => element !== undefined)) {
      const final = await createStops(formatDataAPI(dataStopArret), "");
      if (!final) {
        throw new Error("Erreur à la création du stop");
      } else {
        popupLoading(false, true, null, null);
      }
    } else {
      throw new Error("Erreur à la création du stop");
    }
    callback();
  } catch (error) {
    console.error(error);
    popupLoading(false, false, "Erreur à la création", null);
  }
};

if (AjouterStop === "true") {
}

processStops(()=>  
  callback({
  data: nouvelArret
}))