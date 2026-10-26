console.log("Function 86", context);

const idsMissions = store.pageContentStore.checked;

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

const showPopupError = () => {
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
                <div>Veuillez décocher puis recochez les missions sélectionnées, puis réessayez.</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `,
  );
};

// sync functions
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

const buildFactureData = (missionData, beneficiary) => {
  // On décode la chaîne JSON des données du bénéficiaire
  const benefData = JSON.parse(beneficiary.data);

  return {
    PrénomSelected: missionData.PrénomSelected,
    Nom: missionData.NomFormMission,
    DateDeNaissance: missionData.DateDeNaissance,
    IdentifiantMission: missionData.IdentifiantMission,
    Maison: missionData.Maison,
    // On suppose que "MontantDu" est défini dans missionData ou dans un contexte global
    MontantDû: missionData.MontantDu,
    MontantPayé: "0",
    CalculPrix_Remise: "0",
    CoorFactu_Réception: benefData["CoorFactu_Réception"],
    dateValiditeAttestationMututelle:
      benefData.dateValiditeAttestationMututelle || "",
    InformationsPourLaFacturation:
      benefData.InformationsPourLaFacturation || "",
    CoorFactu_Courrier: benefData["CoorFactu_Courrier"],
    CoorFactu_Nom: benefData["CoorFactu_Nom"] || "",
    CoorFactu_Prénom: benefData["CoorFactu_Prénom"] || "",
    CoorFactu_Rue: benefData["CoorFactu_Rue"] || "",
    CoorFactu_Numéro: benefData["CoorFactu_Numéro"] || "",
    "CoorFactu_Code postal": benefData["CoorFactu_Code postal"] || "",
    CoorFactu_Ville: benefData["CoorFactu_Ville"] || "",
    CoorFactu_Pays: benefData["CoorFactu_Pays"] || "",
    AllocataireSocial: benefData["AllocataireSocial"] || "",
    CoorFactu_Qualité: benefData["CoorFactu_Qualité"] || "",
  };
};

const getBeneficiary = async (id) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "BÉNÉFICIAIRE",
        type: "TEXT",
      },
      { key: "FORMID", operator: "EQUALS", value: id, type: "TEXT" },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res.data.document;
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

const getMissions = async (ids) => {
  try {
    const res = await api({ local: true }).post("document/id", {
      ids: ids,
    });
    const missions = res?.data.documents;
    console.log("Résultat de la vérification des missions :", missions);
    return missions;
  } catch (error) {
    console.error("Erreur lors de la vérification des missions :", error);
    throw error;
  }
};

// returns a list of bills assigned to the mission
const checkIfFactureExists = async (data) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Facture",
        type: "TEXT",
      },
      { key: "Maison", operator: "EQUALS", value: data.Maison, type: "TEXT" },
      {
        key: "IdentifiantMission",
        operator: "EQUALS",
        value: data.IdentifiantMission,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Brouillon", type: "TEXT" },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

// updates form data and status to 'Acceptée'
const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: "Facturation en cours",
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId,
    };

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};

const createFactureForm = async (formLayoutId, filteredData) => {
  try {
    console.log(formatDataAPI(filteredData));
    try {
      const response = await api({ local: true }).post("document", {
        document: {
          data: formatDataAPI(filteredData),
          status: "Brouillon",
          active: true,
          template: { templateId: formLayoutId },
        },
      });
      console.log("Réponse de l'API :", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création du formulaire bénéficiaire :",
      error,
    );
    throw error;
  }
};

const main = async () => {
  try {
    let message = "Veuillez patienter, s'il vous plaît.";
    showPopupLoading(message);
    const missions = await getMissions(idsMissions);
    for (const m of missions) {
      if (m.status === "Facturée") {
        showPopupError();
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
        return;
      }
    }

    console.log("Missions récupérées :", missions);

    // returns missions without bill ID
    const filteredMissions = missions.filter((mission) => {
      const data = JSON.parse(mission.data);
      return !data.IdentifiantFacture;
    });

    // iterates over all missions regardless if they have a bill ID or not
    for (const mission of missions) {
      const data = JSON.parse(mission.data);
      console.log("OLD DATA", data);
      const factureExists = await checkIfFactureExists(data);
      console.log("Factures existantes: ", factureExists.ids.length);

      // if a bill is found for that mission, assign it
      if (factureExists.ids.length > 0) {
        console.log(
          `Facture already exists for mission ${data.IdentifiantMission}`,
        );
        const newData = { ...data, IdentifiantFacture: factureExists.ids[0] };
        console.log("NEW DATA", newData);
        console.log("MISSION ID", mission.documentID);
        await updateMissionForm(
          mission.documentID,
          newData,
          "0e44171d-1616-4a50-9b36-aff4d998c4a5",
        );
        // else make a new bill and assign it to the beneficiary, then to the mission
      } else {
        const beneficiary = await getBeneficiary(data.IdentifiantMission);
        console.log(beneficiary);

        // Création de la variable factureData avec les bonnes valeurs
        const factureData = await buildFactureData(data, beneficiary);
        console.log("Facture Data générée :", factureData);

        // Création de la facture
        const facture = await createFactureForm(
          "81e43068-2f10-426b-b78b-dfd855136bd5",
          factureData,
        );
        console.log("Facture créée :", facture);

        // Mise à jour de la mission avec l'identifiant de la facture
        const newData = {
          ...data,
          IdentifiantFacture: facture.data.id,
        };
        await updateMissionForm(
          mission.documentID,
          newData,
          "0e44171d-1616-4a50-9b36-aff4d998c4a5",
        );
      }
    }
    console.log("Missions sans IdentifiantFacture :", filteredMissions);
    hidePopupLoading();
  } catch (error) {
    console.error("Erreur lors de la récupération des missions :", error);
    hidePopupLoading();
  }
};

main();
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
