console.log("Function 94", context);
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
const showPopupLoading = () => {
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
                <div>Une mission n'a pas de prix assigné.</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `
  );
};
// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const resultMcr = getArea();

const apiFilters = [
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
    operator: "NOTEQUALS",
    value: "Supprimé(e)",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const getMissionData = async () => {
  try {
    // get the id of the form
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const idsMission = res1.data.ids;

    // get the infos
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsMission,
    });
    //parse the info
    const missionList = res2.data.documents.map((mission) =>
      JSON.parse(mission.data)
    );
    return missionList;
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// main function
const main = async () => {
  console.log("111");
  // get the list of mission infos
  const missions = await getMissionData();
  console.log("333");
  // if not undefined
  if (missions.length) {
    // var to store prixInitial
    let prixInitialTotal = 0;
    let prixInitialHorsForfaitTotal = 0;
    let totalForfaits = 0;
    // remise parsefloat
    const remise = parseFloat(docData.CalculPrix_Remise);
    // add every prixInitiail to the total
    missions.forEach((info) => {
      const prixInitial = info.CalculPrix_Prix;
      const prixForfaits = info.CalculPrix_PrixForfaitPriseEnChargeEuro || "0";
      const prixHorsForfait =
        parseFloat(prixInitial) - parseFloat(prixForfaits);
      if (prixInitial) {
        prixInitialTotal += parseFloat(prixInitial);
        totalForfaits += parseFloat(prixForfaits);
        prixInitialHorsForfaitTotal += prixHorsForfait;
      } else {
        console.log("222");
        showPopupLoading();
        // button to close the popup
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
        throw new Error("Error: One or more missions with undefined prices.");
      }
    });

    // if remise has a value and is not equal 0
    if (remise && remise !== 0) {
      // calculate difference and substrac
      const montantASoustraire = (prixInitialHorsForfaitTotal * remise) / 100;
      const montantFinalDu =
        prixInitialHorsForfaitTotal - montantASoustraire + totalForfaits;
      // inject the data
      injectDocData({
        fillData: {
          MontantInitial: parseFloat(prixInitialTotal.toFixed(2)),
          MontantDû: montantFinalDu.toFixed(2),
          Facture_PrixInitialHorsForfait: parseFloat(
            prixInitialHorsForfaitTotal.toFixed(2)
          ),
          Facture_PrixDesForfaits: parseFloat(totalForfaits.toFixed(2)),
        },
      });
    } else {
      // else we inject the same data because no remise
      injectDocData({
        fillData: {
          MontantInitial: parseFloat(prixInitialTotal.toFixed(2)),
          MontantDû: prixInitialTotal.toFixed(2),
          Facture_PrixInitialHorsForfait: parseFloat(
            prixInitialHorsForfaitTotal.toFixed(2)
          ),
          Facture_PrixDesForfaits: parseFloat(totalForfaits.toFixed(2)),
        },
      });
    }
  } else {
    console.log("Aucune mission trouvée.");
  }
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
