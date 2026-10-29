console.log('Function46', context);
const showPopupMessage = (message, color = "#2ecc71", duration = 3000) => {
  let popup = document.getElementById("messagePopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "messagePopup";
    document.body.appendChild(popup);
  }
  popup.innerText = message;
  popup.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${color};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-size: 16px;
    transition: opacity 0.5s ease;
    opacity: 1;
  `;
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, duration);
};
 
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
 
console.log("docData :", docData);
const statusChamp = docData.TEMPORARY_STATUS;
const formID = docData.FORMID;
console.log(docData.NUMBER)
 
if (statusChamp === "Actif" && formID) {

  console.log("Actif")
  
  const doc = {
    data: formatDataAPI({ ...docData, ChampInvisible: "Draft" }),
    status: "Draft",
    active: true,
    template: { templateId: "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e" },
    documentID: formID,
  };
  api({ local: true })
    .put("document", { document: doc, preventNotify: "FULL" })
    .then(() => {
      showPopupMessage("Statut changé à Draft, page rechargée");
      window.location.reload();
    })
    .catch(() => showPopupMessage("Erreur lors de la sauvegarde", "#e74c3c"));
 
} else if (statusChamp === "Draft" && docData.NUMBER !== 0) {
  
  console.log("Draft et différent de 0");

  const doc = {
    data: formatDataAPI(docData),
    status: "Draft",
    active: true,
    template: { templateId: "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e" },
    documentID: formID,
  };
  api({ local: true })
    .put("document", { document: doc, preventNotify: "FULL" })
    .then(() => showPopupMessage("Modifications sauvegardées"))
    .catch(() => showPopupMessage("Erreur lors de la sauvegarde", "#e74c3c")); 
} else {

  console.log("Création new formID")
  
  const doc = {
    data: formatDataAPI(docData),
    status: "Draft",
    active: true,
    template: { templateId: "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e" },
  };
  api({ local: true })
    .post("document", { document: doc, preventNotify: "FULL" })
    .then((res) => {
      showPopupMessage("Modifications sauvegardées");
      const newFormID = res?.data?.id || res?.data?.formID;
      if (newFormID) {
        window.location.href =
         window.location.pathname.split("/").slice(0, 2).join("/") + "/" + newFormID;
      }
    })
    .catch(() => showPopupMessage("Erreur lors de la sauvegarde", "#e74c3c"));
}

