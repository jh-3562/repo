console.log("Function 121", context);
const {
  PrénomSelected,
  Nom,
  DateDeNaissance,
  IdentifiantMission,
  NuméroFacture,
  MontantInitial,
  MontantDû,
  FichierPDFFacture,
  DateEnvoi,
  CoorFactu_Réception,
  CoorFactu_Courrier,
  CoorFactu_Prénom,
  CoorFactu_Nom,
  CoorFactu_Rue,
  "CoorFactu_Code postal": CoorFactu_CodePostal,
  CoorFactu_Numéro,
  CoorFactu_Ville,
  CoorFactu_Pays,
  Relances,
  Maison,
  MontantRestantDû,
  MontantPayé,
} = docData;

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

const showErrorBanner = (errorMessage) => {
  const errorBanner = createOrUpdateElement(
    "errorBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `,
    `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
};

// if every info is filled we can proceed
if (
  PrénomSelected &&
  Nom &&
  IdentifiantMission &&
  NuméroFacture &&
  MontantInitial &&
  MontantDû &&
  FichierPDFFacture &&
  DateEnvoi &&
  CoorFactu_Réception
) {
  // we create a new date for today
  const date = new Date();
  // get the year, month and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // reformat the date
  const formattedDate = `${day}/${month}/${year}`;
  const formDate = `${year}-${month}-${day}`;
  console.log("FORMATTED DATE", formattedDate);
  console.log("Function 78", context);

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
  const viewGroupUrl = () => {
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
  const redirectToViewGroup = () => {
    window.location.href = viewGroupUrl();
  };

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
                  <div>Veuillez patienter, la relance est en train d'être générée.</div>
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
  // constant to update the facture form and missions related form
  const updateDocuments = async (formData, formId) => {
    // for the facture doc
    const documentFacture = {
      data: formatDataAPI(formData),
      status: "Envoyée",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: formId,
    };
    // put/many for multiple updates (on facture and missions)
    const res = await api({ local: true }).put("document", {
      document: documentFacture,
      preventNotify: "FULL",
    });

    return res;
  };

  // function to generate the PDF
  const createPDF = async (profilInfo) => {
    const tableUseless = [
      {
        headers: ["", ""],
        rows: [],
      },
    ];
    // new entry
    tableUseless[0].rows.push(["", ""]);
    // client billing informations
    const clientAddress = `${CoorFactu_Rue} ${CoorFactu_Numéro},`;
    const clientAddressPt2 = `${CoorFactu_CodePostal}, ${CoorFactu_Ville}, ${CoorFactu_Pays}`;
    const clientName = `${CoorFactu_Prénom} ${CoorFactu_Nom.toUpperCase()}`;
    const clientName2 = `${PrénomSelected} ${Nom.toUpperCase()}`;
    const result = [];
    /* here we treat the mcr informations */
    // necessary info for mcr
    let mcrStreet;
    let mcrIban;
    let mcrPhone;
    let mcrName;
    let mcrTVA;
    let mcrArea;
    let mcrOffName;

    mcrStreet = profilInfo?.AdresseMCR || "";
    mcrPhone = profilInfo?.TelephoneMCR || "";
    mcrIban = profilInfo?.IBANMCR || "";
    mcrTVA = profilInfo?.TVAMCR || "";
    mcrOffName = profilInfo?.NomMCR || "";
    // if maison is Arlon
    if (Maison === "MCR Arlon") {
      mcrArea = "Arlon";
      mcrName = "ARLON";
    }
    // if aubange messancy
    if (Maison === "MCR Aubange-Messancy") {
      mcrArea = "Aubange-Messancy";
      mcrName = "AUBANGE-MESSANCY";
    }
    // if maison is sud gaume
    if (Maison === "MCR Sud Gaume") {
      mcrArea = "Sud Gaume";
      mcrName = "SUD GAUME";
    }
    // if maison is rulles et semois
    if (Maison === "MCR Rulles-Semois") {
      mcrArea = "Rulles-Semois";
      mcrName = "RULLES-ET-SEMOIS";
    }

    if (Maison === "MCR Docteur Lagneau") {
      mcrArea = "Docteur Lagneau";
      mcrName = "DR LAGNEAU BOUILLON PALISEUL";
    }

    if (Maison === "MCR Marche") {
      mcrArea = "Marche";
      mcrName = "MARCHE";
    }

    if (Maison === "MCR Gembloux") {
      mcrArea = "Gembloux";
      mcrName = "GEMBLOUX";
    }

    if (Maison === "MCR Namur") {
      mcrArea = "Namur";
      mcrName = "NAMUR";
    }
    
    if (Maison === "MCR Florenville") {
      mcrArea = "Florenville";
      mcrName = "FLORENVILLE";
    }

    if (Maison === "MCR Rochefort") {
      mcrArea = "Rochefort";
      mcrName = "ROCHEFORT";
    }
    // change dates to european standard
    let dateEnvoiSplit = DateEnvoi.split("-");
    const newDateEnvoi = `${dateEnvoiSplit[2]}/${dateEnvoiSplit[1]}/${dateEnvoiSplit[0]}`;
    // add other maison conditions ...
    /* get the right montant restant dû by verifying if a payment has been made yet*/
    const restantDû = MontantPayé === "0" ? MontantDû : MontantRestantDû;
    /** every part needed for the informations of letter */
    const infoTitle = `Madame, Monsieur`;
    const infoPart1 = `À la suite d'une vérification de nos comptes, nous ne trouvons pas de trace du règlement de notre facture n° ${NuméroFacture} datée du ${newDateEnvoi}, au nom de ${clientName2}, pour un montant restant dû de ${restantDû}€`;
    const infoPart2 = `Si entretemps vous avez fait le nécessaire, veuillez nous excuser du présent rappel et nous faire savoir par quel mode de paiement et à quelle date vous l'avez exécuté.`;
    const infoPart3 = `Dans le cas contraire, nous vous remercions d'apurer ce montant sur notre compte bancaire IBAN ${mcrIban} dans les 5 jours ouvrables`;
    const infoPart4 = `Veuillez croire, Madame, Monsieur, à l'assurance de nos sentiments distingués.`;

    const nbRelances = Relances.length + 1;
    let relanceMsg;
    switch (nbRelances) {
      case 1:
        relanceMsg = "1er";
        break;
      case 2:
        relanceMsg = "2ème";
        break;
      case 3:
        relanceMsg = "3ème";
        break;
      default:
        relanceMsg = `${nbRelances}ème`;
    }
    /* push the data informations of ODS file*/

    const factureInfo = `{ "IBAN": "${mcrIban}", "Adresse": "${mcrStreet}", "Telephone": "${mcrPhone}", "nameOfficiel": "${mcrOffName}",
        "CurrentDate": "${formattedDate}", "NbRappel": "${relanceMsg}", "Name": "${mcrName}", "tva": "${mcrTVA}", "areaName": "${mcrArea}",
       "ClientName": "${clientName}", "ClientAddress": "${clientAddress}", "ClientAddressPt2": "${clientAddressPt2}", "InfoTitle": "${infoTitle}",
       "InfoPart1": "${infoPart1}", "InfoPart2": "${infoPart2}", "InfoPart3": "${infoPart3}", "InfoPart4": "${infoPart4}" }`;
    result.push(factureInfo);

    const res10 = await api({ local: true }).post(
      `document/download/sheets/FactureRelance/pdf/${NuméroFacture}`,
      {
        sheets: [
          {
            name: "InvoiceSheet",
            datas: result,
            sheetNames: [NuméroFacture],
            tableDatas: [tableUseless],
          },
        ],
      },
    );
    console.log("RES10", res10);
    const fileUrl = res10.data.fileUrl;
    return fileUrl;
  };

  // function to convert and update the facture form
  const convertAndUpdateFactureForm = async (fileUrl, numéroFacture) => {
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
                  numéroFacture,
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
    clonedDocData.Relances.push({
      "Relances|1|Date": formDate,
      "Relances|2|Facture": fileDataString,
    });
    console.log("Mise à jour des données du formulaire :", clonedDocData);
    console.log("ID du formulaire à mettre à jour :", docData.FORMID);
    // last step update the documents for mission and facture
    await updateDocuments(clonedDocData, docData.FORMID);
    if (CoorFactu_Réception === "Courrier postal") {
      // download the pdf
      // creates a download link
      const fileName = fileUrl.split("/").pop();
      const downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // last step update the documents for mission and facture
      /**
       * n8n call here
       *  */
      // if there is value for the email
      if (CoorFactu_Courrier) {
        try {
          const formID = docData.FORMID;
          // then call the webhook
          // webhook n8n
          const res = await fetch(
            "https://n8n.mcrbe-test.fastercom.io/webhook/relance",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                formID,
              }),
            },
          );
          const data = await res.json();
          console.log("data", data);
          if (!data[0].accepted[0]) {
            console.log("Erreur lors de l`envoi de courriel");
            showErrorBanner(
              "Erreur lors de l'envoi de courriel, veuillez-réessayer",
            );
            hidePopupLoading();
            return;
          }
          await updateDocuments(clonedDocData, docData.FORMID);
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour des formulaires :",
            error,
          );
          throw error;
        }
      } else {
        console.log("ERREUR ");
      }
    }
    hidePopupLoading();
    navigateBack();
  };
  const navigateBack = async () => {
    let viewGroup;
    const lastPage = localStorage.getItem("lastCustomPage");
    console.log("LAST PAGE ", lastPage);
    if (lastPage) {
      // Extraire le premier segment (le viewgroup)
      viewGroup = lastPage;
      window.location.href = viewGroup;
    } else {
      window.history.back(); // fallback si rien n’est trouvé
    }
  };

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
          value: Maison,
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

  // main
  const main = async () => {
    // we show the waiting popup
    showPopupLoadingWaiting();
    const profilInfo = await getProfil();
    // Get the new facture number
    const numéroFacture = `${NuméroFacture}_Relance`;
    console.log("Numéro de facture", numéroFacture);
    // create the pdf and get the file from url
    const fileUrl = await createPDF(profilInfo);
    // convert and update the facture form and give all the necessary infos
    await convertAndUpdateFactureForm(fileUrl, numéroFacture);
    //redirectToViewGroup();
  };
  window.addEventListener("popstate", hidePopupLoading);
  window.addEventListener("hashchange", hidePopupLoading);
  main(docData);
} else {
  console.log(
    "Erreur lors de la génération de la relance, un champ nécéssaire n'est pas remplit",
  );
}
