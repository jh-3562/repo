console.log('Function 57', context);

// get the needed const
const status = docData.STATUS;
let retourAnnul = docData.RetourAnnulé;
const retourChecked = docData.CC_Retour;

// to hide the popup
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// if status is draft we do nothing
if (status === "Draft") {
  // do nothing
  return;
} else {
  // updates the checkbox Retour Annulé
  retourAnnul = retourChecked === "true" ? false : true;
  // if the checkbox is true we show a popup
  if (retourAnnul === true) {
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
                      <div>Le retour a été annulé</div>
                      <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
                    </div>
                  `
    );
    // button to close the popup
    const closePopupButton = document.getElementById("closePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
  }
}
window.addEventListener("popstate", hidePopupLoading); // Pour les changements d'URL avec l'historique
window.addEventListener("hashchange", hidePopupLoading);
if (retourAnnul === false) {
  return { RetourAnnulé: false };
} else {
  return { RetourAnnulé: true };
}
