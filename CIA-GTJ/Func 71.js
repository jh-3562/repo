console.log("Function 71", context);

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

const updatedDoc = {
  data: formatDataAPI({ ...docData }),
  status: "Actif",
  active: true,
  template: { templateId: "90737127-32da-4bb9-8d95-54b986c978eb" },
  documentID: docData.FORMID,
};

api({ local: true })
  .put("document", { document: updatedDoc, preventNotify: "FULL" })
  .then(() => {
    showPopupMessage("Activée avec succès.", "#2ecc71");
    window.location.href = "/donnees/Donnees_Transporteur";
  })
  .catch((err) => {
    console.error("Erreur lors de l'activation :", err);
    showPopupMessage("Erreur lors de l'activation", "#e74c3c");
  });
