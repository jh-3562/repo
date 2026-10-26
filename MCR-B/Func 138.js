console.log("Function 138", context);
const reasonOfRefusal =
  store.pageContentStore.processData[0].edits.Facture_MotifAnnulation;

// SET TO FALSE ON PROD
const isTestEnvironment = true;

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = async () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */

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

// function to show the popup loading while waiting for api
const showPopupLoadingWaiting = () => {
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
                  <div>Annulation en cours</div>
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

const showPopUpError = (message) => {
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

// function to get the related missions Infos
const getMissionInfo = async () => {
  const apiFiltersMission = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Mission",
      type: "TEXT",
    },
    {
      key: "IdentifiantFacture",
      operator: "EQUALS",
      value: docData.FORMID,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "NOTIN",
      value: "Supprimé(e)|Refusée|Annulée|Draft",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];

  // get the id of the form
  const res1 = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersMission,
  });
  const idsMission = res1.data.ids;

  // get the infos
  const res2 = await api({ local: true }).post("document/id", {
    ids: idsMission,
  });
  //parse the info
  const missionList = res2.data.documents.map((mission) => ({
    ...JSON.parse(mission.data),
    id: mission.documentID,
    number: mission.number,
  }));
  console.log("missionList", missionList);
  return missionList;
};

// cancel the bill and missions reset to À facturer
const annulerFactureEtMissions = async (missionList) => {
  try {
    const documentsToUpdate = [];
    // for the missions
    missionList.forEach((mission) => {
      documentsToUpdate.push({
        data: formatDataAPI({ IdentifiantFacture: "" }),
        status: "À facturer",
        active: true,
        template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" },
        documentID: mission.id,
      });
    });
    // for the bill
    documentsToUpdate.push({
      data: formatDataAPI({}),
      status: "Annulée",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: docData.FORMID,
    });
    const response = await api({ local: true }).put("document/Many", {
      documents: documentsToUpdate,
      preventNotify: "FULL",
    });
  } catch (error) {
    console.warn(
      "Erreur lors de l`annulation de la facture et du repassage des missions ",
      error,
    );
  }
};

let noteCreditNumbers = [];
// function that gets every facture numbers for current month + 1
const getNumberNoteCredit = async (mois, annee, Maison) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "FACTURE",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "NOTIN",
        value: "Brouillon|Draft|Supprimé(e)",
        type: "TEXT",
      },
      {
        key: "NumeroNoteDeCredit",
        operator: "CONTAINS",
        value: `${annee}-${mois.toString().padStart(2, "0")}`,
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: Maison,
        type: "TEXT",
      },
    ];
    // get the ids of the invoices
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const idsFacture = res?.data?.ids;
    // if there is already facture ids
    if (idsFacture.length) {
      // get the facture informations
      const res2 = await api({ local: true }).post("document/id", {
        ids: idsFacture,
      });
      //parse the info
      const factureListNumber = res2.data.documents.map((documentDispo) =>
        JSON.parse(documentDispo.data),
      );
      console.log("FACTURE LIST NUMBER ", factureListNumber);
      // push the numéroFacture in the list to compare later
      factureListNumber.forEach((numero) => {
        noteCreditNumbers.push(numero.NumeroNoteDeCredit);
      });
      console.log("FACTURE LIST", noteCreditNumbers);
      // call the function that returns the new facture number
      return getNewFactureNumber(noteCreditNumbers, mois, annee);
    }
    // else there is no facture for this current month + 1 create new number
    else {
      let factureNo = `NC-${annee}-${mois.toString().padStart(2, "0")}-001`;
      if (isTestEnvironment) {
        factureNo += "_TEST";
      }
      return factureNo;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

// function that compares and gets the biggest number to add +1 to it
const getNewFactureNumber = (factureNumbers, mois, annee) => {
  // parse through the list and get rid of _TEST
  const allNumbers = factureNumbers.map((nombre) => {
    const cleaned = nombre.replace("_TEST", "").replace("NC-", "");
    const parts = cleaned.split("-");
    return parseInt(parts[2], 10);
  });
  console.log("ALL NUMBERS", allNumbers);
  // Trouver la plus grande valeur dans le tableau
  const maxValue = Math.max(...allNumbers);
  const nextNumber = maxValue + 1;

  let formattedNumber = "";
  if (nextNumber < 100) {
    formattedNumber = nextNumber.toString().padStart(3, "0");
  } else {
    formattedNumber = nextNumber.toString(); // 100 et plus
  }
  let result = `NC-${annee}-${mois
    .toString()
    .padStart(2, "0")}-${formattedNumber}`;
  if (isTestEnvironment) {
    result += "_TEST";
  }
  return result;
};

// updates the facture unique number
const updateFactureUniqueNumber = async (numéroNoteCredit) => {
  try {
    const datacloned = { ...docData };
    datacloned.NumeroNoteDeCredit = numéroNoteCredit;
    // for the facture doc
    const document = {
      data: formatDataAPI(datacloned),
      status: "Annulée",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: docData.FORMID,
    };
    // put/many for multiple updates (on facture and missions)
    const res = await api({ local: true }).put("document", {
      document,
      preventNotify: "FULL",
    });
    return res;
  } catch (error) {
    console.log("Erreur lors de la mise à jour du numéro séquentiel :", error);
  }
};

// step that verifies if the number is present
const verifyUniqueNumberFacture = async (numéroNoteCredit) => {
  const apiFiltersVerify = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "FACTURE",
      type: "TEXT",
    },
    {
      key: "NumeroNoteDeCredit",
      operator: "EQUALS",
      value: numéroNoteCredit,
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];

  const res = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersVerify,
  });
  const ids = res?.data?.ids;
  console.log("Résultat de la vérification du bénéficiaire :", ids);
  return ids; // Retourne le nombre d'éléments
};

// constant to injectMissionSupp
const injecterMissionSupplémentaire = (
  description,
  missionLabel = "Mission(s) supplémentaire(s)",
) => {
  const lignes = description.split("\n");
  const indexDepart = lignes.findIndex((line) =>
    line.trim().startsWith("Lieu de départ"),
  );
  if (indexDepart !== -1) {
    lignes.splice(indexDepart, 0, missionLabel);
  } else {
    lignes.push(missionLabel); // fallback si "Lieu de départ" non trouvé
  }
  return lignes.join("\n");
};

// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const resultMcr = getArea();

const getProfil = async () => {
  try {
    const apiFilters2 = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Profil MCR",
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: resultMcr,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    console.log("API FILTER", apiFilters2);
    const responseID = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters2,
    });
    const ids = responseID?.data?.ids;

    const responseInfos = await api({ local: true }).post("document/id", {
      ids,
    });

    console.log("------responseInfos", responseInfos);

    const parsedData = responseInfos.data.documents.map((info) => ({
      ...JSON.parse(info.data),
      FORMID: info.metaData["FORMID"],
    }));

    return parsedData?.[0] || [];
  } catch (error) {
    console.log("Erreur", error);
    hidePopupLoading();
  }
};

// function to generate the PDF
const createPDF = async (
  missionList,
  noFactureAnnulée,
  numéroNoteCredit,
  profilInfo,
) => {
  // necessary constant for mission Info
  const now = new Date();
  const factureTodayDate =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  const tableDataMission = [
    {
      headers: [
        "Date (Numéro de mission)",
        "Description",
        "Quantité",
        "Prix unitaire",
        "Remise",
        "Prix Final",
      ],
      rows: [],
    },
  ];
  const groupedRows = [];
  const result = [];
  // necessary lists for the tableDataMission
  const missionDateStorage = [];
  let missionDate = [];
  let missionDescription = [];
  let missionQuantite = [];
  let missionPrixUni = [];
  let missionRemise = [];
  let missionFinalPrice = [];
  let listeDestination = [];
  let missionPrixUniFinal = [];
  /**
   * INFO ABOUT CLIENT ADDRESS AND NAME
   */
  const {
    CoorFactu_Rue,
    CoorFactu_Numéro,
    CoorFactu_Ville,
    CoorFactu_Pays,
    CoorFactu_Prénom,
    CoorFactu_Nom,
    "CoorFactu_Code postal": CoorFactu_CodePostal,
    Maison,
    MontantInitial,
    CalculPrix_Remise,
    MontantDû,
    PrénomSelected,
    Nom,
    CommentaireFacture,
  } = docData;
  const clientAddress = `${CoorFactu_Rue} ${CoorFactu_Numéro}`;
  const clientAdressPt2 = `${CoorFactu_CodePostal} ${CoorFactu_Ville} ${CoorFactu_Pays}`;
  const clientName = `${CoorFactu_Prénom} ${CoorFactu_Nom.toUpperCase()}`;
  const beneName = `${PrénomSelected} ${Nom}`;
  /* here we treat the mcr informations */
  // necessary info for mcr
  let mcrStreet;
  let mcrName;
  let mcrIban;
  let mcrForm;
  let mcrPhone;
  let mcrTVA;
  let mcrTown;
  let mcrOffName;

  /*******  INFO FOR HOUSES *******/
  mcrStreet = profilInfo?.AdresseMCR || "";
  mcrPhone = profilInfo?.TelephoneMCR || "";
  mcrIban = profilInfo?.IBANMCR || "";
  mcrTVA = profilInfo?.TVAMCR || "";
  mcrOffName = profilInfo?.NomMCR || "";
  // if house is arlon
  if (Maison === "MCR Arlon") {
    mcrName = "Maison Croix-Rouge Arlon";
    mcrTown = "ARLON";
  }
  // if house is Aubange-Messancy
  if (Maison === "MCR Aubange-Messancy") {
    mcrName = "Maison Croix-Rouge Aubange-Messancy";
    mcrTown = "AUBANGE-MESSANCY";
  }
  if (Maison === "MCR Sud Gaume") {
    mcrName = "MCR 588 VSL Sud Gaume";
    mcrTown = "SUD GAUME";
  }
  if (Maison === "MCR Rulles-Semois") {
    mcrName = "Maison Croix-Rouge Rulles-et-Semois";
    mcrTown = "RULLES-ET-SEMOIS";
  }
  if (Maison === "MCR Docteur Lagneau") {
    mcrName = "Maison Croix-Rouge Dr Lagneau Bouillon Paliseul";
    mcrTown = "Bouillon Paliseul";
  }

  if (Maison === "MCR Marche") {
    mcrName = "Maison Croix-Rouge Marche";
    mcrTown = "Marche";
  }

  if (Maison === "MCR Gembloux") {
    mcrName = "Maison Croix-Rouge Gembloux";
    mcrTown = "Gembloux";
  }

  if (Maison === "MCR Namur") {
    mcrName = "Maison Croix-Rouge Namur";
    mcrTown = "Namur";
  }
  
  if (Maison === "MCR Florenville") {
    mcrName = "Maison Croix-Rouge Florenville-Chiny";
    mcrTown = "Florenville";
  }

  if (Maison === "MCR Rochefort") {
    mcrName = "Maison Croix-Rouge Rochefort";
    mcrTown = "Rochefort";
  }

  // add other maison conditions ...

  // tri to put them in order (old to new)
  missionList.sort((a, b) => {
    const dateA = new Date(a.Planification_Date);
    const dateB = new Date(b.Planification_Date);
    return dateA - dateB; // ordre croissant (plus vieux en premier)
  });
  /* LOOP AND REDECLARE CONSTANTS FOR EACH MISSION */
  missionList.forEach((mission) => {
    const {
      Planification_Date,
      CalculPrix_CalculKilomètrage,
      DistanceGarageGarage,
      DistanceDepartDestination,
      CalculPrixBis_PrixInitial,
      CalculPrix_Remise,
      CalculPrix_Prix,
      CC_AdresseDépart,
      CC_Destinations,
      CalculPrixBis_TarifAppliqué,
      CalculPrix_PrixParKmEuro,
      CalculPrix_PrixForfaitPriseEnChargeEuro,
      CC_Retour,
      number,
      MontantKmSupp,
      NbKMSupp,
      CalculPrix_NbKMCouvertForfaitPriseEnCharge,
    } = mission;
    const montantKMSUPP = Number(MontantKmSupp);
    const nbKMSUPP = Number(NbKMSupp);
    missionPrixUniFinal.push(Number(CalculPrix_Prix));
    // re initialize lists
    missionDate = [];
    missionQuantite = [];
    missionPrixUni = [];
    missionRemise = [];
    missionFinalPrice = [];
    missionDescription = [];
    listeDestination = [];

    // re format the missions dates and add the mission number
    let missionNumber = number;
    let missionParts = Planification_Date.split("-");
    let missionDateFormatted = `${missionParts[2]}/${missionParts[1]}/${missionParts[0]}`;
    // get the date of mission and push it
    missionDate.push(`${missionDateFormatted} (${missionNumber})`);
    // and we store it to use it as verification for emission date
    missionDateStorage.push(Planification_Date);

    const missionDestinationsLength = CC_Destinations || 0;
    for (let i = 1; i <= missionDestinationsLength; i++) {
      const address = mission[`CC_Destinations|100|Adresse|${i}`];
      listeDestination.push(address);
    }
    const destinations = listeDestination.join("\n");
    /* here we get right description details*/
    const forfait = CalculPrixBis_TarifAppliqué;
    const trajetInfo = CC_Retour ? "Aller-Retour" : "Aller";

    /***************** HERE IS WHERE WE PUSH INFO IN LISTS DEPENDING ON CASES *******************/
    /*** if km is garage to garage *******/
    if (
      CalculPrix_CalculKilomètrage === "Du garage au garage" &&
      CalculPrix_CalculKilomètrage
    ) {
      // if there is a km supplémentaires and forfait
      if (montantKMSUPP && nbKMSUPP) {
        const km = DistanceGarageGarage;
        // push info in the lists (Description, quantitie, Prix unitaire, final price)
        missionDescription.push(
          `${trajetInfo}, ${forfait}\nKM parcourus: \nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait) \nKm supplémentaire au-delà du forfait\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
        );
        missionQuantite.push(`\n${km}\n1\n${nbKMSUPP}`);
        missionPrixUni.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${CalculPrix_PrixParKmEuro}`,
        );
        missionFinalPrice.push(
          `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}\n-${montantKMSUPP}`,
        );
      }
      // else proceed as usual
      else {
        const km = DistanceGarageGarage;
        // if there is a forfait
        if (CalculPrix_PrixForfaitPriseEnChargeEuro) {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait)\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}\n1`);
          missionPrixUni.push(`\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`);
          missionFinalPrice.push(
            `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}`,
          );
        }
        // else no forfait
        else {
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}`);
          missionPrixUni.push(`\n${CalculPrix_PrixParKmEuro}`);
          missionFinalPrice.push(`\n-${CalculPrixBis_PrixInitial}`);
        }
      }
      /*** else if km is départ to destination*******/
    } else if (
      CalculPrix_CalculKilomètrage ===
        "Du lieu de départ au lieu de destination" &&
      CalculPrix_CalculKilomètrage
    ) {
      // if there is a km supplémentaires and forfait
      if (montantKMSUPP && nbKMSUPP) {
        const km = DistanceDepartDestination;
        // push info in the lists (Description, quantitie, Prix unitaire, final price)
        missionDescription.push(
          `${trajetInfo}, ${forfait}\nKM parcourus: \nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait) \nKm supplémentaire au-delà du forfait\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
        );
        missionQuantite.push(`\n${km}\n1\n${nbKMSUPP}`);
        missionPrixUni.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${CalculPrix_PrixParKmEuro}`,
        );
        missionFinalPrice.push(
          `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}\n-${montantKMSUPP}`,
        );
      } else {
        const km = DistanceDepartDestination;
        // if there is a forfait
        if (CalculPrix_PrixForfaitPriseEnChargeEuro) {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait)\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}\n1`);
          missionPrixUni.push(`\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`);
          missionFinalPrice.push(
            `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}`,
          );
        } else {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}`);
          missionPrixUni.push(`\n${CalculPrix_PrixParKmEuro}`);
          missionFinalPrice.push(`\n-${CalculPrixBis_PrixInitial}`);
        }
      }
    } // else proceed as usual
    else {
      missionDescription.push(
        `${trajetInfo}\nNombre de KM : ... \nLieu de départ: ${CC_AdresseDépart} \nDestination(s) : \n${destinations}`,
      );
      missionQuantite.push(``);
      missionPrixUni.push(``);
      missionFinalPrice.push(``);
    }

    // push remise in the list
    missionRemise.push(
      CalculPrix_Remise ? `\n\n\n${CalculPrix_Remise} %` : "\n\n\n0 %",
    );

    /* // new entry for tableDataMission
    tableDataMission[0].rows.push([
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ]); */
    const currentRow = [
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ];
    currentRow._missionsCount = 1;
    currentRow._prixSource = parseFloat(CalculPrix_Prix);
    currentRow._originalKey = [...currentRow];

    const currentRowOriginal = [
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ];

    const existingIndex = groupedRows.findIndex((row) => {
      const original = row._originalKey;
      if (!original) return false;
      for (let i = 1; i < 6; i++) {
        if (original[i] !== currentRowOriginal[i]) return false;
      }
      return true;
    });

    if (existingIndex !== -1) {
      const existingRow = groupedRows[existingIndex];

      existingRow._missionsCount = (existingRow._missionsCount || 1) + 1;

      existingRow[0] += `\n${currentRow[0]}`;
      if (existingRow._missionsCount === 2) {
        existingRow[1] = injecterMissionSupplémentaire(
          existingRow[1],
          "Mission(s) supplémentaire(s)",
        );
      }
    } else {
      currentRow._totalFinal =
        parseFloat(currentRow[5].replace(/[^\d.-]/g, "")) || 0;
      groupedRows.push(currentRow);
    }
  });

  groupedRows.forEach((row) => {
    if (row._missionsCount > 1) {
      const count = row._missionsCount - 1; // Nombre de missions supplémentaires
      const prix = row._prixSource; // Prix unitaire de la mission supplémentaire
      const total = (prix * count).toFixed(2); // Total des missions supplémentaires

      // Ajouter "Mission(s) supplémentaire(s)" seulement une fois à la fin du groupe
      row[2] += `\n${count}`; // Nombre de missions supplémentaires
      row[3] += `\n${prix}`; // Prix unitaire
      row[5] += `\n-${total}`; // Total price for the additional missions
    }
  });

  // Nettoyer les props temporaires
  tableDataMission[0].rows = groupedRows.map((row) => {
    delete row._missionsCount;
    delete row._totalFinal;
    delete row._originalKey;
    return row;
  });

  /* here we calculate the biggest date and use it as emission date */
  missionDateStorage.push(factureTodayDate);
  // recuperate the biggest date to use
  let maxDate = new Date(
    Math.max(...missionDateStorage.map((date) => new Date(date))),
  );
  let dateEcheance = new Date(maxDate);
  dateEcheance.setDate(dateEcheance.getDate() + 60);
  const emissionDate = maxDate.toISOString().split("T")[0];
  const echeanceDate = dateEcheance.toISOString().split("T")[0];

  // re format the emissionDate and echeance date
  const emissionDateParts = emissionDate.split("-");
  const emissionDateFormatted = `${emissionDateParts[2]}/${emissionDateParts[1]}/${emissionDateParts[0]}`;
  const echeanceDateParts = echeanceDate.split("-");
  const echeanceDateFormatted = `${echeanceDateParts[2]}/${echeanceDateParts[1]}/${echeanceDateParts[0]}`;
  /* push the data informations of ODS file*/
  for (let b = 0; b < missionList.length; b++) {
    const factureInfo = `{ "NoFacture": "${noFactureAnnulée}", "NoCredit": "${numéroNoteCredit}", "donneeIban": "${mcrIban}", "nameOfficiel": "${mcrOffName}",
    "Title": "NOTE DE CRÉDIT", "Date": "${emissionDateFormatted}", "Échéance": "${echeanceDateFormatted}", "Adresse": "${mcrStreet}",
      "Name": "${mcrTown}", "Telephone": "${mcrPhone}", "TVAMCR": "${mcrTVA}", "BeneName": "${beneName}", "Comment": "${
        CommentaireFacture || ""
      }",
       "ClientName": "${clientName}", "ClientAddress": "${clientAddress}", "ClientAddressPt2": "${clientAdressPt2}",
      "SsTot": "-${MontantInitial} €", "TVAM": "0 €", "Rem": "${
        CalculPrix_Remise ? CalculPrix_Remise : 0
      } %", "Tot": "-${MontantDû} €", "donneeMontant": "${MontantDû} €", "donneeCommunication": "${numéroNoteCredit}",}`;
    result.push(factureInfo);
  }
  console.log("RESULT", result);
  console.log("NUMÉRO NOTE CREDIT", numéroNoteCredit);
  console.log("TABLEDAAMISSION", tableDataMission);
  const res10 = await api({ local: true }).post(
    `document/download/sheets/NOTE_DE_CREDIT/pdf/${numéroNoteCredit}`,
    {
      sheets: [
        {
          name: "InvoiceSheet",
          datas: result,
          sheetNames: [numéroNoteCredit],
          tableDatas: [tableDataMission],
        },
      ],
    },
  );
  console.log("RES10", res10);
  const fileUrl = res10.data.fileUrl;
  return { fileUrl, emissionDate };
};

// function to convert and update the facture form
const convertAndUpdateFactureForm = async (fileUrl, numéroNoteCredit) => {
  if (!fileUrl) {
    console.error("URL du fichier non trouvée dans la réponse.");
    return;
  }
  // Step 1: Get the file and convert in base64
  const fileDataString = await fetch(fileUrl)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1]; // Extraction du Base64
            resolve(
              `{"filename":"${btoa(
                numéroNoteCredit,
              )}.pdf","data":"data:application/vnd.oasis.opendocument.spreadsheet;base64,${base64Data}"}`,
            );
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    )
    .catch((error) => {
      console.error(
        "Erreur lors du téléchargement ou conversion du fichier :",
        error,
      );
      return null;
    });

  if (!fileDataString) return;

  // Step 2: Update the form
  const clonedDocData = { ...docData };
  clonedDocData.NumeroNoteDeCredit = numéroNoteCredit;
  clonedDocData.NoteDeCredit = fileDataString;
  clonedDocData.Facture_MotifAnnulation = reasonOfRefusal;
  console.log("Mise à jour des données du formulaire :", clonedDocData);
  console.log("ID du formulaire à mettre à jour :", docData.FORMID);

  // last step update the documents for mission and facture
  await updateDocuments(clonedDocData, docData.FORMID);
};

// constant to update the facture form and missions related form
const updateDocuments = async (formData, formId) => {
  // for the facture doc
  const document = {
    data: formatDataAPI(formData),
    status: "Annulée",
    active: true,
    template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
    documentID: formId,
  };

  // put/many for multiple updates (on facture and missions)
  const res = await api({ local: true }).put("document", {
    document,
  });
  hidePopupLoading();
  return res;
};

// main
const main = async () => {
  try {
    // get every missions related to the bill
    const missionList = await getMissionInfo();
    const profilInfo = await getProfil();
    console.log("profilInfo", profilInfo);
    // we show the waiting popup
    showPopupLoadingWaiting();
    // get the date, month and year
    const date = new Date();
    const mois = date.getMonth() + 1;
    const annee = date.getFullYear();
    const MCR = docData["Maison"];
    const noFactureAnnulée = docData.NuméroFacture;
    // Get the new facture number
    const numéroNoteCredit = await getNumberNoteCredit(mois, annee, MCR);
    console.log("Numéro note de crédit", numéroNoteCredit);

    // step 1 : update the invoice form with the "Numéro séquentiel unique" that we want to give to the pdf file
    const updateFactureResponse =
      await updateFactureUniqueNumber(numéroNoteCredit);

    // here we update the facture number and verifies if it unique
    try {
      // Step 2 : Verify that there is only one form with this "Numéro séquentiel unique" among  all the invoice forms
      const id = await verifyUniqueNumberFacture(numéroNoteCredit);
      console.log("ID", id);
      // If there is only one form, continue
      if (id.length === 1) {
        console.log("yes only 1!");
        // create the pdf and get the file from url
        const { fileUrl, emissionDate } = await createPDF(
          missionList,
          noFactureAnnulée,
          numéroNoteCredit,
          profilInfo,
        );
        // convert and update the facture form and give all the necessary infos
        await convertAndUpdateFactureForm(fileUrl, numéroNoteCredit);
        await annulerFactureEtMissions(missionList);
        hidePopupLoading();
      }
      // Else, show error message
      else {
        hidePopupLoading();
        let errorMultiple = "Ce numéro de note de crédit n'est pas unique";
        showPopUpError(errorMultiple);
        console.log(
          "Erreur plusieurs documents possède ce numéro de facture :",
        );
        // button to close the popup
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
      }
    } catch (error) {
      console.log("Erreur lors de la vérification du numéro séquentiel", error);
      hidePopupLoading();
    }
  } catch (error) {
    console.warn("Erreur lors de l`annulation de la commande ", error);
    hidePopupLoading();
  }
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
