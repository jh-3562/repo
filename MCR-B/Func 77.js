console.log("Function 77", context);

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
            `
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

const AREA = window.location.pathname.split("/")[1];

const updateForms = async (body) => {
  try {
    // webhook n8n
    fetch("https://n8n.mcrbe-test.fastercom.io/webhook/CalculateFacture", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => {
      hidePopupLoading();
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des formulaires :", error);
    hidePopupLoading();
    throw error;
  }
};

// main
const main = async () => {
  const data = {
    Maison: mcrDictionary[AREA],
  };
  try {
    let message = "Veuillez patienter, s'il vous plaît.";
    showPopupLoading(message);
    await updateForms({ data });
  } catch (error) {
    console.error(error);
  }
};

main();
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
