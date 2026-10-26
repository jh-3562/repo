console.log("function80", context);
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
// get the are
const resultMcr = getArea();
// store necessary constants
const {
  PrénomSelected,
  Nom,
  DateDeNaissance,
  PriseEnCharge_VéhiculeUtilisé,
  PriseEnCharge_VéhiculeUtiliséRetour,
  FORMLAYOUTID,
  NomFormMission,
  Planification_Date,
  Catégorie,
  TPMR,
} = docData;
let driverMissionCompatible;
// messages constants
const messageFromDispoForm =
  "Certaines missions sont incompatibles avec ce chauffeur";
const messageFromMissionForm =
  "Un ou plusieurs chauffeurs sont incompatibles avec cette mission";
// api filter for drivers data
const apiFiltersChauffeur = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
  {
    key: "Prénom",
    operator: "EQUALS",
    value: PrénomSelected,
    type: "TEXT",
  },
  {
    key: "Nom",
    operator: "EQUALS",
    value: Nom,
    type: "TEXT",
  },
  {
    key: "DateDeNaissance",
    operator: "EQUALS",
    value: DateDeNaissance,
    type: "DATE",
  },
];

// api filter for missions with matching vehicle (Aller)
const apiFiltersMissionVehiculeAller = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTEQUALS",
    value: "Supprimé(e)",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtilisé,
    type: "TEXT",
  },
];

// api filter for missions with matching vehicle (Retour)
const apiFiltersMissionVehiculeRetour = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTEQUALS",
    value: "Supprimé(e)",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtiliséRetour",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtiliséRetour,
    type: "TEXT",
  },
];

// api filter for availabilty matching vehicle aller from form mission
const apiFiltersAvailabilityAller = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtilisé,
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
];
// api filter for availabilty matching vehicle return from form mission
const apiFiltersAvailabilityRetour = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtiliséRetour,
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
];

// function that gets the driver data with his name etc... from availabilities form
const getDriverData = async () => {
  try {
    // filter by id
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersChauffeur,
    });
    const idsChauffeur = res1.data.ids;

    // get driver info
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsChauffeur,
    });

    // parse the info
    const driverList = res2.data.documents.map((documentDriver) =>
      JSON.parse(documentDriver.data)
    );
    return driverList;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// function that gets the driver data from mission form with formID
const getDriverDataFromMission = async (ids) => {
  try {
    const apiFiltersChauffeur2 = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Volontaire",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "Enregistré",
        type: "TEXT",
      },
      {
        key: "FORMID",
        operator: "IN",
        value: ids,
        type: "TEXT",
      },
    ];
    // filter by id
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersChauffeur2,
    });
    const idsChauffeur = res1.data.ids;

    // get driver info
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsChauffeur,
    });

    // parse the info
    const driverList = res2.data.documents.map((documentDriver) =>
      JSON.parse(documentDriver.data)
    );
    console.log("LISTE DES CHAUFFEURS", driverList);
    return driverList;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// api to get the mission data matching vehicle for both aller and retour
const getMissionData = async () => {
  try {
    // filter by id vehicle aller
    const res3 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMissionVehiculeAller,
    });
    const idsvehicleAller = res3.data.ids;
    // filter by id vehicle retour
    const res4 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMissionVehiculeRetour,
    });
    const idsvehicleRetour = res4.data.ids;

    // get driver info aller
    const res5 = await api({ local: true }).post("document/id", {
      ids: idsvehicleAller,
    });

    // get driver info return
    const res6 = await api({ local: true }).post("document/id", {
      ids: idsvehicleRetour,
    });

    // parse the info aller
    const vehicleListAller = res5.data.documents.map((documentVehicle) =>
      JSON.parse(documentVehicle.data)
    );

    // parse the info return
    const vehicleListRetour = res6.data.documents.map((documentVehicleRetour) =>
      JSON.parse(documentVehicleRetour.data)
    );
    return { vehicleListAller, vehicleListRetour };
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// gets the data of availability matching the car for aller
const getAvailabilityDataAller = async () => {
  try {
    // filter by availability for aller
    const res7 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersAvailabilityAller,
    });
    const idsAvailAller = res7.data.ids;
    // get availability info with the id (aller)
    const res9 = await api({ local: true }).post("document/id", {
      ids: idsAvailAller,
    });
    // parse the info aller
    const availabilityListAller = res9.data.documents.map((availability) =>
      JSON.parse(availability.data)
    );

    console.log("LISTG ALLEr DISPO", availabilityListAller);
    const joinedIds = availabilityListAller
      .map((info) => info.IdentifiantDispo)
      .join("|");
    return joinedIds;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// function that gets the availabilty data from return vehicle input
const getAvailabilityDataRetour = async () => {
  // filter by availability for return
  const res8 = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersAvailabilityRetour,
  });
  const idsAvailRetour = res8.data.ids;
  // get the availability info with the id (retour)
  const res10 = await api({ local: true }).post("document/id", {
    ids: idsAvailRetour,
  });
  // parse the info return
  const availabilityListRetour = res10.data.documents.map(
    (availabilityRetour) => JSON.parse(availabilityRetour.data)
  );
  const joinedIds = availabilityListRetour
    .map((info) => info.IdentifiantDispo)
    .join("|");
  return joinedIds;
};

// to hide the popup
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// popup create
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

// function that shows the error message
const showButton = (message) => {
  // creates the popup
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
              <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
                <div>${message}</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `
  );
  // button to close the popup
  const closePopupButton = document.getElementById("closePopupBtn");
  if (closePopupButton) {
    closePopupButton.addEventListener("click", hidePopupLoading);
  }
};

// boolean to track if we need to verify for returns
let loopBack = true;
// main function
const main = async () => {
  /* THIS PART IS FOR THE VERIFICATION ON DISPO FORM */
  if (
    PrénomSelected &&
    Planification_Date &&
    DateDeNaissance &&
    Nom &&
    PriseEnCharge_VéhiculeUtilisé &&
    FORMLAYOUTID === "cd81267c-4a6b-451b-846f-22999f0be1f5"
  ) {
    // store in constants the results for driver, and missioninfo related to vehicle
    const [driver, vehicle] = await Promise.all([
      getDriverData(),
      getMissionData(),
    ]);
    // store the list individually
    const vehicleListAller = vehicle.vehicleListAller;
    const vehicleListRetour = vehicle.vehicleListRetour;
    let driverMission = driver[0].Aptitudes_MissionsPratiquées;
    // if driver has missionPratiquee
    if (driverMission) {
      // split the values and put in variable
      driverMissionCompatible = driverMission.split("|");
    }
    // else its default transport social
    else {
      driverMissionCompatible = ["Transport Social"];
    }

    /* THIS PART IS FOR ALLER ONLY  */
    // loop through vehicle for aller
    for (let i = 0; i < vehicleListAller.length; i++) {
      let categorieNotSplit = vehicleListAller[i].Catégorie;
      let tpmr = vehicleListAller[i].TPMR;
      // verifies if the categorie is undefined if yes do nothing
      if (categorieNotSplit === undefined) {
      }
      // else process as usal
      else {
        // split the mission categorie
        let categorieSplit = categorieNotSplit.split("/");
        // verifies if one mission value is present in the driver values
        if (
          categorieSplit.some((categorie) =>
            driverMissionCompatible.includes(categorie)
          )
        ) {
          const catValue = tpmr === "Oui" ? "TPMR" : "VSL";
          /** IF CATEGORIE IS TPMR VERIFIES */
          if (categorieSplit.includes("TPMR")) {
            if (driverMissionCompatible.includes(catValue)) {
              continue;
            } else {
              showButton(messageFromDispoForm);
              loopBack = false;
              break;
            }
          } else {
            // if yes process as usual
            continue;
          }
        }
        // else there is incompatibility
        else {
          showButton(messageFromDispoForm);
          loopBack = false;
          break;
        }
      }
    }

    /* THIS PART ONLY HAPPENS IF FOR ALLER EVERYTHING IS COMPATIBLE */
    // if index is still 0 we can process with the return and do same logic
    if (loopBack) {
      // loop through vehicle for return
      for (let i = 0; i < vehicleListRetour.length; i++) {
        // get the categorie
        let categorieNotSplitReturn = vehicleListRetour[i].Catégorie;
        let tpmr = vehicleListRetour[i].TPMR;
        // verifies if the categorie is undefined if yes do nothing
        if (categorieNotSplitReturn === undefined) {
        }
        // else process as usal
        else {
          // split the categorie values
          let categorieSplitReturn = categorieNotSplitReturn.split("/");
          // verifies if one mission value is present in the driver values
          if (
            categorieSplitReturn.some((categorie) =>
              driverMissionCompatible.includes(categorie)
            )
          ) {
            const catValue = tpmr === "Oui" ? "TPMR" : "VSL";
            /** IF CATEGORIE IS TPMR VERIFIES */
            if (categorieSplit.includes("TPMR")) {
              if (driverMissionCompatible.includes(catValue)) {
                continue;
              } else {
                showButton(messageFromDispoForm);
                loopBack = false;
                break;
              }
            } else {
              // if yes process as usual
              continue;
            }
          }
          // else there is incompatibility
          else {
            showButton(messageFromDispoForm);
            break;
          }
        }
      }
    }
  }

  /* 
  THIS PART IS FOR THE VERIFICATION ON MISSION FORMS
  */
  // if form is mission and we press vehicle aller
  else if (
    PrénomSelected &&
    NomFormMission &&
    Planification_Date &&
    PriseEnCharge_VéhiculeUtilisé &&
    FORMLAYOUTID === "0e44171d-1616-4a50-9b36-aff4d998c4a5" &&
    inputKey === "PriseEnCharge_VéhiculeUtilisé" &&
    Catégorie
  ) {
    // if categorie is not transport social
    if (Catégorie !== "Transport Social") {
      const catValue = TPMR === "Oui" ? "TPMR" : "VSL";
      const categorieSplit = Catégorie.split("/");
      const availsIds = await getAvailabilityDataAller();
      // if there are availabilities proceed
      if (availsIds) {
        const driverList = await getDriverDataFromMission(availsIds);
        console.log("DRIVER LIST", driverList);
        driverList.forEach((driver) => {
          // if the driver has mission pratiquees
          if (driver.Aptitudes_MissionsPratiquées) {
            const missionPratiquées =
              driver.Aptitudes_MissionsPratiquées.split("|");
            console.log("CAT SPLIT", categorieSplit);
            console.log("mission PRAT", missionPratiquées);
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              if (categorieSplit.includes("TPMR")) {
                if (missionPratiquées.includes(catValue)) {
                  // do nothing
                } else {
                  showButton(messageFromMissionForm);
                  return;
                }
              } else {
                // do nothing
                console.log("ALL GOOD");
              }
            }
            // else error message
            else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
          // else the driver has no categorie assigned so default is Tranport Social
          else {
            const missionPratiquées = ["Transport Social"];
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              // do nothing
              console.log("ALL GOOD");
            } else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
        });
      } else {
        console.log("Aucune disponibilité de trouvé");
        return;
      }
    }
  }
  // if we press on vehicle return on mission form
  else if (
    PrénomSelected &&
    NomFormMission &&
    Planification_Date &&
    PriseEnCharge_VéhiculeUtiliséRetour &&
    FORMLAYOUTID === "0e44171d-1616-4a50-9b36-aff4d998c4a5" &&
    inputKey === "PriseEnCharge_VéhiculeUtiliséRetour" &&
    Catégorie
  ) {
    // if categorie is not transport social
    if (Catégorie !== "Transport Social") {
      const catValue = TPMR === "Oui" ? "TPMR" : "VSL";
      // get the avail info then driver info
      const categorieSplit = Catégorie.split("/");
      const availsIds = await getAvailabilityDataRetour();
      // if there are availabilities
      if (availsIds) {
        console.log("YES", availsIds);
        const driverList = await getDriverDataFromMission(availsIds);
        // verifies if the driver is compatible
        driverList.forEach((driver) => {
          // if the driver has mission pratiquees
          if (driver.Aptitudes_MissionsPratiquées) {
            const missionPratiquées =
              driver.Aptitudes_MissionsPratiquées.split("|");
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              if (categorieSplit.includes("TPMR")) {
                if (missionPratiquées.includes(catValue)) {
                  // do nothing
                } else {
                  showButton(messageFromMissionForm);
                  return;
                }
              } else {
                // do nothing
                console.log("ALL GOOD");
              }
            } else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
          // else driver has no mission pratiquee assigned so default is Transport Social
          else {
            const missionPratiquées = ["Transport Social"];
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              // do nothing
              console.log("ALL GOOD");
            } else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
        });
      } else {
        console.log("Aucune disponibilité de trouvé");
        return;
      }
    }
  } else {
    // else we need more info to do the api searches
    console.log("NEED MORE INFOS");
    return;
  }
};

window.addEventListener("popstate", hidePopupLoading); // Pour les changements d'URL avec l'historique
window.addEventListener("hashchange", hidePopupLoading);

main();
