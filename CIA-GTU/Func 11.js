console.log("FunctionAnnuler", context);

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
const formID = docData.FORMID;

if (formID) {
  console.log("Annulation du document");

  const doc = {
    data: formatDataAPI(docData),
    status: "Annulé",   // <- statut d’annulation
    active: false,      // <- désactiver le document
    template: { templateId: "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e" },
    documentID: formID,
  };

  api({ local: true })
    .put("document", { document: doc, preventNotify: "FULL" })
    .then(() => {
      showPopupMessage("Document annulé avec succès", "#e67e22");
      setTimeout(() => window.location.reload(), 1500);
    })
    .catch(() => showPopupMessage("Erreur lors de l’annulation", "#e74c3c"));
} else {
  showPopupMessage("Impossible d’annuler : aucun document trouvé", "#e74c3c");
}

