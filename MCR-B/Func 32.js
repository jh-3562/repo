console.log("Function 32", context);
const safe = (v) => v ?? "";
const isTrue = (value) => value === true || value === "true";
const hasActiveReturn = (mission) =>
  isTrue(mission?.CC_Retour) && !isTrue(mission?.RetourAnnulé);
const getDestinationsCount = (mission) => {
  if (Array.isArray(mission?.CC_Destinations)) {
    return mission.CC_Destinations.length;
  }
  const count = Number(mission?.CC_Destinations);
  return Number.isInteger(count) && count > 0 ? count : 0;
};
const getDestinationField = (mission, index, field) =>
  mission?.[`CC_Destinations|${field}|${index}`] ??
  mission?.CC_Destinations?.[index - 1]?.[`CC_Destinations|${field}`];
// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

/**
 *  Return corresponding day
 * @param {*} dateStr
 * @returns
 */
const getWeekday = (dateStr) => {
  const date = new Date(dateStr);
  const dayIndex = date.getDay();

  // Days of the week in French
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const result = days[dayIndex];
  // console.log("DEBUG - result of getWeekday", days[dayIndex]);

  return result;
};

// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const date = store.pageContentStore.processData[0].edits.DateBatchstep;
const typeTelechargement =
  store.pageContentStore.processData[0].edits.TypeTelechargement;
const resultMcr = getArea();

const rangeDateDebut = "0001-01-01|" + date;
const rangeDateFin = date + "|9999-12-31";

const formatDispobilite = (dispo, date) => {
  const documents = dispo;

  const formatedDocuments = [];
  // console.log("DEBUG - date", date);
  documents.forEach((doc) => {
    const data = doc;

    //console.log('data', data)

    const exceptions = data.Exception_Récurrence
      ? data.Exception_Récurrence.split("|").map(
          (date) => new Date(date).toISOString().split("T")[0],
        )
      : [];

    if (exceptions.includes(date)) {
      return;
    }
    if (
      data.IdentifiantFormulaireRécurrence &&
      data.Planification_Date === date
    ) {
      const newData = {
        ...data,
        Planification_Récurrence: "Une seule fois",
      };
      formatedDocuments.push({
        ...doc,
        data: JSON.stringify(newData),
      });
    } else if (data.Planification_Récurrence === "Une seule fois") {
      formatedDocuments.push({
        ...doc,
      });
    } else if (data.Planification_Récurrence === "Par semaine") {
      const day = getWeekday(date);
      const days = data.Planification_Répéter.split("|");

      if (days.includes(day)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    } else if (data.Planification_Récurrence === "Par jour spécifique") {
      const days = data.Planification_MultiDate.split("|");
      if (days.includes(date)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    }
  });

  return formatedDocuments;
};

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
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

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

const apiFiltersDispo2 = [
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

// fetch the data of missions
const fetchMissionsData = async (date) => {
  try {
    /* console.log(
      "DEBUG - ---------------------------MISSIONS---------------------------",
    ); */
    // filter by id
    const res2 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMission,
    });
    const idsMission = res2.data.ids;

    // get mission info
    const res3 = await api({ local: true }).post("document/id", {
      ids: idsMission,
    });
    // parse the info
    const missionList = res3.data.documents.map((documentMission) =>
      JSON.parse(documentMission.data),
    );

    const interpretedResult = await recurrence.getDocuments(
      apiFiltersMission,
      [date, date],
      api,
    );
    const result = interpretedResult.data.documents.map((documentMission) => {
      const dataParsed = JSON.parse(documentMission.data);
      return {
        ...dataParsed,
        NUMBER: documentMission.number,
      };
    });
    /* console.log("DEBUG - Missions récupérées", {
      date,
      count: result.length,
      missions: result.map((mission) => ({
        number: mission.NUMBER,
        status: mission.STATUS,
        outboundVehicle: mission.PriseEnCharge_VéhiculeUtilisé,
        returnVehicle: mission.PriseEnCharge_VéhiculeUtiliséRetour,
        returnEnabled: mission.CC_Retour,
        returnCanceled: mission.RetourAnnulé,
      })),
    }); */
    return result;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// get the availability data
const fetchDispoData = async (date) => {
  try {
    /* console.log(
      "DEBUG - ---------------------------AVAILABILITIES---------------------------",
    ); */
    const res = await recurrence.getDocuments(
      apiFiltersDispo2,
      [date, date],
      api,
    );
    // console.log("DEBUG - recurrence.getDocuments", res);

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

// const for recurrent terms
const surAppel = "SUR APPEL";
const déposer = "Déposer";
const retour = "Retour";
const debutRDV = "Heure de RDV";
const finRDV = "Fin de RDV";
const priseEnCharge = "Prise en charge";
// Initialize some lists
const feuilleDeRoute = [];
const dataDate = [];
const vehiculeMarqueList = [];
const vehiculeTypeList = [];
const vehiculeIdentList = [];
const chauffNomDispo = [];
const missionLieuDepart = [];
const missionLieuArrivee = [];
const missionRecup = [];
const missionArrivee = [];
const titleInfo = [];
// get the right info and creates a pdf (feuille de route)
const createPDF = async (listeTotale) => {
  try {
    // Create table data for the PDF
    const tableDataMissionInfos = [];
    const tableDatasMission = [];
    const tableDataVehicules = [];
    const tableDataMissionVehicule = [];
    // var for when there is no drivers
    let noDriverPrenom = "Aucun";
    let noDriverNom = "Chauffeur";
    // gets the date
    let date =
      listeTotale[0]?.missions[0]?.Planification_Date ||
      listeTotale[0]?.missionsRetour[0]?.Planification_Date;
    // reformat the date
    let dateParts = date.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    let result = [];
    // necessary index
    let i = 0;
    let missionIndex = 0;
    let vehiculeIndex = 0;
    let infoIndex = 0;

    // gets every element of the total list (that contains every related infos)
    listeTotale.forEach((data) => {
      let driverData = data.drivers;
      let missionData = data.missions;
      let missionRetourData = data.missionsRetour;

      // re initialize for next foreach data
      const places = [];
      const nomBenif = [];
      const heures = [];
      const détails = [];
      const vehiculeMarqueList = [];
      const vehiculeTypeList = [];
      const vehiculeImmatList = [];
      const missionLieuDepart = [];
      const materiel = [];
      const nbAccompagnateurs = [];
      const detailsForDriver = [];
      const beneficiaryName = [];
      // verifies if there is data for a driver if yes add to list
      // if no driver available takes default value
      if (driverData.length === 0) {
        chauffNomDispo.push(`${noDriverPrenom} ${noDriverNom}`);
      } else {
        // returns the name of the available driver
        let driversList = driverData.map((driver) => {
          let driverPrenom = driver.PrénomSelected;
          let driverNom = driver.Nom || "";
          let driverStart = driver.InformationsAdmin_DateHeureDébut.split(
            "T",
          )[1].slice(0, 5);
          let driverEnd = driver.InformationsAdmin_DateHeureFin.split(
            "T",
          )[1].slice(0, 5);
          return `${driverPrenom} ${
            driverNom ? driverNom.toUpperCase() : ""
          } | ${driverStart} - ${driverEnd}`;
        });
        // if more than one driver available we concat
        if (driverData.length > 1) {
          chauffNomDispo.push(driversList.join(" & "));
        } else {
          chauffNomDispo.push(driversList);
        }
      }
      /********** PARSE THROUGH MISSION FOR ALLER DATA **************/
      // parse through every mission data
      missionData.forEach((mission) => {
        // constant needed
        const {
          MatérielAPrévoir,
          CC_NbAccompagnateur,
          PrénomSelected,
          NomFormMission,
          InformationsPourLeChauffeur,
          PriseEnCharge_LieuDépartChauffeur,
          CC_Retour,
          CC_Arrivée,
          PriseEnCharge_VéhiculeUtiliséRetour,
          PriseEnCharge_VéhiculeUtilisé,
          checkboxBeneKg,
          MobilitéDuBénéficiaire,
          TPMR,
          Motif,
          CheckboxResterAvecBene,
          NUMBER,
          CC_AdresseDépart,
          Catégorie,
        } = mission;
        const isRDVPec =
          mission?.TypeTransport === "RDV au lieu de prise en charge"
            ? true
            : false;
        const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";
        // console.log("DEBUG - MISSION INFO TEST", mission);
        // gets the value of checkbox bene,
        let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
        let checkboxBeneValue =
          CheckboxResterAvecBene === "true"
            ? "Rester sur place avec le bénéficiaire"
            : "Non";
        let motifValue = Motif ? Motif : "...";
        let detailsToAdd;
        if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
          detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        } else {
          detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        }

        /* here we push the mission information for 3rd table */
        // if we have the info push it else push ...
        beneficiaryName.push(
          `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
        );
        MatérielAPrévoir
          ? materiel.push(MatérielAPrévoir)
          : materiel.push("Aucun");
        CC_NbAccompagnateur
          ? nbAccompagnateurs.push(CC_NbAccompagnateur)
          : nbAccompagnateurs.push("...");
        if (
          hasActiveReturn(mission) &&
          mission.PriseEnCharge_VéhiculeUtilisé ===
            mission.PriseEnCharge_VéhiculeUtiliséRetour
        ) {
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Aller-Retour  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(`Aller-Retour  ${detailsToAdd}`);
        } else if (
          hasActiveReturn(mission) &&
          mission.PriseEnCharge_VéhiculeUtilisé !==
            mission.PriseEnCharge_VéhiculeUtiliséRetour
        ) {
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Aller - Retour effectué par un autre véhicule  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(
                `Aller - Retour effectué par un autre véhicule  ${detailsToAdd}`,
              );
        } else {
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Aller  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(`Aller  ${detailsToAdd}`);
        }

        // starting place of mission
        missionLieuDepart.push(PriseEnCharge_LieuDépartChauffeur);
        // for the size of the collection
        let destinationsCount = getDestinationsCount(mission);
        const phoneDepart = mission.TelephoneNumber
          ? ` (${mission.TelephoneNumber}) `
          : "";
        // push the first arrival infos
        places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
        nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
        heures.push(mission.CC_Récupération);
        isRDVPec
          ? détails.push("RDV Prise en charge")
          : détails.push(priseEnCharge);

        /*** PARSE THROUGH MISSION DESTINATIONS TO FILL THE TABLE  *********/
        for (let j = 1; j <= destinationsCount; j++) {
          // dynamic keys to get the right line
          let destinationAdresse = getDestinationField(
            mission,
            j,
            "100|Adresse",
          );
          let phoneDestination = getDestinationField(
            mission,
            j,
            "920|Telephone",
          );
          let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
          let destinationDebarquement = getDestinationField(
            mission,
            j,
            "300|Arrivée",
          );
          let destinationEmbarquement = getDestinationField(
            mission,
            j,
            "700|Récupération",
          );
          let destinationDenomination = getDestinationField(
            mission,
            j,
            "110|Dénomination",
          );
          const denomination = destinationDenomination
            ? ` - ${destinationDenomination}`
            : "";
          // if we have info for unloading
          if (
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            destinationDebarquement
          ) {
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationDebarquement);
            isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
          }
          // if we have info for loading
          if (
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            destinationEmbarquement
          ) {
            if (
              /*if we are at last item of collection with a return from different car
                               dont take value next car will have it  */
              j == destinationsCount &&
              (!hasActiveReturn(mission) ||
                PriseEnCharge_VéhiculeUtilisé !==
                  PriseEnCharge_VéhiculeUtiliséRetour)
            ) {
              // do nothing in that case
              return;
            } else {
              // take the info normally
              places.push(`${destinationAdresse}${denomination}${phoneDest}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(destinationEmbarquement);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            }
          }

          // if the driver is on call
          if (
            // if on call for final loading and unloading
            j == destinationsCount &&
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            hasActiveReturn(mission) &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            PriseEnCharge_VéhiculeUtilisé ===
              PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationDebarquement &&
            !destinationEmbarquement &&
            !CC_Arrivée
          ) {
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Dépose") : détails.push(retour);
          } else if (
            // if on call for final loading only
            j == destinationsCount &&
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            hasActiveReturn(mission) &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            PriseEnCharge_VéhiculeUtilisé ===
              PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationDebarquement &&
            !destinationEmbarquement &&
            CC_Arrivée
          ) {
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
          } else if (
            // if on call for final unloading only
            j == destinationsCount &&
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            hasActiveReturn(mission) &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            PriseEnCharge_VéhiculeUtilisé ===
              PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationDebarquement &&
            destinationEmbarquement &&
            !CC_Arrivée
          ) {
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
          }
        }
        // if there is a return with same car do as normal
        if (
          hasActiveReturn(mission) &&
          CC_Arrivée &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtiliséRetour === PriseEnCharge_VéhiculeUtilisé
        ) {
          places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(CC_Arrivée);
          détails.push(retour);
        }
      });

      // verifies if there is a return data
      // if not do nothing
      if (missionRetourData.length === 0) {
      } else {
        /*******************PARSE THROUGH MISSION RETURN ONLY ***********/
        missionRetourData.forEach((missionRetour) => {
          if (!hasActiveReturn(missionRetour)) return;
          // console.log("DEBUG - WE HAVE A RETURN ");
          // constants needed for missionRetour 3rd table informations
          const {
            CC_AdresseDépart,
            CC_Arrivée,
            CC_Destinations,
            PriseEnCharge_VéhiculeUtiliséRetour,
            PriseEnCharge_VéhiculeUtilisé,
            MatérielAPrévoir,
            CC_NbAccompagnateur,
            PrénomSelected,
            NomFormMission,
            InformationsPourLeChauffeur,
            checkboxBeneKg,
            MobilitéDuBénéficiaire,
            TPMR,
            Motif,
            CheckboxResterAvecBene,
            NUMBER,
            Catégorie,
          } = missionRetour;
          const isRDVPec =
            missionRetour?.TypeTransport === "RDV au lieu de prise en charge"
              ? true
              : false;
          const deno = missionRetour.Dénomination
            ? ` - ${missionRetour.Dénomination}`
            : "";
          const phoneDepart = missionRetour.TelephoneNumber
            ? ` (${missionRetour.TelephoneNumber})`
            : "";
          let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
          let motifValue = Motif ? Motif : "...";
          let checkboxBeneValue =
            CheckboxResterAvecBene === "true"
              ? "Rester sur place avec le bénéficiaire"
              : "Non";
          let detailsToAdd;
          if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
            detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
          } else {
            detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
          }
          let destinationsReturnCount = getDestinationsCount(missionRetour);
          /* here we push the mission information for 3rd table */
          if (
            missionRetour.CC_Retour === "true" &&
            missionRetour.PriseEnCharge_VéhiculeUtilisé !==
              missionRetour.PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            // if we have the info push it else push ...
            beneficiaryName.push(
              `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
            );
            MatérielAPrévoir
              ? materiel.push(MatérielAPrévoir)
              : materiel.push("Aucun");
            CC_NbAccompagnateur
              ? nbAccompagnateurs.push(CC_NbAccompagnateur)
              : nbAccompagnateurs.push("...");
            InformationsPourLeChauffeur
              ? detailsForDriver.push(
                  `Retour  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
                )
              : detailsForDriver.push(`Retour  ${detailsToAdd}`);
          }
          // parse through every collection list but only need last line (j == destinationReturnCount)
          for (let j = 1; j <= destinationsReturnCount; j++) {
            // console.log("DEBUG - TESTRETURN");
            let destinationReturnEmbarquement = getDestinationField(
              missionRetour,
              j,
              "700|Récupération",
            );
            let phoneDestination = getDestinationField(
              missionRetour,
              j,
              "920|Telephone",
            );
            let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
            let destinationReturnAdresse = getDestinationField(
              missionRetour,
              j,
              "100|Adresse",
            );
            let destinationDenomination = getDestinationField(
              missionRetour,
              j,
              "110|Dénomination",
            );
            const denomination = destinationDenomination
              ? ` - ${destinationDenomination}`
              : "";
            /* console.log("DEBUG - TEST VAR", {
              j,
              destinationsReturnCount,
              CC_AdresseDépart,
              CC_Arrivée,
              destinationReturnEmbarquement,
              PriseEnCharge_VéhiculeUtilisé,
              PriseEnCharge_VéhiculeUtiliséRetour,
            }); */

            if (
              // if loading and unloading info is there
              CC_AdresseDépart &&
              CC_Arrivée &&
              PriseEnCharge_VéhiculeUtiliséRetour &&
              destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A1");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(destinationReturnEmbarquement);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(CC_Arrivée);
              détails.push(retour);
            } else if (
              // if only loading info is there (SUR APPEL) for unloading
              CC_AdresseDépart &&
              PriseEnCharge_VéhiculeUtiliséRetour &&
              !CC_Arrivée &&
              destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A2");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(destinationReturnEmbarquement);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              détails.push(retour);
            } else if (
              // if only unloading info is there (SUR APPEL) for loading
              PriseEnCharge_VéhiculeUtiliséRetour &&
              CC_AdresseDépart &&
              CC_Arrivée &&
              !destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A3");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(CC_Arrivée);
              détails.push(retour);
            } else if (
              // if no info for both loading and unloading (SUR APPEL) for both
              PriseEnCharge_VéhiculeUtiliséRetour &&
              CC_AdresseDépart &&
              !CC_Arrivée &&
              !destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A4");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              détails.push(retour);
            }
          }
        });
      }

      // push the vehicule in the list
      let vehiculeMarque = data.vehicule.Ident_Marque;
      let vehiculeModèle = data.vehicule.Ident_Modèle;
      let vehiculeImmat = data.vehicule.Ident_NuméroImmat;
      let vehiculeIdent = data.vehicule.Ident_Libellé;
      vehiculeMarqueList.push(vehiculeMarque);
      vehiculeTypeList.push(vehiculeModèle);
      vehiculeImmatList.push(vehiculeImmat);
      vehiculeIdentList.push(vehiculeIdent);
      // title of feuille de route incremented every feuille de route
      let feuilleRoute = `Feuille de route de ${vehiculeIdentList[i]}`;
      titleInfo.push(feuilleRoute);

      // create a new entry for tableDataMissionInfos
      tableDataMissionInfos.push({
        headers: [
          "Bénéficiaire",
          "Accompagnateurs",
          "Matériel à prévoir",
          "Détails",
        ],
        rows: [],
      });

      // create a new entry for tableDatasMission
      tableDatasMission.push({
        headers: ["Détails", "Bénéficiaire", "Heure", "Emplacement"],
        rows: [],
      });
      // create a new entry for tableDataVehicules
      tableDataVehicules.push({
        headers: ["Marque", "Type", "Immatriculation"],
        rows: [],
      });

      // converts time in minutes except SUR APPEL
      const convertToMinutes = (heure) => {
        if (!heure || typeof heure !== "string") return Infinity;

        if (heure === "SUR APPEL") return Infinity;

        const parts = heure.split(":");
        if (parts.length !== 2) return Infinity;

        const [hours, minutes] = parts.map(Number);

        if (isNaN(hours) || isNaN(minutes)) return Infinity;

        return hours * 60 + minutes;
      };

      const sortedIndices = heures
        .map((heure, index) => ({
          index,
          minutes: convertToMinutes(heure),
        }))
        .sort((a, b) => a.minutes - b.minutes)
        .map((item) => item.index);

      // apply the right order of minutes
      const sortedDétails = sortedIndices.map((index) => détails[index]);
      const sortedNomBenif = sortedIndices.map((index) => nomBenif[index]);
      const sortedHeures = sortedIndices.map((index) => heures[index]);
      const sortedPlaces = sortedIndices.map((index) => places[index]);
      // we loop and add the mission infos to list
      for (let b = 0; b < détails.length; b++) {
        // new entry
        tableDatasMission[missionIndex].rows.push([
          safe(`${b + 1}. ${sortedDétails[b] || "..."}`),
          safe(sortedNomBenif[b] || "Bénéficiaire inconnu"),
          safe(sortedHeures[b] || "Heure inconnue"),
          safe(sortedPlaces[b] || "Lieu non renseigné"),
        ]);
      }
      /* console.log("DEBUG - Étapes assemblées pour le véhicule", {
        vehicle: data.vehicule.Ident_Libellé,
        missionNumbers: missionData.map((mission) => mission.NUMBER),
        returnMissionNumbers: missionRetourData.map(
          (mission) => mission.NUMBER,
        ),
        routeRows: tableDatasMission[missionIndex].rows,
      }); */
      missionIndex++;

      // this part is to give the same order of name to the tableDataMissionInfo
      const normalizeName = (name) => name?.split(" (")[0].trim();
      const orderedNames = [];
      const seen = new Set();

      for (const name of sortedNomBenif) {
        const key = normalizeName(name);

        if (!seen.has(key)) {
          seen.add(key);
          orderedNames.push(key);
        }
      }

      const infoIndexByName = {};

      for (let i = 0; i < beneficiaryName.length; i++) {
        const key = normalizeName(beneficiaryName[i]);

        if (infoIndexByName[key] === undefined) {
          infoIndexByName[key] = i;
        }
      }
      for (const name of orderedNames) {
        const i = infoIndexByName[name];
        if (i === undefined) continue;

        tableDataMissionInfos[infoIndex].rows.push([
          safe(beneficiaryName[i]),
          safe(nbAccompagnateurs[i]),
          safe(materiel[i]),
          safe(detailsForDriver[i]),
        ]);
      }
      /*
      // we loop and add the individual informations of mission to list
      for (let b = 0; b < nbAccompagnateurs.length; b++) {
        // new entry
        tableDataMissionInfos[infoIndex].rows.push([
          beneficiaryName[b],
          nbAccompagnateurs[b],
          materiel[b],
          detailsForDriver[b],
        ]);
      }
        */
      infoIndex++;
      // we loop and add the vehicles infos to list
      for (let b = 0; b < vehiculeMarqueList.length; b++) {
        // new entry
        tableDataVehicules[vehiculeIndex].rows.push([
          safe(vehiculeMarqueList[b]),
          safe(vehiculeTypeList[b]),
          safe(vehiculeImmatList[b]),
        ]);
      }
      vehiculeIndex++;
      i++;
    });

    // fill the result part of ods file with right info
    for (let b = 0; b < listeTotale.length; b++) {
      let feuilleInfo;
      feuilleInfo = `{ "Name": "Chauffeur(s): ${chauffNomDispo[b]}", "Title": "${titleInfo[b]}", "Date": "Date: ${dateFormatee}"}`;
      result.push(feuilleInfo); // return it to result list
    }
    // add to the megalist (missioninfo1, vehicleinfo1),....
    for (let m = 0; m < listeTotale.length; m++) {
      tableDataMissionVehicule.push([
        tableDatasMission[m],
        tableDataVehicules[m],
        tableDataMissionInfos[m],
      ]);
    }
    /* console.log(
      "DEBUG - ALL NEEDED PARAMS : DATA, SHEETNAMES, TABLEDATAS",
      result,
      titleInfo,
      tableDataMissionVehicule,
    ); */
    tableDataMissionVehicule.forEach((feuille, feuilleIndex) => {
      feuille.forEach((table, tableIndex) => {
        table.rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell == null || cell === "") {
              console.warn(`❗ Cellule vide trouvée :
            - Feuille : ${feuilleIndex + 1} (${titleInfo[feuilleIndex]})
            - Table : ${["Mission", "Véhicule", "Infos"][tableIndex]}
            - Ligne : ${rowIndex + 1}
            - Colonne : ${cellIndex + 1}
            - Valeur : ${cell}`);
            }
          });
        });
      });
    });

    // api call
    const res10 = await api({ local: true }).post(
      "document/download/sheets/FeuilleDeRoute/pdf/FeuilleDeRoute",
      {
        sheets: [
          {
            name: "RouteSheet",
            datas: result,
            sheetNames: titleInfo,
            tableDatas: tableDataMissionVehicule,
          },
        ],
      },
    );

    // gets the url name and file name
    const fileUrl = res10.data.fileUrl;
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
  } catch (error) {
    console.error("Erreur", error);
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

const downloadAllPDFsAsZip = async () => {
  const zip = new JSZip();

  for (const { path, filename } of pdfList) {
    try {
      const response = await fetch(path);
      // console.log("DEBUG - RESPONSE ", response);
      const blob = await response.blob();
      // console.log("DEBUG - BLOB ", blob);
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${filename}`, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `FDR_${date}.zip`);
  });
};

const pdfList = [];
// get the right info and creates a pdf (feuille de route)
const createPDFIndividual = async (mission) => {
  try {
    const vehiculeIdentList = [];
    const chauffNomDispo = [];
    const titleInfo = [];
    // Create table data for the PDF
    const tableDataMissionInfos = [];
    const tableDatasMission = [];
    const tableDataVehicules = [];
    const tableDataMissionVehicule = [];
    // var for when there is no drivers
    let noDriverPrenom = "Aucun";
    let noDriverNom = "Chauffeur";
    // gets the date
    let date =
      mission?.missions[0]?.Planification_Date ||
      mission?.missionsRetour[0]?.Planification_Date;
    // reformat the date
    let dateParts = date.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    let result = [];
    // necessary index
    let i = 0;
    let missionIndex = 0;
    let vehiculeIndex = 0;
    let infoIndex = 0;

    let driverData = mission.drivers;
    let missionData = mission.missions;
    let missionRetourData = mission.missionsRetour;

    // re initialize for next foreach data
    const places = [];
    const nomBenif = [];
    const heures = [];
    const détails = [];
    const vehiculeMarqueList = [];
    const vehiculeTypeList = [];
    const vehiculeImmatList = [];
    const missionLieuDepart = [];
    const materiel = [];
    const nbAccompagnateurs = [];
    const detailsForDriver = [];
    const beneficiaryName = [];
    // verifies if there is data for a driver if yes add to list
    // if no driver available takes default value
    if (driverData.length === 0) {
      chauffNomDispo.push(`${noDriverPrenom} ${noDriverNom}`);
    } else {
      // returns the name of the available driver
      let driversList = driverData.map((driver) => {
        let driverPrenom = driver.PrénomSelected;
        let driverNom = driver.Nom || "";
        let driverStart = driver.InformationsAdmin_DateHeureDébut.split(
          "T",
        )[1].slice(0, 5);
        let driverEnd = driver.InformationsAdmin_DateHeureFin.split(
          "T",
        )[1].slice(0, 5);
        return `${driverPrenom} ${
          driverNom ? driverNom.toUpperCase() : ""
        } | ${driverStart} - ${driverEnd}`;
      });
      // if more than one driver available we concat
      if (driverData.length > 1) {
        chauffNomDispo.push(driversList.join(" & "));
      } else {
        chauffNomDispo.push(driversList);
      }
    }
    /********** PARSE THROUGH MISSION FOR ALLER DATA **************/
    // parse through every mission data
    missionData.forEach((mission) => {
      // constant needed
      const {
        MatérielAPrévoir,
        CC_NbAccompagnateur,
        PrénomSelected,
        NomFormMission,
        InformationsPourLeChauffeur,
        PriseEnCharge_LieuDépartChauffeur,
        CC_Retour,
        CC_Arrivée,
        PriseEnCharge_VéhiculeUtiliséRetour,
        PriseEnCharge_VéhiculeUtilisé,
        checkboxBeneKg,
        MobilitéDuBénéficiaire,
        TPMR,
        Motif,
        CheckboxResterAvecBene,
        NUMBER,
        CC_AdresseDépart,
        Catégorie,
      } = mission;
      const isRDVPec =
        mission?.TypeTransport === "RDV au lieu de prise en charge"
          ? true
          : false;
      const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";
      // console.log("DEBUG - MISSION INFO TEST", mission);
      // gets the value of checkbox bene,
      let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
      let checkboxBeneValue =
        CheckboxResterAvecBene === "true"
          ? "Rester sur place avec le bénéficiaire"
          : "Non";
      let motifValue = Motif ? Motif : "...";
      let detailsToAdd;
      if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
        detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
      } else {
        detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
      }

      /* here we push the mission information for 3rd table */
      // if we have the info push it else push ...
      beneficiaryName.push(
        `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
      );
      MatérielAPrévoir
        ? materiel.push(MatérielAPrévoir)
        : materiel.push("Aucun");
      CC_NbAccompagnateur
        ? nbAccompagnateurs.push(CC_NbAccompagnateur)
        : nbAccompagnateurs.push("...");
      if (
        hasActiveReturn(mission) &&
        mission.PriseEnCharge_VéhiculeUtilisé ===
          mission.PriseEnCharge_VéhiculeUtiliséRetour
      ) {
        InformationsPourLeChauffeur
          ? detailsForDriver.push(
              `Aller-Retour  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
            )
          : detailsForDriver.push(`Aller-Retour  ${detailsToAdd}`);
      } else if (
        hasActiveReturn(mission) &&
        mission.PriseEnCharge_VéhiculeUtilisé !==
          mission.PriseEnCharge_VéhiculeUtiliséRetour
      ) {
        InformationsPourLeChauffeur
          ? detailsForDriver.push(
              `Aller - Retour effectué par un autre véhicule ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
            )
          : detailsForDriver.push(
              `Aller - Retour effectué par un autre véhicule ${detailsToAdd}`,
            );
      } else {
        InformationsPourLeChauffeur
          ? detailsForDriver.push(
              `Aller  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
            )
          : detailsForDriver.push(`Aller  ${detailsToAdd}`);
      }

      // starting place of mission
      missionLieuDepart.push(PriseEnCharge_LieuDépartChauffeur);
      // for the size of the collection
      let destinationsCount = getDestinationsCount(mission);
      const phoneDepart = mission.TelephoneNumber
        ? ` (${mission.TelephoneNumber}) `
        : "";
      // push the first arrival infos
      places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
      nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
      heures.push(mission.CC_Récupération);
      isRDVPec
        ? détails.push("RDV Prise en charge")
        : détails.push(priseEnCharge);

      /*** PARSE THROUGH MISSION DESTINATIONS TO FILL THE TABLE  *********/
      for (let j = 1; j <= destinationsCount; j++) {
        // dynamic keys to get the right line
        let destinationAdresse = getDestinationField(mission, j, "100|Adresse");
        let destinationDebarquement = getDestinationField(
          mission,
          j,
          "300|Arrivée",
        );
        let phoneDestination = getDestinationField(mission, j, "920|Telephone");
        let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
        let destinationEmbarquement = getDestinationField(
          mission,
          j,
          "700|Récupération",
        );
        let destinationDenomination = getDestinationField(
          mission,
          j,
          "110|Dénomination",
        );
        const denomination = destinationDenomination
          ? ` - ${destinationDenomination}`
          : "";
        // if we have info for unloading
        if (
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          destinationDebarquement
        ) {
          places.push(`${destinationAdresse}${denomination}${phoneDest}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(destinationDebarquement);
          isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
        }
        // if we have info for loading
        if (
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          destinationEmbarquement
        ) {
          if (
            /*if we are at last item of collection with a return from different car
                               dont take value next car will have it  */
            j == destinationsCount &&
            (!hasActiveReturn(mission) ||
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour)
          ) {
            // do nothing in that case
            return;
          } else {
            // take the info normally
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationEmbarquement);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
          }
        }

        // if the driver is on call
        if (
          // if on call for final loading and unloading
          j == destinationsCount &&
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          hasActiveReturn(mission) &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtilisé ===
            PriseEnCharge_VéhiculeUtiliséRetour &&
          destinationDebarquement &&
          !destinationEmbarquement &&
          !CC_Arrivée
        ) {
          places.push(`${destinationAdresse}${denomination}${phoneDest}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
          places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Dépose") : détails.push(retour);
        } else if (
          // if on call for final loading only
          j == destinationsCount &&
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          hasActiveReturn(mission) &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtilisé ===
            PriseEnCharge_VéhiculeUtiliséRetour &&
          destinationDebarquement &&
          !destinationEmbarquement &&
          CC_Arrivée
        ) {
          places.push(`${destinationAdresse}${denomination}${phoneDest}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
        } else if (
          // if on call for final unloading only
          j == destinationsCount &&
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          hasActiveReturn(mission) &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtilisé ===
            PriseEnCharge_VéhiculeUtiliséRetour &&
          destinationDebarquement &&
          destinationEmbarquement &&
          !CC_Arrivée
        ) {
          places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
        }
      }
      // if there is a return with same car do as normal
      if (
        hasActiveReturn(mission) &&
        CC_Arrivée &&
        PriseEnCharge_VéhiculeUtiliséRetour &&
        PriseEnCharge_VéhiculeUtiliséRetour === PriseEnCharge_VéhiculeUtilisé
      ) {
        places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
        nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
        heures.push(CC_Arrivée);
        détails.push(retour);
      }
    });
    // verifies if there is a return data
    // if not do nothing
    if (missionRetourData.length === 0) {
    } else {
      /*******************PARSE THROUGH MISSION RETURN ONLY ***********/
      missionRetourData.forEach((missionRetour) => {
        if (!hasActiveReturn(missionRetour)) return;
        // constants needed for missionRetour 3rd table informations
        const {
          CC_AdresseDépart,
          CC_Arrivée,
          CC_Destinations,
          PriseEnCharge_VéhiculeUtiliséRetour,
          PriseEnCharge_VéhiculeUtilisé,
          MatérielAPrévoir,
          CC_NbAccompagnateur,
          PrénomSelected,
          NomFormMission,
          InformationsPourLeChauffeur,
          checkboxBeneKg,
          MobilitéDuBénéficiaire,
          TPMR,
          Motif,
          CheckboxResterAvecBene,
          NUMBER,
          Catégorie,
        } = missionRetour;
        const isRDVPec =
          missionRetour?.TypeTransport === "RDV au lieu de prise en charge"
            ? true
            : false;
        const deno = missionRetour.Dénomination
          ? ` - ${missionRetour.Dénomination}`
          : "";
        const phoneDepart = missionRetour.TelephoneNumber
          ? ` (${missionRetour.TelephoneNumber})`
          : "";
        let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
        let motifValue = Motif ? Motif : "...";
        let checkboxBeneValue =
          CheckboxResterAvecBene === "true"
            ? "Rester sur place avec le bénéficiaire"
            : "Non";
        let detailsToAdd;
        if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
          detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        } else {
          detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        }
        let destinationsReturnCount = getDestinationsCount(missionRetour);
        /* here we push the mission information for 3rd table */
        if (
          missionRetour.CC_Retour === "true" &&
          missionRetour.PriseEnCharge_VéhiculeUtilisé !==
            missionRetour.PriseEnCharge_VéhiculeUtiliséRetour
        ) {
          // if we have the info push it else push ...
          beneficiaryName.push(
            `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
          );
          MatérielAPrévoir
            ? materiel.push(MatérielAPrévoir)
            : materiel.push("Aucun");
          CC_NbAccompagnateur
            ? nbAccompagnateurs.push(CC_NbAccompagnateur)
            : nbAccompagnateurs.push("...");
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Retour ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(`Retour  ${detailsToAdd}`);
        }
        // parse through every collection list but only need last line (j == destinationReturnCount)
        for (let j = 1; j <= destinationsReturnCount; j++) {
          let destinationReturnEmbarquement = getDestinationField(
            missionRetour,
            j,
            "700|Récupération",
          );
          let destinationReturnAdresse = getDestinationField(
            missionRetour,
            j,
            "100|Adresse",
          );
          let phoneDestination = getDestinationField(
            missionRetour,
            j,
            "920|Telephone",
          );
          let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
          let destinationDenomination = getDestinationField(
            missionRetour,
            j,
            "110|Dénomination",
          );
          const denomination = destinationDenomination
            ? ` - ${destinationDenomination}`
            : "";
          if (
            // if loading and unloading info is there
            CC_AdresseDépart &&
            CC_Arrivée &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationReturnEmbarquement);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(CC_Arrivée);
            détails.push(retour);
          } else if (
            // if only loading info is there (SUR APPEL) for unloading
            CC_AdresseDépart &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            !CC_Arrivée &&
            destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationReturnEmbarquement);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            détails.push(retour);
          } else if (
            // if only unloading info is there (SUR APPEL) for loading
            PriseEnCharge_VéhiculeUtiliséRetour &&
            CC_AdresseDépart &&
            CC_Arrivée &&
            !destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(CC_Arrivée);
            détails.push(retour);
          } else if (
            // if no info for both loading and unloading (SUR APPEL) for both
            PriseEnCharge_VéhiculeUtiliséRetour &&
            CC_AdresseDépart &&
            !CC_Arrivée &&
            !destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            détails.push(retour);
          }
        }
      });
    }

    // push the vehicule in the list
    let vehiculeMarque = mission.vehicule.Ident_Marque;
    let vehiculeModèle = mission.vehicule.Ident_Modèle;
    let vehiculeImmat = mission.vehicule.Ident_NuméroImmat;
    let vehiculeIdent = mission.vehicule.Ident_Libellé;
    vehiculeMarqueList.push(vehiculeMarque);
    vehiculeTypeList.push(vehiculeModèle);
    vehiculeImmatList.push(vehiculeImmat);
    vehiculeIdentList.push(vehiculeIdent);
    // title of feuille de route incremented every feuille de route
    let feuilleRoute = `Feuille de route de ${vehiculeIdentList[i]}`;
    titleInfo.push(feuilleRoute);

    // create a new entry for tableDataMissionInfos
    tableDataMissionInfos.push({
      headers: [
        "Bénéficiaire",
        "Accompagnateurs",
        "Matériel à prévoir",
        "Détails",
      ],
      rows: [],
    });

    // create a new entry for tableDatasMission
    tableDatasMission.push({
      headers: ["Détails", "Bénéficiaire", "Heure", "Emplacement"],
      rows: [],
    });
    // create a new entry for tableDataVehicules
    tableDataVehicules.push({
      headers: ["Marque", "Type", "Immatriculation"],
      rows: [],
    });

    // converts time in minutes except SUR APPEL
    const convertToMinutes = (heure) => {
      if (heure === "SUR APPEL") {
        return Infinity; // "SUR APPEL" always placed at the end
      }
      const [hours, minutes] = heure.split(":").map(Number);
      return hours * 60 + minutes; // return total minutes
    };

    // filter the hours to place it in order in table
    const sortedIndices = heures
      .map((heure, index) => {
        const minutes = convertToMinutes(heure);
        return { heure, index, minutes };
      })
      .sort((a, b) => a.minutes - b.minutes)
      .map((item) => item.index); // get the index

    // apply the right order of minutes
    const sortedDétails = sortedIndices.map((index) => détails[index]);
    const sortedNomBenif = sortedIndices.map((index) => nomBenif[index]);
    const sortedHeures = sortedIndices.map((index) => heures[index]);
    const sortedPlaces = sortedIndices.map((index) => places[index]);
    // we loop and add the mission infos to list
    for (let b = 0; b < détails.length; b++) {
      // new entry
      tableDatasMission[missionIndex].rows.push([
        safe(`${b + 1}. ${sortedDétails[b] || "..."}`),
        safe(sortedNomBenif[b] || "Bénéficiaire inconnu"),
        safe(sortedHeures[b] || "Heure inconnue"),
        safe(sortedPlaces[b] || "Lieu non renseigné"),
      ]);
    }
    /* console.log("DEBUG - Étapes assemblées pour le véhicule", {
      vehicle: mission.vehicule.Ident_Libellé,
      missionNumbers: missionData.map((item) => item.NUMBER),
      returnMissionNumbers: missionRetourData.map((item) => item.NUMBER),
      routeRows: tableDatasMission[missionIndex].rows,
    }); */
    missionIndex++;

    // this part is to give the same order of name to the tableDataMissionInfo
    const normalizeName = (name) => name?.split(" (")[0].trim();
    const orderedNames = [];
    const seen = new Set();

    for (const name of sortedNomBenif) {
      const key = normalizeName(name);

      if (!seen.has(key)) {
        seen.add(key);
        orderedNames.push(key);
      }
    }

    const infoIndexByName = {};

    for (let i = 0; i < beneficiaryName.length; i++) {
      const key = normalizeName(beneficiaryName[i]);

      if (infoIndexByName[key] === undefined) {
        infoIndexByName[key] = i;
      }
    }
    for (const name of orderedNames) {
      const i = infoIndexByName[name];
      if (i === undefined) continue;

      tableDataMissionInfos[infoIndex].rows.push([
        safe(beneficiaryName[i]),
        safe(nbAccompagnateurs[i]),
        safe(materiel[i]),
        safe(detailsForDriver[i]),
      ]);
    }
    infoIndex++;
    // we loop and add the vehicles infos to list
    for (let b = 0; b < vehiculeMarqueList.length; b++) {
      // new entry
      tableDataVehicules[vehiculeIndex].rows.push([
        safe(vehiculeMarqueList[b] || "Marque inconnue"),
        safe(vehiculeTypeList[b] || "Type inconnu"),
        safe(vehiculeImmatList[b] || "Non immatriculé"),
      ]);
    }
    vehiculeIndex++;
    i++;

    // fill the result part of ods file with right info

    let feuilleInfo;
    feuilleInfo = `{ "Name": "Chauffeur(s): ${chauffNomDispo[0]}", "Title": "${titleInfo[0]}", "Date": "Date: ${dateFormatee}"}`;
    result.push(feuilleInfo); // return it to result list

    // add to the megalist (missioninfo1, vehicleinfo1),....
    // console.log("DEBUG - TABLEDATAMISSION INFO ", tableDataMissionInfos);
    tableDataMissionVehicule.push([
      tableDatasMission[0],
      tableDataVehicules[0],
      tableDataMissionInfos[0],
    ]);
    // console.log("DEBUG - RESULT!! ", result);
    /* console.log(
      "DEBUG - ALL NEEDED PARAMS : DATA, SHEETNAMES, TABLEDATAS",
      result,
      titleInfo,
      tableDataMissionVehicule,
    ); */
    // api call
    const res10 = await api({ local: true }).post(
      "document/download/sheets/FeuilleDeRoute/pdf/FeuilleDeRoute",
      {
        sheets: [
          {
            name: "RouteSheet",
            datas: result,
            sheetNames: titleInfo,
            tableDatas: tableDataMissionVehicule,
          },
        ],
      },
    );
    // console.log("DEBUG - RES10 RAW =>", res10);
    // gets the url name and file name
    const fileUrl = res10.data.fileUrl;
    if (fileUrl) {
      // Extract the PDF path and filename
      // custom name for file
      const newFilename = `FDR_${date}_${vehiculeIdent}.pdf`;
      // If a valid PDF path exists, create a download link
      pdfList.push({ path: fileUrl, filename: newFilename }); // Use the new filename here
    } else {
      console.error("URL du fichier non trouvée dans la réponse.");
    }
  } catch (error) {
    console.error("Erreur", error);
  }
};

// main function
const main = async () => {
  showPopupLoadingWaiting();
  // store in constants the results
  const [missionList, dispoList, vehiculeList] = await Promise.all([
    fetchMissionsData(date),
    fetchDispoData(date),
    fetchVehiculesData(),
  ]);
  // console.log("DEBUG - dispoList After API:", dispoList);
  const listeTotale = [];
  /***********FILTER ELEMENTS TO GET ONLY MISSION WITH VEHICLE ASSIGNED  */
  vehiculeList.forEach((element) => {
    const driverVehicle = dispoList
      .filter(
        (elementDispo) =>
          element.Ident_Libellé === elementDispo.PriseEnCharge_VéhiculeUtilisé,
      )
      .sort((a, b) => {
        const heureA = a.InformationsAdmin_DateHeureDébut.split("T")[1].slice(
          0,
          5,
        );
        const heureB = b.InformationsAdmin_DateHeureDébut.split("T")[1].slice(
          0,
          5,
        );
        return heureA.localeCompare(heureB);
      });
    const missionVehicle = missionList.filter(
      (elementMission) =>
        element.Ident_Libellé === elementMission.PriseEnCharge_VéhiculeUtilisé,
    );
    const missionVehicleRetour = missionList.filter(
      (elementMission) =>
        hasActiveReturn(elementMission) &&
        element.Ident_Libellé ===
          elementMission.PriseEnCharge_VéhiculeUtiliséRetour,
    );
    /* console.log("DEBUG - Affectation au véhicule", {
      vehicle: element.Ident_Libellé,
      outboundMissionNumbers: missionVehicle.map((mission) => mission.NUMBER),
      returnMissionNumbers: missionVehicleRetour.map(
        (mission) => mission.NUMBER,
      ),
    }); */
    if (missionVehicle.length || missionVehicleRetour.length) {
      listeTotale.push({
        vehicule: element,
        drivers: driverVehicle,
        missions: missionVehicle,
        missionsRetour: missionVehicleRetour,
      });
    }
  });
  // 2️⃣ Ajouter les missions sans véhicule trouvé
  const missionSansVehicule = missionList.filter(
    (m) =>
      !vehiculeList.some(
        (v) =>
          v.Ident_Libellé === m.PriseEnCharge_VéhiculeUtilisé ||
          (hasActiveReturn(m) &&
            v.Ident_Libellé === m.PriseEnCharge_VéhiculeUtiliséRetour),
      ),
  );

  missionSansVehicule.forEach((mission) => {
    const drivers = dispoList.filter(
      (d) =>
        d.PriseEnCharge_VéhiculeUtilisé ===
        mission.PriseEnCharge_VéhiculeUtilisé,
    );
    listeTotale.push({
      vehicule: {
        Ident_Libellé: "Aucun véhicule",
        Ident_Marque: "-",
        Ident_Modèle: "-",
        Ident_NuméroImmat: "-",
      },
      drivers: drivers.length ? drivers : [],
      missions: [mission],
      missionsRetour: [],
    });
  });
  /* console.log(
    "DEBUG - Trajets préparés",
    listeTotale.map((route) => ({
      vehicle: route.vehicule.Ident_Libellé,
      missionNumbers: route.missions.map((mission) => mission.NUMBER),
      returnMissionNumbers: route.missionsRetour.map(
        (mission) => mission.NUMBER,
      ),
    })),
  ); */
  /*** IF AT LEAST 1 MISSION HAS A VEHICLE ASSIGNED */
  if (listeTotale.length) {
    if (typeTelechargement === "Groupé") {
      await createPDF(listeTotale);
    } else {
      for (const mission of listeTotale) {
        // console.log("DEBUG - MISSION INDIV INFO ", mission);
        await createPDFIndividual(mission);
      }
      downloadAllPDFsAsZip();
    }
  } else {
    return;
  }
  hidePopupLoading();
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
