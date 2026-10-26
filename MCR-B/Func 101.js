console.log("Function 101", context);

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

// get the ids
const formIDs = store.pageContentStore.checked;
let index = 1;
// api to get the invoices info
const getFactureInfo = async () => {
  if (formIDs) {
    // constant to store the document to update status
    const documentFacture = [];
    const documentN8n = [];
    try {
      const res1 = await api({ local: true }).post("document/id", {
        ids: formIDs,
      });
      const pdfList = [];
      res1.data.documents.forEach((document) => {
        // Parse the document data (to extract the PDF path)
        const documentData = JSON.parse(document.data);
        console.log("documentData", documentData);
        const prenom = documentData.PrénomSelected;
        const nom = documentData.Nom;
        // if CoorFactu_Réception is Courrier postal we download and update the status
        if (documentData.CoorFactu_Réception === "Courrier postal") {
          try {
            // Parse the FichierPDFFacture if it's a JSON string
            const pdf = JSON.parse(documentData.FichierPDFFacture);
            console.log("PDF", pdf);
            // Extract the PDF path and filename
            const pdfPath = pdf.path;
            // custom name for file
            const newFilename = `Facture_${documentData.NuméroFacture}_${prenom}_${nom}.pdf`;
            // If a valid PDF path exists, create a download link
            if (pdfPath) {
              pdfList.push({ path: pdfPath, filename: newFilename }); // Use the new filename here
            }
            index++;
            // push the document we need to update status to Envoyée
            documentFacture.push({
              documentID: document.documentID,
              data: JSON.stringify({}),
              status: "Envoyée",
              active: true,
              template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
            });
          } catch (error) {
            console.log("Erreur lors du téléchargement de la facture", error);
          }
        }

        // if courrier electronique we do a
        if (documentData.CoorFactu_Réception === "Courrier électronique") {
          documentN8n.push({
            documentID: document.documentID,
            data: JSON.stringify({}),
            status: "Envoi en cours",
            active: true,
            template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
          });
        }
      });
      if (documentN8n.length) {
        const res2 = await api({ local: true }).put("document/Many", {
          documents: documentN8n,
        });
        try {
          // then call the webhook
          // webhook n8n
          fetch("https://n8n.mcrbe-test.fastercom.io/webhook/email", {
            method: "GET",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
          });
          hidePopupLoading();
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour des formulaires :",
            error
          );
          hidePopupLoading();
          throw error;
        }
      }

      // if at least 1 we update
      if (documentFacture.length) {
        // put/many for multiple updates (on facture and missions)
        const res = await api({ local: true }).put("document/Many", {
          documents: documentFacture,
        });
      }
      if (pdfList.length) {
        await downloadAllPDFsAsZip(pdfList);
      }
      hidePopupLoading();
    } catch (error) {
      console.log("Erreur lors de la récupération des factures", error);
      hidePopupLoading();
    }
  } else {
    console.log("Erreur, veuillez sélectionner une facture.");
    hidePopupLoading();
  }
};

const downloadAllPDFsAsZip = async (pdfList) => {
  const zip = new JSZip();

  for (const { path, filename } of pdfList) {
    try {
      const response = await fetch(path);
      console.log("RESPONSE ", response);
      const blob = await response.blob();
      console.log("BLOB ", blob);
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${filename}`, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "Factures.zip");
  });
};

// main
const main = async () => {
  let message = "Veuillez patienter, s'il vous plaît.";
  showPopupLoading(message);
  // api call
  await getFactureInfo();
};

main();
