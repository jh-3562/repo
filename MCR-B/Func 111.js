console.log("Function 111", context);
//constants
const { NUMBER, STATUS } = docData;
const user = store.moduleStore.user.username;
const FIRST_VOLONTAIRE = 0; // we define the first form to be applied to the fields, if there is more than 1
const fieldMapping = [
  ["Prénom", "PrénomSelected"],
  ["Nom", "Nom"],
  ["Nom", "NomFormMission"],
  ["DateDeNaissance", "DateDeNaissance"],
  ["IdentifiantDispo", "IdentifiantDispo"],
];

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire",
    type: "TEXT",
  },
  {
    key: "NomDutilisateur",
    operator: "EQUALS",
    value: user,
    type: "TEXT",
  },
];

//sync functions
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

const hidePopupInfo = () => {
  const infoPopup = document.getElementById("infoPopup");
  if (infoPopup) infoPopup.style.display = "none";
};

const showPopupInfo = (infoMessage) => {
  const popup = createOrUpdateElement(
    "infoPopup",
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
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center; position: relative; width: 300px; text-align: center;">
          <button id="closePopup" style="position: absolute; top: 0px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
          <div style="margin-top: 20px;">${infoMessage}</div>
      </div>
      `
  );

  document
    .getElementById("closePopup")
    .addEventListener("click", hidePopupInfo.bind(this));
};

//async functions
const getIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;

    return ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des ids :", error);
    throw error;
  }
};

const getDocuments = async (ids) => {
  try {
    const res = await api({ local: true }).post("document/id", { ids });

    const documents = res?.data?.documents;
    return documents.map((doc) => {
      const data = JSON.parse(doc.data);
      const fields = {};

      fieldMapping.forEach(([sourceKey, destinationKey]) => {
        fields[destinationKey] = data[sourceKey];
      });

      fields["IdentifiantDispo"] = doc.documentID;
      return fields;
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw error;
  }
};

//main
const main = async () => {
  try {
    // 0. Check if form STATUS === 'Brouillon', 'Draft', otherwise ABORT
    if (["Draft", "Brouillon"].includes(STATUS)) {
      // 1. retrieve ids according to filters
      const ids = await getIds();
      console.log("ids", ids);

      // 2. retrieve documents by their ids
      const documents = await getDocuments(ids);
      console.log("documents", documents);

      // 3. handle autofill based on documents obtained
      const docLength = documents.length;
      const data = docLength > 0 ? documents[FIRST_VOLONTAIRE] : {};
      console.log(data);

      if (docLength > 1) {
        // show info popup
        console.log("show popup multiple volontaires");
        showPopupInfo(
          "Il semble que votre nom d'utilisateur figure sur plusieurs formulaires de volontaires."
        );
      }
      // 4. autofill data via callback
      callback({
        data,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des volontaires :", error);
  }
};

main();
