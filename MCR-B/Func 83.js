console.log("Function 83", context);

// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const resultMcr = getArea();
const date = store.pageContentStore.processData[0].edits.DateBatchstep;
const typeTelechargement =
  store.pageContentStore.processData[0].edits.TypeTelechargement;
const rangeDateDebut = "0001-01-01|" + date;
const rangeDateFin = date + "|9999-12-31";

// api document/id/filter
const apiFiltersMission = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Supprimé(e)|Refusée|Annulée|Draft",
    type: "TEXT",
  },
  {
    key: "InformationsAdmin_DateHeureDébut",
    operator: "BETWEEN",
    value: rangeDateDebut,
    type: "DATETIME",
  },
  {
    key: "InformationsAdmin_DateHeureFin",
    operator: "BETWEEN",
    value: rangeDateFin,
    type: "DATETIME",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

// to get the beneficiary info
const getBeneficiaryData = async (missionList, identifiantBene) => {
  const finalList = [];

  // get mission info
  const res6 = await api({ local: true }).post("document/id", {
    ids: identifiantBene,
  });
  const infoBene = res6.data.documents;
  const beneList = res6.data.documents.map((documentbene) => {
    const parsedData = JSON.parse(documentbene.data); // Parse the JSON data
    return parsedData;
  });

  const listeTotale = missionList.map((mission) => {
    const document = infoBene.find(
      (info) => info.documentID === mission.IdentifiantMission,
    );
    const { CoorFactu_Rue, CoorFactu_Numéro, CoorFactu_Ville, CoorFactu_Pays } =
      JSON.parse(document.data);
    return {
      ...mission,
      CoorFactu_Rue,
      CoorFactu_Numéro,
      CoorFactu_Ville,
      CoorFactu_Pays,
    };
  });
  return listeTotale;
};
// to get the mission data
const getMissionData = async (date) => {
  try {
    // constants to store mission beneficairy prenom, nom and date of birth
    const identifiantBene = [];
    // filter by id
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMission,
    });
    const idsMission = res1.data.ids;
    // get mission info
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsMission,
    });

    const interpretedResult = await recurrence.getDocuments(
      apiFiltersMission,
      [date, date],
      api,
    );
    const existingResult = await recurrence.createFormsIfNeeded(
      interpretedResult.data.documents,
      api,
    );
    const missionList = existingResult.map((document) => {
      const parsedData = JSON.parse(document.data); // Parse the JSON data
      // add the number to the list
      return {
        ...parsedData,
        number: document.number,
        id: document.documentID,
        status: document.status,
      };
    });

    missionList.forEach((data) => {
      identifiantBene.push(data.IdentifiantMission);
    });
    return { missionList, identifiantBene };
    //return missionList;
  } catch (error) {
    console.log("ERREUR", error);
  }
};

const apiFiltersDispo = [
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
    key: "Planification_Disponiblité",
    operator: "EQUALS",
    value: "Disponible",
    type: "TEXT",
  },

  {
    key: "InformationsAdmin_DateHeureDébut",
    operator: "BETWEEN",
    value: rangeDateDebut,
    type: "DATETIME",
  },
  {
    key: "InformationsAdmin_DateHeureFin",
    operator: "BETWEEN",
    value: rangeDateFin,
    type: "DATETIME",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const apiFiltersVehicules = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

// get the availability data
const fetchDispoData = async (date) => {
  try {
    console.log(
      "---------------------------AVAILABILITIES---------------------------",
    );
    const res = await recurrence.getDocuments(
      apiFiltersDispo,
      [date, date],
      api,
    );
    console.log("recurrence.getDocuments", res);

    //parse the info
    const dispoList = res.data.documents.map((documentDispo) =>
      JSON.parse(documentDispo.data),
    );
    return dispoList;
  } catch (error) {
    console.error("Erreur lors des appels API 2", error);
  }
};

// get the available car
const fetchVehiculesData = async () => {
  try {
    // get the ids
    const res6 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersVehicules,
    });
    const idsVehicules = res6.data.ids;

    // get the infos
    const res7 = await api({ local: true }).post("document/id", {
      ids: idsVehicules,
    });
    //parse the infos
    const listeVehic = res7.data.documents.map((documentVehic) =>
      JSON.parse(documentVehic.data),
    );
    return listeVehic;
  } catch (error) {
    console.error("Erreur lors des appels API 3", error);
  }
};

// function that get the driver names
const getDrivers = async () => {};

// function that updates the status of the mission to À facturer
const updateStatusMission = async (missionList) => {
  try {
    // get only the acceptée missions to update
    const acceptedMissions = missionList.filter(
      (mission) => mission.status === "Acceptée",
    );
    const documentsUpdate = acceptedMissions.map((mission) => ({
      data: JSON.stringify({
        ...mission,
      }), // object of the keys from the Field DB and its new value
      status: "À facturer", // key from Status FormLayout
      active: true,
      template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" }, // key from DB FormLayout
      documentID: mission.id, // FormID from DB Form
    }));
    if (acceptedMissions.length) {
      // api document/Many (put) (met a jour plusieurs formulaire)
      const resStatus = await api({ local: true }).put("document/Many", {
        documents: documentsUpdate,
      });
    } else {
      console.log("Aucune mission à mettre à jour.");
    }
  } catch (error) {
    console.warn("Error : ", error);
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
        value: resultMcr,
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

// to create the pdf
const createPDF = async (listOfMissions, profilInfo) => {
  try {
    // necessary constants
    const result = [];
    const title = [];
    const km = [];
    const missionPrice = [];
    const adressFactu = [];
    const trajetInfo = [];
    const categorie = [];
    const vehicule = [];
    const tpmr = [];
    let phoneNumbers = [];
    let clientIndex = 0;
    let number = [];
    let drivers = [];
    let depart = [];
    let destination = [];
    let comments = [];
    let motifs = [];
    const tableDataServices = [];
    const tableDataHours = [];
    const tableDatasClient = [];
    const tablesJoined = [];
    const currentDate = listOfMissions[0].Planification_Date;
    let clientName = [];
    let nomMaison;
    let statutMaison;
    let formeMaison;
    let adresseMaison;

    // re format the currentDate
    let dateParts = currentDate.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    adresseMaison = `Adresse : ${profilInfo?.AdresseMCR || ""}`;

    // Configuration des maisons
    const mcrConfig = {
      "MCR Arlon": "Nom: Maison Croix-Rouge Arlon",
      "MCR Aubange-Messancy": "Nom: Maison Croix-Rouge Aubange-Messancy",
      "MCR Sud Gaume": "Nom: Maison Croix-Rouge Sud Gaume",
      "MCR Rulles-Semois": "Nom: Maison Croix-Rouge Rulles-Et-Semois",
      "MCR Docteur Lagneau":
        "Nom: Maison Croix-Rouge Dr Lagneau Bouillon Paliseul",
      "MCR Marche": "Nom: Maison Croix-Rouge Marche",
      "MCR Gembloux": "Nom: Maison Croix-Rouge Gembloux",
      "MCR Namur": "Nom: Maison Croix-Rouge Namur",
      "MCR Florenville": "Nom: Maison Croix-Rouge Florenville-Chiny",
      "MCR Rochefort": "Nom: Maison Croix-Rouge Rochefort",
    };

    nomMaison = mcrConfig[resultMcr] || "";
    statutMaison = `inscrite à la banque carrefour des entreprises sous le numéro : ${profilInfo?.["Numéro BCE"] || "0406.729.809"}`;
    formeMaison =
      profilInfo?.["Exploitant BDC"] ||
      "Exploitant un service de transport à finalité spéciale en vertu d'une autorisation portant le n° TC727";
    // list for
    // loop to get every info
    listOfMissions.forEach((mission) => {
      // re initialize necessary lists
      phoneNumbers = [];
      destination = [];
      const vehiculeAller =
        mission?.PriseEnCharge_VéhiculeUtilisé || "Non renseigné";
      const vehiculeRetour =
        mission?.PriseEnCharge_VéhiculeUtiliséRetour || "Non renseigné";
      //push the starting adress, price of mission and amount of km

      const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";
      const phoneDepart = mission.TelephoneNumber
        ? ` (${mission.TelephoneNumber})`
        : "";
      depart.push(`${mission.CC_AdresseDépart}${deno}${phoneDepart}`);
      let collectionLength = mission.CC_Destinations;
      for (let j = 1; j <= collectionLength; j++) {
        let currentDestination = mission[`CC_Destinations|100|Adresse|${j}`];
        const phoneDest = mission[`CC_Destinations|920|Telephone|${j}`]
          ? ` (${mission[`CC_Destinations|920|Telephone|${j}`]})`
          : "";
        const denomination = mission[`CC_Destinations|110|Dénomination|${j}`]
          ? ` - ${mission[`CC_Destinations|110|Dénomination|${j}`]}`
          : "";
        destination.push(
          `Destination : ${currentDestination}${denomination}${phoneDest}`,
        );
      }

      // categorie and tpmr
      mission.TPMR === "Oui" ? tpmr.push("Oui") : tpmr.push("Non");
      categorie.push(`${mission.Catégorie}`);

      /*HERE WE GET / CONCAT AND PUSH THE ADRESS OF FACTURATION */
      const coordStreet = mission.CoorFactu_Rue;
      const coordTown = mission.CoorFactu_Ville;
      const coordNumber = mission.CoorFactu_Numéro;
      const coordCountry = mission.CoorFactu_Pays;
      // we concat it
      const coordAddress = `${coordStreet} ${coordNumber}, ${coordTown}, ${coordCountry}`;
      adressFactu.push(coordAddress);

      // here we get the motif and comment
      const motif = mission.Motif ? mission.Motif.replace(/"/g, '\\"') : "";
      const driverComment = mission.InformationsPourLeChauffeur || "";
      motifs.push(motif);
      comments.push(driverComment);

      /*HERE WE GET AND PUSH ALLER/ALLER-RETOUR */
      const isChecked = mission.CC_Retour;
      const isRDVPec = mission?.TypeTransport;
      if (isRDVPec === "Retour") {
        trajetInfo.push("Retour");
        vehicule.push(`Véhicule : ${vehiculeAller}`);
      } else if (isChecked === "true") {
        trajetInfo.push("Aller-Retour");
        if (vehiculeAller !== vehiculeRetour) {
          vehicule.push(
            `Véhicule Aller : ${vehiculeAller} - Véhicule Retour : ${vehiculeRetour}`,
          );
        } else {
          vehicule.push(`Véhicule : ${vehiculeAller}`);
        }
      } else {
        trajetInfo.push("Aller");
        vehicule.push(`Véhicule : ${vehiculeAller}`);
      }
      /*HERE WE GET AND PUSH THE RIGHT KM VALUE and we push mission price*/
      const calculKM = mission.CalculPrix_CalculKilomètrage;
      if (calculKM === "Du garage au garage") {
        km.push(`KM : ${mission.DistanceGarageGarage}`);
        missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
      } else if (calculKM === "Du lieu de départ au lieu de destination") {
        km.push(`KM : ${mission.DistanceDepartDestination}`);
        missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
      } else {
        km.push(`KM : ..............`);
        missionPrice.push(`Prix : ................`);
      }

      /* HERE WE PUSH THE CLIENT INFO and mission price*/
      number.push(`${mission.number}`);
      clientName.push(
        `${mission.PrénomSelected} ${mission.NomFormMission.toUpperCase()}`,
      );
      // push the drivers
      drivers.push(`${mission.chauffeurs}`);
      title.push(`Bon de commande`);
      // Créer une nouvelle entrée pour tableDatasClient
      tableDatasClient.push({
        headers: [""],
        rows: [],
      });

      // create a new entry for tableDataServices
      tableDataServices.push({
        headers: [""],
        rows: [],
      });

      // create a new entry for tablehours
      tableDataHours.push({
        headers: [""],
        rows: [],
      });

      /* PHONE NUMBERS SECTION */
      // for the phone numbers push in list
      let phoneLength = mission.Téléphones;
      for (let j = 1; j <= phoneLength; j++) {
        let phonenumber = mission[`Téléphones|2|Téléphone|${j}`]
          ? mission[`Téléphones|2|Téléphone|${j}`]
          : `....`;
        phoneNumbers.push(phonenumber);
      }
      // if there is a data push it in list
      if (phoneNumbers.length) {
        for (let p = 0; p < phoneNumbers.length; p++) {
          let indexPhone = 1;
          tableDatasClient[clientIndex].rows.push([
            `Contact ${indexPhone} Téléphone: ${phoneNumbers[p]}`,
          ]);
          indexPhone++;
        }
      } else {
        // else empty
        tableDatasClient[clientIndex].rows.push([
          `Contact No: ........................`,
        ]);
      }

      /********* table hours section**********/
      const priseEnCharge = mission.CC_Récupération;
      tableDataHours[clientIndex].rows.push([
        `Hr début de mission : ${
          mission.heureDebutMission || "..."
        } - Hr de prise en charge : ${priseEnCharge}`,
      ]);
      // loop to get every line
      for (let j = 1; j <= mission.CC_Destinations.length; j++) {
        console.log("mission", mission);
        let debutRDV =
          mission[`CC_Destinations|400|Début de RDV|${j}`] || "...";
        let finRDV = mission[`CC_Destinations|600|Fin de RDV|${j}`];
        if (isRDVPec === "Retour") {
          tableDataHours[clientIndex].rows.push([
            `Hr d'arrivée : ${mission[`CC_Destinations|300|Arrivée|${j}`] || "..."}`,
          ]);
        } else if (finRDV) {
          tableDataHours[clientIndex].rows.push([
            `Hr rendez-vous : ${debutRDV || ""} - Hr reprise client estimée : ${
              finRDV || "..."
            }`,
          ]);
        } else {
          tableDataHours[clientIndex].rows.push([
            `Hr rendez-vous : ${debutRDV || ""}`,
          ]);
        }
      }
      tableDataHours[clientIndex].rows.push([
        ` Hr fin mission estimée : ${mission.heureFinMission || "..."}`,
      ]);

      /* SERVICES SECTION */
      for (let a = 0; a < destination.length; a++) {
        tableDataServices[clientIndex].rows.push([`${destination[a]}`]);
      }

      clientIndex++;
    });

    // fill the result part of ods file with right info
    for (let b = 0; b < listOfMissions.length; b++) {
      let feuilleInfo;
      let feuilleInfoObj = {
        Number: `No de mission: ${number[b]}`,
        Title: title[b] || "",
        Drivers: drivers[b] || "",
        Motif: motifs[b] || "",
        Comment: comments[b] || "",
        ClientName: clientName[b] || "",
        LieuDepart: `Départ : ${depart[b] || ""}`,
        Categorie: `Catégorie : ${categorie[b] || ""}`,
        TPMR: `TPMR : ${tpmr[b] || ""}`,
        Date: `Date : ${dateFormatee}`,
        NomMaison: nomMaison || "",
        Km: km[b] || "",
        Prix: missionPrice[b] || "",
        Trajet: trajetInfo[b] || "",
        AdresseFacturation: `Adresse de facturation : ${adressFactu[b] || ""}`,
        StatutMaison: statutMaison || "",
        Forme: formeMaison || "",
        AdresseMaison: adresseMaison || "",
        Vehic: vehicule[b] || "",
      };
      // ⬇️ Le stringify ici est sûr
      result.push(JSON.stringify(feuilleInfoObj));
      /*
      feuilleInfo = `{ "Number": "No de mission: ${number[b]}", "Title": "${title[b]}", "Drivers": "${drivers[b]}", "Motif": "${motifs[b]}", "Comment": "${comments[b]}",
          "ClientName": "${clientName[b]}", "LieuDepart": "Départ : ${depart[b]}", "Categorie": "Catégorie : ${categorie[b]}",
          "TPMR": "TPMR : ${tpmr[b]}",  
          "Date": "Date : ${dateFormatee}", "NomMaison": "${nomMaison}", "Km": "${km[b]}", "Prix": "${missionPrice[b]}", "Trajet": "${trajetInfo[b]}", 
          "AdresseFacturation": "Adresse de facturation : ${adressFactu[b]}",
          "StatutMaison": "${statutMaison}", "Forme": "${formeMaison}", "AdresseMaison": "${adresseMaison}",}`;
      result.push(feuilleInfo); // return it to result list
      */
    }

    // push the data in the
    for (let m = 0; m < listOfMissions.length; m++) {
      tablesJoined.push([
        tableDatasClient[m],
        tableDataServices[m],
        tableDataHours[m],
      ]);
    }

    // api call to generate the pdf
    const res10 = await api({ local: true }).post(
      "document/download/sheets/BonDeCommande/pdf/BonDeCommande",
      {
        sheets: [
          {
            name: "BonDeCommande",
            datas: result,
            sheetNames: title,
            tableDatas: tablesJoined,
          },
        ],
      },
    );

    if (res10 !== undefined) {
      // gets the url name and file name
      const fileUrl = res10.data.fileUrl;
      console.log("RES10", res10);
      console.log("fileURL", fileUrl);
      const fileName = fileUrl.split("/").pop();
      if (fileUrl) {
        // creates a download link
        const downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        console.error("URL du fichier non trouvée dans la réponse.");
      }
    }
  } catch (error) {
    console.log("ERREUR", error);
  }
};

const downloadAllPDFsAsZip = async () => {
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
    saveAs(content, `BDC_${date}.zip`);
  });
};

// to store the pdf
const pdfList = [];
// to create the pdf
const createPDFIndividuel = async (mission, profilInfo) => {
  try {
    // necessary constants
    const result = [];
    const title = [];
    const km = [];
    const missionPrice = [];
    const adressFactu = [];
    const trajetInfo = [];
    const vehicule = [];
    const categorie = [];
    const tpmr = [];
    let phoneNumbers = [];
    let clientIndex = 0;
    let number = [];
    let drivers = [];
    let depart = [];
    let destination = [];
    let comments = [];
    let motifs = [];
    const tableDataServices = [];
    const tableDataHours = [];
    const tableDatasClient = [];
    const tablesJoined = [];
    const currentDate = mission.Planification_Date;
    let clientName = [];
    let nomMaison;
    let statutMaison;
    let formeMaison;
    let adresseMaison;

    // re format the currentDate
    let dateParts = currentDate.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    adresseMaison = `Adresse : ${profilInfo?.AdresseMCR || ""}`;

    const mcrConfig = {
      "MCR Arlon": "Nom: Maison Croix-Rouge Arlon",
      "MCR Aubange-Messancy": "Nom: Maison Croix-Rouge Aubange-Messancy",
      "MCR Sud Gaume": "Nom: Maison Croix-Rouge Sud Gaume",
      "MCR Rulles-Semois": "Nom: Maison Croix-Rouge Rulles-Et-Semois",
      "MCR Docteur Lagneau":
        "Nom: Maison Croix-Rouge Dr Lagneau Bouillon Paliseul",
      "MCR Marche": "Nom: Maison Croix-Rouge Marche",
      "MCR Gembloux": "Nom: Maison Croix-Rouge Gembloux",
      "MCR Namur": "Nom: Maison Croix-Rouge Namur",
      "MCR Florenville": "Nom: Maison Croix-Rouge Florenville-Chiny",
      "MCR Rochefort": "Nom: Maison Croix-Rouge Rochefort",
    };

    nomMaison = mcrConfig[resultMcr] || "";
    statutMaison = `inscrite à la banque carrefour des entreprises sous le numéro : ${profilInfo?.["Numéro BCE"] || "0406.729.809"}`;
    formeMaison =
      profilInfo?.["Exploitant BDC"] ||
      "Exploitant un service de transport à finalité spéciale en vertu d'une autorisation portant le n° TC727";

    // re initialize necessary lists
    phoneNumbers = [];
    destination = [];
    const vehiculeAller =
      mission?.PriseEnCharge_VéhiculeUtilisé || "Non renseigné";
    const vehiculeRetour =
      mission?.PriseEnCharge_VéhiculeUtiliséRetour || "Non renseigné";
    //push the starting adress, price of mission and amount of km

    const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";

    const phoneDepart = mission.TelephoneNumber
      ? ` (${mission.TelephoneNumber})`
      : "";
    depart.push(`${mission.CC_AdresseDépart}${deno}${phoneDepart}`);
    let collectionLength = mission.CC_Destinations;
    for (let j = 1; j <= collectionLength; j++) {
      let currentDestination = mission[`CC_Destinations|100|Adresse|${j}`];
      const phoneDest = mission[`CC_Destinations|920|Telephone|${j}`]
        ? ` (${mission[`CC_Destinations|920|Telephone|${j}`]})`
        : "";
      const denomination = mission[`CC_Destinations|110|Dénomination|${j}`]
        ? ` - ${mission[`CC_Destinations|110|Dénomination|${j}`]}`
        : "";
      destination.push(
        `Destination : ${currentDestination}${denomination}${phoneDest}`,
      );
    }

    // categorie and tpmr
    mission.TPMR === "Oui" ? tpmr.push("Oui") : tpmr.push("Non");
    categorie.push(`${mission.Catégorie}`);

    /*HERE WE GET / CONCAT AND PUSH THE ADRESS OF FACTURATION */
    const coordStreet = mission.CoorFactu_Rue;
    const coordTown = mission.CoorFactu_Ville;
    const coordNumber = mission.CoorFactu_Numéro;
    const coordCountry = mission.CoorFactu_Pays;
    // we concat it
    const coordAddress = `${coordStreet} ${coordNumber}, ${coordTown}, ${coordCountry}`;
    adressFactu.push(coordAddress);

    // here we get the motif and comment
    const motif = mission.Motif ? mission.Motif.replace(/"/g, '\\"') : "";
    const driverComment = mission.InformationsPourLeChauffeur || "";
    motifs.push(motif);
    comments.push(driverComment);

    /*HERE WE GET AND PUSH ALLER/ALLER-RETOUR */
    const isChecked = mission.CC_Retour;
    const isRDVPec = mission?.TypeTransport;
    if (isRDVPec === "Retour") {
      trajetInfo.push("Retour");
      vehicule.push(`Véhicule : ${vehiculeAller}`);
    } else if (isChecked === "true") {
      trajetInfo.push("Aller-Retour");
      if (vehiculeAller !== vehiculeRetour) {
        vehicule.push(
          `Véhicule Aller : ${vehiculeAller} - Véhicule Retour : ${vehiculeRetour}`,
        );
      } else {
        vehicule.push(`Véhicule : ${vehiculeAller}`);
      }
    } else {
      trajetInfo.push("Aller");
      vehicule.push(`Véhicule : ${vehiculeAller}`);
    }
    /*HERE WE GET AND PUSH THE RIGHT KM VALUE and we push mission price*/
    const calculKM = mission.CalculPrix_CalculKilomètrage;
    if (calculKM === "Du garage au garage") {
      km.push(`KM : ${mission.DistanceGarageGarage}`);
      missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
    } else if (calculKM === "Du lieu de départ au lieu de destination") {
      km.push(`KM : ${mission.DistanceDepartDestination}`);
      missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
    } else {
      km.push(`KM : ..............`);
      missionPrice.push(`Prix : ................`);
    }

    /* HERE WE PUSH THE CLIENT INFO and mission price*/
    number.push(`${mission.number}`);
    clientName.push(
      `${mission.PrénomSelected} ${mission.NomFormMission.toUpperCase()}`,
    );
    // push the drivers
    drivers.push(`${mission.chauffeurs}`);
    title.push(`Bon de commande`);
    // Créer une nouvelle entrée pour tableDatasClient
    tableDatasClient.push({
      headers: [""],
      rows: [],
    });

    // create a new entry for tableDataServices
    tableDataServices.push({
      headers: [""],
      rows: [],
    });

    // create a new entry for tablehours
    tableDataHours.push({
      headers: [""],
      rows: [],
    });

    /* PHONE NUMBERS SECTION */
    // for the phone numbers push in list
    let phoneLength = mission.Téléphones;
    for (let j = 1; j <= phoneLength; j++) {
      let phonenumber = mission[`Téléphones|2|Téléphone|${j}`]
        ? mission[`Téléphones|2|Téléphone|${j}`]
        : `....`;
      phoneNumbers.push(phonenumber);
    }
    // if there is a data push it in list
    if (phoneNumbers.length) {
      for (let p = 0; p < phoneNumbers.length; p++) {
        let indexPhone = 1;
        tableDatasClient[clientIndex].rows.push([
          `Contact ${indexPhone} Téléphone: ${phoneNumbers[p]}`,
        ]);
        indexPhone++;
      }
    } else {
      // else empty
      tableDatasClient[clientIndex].rows.push([
        `Contact No: ........................`,
      ]);
    }
    /********* table hours section**********/
    const priseEnCharge = mission.CC_Récupération;
    tableDataHours[clientIndex].rows.push([
      `Hr début de mission : ${
        mission.heureDebutMission || "..."
      } - Hr de prise en charge : ${priseEnCharge}`,
    ]);
    // loop to get every line
    for (let j = 1; j <= mission.CC_Destinations.length; j++) {
      console.log("mission", mission);
      let debutRDV = mission[`CC_Destinations|400|Début de RDV|${j}`] || "...";
      let finRDV = mission[`CC_Destinations|600|Fin de RDV|${j}`];
      if (isRDVPec === "Retour") {
        tableDataHours[clientIndex].rows.push([
          `Hr d'arrivée : ${mission[`CC_Destinations|300|Arrivée|${j}`] || "..."}`,
        ]);
      } else if (finRDV) {
        tableDataHours[clientIndex].rows.push([
          `Hr rendez-vous : ${debutRDV || ""} - Hr reprise client estimée : ${
            finRDV || "..."
          }`,
        ]);
      } else {
        tableDataHours[clientIndex].rows.push([
          `Hr rendez-vous : ${debutRDV || ""}`,
        ]);
      }
    }
    tableDataHours[clientIndex].rows.push([
      `Hr fin mission estimée : ${mission.heureFinMission || "..."}`,
    ]);

    /* SERVICES SECTION */
    for (let a = 0; a < destination.length; a++) {
      tableDataServices[clientIndex].rows.push([`${destination[a]}`]);
    }

    clientIndex++;

    // fill the result part of ods file with right info
    let feuilleInfoObj = {
      Number: `No de mission: ${number[0]}`,
      Title: title[0] || "",
      Drivers: drivers[0] || "",
      Motif: motifs[0] || "",
      Comment: comments[0] || "",
      ClientName: clientName[0] || "",
      LieuDepart: `Départ : ${depart[0] || ""}`,
      Categorie: `Catégorie : ${categorie[0] || ""}`,
      TPMR: `TPMR : ${tpmr[0] || ""}`,
      Date: `Date : ${dateFormatee}`,
      NomMaison: nomMaison || "",
      Km: km[0] || "",
      Prix: missionPrice[0] || "",
      Trajet: trajetInfo[0] || "",
      AdresseFacturation: `Adresse de facturation : ${adressFactu[0] || ""}`,
      StatutMaison: statutMaison || "",
      Forme: formeMaison || "",
      AdresseMaison: adresseMaison || "",
      Vehic: vehicule[0] || "",
    };
    // ⬇️ Le stringify ici est sûr
    result.push(JSON.stringify(feuilleInfoObj));
    /*
    let feuilleInfo;
    feuilleInfo = `{ "Number": "No de mission: ${number[0]}", "Title": "${title[0]}", "Drivers": "${drivers[0]}", "Motif": "${motifs[0]}", "Comment": "${comments[0]}",
          "ClientName": "${clientName[0]}", "LieuDepart": "Départ : ${depart[0]}", "Categorie": "Catégorie : ${categorie[0]}",
          "TPMR": "TPMR : ${tpmr[0]}",  
          "Date": "Date : ${dateFormatee}", "NomMaison": "${nomMaison}", "Km": "${km[0]}", "Prix": "${missionPrice[0]}", "Trajet": "${trajetInfo[0]}", 
          "AdresseFacturation": "Adresse de facturation : ${adressFactu[0]}",
          "StatutMaison": "${statutMaison}", "Forme": "${formeMaison}", "AdresseMaison": "${adresseMaison}",}`;
    result.push(feuilleInfo); // return it to result list
    */

    // push the data in the
    tablesJoined.push([
      tableDatasClient[0],
      tableDataServices[0],
      tableDataHours[0],
    ]);

    // api call to generate the pdf
    const res10 = await api({ local: true }).post(
      "document/download/sheets/BonDeCommande/pdf/BonDeCommande",
      {
        sheets: [
          {
            name: "BonDeCommande",
            datas: result,
            sheetNames: title,
            tableDatas: tablesJoined,
          },
        ],
      },
    );

    if (res10 !== undefined) {
      // gets the url name and file name
      const fileUrl = res10.data.fileUrl;
      if (fileUrl) {
        // Extract the PDF path and filename
        // custom name for file
        const newFilename = `BDC_${date}_${
          mission.number
        }_${mission.NomFormMission.toUpperCase()}_${
          mission.PrénomSelected
        }.pdf`;
        // If a valid PDF path exists, create a download link

        pdfList.push({ path: fileUrl, filename: newFilename }); // Use the new filename here
      } else {
        console.error("URL du fichier non trouvée dans la réponse.");
      }
    }
  } catch (error) {
    console.log("ERREUR", error);
  }
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
                  <div>Génération en cours</div>
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

// the main function
const main = async () => {
  console.log("MAIN");
  showPopupLoadingWaiting();
  const profilInfo = await getProfil();
  console.log("PROFIL INFO ", profilInfo);
  const { missionList, identifiantBene } = await getMissionData(date);
  const [dispoList, vehiculeList] = await Promise.all([
    fetchDispoData(date),
    fetchVehiculesData(),
  ]);
  console.log("DISPOLIST ", dispoList);
  console.log("VEHICULE LIST ", vehiculeList);
  let listOfMissions = await getBeneficiaryData(missionList, identifiantBene);
  /***********FILTER ELEMENTS TO GET ONLY MISSION WITH VEHICLE ASSIGNED  */
  const driverVehicle = vehiculeList.map((element) => {
    return dispoList.filter(
      (elementDispo) =>
        element.Ident_Libellé === elementDispo.PriseEnCharge_VéhiculeUtilisé,
    );
  });

  const allDriverVehicles = driverVehicle.flat();

  listOfMissions.forEach((mission) => {
    console.log("DRIVER VEHICLE ", driverVehicle);
    // Trouver les chauffeurs pour le véhicule utilisé à l'aller
    const chauffeursAller = allDriverVehicles
      .filter(
        (dispo) =>
          dispo.PriseEnCharge_VéhiculeUtilisé ===
          mission.PriseEnCharge_VéhiculeUtilisé,
      )
      .map((dispo) => `${dispo.PrénomSelected} ${dispo.Nom}` || "")
      .filter(Boolean);

    let chauffeursRetour = [];
    if (mission.CC_Retour === "true") {
      // Trouver les chauffeurs pour le véhicule utilisé au retour
      chauffeursRetour = allDriverVehicles
        .filter(
          (dispo) =>
            dispo.PriseEnCharge_VéhiculeUtilisé ===
            mission.PriseEnCharge_VéhiculeUtiliséRetour,
        )
        .map((dispo) => `${dispo.PrénomSelected} ${dispo.Nom}`)
        .filter(Boolean);
    }

    // Fusionner les deux listes de chauffeurs
    const allChauffeurs = [...chauffeursAller, ...chauffeursRetour];

    // Supprimer les doublons (optionnel)
    const uniqueChauffeurs = [...new Set(allChauffeurs)];

    // Concaténer avec " & "
    const chauffeursConcat = uniqueChauffeurs.join(" & ");
    // Ajouter la propriété à la mission
    mission.chauffeurs = chauffeursConcat;
  });

  console.log("LIST OF MISSIONS ", listOfMissions);
  if (listOfMissions) {
    // for the groupé
    if (typeTelechargement === "Groupé") {
      await createPDF(listOfMissions, profilInfo);
      await updateStatusMission(listOfMissions);
    } else {
      for (const mission of listOfMissions) {
        await createPDFIndividuel(mission, profilInfo);
      }

      await updateStatusMission(listOfMissions);
      console.log("PDF LIST ", pdfList);
      downloadAllPDFsAsZip();
    }
  } else {
    console.log("Aucune mission trouvée pour cette date");
  }
  hidePopupLoading();
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
