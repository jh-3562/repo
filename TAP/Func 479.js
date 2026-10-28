console.log("Fonction 479 - assignerChauffeurTransports", context);

// ----- Constantes -----
const EDITS = store?.pageContentStore?.processData?.[0]?.edits;
const isVueMissionsToutes = window.location.href.includes("VueMissions_Toutes");
// Récupération des/de l'id(s) sélectionné (EDIT, CHECKBOX ou DOCDATA)
const CHECKBOX_UUIDS = isVueMissionsToutes
  ? ["a3048727-cb00-4414-be8b-28d088885c1d"] // VC Grille missions toutes
  : [
      "a76e0fa5-7268-4c9f-a1fd-7f198ef17169", // VC "Grilles mission auj"
      "1a618b3a-b9ed-4edf-889b-25dfaa9a5c8f", // VC "TableTransportsAValider"
    ];
const CHAUFFEURS_INFOS = {
  "Contrainte|1|Chauffeur": EDITS["Contrainte|1|Chauffeur"] || "",
  Chauffeur_Adresse: EDITS["Chauffeur_Adresse"] || "",
  Chauffeur_email: EDITS["Chauffeur_email"] || "",
  DestinationChauffeur: EDITS["DestinationChauffeur"] || "",
  TypeVehicule: EDITS["TypeVehicule"] || "",
  TypeVéhicule2: EDITS["TypeVéhicule2"] || "",
  LongitudeChauffeur: EDITS["LongitudeChauffeur"] || "",
  LatitudeChauffeur: EDITS["LatitudeChauffeur"] || "",
  ModeleRemuneration: EDITS["ModeleRemuneration"] || "",
};

let FORMIDS = new Set();

// 2. Ajoute tous les IDs dans `checked` pour chaque UUID
const checkedFormIds = CHECKBOX_UUIDS.flatMap(
  (uuid) => store?.pageContentStores?.[uuid]?.checked || [],
);
checkedFormIds.forEach((id) => FORMIDS.add(id));

// 1. Ajoute l'ID dans `active` s'il existe et qu'il n'y a aucun checked
if (store?.pageContentStore?.active?.[0] !== undefined && !checkedFormIds.length) {
  FORMIDS.add(store.pageContentStore.active[0]);
}

// 3. Ajoute l'ID dans `docData.FORMID` s'il existe
if (docData?.FORMID !== undefined) {
  FORMIDS.add(docData.FORMID);
}

// 4. Convertit le Set en tableau si nécessaire
const uniqueFORMIDS = Array.from(FORMIDS);

console.log("FORMIDS uniques :", uniqueFORMIDS);

// 4. Si aucun ID trouvé, FORMIDS sera vide
console.log("Tous les FORMIDS :", FORMIDS);

const PONTIAC_FORMLAYOUTID_TRANSPORT = "6d75ae79-ced2-4a83-a41e-da016f27e530";

// ----- Fonctions génériques -----
// Mise à jour de plusieurs documents
const updateManyDocuments = async (documents) => {
  try {
    console.log("DOCUMENTS ", documents);
    return await api({ local: true }).put("document/Many", {
      documents: documents,
    });
  } catch (error) {
    console.log("Erreur lors de la modification des documents.");
  }
};

// Création du corp de la mise à jour d'un document
const createUpdateDocument = (data, templateId, documentID, status) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId: templateId },
    documentID: documentID,
  };
};

// Récupération des ids filtrés et récupération des documents associés
const searchForms = async (filters, limit, onlyIds = false) => {
  try {
    const resIds = await api({ local: true }).post("document/id/filter", {
      filters,
    });

    const ids = resIds.data?.ids;

    if (!ids || ids.length === 0) {
      console.warn("Aucun ID trouvé avec les filtres :", filters);
      return [];
    }

    if (limit) ids.slice(0, limit);

    if (onlyIds)
      return ids.map((id) => {
        return {
          FORMID: id,
        };
      });

    const resDocs = await api({ local: true }).post("document/id", { ids });
    const documents = resDocs?.data?.documents;

    if (!documents) {
      throw new Error("Erreur lors de la récupération des documents");
    }

    return documents.map((doc, index) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error("Erreur dans searchForms :", error);
    throw error;
  }
};

const getRecurrenceInfo = (documentData) => {
  let tarifDebut, tarifFin;
  let isJourOnly = false;
  let isJourSpecifique = false;
  let isParSemaine = false;

  // --- Une seule fois ---
  if (
    documentData.Dates_TypeRéc === "Une seule fois" ||
    documentData.Dates_TypeRéc === "Occurrence" ||
    !documentData.Dates_TypeRéc
  ) {
    tarifDebut = `0001-12-31|${documentData.Dates_DateTransport}`;
    tarifFin = `${documentData.Dates_DateTransport}|9999-12-31`;
    isJourOnly = true;
  }
  // --- Recurrence par jour spécifique ---
  else if (documentData.Dates_TypeRéc === "Par jour spécifique") {
    const dateSplit = documentData.Dates_Multidates.split("|").map(
      (date) => new Date(date.trim()),
    );

    const minDate = new Date(Math.min(...dateSplit));
    const maxDate = new Date(Math.max(...dateSplit));

    const minDatetoString = minDate.toISOString().split("T")[0];
    const maxDatetoString = maxDate.toISOString().split("T")[0];
    console.log("Date la plus ancienne :", minDatetoString);
    console.log("Date la plus récente :", maxDatetoString);
    tarifDebut = `0001-12-31|${minDatetoString}`;
    tarifFin = `${maxDatetoString}|9999-12-31`;
    isJourSpecifique = true;
  }
  // --- Recurrence par semaine ---
  else {
    const debut = documentData.Dates_DebutRec;
    const fin = documentData.Dates_FinRec;
    tarifDebut = `0001-12-31|${debut}`;
    tarifFin = `${fin}|9999-12-31`;
    isParSemaine = true;
  }
  return { tarifDebut, tarifFin, isJourOnly, isJourSpecifique, isParSemaine };
};
const getTauxInfo = async (documentData) => {
  const { tarifDebut, tarifFin } = getRecurrenceInfo(documentData);

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Formule de rémunération",
      type: "TEXT",
    },
    {
      key: "tauxChauffeurStartDate",
      operator: "BETWEEN",
      value: tarifDebut,
      type: "DATE",
    },
    {
      key: "tauxChauffeurEndDate",
      operator: "BETWEEN",
      value: tarifFin,
      type: "DATE",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Actif",
      type: "TEXT",
    },
  ];

  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;
    const res2 = await api({ local: true }).post("document/id", { ids });
    const documents = res2?.data?.documents;
    return documents;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error.message);
    return [];
  }
};
const buildDocumentsUpdateTransportChauffeur = async (transportsDocuments, modele) => {
  const updates = [];

  for (const transportDocument of transportsDocuments) {
    let documents = [];

    if (modele) {
      const unfilteredDocs = await getTauxInfo(transportDocument);
      documents = unfilteredDocs.filter((doc) => {
        const parsed = JSON.parse(doc.data);
        return parsed.ModeleRemuneration === modele;
      });
    }

    if (documents.length === 1) {
      const data = JSON.parse(documents[0].data);
      CHAUFFEURS_INFOS["TauxChauffeur"] = data["Libellé"] || "";
      CHAUFFEURS_INFOS["CalculPrixTransportGroupe"] = data["CalculPrixTransportGroupe"] || "";
      CHAUFFEURS_INFOS["TAUX_KM_Chauffeur"] = data["TAUX_KM_Chauffeur"] || "";
      CHAUFFEURS_INFOS["MinimumPriceRenumeration"] = data["MinimumPriceRenumeration"] || "";
    }

    updates.push(
      createUpdateDocument(
        CHAUFFEURS_INFOS,
        PONTIAC_FORMLAYOUTID_TRANSPORT,
        transportDocument.FORMID,
        EDITS["Planifier_Statut"],
      ),
    );
  }

  return updates;
};

const geocodeWithBing = async (address) => {
  const result = {};
  try {
    const url = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
      address,
    )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`;
    const response = await fetch(url);
    const data = await response.json();
    result["coordinates"] = data.resourceSets[0].resources[0].geocodePoints[0].coordinates;
    result["municipality"] = data.resourceSets[0].resources[0].address.locality;
    result["country"] = data.resourceSets[0].resources[0].address.countryRegion;
    result["postalCode"] = data.resourceSets[0].resources[0].address.postalCode;
  } catch (error) {
    console.log("Error while geocoding with Bing:", error.message);
  }
  return result;
};
const geocodeWithGoogle = async (address) => {
  return new Promise((resolve) => {
    new google.maps.Geocoder().geocode({ address }, (results, status) => {
      const result = {};
      if (status === google.maps.GeocoderStatus.OK) {
        const location = results[0]?.geometry.location;
        result["coordinates"] = [location.lat(), location.lng()];
        result["municipality"] = results[0].address_components.find((component) =>
          component.types.includes("locality"),
        )?.long_name;
        result["country"] = results[0].address_components.find((component) =>
          component.types.includes("country"),
        )?.long_name;
        result["postalCode"] = results[0].address_components.find((component) =>
          component.types.includes("postal_code"),
        )?.long_name;
      }
      resolve(result);
    });
  });
};
const calculateDistanceWithGoogle = async (
  origin,
  destination,
  waypoints,
) => {
  return new Promise((resolve) => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          let totalDistance = 0;
          let totalDuration = 0;
          let DistanceAller = 0;
          let DistanceRetour = 0;
          let DureeLeg1 = 0;
          let DureeLeg2 = 0;
          const distances = [];
          const durations = [];
          const legs = result.routes[0]?.legs;
          if (legs) {
            for (const leg of legs) {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
              distances.push(leg.distance.value);
              durations.push(leg.duration.value);
            }
            DureeLeg1 = legs[0]?.duration.value || 0;
            DureeLeg2 = legs[1]?.duration.value || 0;
            DistanceRetour = legs[legs.length - 1].distance.value;
            DistanceAller = totalDistance - DistanceRetour;
          }

          resolve({
            totalDistance,
            distances,
            durations,
            totalDuration,
            DistanceAller,
            DistanceRetour,
            DureeLeg1,
            DureeLeg2,
          });
        } else {
          resolve(null);
        }
      },
    );
  });
};

const calculateTransportData = async (docData) => {
  const resultData = {};
  const getFiltersDatetimes = () => {
    const result = {};
    const recurrenceType = docData["Dates_TypeRéc"];

    let startDate = undefined;
    let endDate = undefined;
    switch (recurrenceType) {
      case "Une seule fois":
        startDate = docData["Dates_DateTransport"];
        endDate = docData["Dates_DateTransport"];
        break;
      case "Par mois":
        startDate = docData["Dates_DebutRec"];
        endDate = docData["Dates_FinRec"];
        break;
      case "Par semaine":
        startDate = docData["Dates_DebutRec"];
        endDate = docData["Dates_FinRec"];
        break;
      case "Par jour spécifique":
        const allDates = docData["Dates_Multidates"].split("|");
        startDate = allDates.reduce((date1, date2) =>
          new Date(date1) < new Date(date2) ? date1 : date2,
        );
        endDate = allDates.reduce((date1, date2) =>
          new Date(date1) < new Date(date2) ? date2 : date1,
        );
        break;
    }

    if (startDate != undefined) {
      result["DateTime_Start"] = startDate + "T00:00:00";
    }
    if (endDate != undefined) {
      result["DateTime_End"] = endDate + "T23:59:59";
    }
    return result;
  };

  const convertMinutesToHHMM = (totalMinutes) => {
    const totalMinutes24H = totalMinutes % (24 * 60);

    const hours = Math.floor(totalMinutes24H / 60);
    const minutes = Math.floor(totalMinutes24H % 60);

    const formattedTime =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0");
    return formattedTime;
  };

  const geocodeAddress = async (address, useBing) => {
    let geocodeResult = null;
    if (useBing) {
      geocodeResult = await geocodeWithBing(address);
    } else {
      geocodeResult = await geocodeWithGoogle(address);
    }
    return geocodeResult;
  };
  let startLatitude = 0.0;
  let startLongitude = 0.0;
  let endLatitude = 0.0;
  let endLongitude = 0.0;
  let stopoverLatitude = 0.0;
  let stopoverLongitude = 0.0;
  let kmForTotalPrice = 0;
  let kmForCustomerPrice = 0;
  let kmForCompanionPrice = 0;
  let dureeLeg1 = 0;
  let dureeLeg2 = 0;
  let dispatchDureeTransportTheo = 0;
  const isStopoverAtFirstTrip =
    docData["Transport_PositionArret"] === "À l'aller";
  const driverLatitude = docData["LatitudeChauffeur"];
  const driverLongitude = docData["LongitudeChauffeur"];
  const typeTransport = docData["TypeTransport"] || "ALLER";

  let distanceAllerKm = 0.0;
  let distanceRetourKm = 0.0;
  let durationAllerMin = 0.0;
  let durationRetourMin = 0.0;

  // Geocode the departure address
  let startLocationGeocodeResult = {
    coordinates: ["", ""],
    municipality: "",
    country: "",
    postalCode: "",
  };
  if (docData["Etablissement_Adresse"]) {
    if (docData["GeocodeBing1"] === "true") {
      startLocationGeocodeResult = await geocodeWithBing(
        docData["Etablissement_Adresse"],
      );
    } else {
      startLocationGeocodeResult = await geocodeWithGoogle(
        docData["Etablissement_Adresse"],
      );
    }
    if (
      startLocationGeocodeResult &&
      startLocationGeocodeResult.coordinates.length > 0
    ) {
      startLatitude = startLocationGeocodeResult.coordinates[0];
      startLongitude = startLocationGeocodeResult.coordinates[1];
    }
  }
  Object.assign(resultData, {
    startLatitude: startLocationGeocodeResult.coordinates[0].toString(),
    startLongitude: startLocationGeocodeResult.coordinates[1].toString(),
    Etablissement_Ville: startLocationGeocodeResult.municipality,
    Etablissement_Numero: startLocationGeocodeResult.streetNumber,
    Etablissement_Rue: startLocationGeocodeResult.street,
    Etablissement_Pays: startLocationGeocodeResult.country,
    Etablissement_CodePostal: startLocationGeocodeResult.postalCode,
  });
  // Geocode the destination address
  let endLocationGeocodeResult = {
    coordinates: ["", ""],
    municipality: "",
    country: "",
    postalCode: "",
  };
  if (docData["EtablissementDest_Adresse"]) {
    if (docData["GeocodeBing2"] === "true") {
      endLocationGeocodeResult = await geocodeWithBing(
        docData["EtablissementDest_Adresse"],
      );
    } else {
      endLocationGeocodeResult = await geocodeWithGoogle(
        docData["EtablissementDest_Adresse"],
      );
    }
    if (
      endLocationGeocodeResult &&
      endLocationGeocodeResult.coordinates.length > 0
    ) {
      endLatitude = endLocationGeocodeResult.coordinates[0];
      endLongitude = endLocationGeocodeResult.coordinates[1];
    }
  }
  Object.assign(resultData, {
    endLatitude: endLocationGeocodeResult.coordinates[0].toString(),
    endLongitude: endLocationGeocodeResult.coordinates[1].toString(),
    EtablissementDest_Ville: endLocationGeocodeResult.municipality,
    EtablissementDest_Numero: endLocationGeocodeResult.streetNumber,
    EtablissementDest_Rue: endLocationGeocodeResult.street,
    EtablissementDest_Pays: endLocationGeocodeResult.country,
    EtablissementDest_CodePostal: endLocationGeocodeResult.postalCode,
  });

  // Geocode the stopover address
  let stopOverLocationGeocodeResult = {
    coordinates: ["", ""],
    municipality: "",
    country: "",
    postalCode: "",
  };
  if (docData["AdresseDestination2"]) {
    if (docData["GeocodeBing3"] === "true") {
      stopOverLocationGeocodeResult = await geocodeWithBing(
        docData["AdresseDestination2"],
      );
    } else {
      stopOverLocationGeocodeResult = await geocodeWithGoogle(
        docData["AdresseDestination2"],
      );
    }
    if (
      stopOverLocationGeocodeResult &&
      stopOverLocationGeocodeResult.coordinates.length > 0
    ) {
      stopoverLatitude = stopOverLocationGeocodeResult.coordinates[0];
      stopoverLongitude = stopOverLocationGeocodeResult.coordinates[1];
    }
  }

  Object.assign(resultData, {
    Lat2Dest: stopOverLocationGeocodeResult.coordinates[0].toString(),
    Lgt2Dest: stopOverLocationGeocodeResult.coordinates[1].toString(),
  });

  const driverLocation =
    driverLatitude !== undefined && driverLongitude !== undefined
      ? { lat: Number(driverLatitude), lng: Number(driverLongitude) }
      : null;
  const startLocation =
    startLatitude !== 0.0 && startLongitude !== 0.0
      ? { lat: startLatitude, lng: startLongitude }
      : null;
  const endLocation =
    endLatitude !== 0.0 && endLongitude !== 0.0
      ? { lat: endLatitude, lng: endLongitude }
      : null;
  const stopoverLocation =
    stopoverLatitude !== 0.0 && stopoverLongitude !== 0.0
      ? { lat: stopoverLatitude, lng: stopoverLongitude }
      : null;
  // Ask distances to Google
  let map = [];
  if (endLocation && startLocation) {
    // Calculate distance for customer price
    const {
      totalDistance,
      distances,
      durations,
      totalDuration,
      DureeLeg1,
      DureeLeg2,
      DistanceAller,
      DistanceRetour,
    } = await calculateDistanceWithGoogle(startLocation, startLocation, [
      { location: endLocation, stopover: true },
    ]);
    // KM_THEORIQUE uses the round-trip distance regardless of TypeTransport.
    kmForCustomerPrice = Math.ceil(totalDistance / 1000);
    kmForCompanionPrice = Math.ceil(distances[0] / 1000);
    dureeLeg1 = (DureeLeg1 / 60).toFixed(0);
    dureeLeg2 = (DureeLeg2 / 60).toFixed(0);
    dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0);

    distanceAllerKm = Math.ceil(distances[0] / 1000);
    distanceRetourKm = Math.ceil(distances[1] / 1000);
    durationAllerMin = (durations[0] / 60).toFixed(0);
    durationRetourMin = (durations[1] / 60).toFixed(0);

    // Calculate distance for total price
    const effectiveStartLocation =
      driverLocation &&
      Number(driverLocation.lat) !== 0 &&
      Number(driverLocation.lng) !== 0
        ? driverLocation
        : startLocation;
    if (driverLocation) {
      if (stopoverLocation) {
        let stopoversForGoogle;
        if (isStopoverAtFirstTrip) {
          stopoversForGoogle =
            typeTransport === "ALLER/RETOUR"
              ? [
                  { location: startLocation, stopover: true },
                  { location: stopoverLocation, stopover: true },
                  { location: endLocation, stopover: true },
                  { location: startLocation, stopover: true },
                ]
              : [
                  { location: startLocation, stopover: true },
                  { location: stopoverLocation, stopover: true },
                  { location: endLocation, stopover: true },
                ];
        } else {
          stopoversForGoogle =
            typeTransport === "ALLER/RETOUR"
              ? [
                  { location: startLocation, stopover: true },
                  { location: endLocation, stopover: true },
                  { location: stopoverLocation, stopover: true },
                  { location: startLocation, stopover: true },
                ]
              : [
                  { location: startLocation, stopover: true },
                  { location: endLocation, stopover: true },
                  { location: stopoverLocation, stopover: true },
                ];
        }
        const {
          totalDistance,
          distances,
          durations,
          totalDuration,
          DureeLeg1,
          DureeLeg2,
        } = await calculateDistanceWithGoogle(
          effectiveStartLocation,
          effectiveStartLocation,
          stopoversForGoogle,
        );
        kmForTotalPrice = Math.ceil(totalDistance / 1000);
        dureeLeg1 = (DureeLeg1 / 60).toFixed(0);
        dureeLeg2 = (DureeLeg2 / 60).toFixed(0);
        dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0);

        distanceAllerKm = Math.ceil((distances[1] + distances[2]) / 1000);
        distanceRetourKm = Math.ceil(distances[3] / 1000);
        durationAllerMin = ((durations[1] + durations[2]) / 60).toFixed(0);
        durationRetourMin = (durations[3] / 60).toFixed(0);
      } else {
        const {
          totalDistance,
          distances,
          durations,
          totalDuration,
          DureeLeg1,
          DureeLeg2,
        } = await calculateDistanceWithGoogle(
          effectiveStartLocation,
          effectiveStartLocation,
          typeTransport === "ALLER/RETOUR"
            ? [
                { location: startLocation, stopover: true },
                { location: endLocation, stopover: true },
                { location: startLocation, stopover: true },
              ]
            : [
                { location: startLocation, stopover: true },
                { location: endLocation, stopover: true },
              ],
        );
        kmForTotalPrice = Math.ceil(totalDistance / 1000);
        dureeLeg1 = (DureeLeg1 / 60).toFixed(0);
        dureeLeg2 = (DureeLeg2 / 60).toFixed(0);
        dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0);
      }
    }
  }

  const transportationDate = docData["Dates_DateTransport"];
  let heureRdv = "00:00";
  let heurePriseEnCharge = "00:00";
  let heureRetour = "00:00";
  let dureeEmbarquement = 5;
  let dureeDebarquement = 5;
  let dureeTransport = dureeLeg1 + dureeLeg2 || 30;

  let dureeAttente = 0;
  let prioriteRdv = true;

  if (docData["EtablissementDest_HeureRDV"]) {
    heureRdv = docData["EtablissementDest_HeureRDV"];
    prioriteRdv = true;
  } else if (docData["Depart_HeurePEC"]) {
    heurePriseEnCharge = docData["Depart_HeurePEC"];
    prioriteRdv = false;
  }

  if (docData["DétailTransport_HeureRetour"]) {
    heureRetour = docData["DétailTransport_HeureRetour"];
  }

  if (docData["Etablissement_DureePEC"]) {
    dureeEmbarquement =
      parseInt(docData["Etablissement_DureePEC"]) || dureeEmbarquement;
  }

  if (docData["EtablissementDest_DureeDebarq"]) {
    dureeDebarquement =
      parseInt(docData["EtablissementDest_DureeDebarq"]) ||
      dureeDebarquement;
  }

  if (docData["Attente_Prevue"]) {
    let heureAttente = docData["Attente_Prevue"];
    let a = heureAttente.split(":");
    dureeAttente = +a[0] * 60 + +a[1];
  }

  let minutesRdv = 0;
  let minutesPec = 0;
  if (prioriteRdv === true) {
    let a = heureRdv.split(":");
    minutesRdv = +a[0] * 60 + +a[1];
    minutesPec =
      minutesRdv - (dureeEmbarquement + dureeTransport + dureeDebarquement);
  } else {
    let a = heurePriseEnCharge.split(":");
    minutesPec = +a[0] * 60 + +a[1];
    minutesRdv =
      minutesPec + dureeEmbarquement + dureeTransport + dureeDebarquement;
  }

  heurePriseEnCharge = convertMinutesToHHMM(minutesPec);
  heureRdv = convertMinutesToHHMM(minutesRdv);

  Object.assign(resultData, {
    KM_THEORIQUE: kmForCustomerPrice.toString(),
    Km_pour_calcul_de_la_totalite: kmForTotalPrice.toString(),
    KM_TH: kmForCompanionPrice.toString(),
    Dispatch_DuréeTransportTheo: dispatchDureeTransportTheo.toString(),
    //EtablissementDest_HeureRDV: heureRdv
  });

  if (typeTransport === "ALLER/RETOUR") {
    const minutesRetour = minutesRdv + dureeAttente;
    resultData["DétailTransport_HeureRetour"] =
      convertMinutesToHHMM(minutesRetour);
  } else {
    resultData["DétailTransport_HeureRetour"] = "";
  }

  Object.assign(resultData, getFiltersDatetimes());

  Object.assign(resultData, {
    DureeTrajetAllerMinute: durationAllerMin.toString(),
    DureeTrajetRetourMinute: durationRetourMin.toString(),
    DistanceTrajet: distanceAllerKm.toString(),
    DistanceTrajetRetour: distanceRetourKm.toString(),
  });

  return resultData;
};

const buildDocumentsUpdateTransportDistance = async (transportsDocuments) => {
  const updates = [];

  for (const transportDocument of transportsDocuments) {
    const updatedTransportDocument = {
      ...transportDocument,
      ...CHAUFFEURS_INFOS,
    };

    const transportData = await calculateTransportData(updatedTransportDocument);

    updates.push(
      createUpdateDocument(
        transportData,
        PONTIAC_FORMLAYOUTID_TRANSPORT,
        transportDocument.FORMID,
        EDITS["Planifier_Statut"],
      ),
    );
  }

  return updates;
};

const calculateAllPrices = (docData) => {
  const transportationCost = (
    distance,
    ratePerDistanceUnit,
    minimumPrice = null,
    maximumPrice = null,
  ) => {
    let transportationCost = distance * ratePerDistanceUnit;
    if (minimumPrice !== null) {
      transportationCost = Math.max(transportationCost, minimumPrice);
    }
    if (maximumPrice !== null) {
      transportationCost = Math.min(transportationCost, maximumPrice);
    }
    return transportationCost.toFixed(2);
  };
  const calculateTotalPrice = () => {
    const estimatedKMForTotalPriceCalculation = parseFloat(
      docData["Km_pour_calcul_de_la_totalite"],
    );
    const driverRatePerKM = parseFloat(docData["TAUX_KM_Chauffeur"]);
    return (estimatedKMForTotalPriceCalculation * driverRatePerKM).toFixed(2);
  };
  const calculateCustomerPrice = (totalityPrice) => {
    const calculatePriceWithoutTravelCompanion = (totalityPrice) => {
      const customerPricingType = docData["customerPricingType"];
      let priceWithoutTravelCompanion;
      switch (customerPricingType) {
        case "Manuel":
          priceWithoutTravelCompanion = parseFloat(docData["Dons_client"]);
          break;
        case "Paie la totalité":
          priceWithoutTravelCompanion = totalityPrice;
          break;
        case "Prix fixe":
          const customerPricingPrix = parseFloat(
            docData["customerPricingPrix"],
          );
          priceWithoutTravelCompanion = customerPricingPrix;
          break;
        case "Tarification par taux":
          const customerPricingTaux = parseFloat(
            docData["customerPricingTaux"],
          );
          const customerMinimumPrice = parseFloat(docData["MinimumPrice"]);
          const customerMaximumPrice = parseFloat(docData["MaximumPrice"]);
          const estimatedKMForCustomerPriceCalculation = parseFloat(
            docData["KM_THEORIQUE"],
          );

          priceWithoutTravelCompanion = transportationCost(
            estimatedKMForCustomerPriceCalculation,
            customerPricingTaux,
            Number.isNaN(customerMinimumPrice) ? null : customerMinimumPrice,
            Number.isNaN(customerMaximumPrice) ? null : customerMaximumPrice,
          );

          break;
      }
      return Math.round(priceWithoutTravelCompanion);
    };

    const calculateTravelCompanionPrice = () => {
      const estimatedKMForTravelCompanionPriceCalculation = parseFloat(
        docData["KM_THEORIQUE"],
      );
      const travelCompanionRatePerKM = parseFloat(
        docData["Taux km accompagnateur"],
      );
      const travelCompanionMinimumPrice = parseFloat(
        docData["Accompagnateur_paye_raison"],
      );

      const hasATravelCompanion = docData["Accompagné"] === "Oui";
      const travelCompanionPays =
        docData["Accompagnateur_paye"] === "L'accompagnateur paye";
      let travelCompanionPrice = 0;
      if (hasATravelCompanion && travelCompanionPays) {
        travelCompanionPrice = transportationCost(
          estimatedKMForTravelCompanionPriceCalculation,
          travelCompanionRatePerKM,
          travelCompanionMinimumPrice,
        );
      }
      return travelCompanionPrice;
    };

    const priceWithoutTravelCompanion =
      calculatePriceWithoutTravelCompanion(totalityPrice);
    const travelCompanionPrice = calculateTravelCompanionPrice();

    return Math.round(
      priceWithoutTravelCompanion + Number(travelCompanionPrice)
    );
  };
  const calculateOrganismPrice = (totalityPrice, customerPrice) => {
    const organismPricingType = docData["organismPricingType"];
    let result;
    switch (organismPricingType) {
      case "Manuel":
        result = parseFloat(docData["Part_Organisme"]);
        break;
      case "Paie la totalité après déduction de la part usager":
        result = (totalityPrice - customerPrice).toFixed(2);
        break;
      case "Prix fixe":
        const organismPrincingPrix = parseFloat(
          docData["organismPrincingPrix"],
        );
        result = organismPrincingPrix;
        break;
      case "Tarification par taux":
        const organismPricingTaux = parseFloat(docData["organismPricingTaux"]);
        const organismMinimumPrice = parseFloat(
          docData["MinimumPriceOrganism"],
        );
        const organismMaximumPrice = parseFloat(
          docData["MaximumPriceOrganism"],
        );
        const estimatedKMForOrganismPriceCalculation = parseFloat(
          docData["Km_pour_calcul_de_la_totalite"],
        );
        result = transportationCost(
          estimatedKMForOrganismPriceCalculation,
          organismPricingTaux,
          Number.isNaN(organismMinimumPrice) ? null : organismMinimumPrice,
          Number.isNaN(organismMaximumPrice) ? null : organismMaximumPrice,
        );
        break;
    }
    return result;
  };
  const calculateBalancePrice = (totalPrice, customerPrice, organismPrice) => {
    const balance = totalPrice - customerPrice - organismPrice;
    return parseFloat(balance.toFixed(2));
  };

  const result = {};
  let totalPrice = undefined;
  const minimumPriceRenumeration = parseFloat(
    docData["MinimumPriceRenumeration"],
  );
  if (docData.CalculPrixTransportGroupe === "Prix au km") {
    totalPrice = calculateTotalPrice();

    if (!isNaN(minimumPriceRenumeration)) {
      totalPrice = Math.max(totalPrice, minimumPriceRenumeration);
    }

    result.Prix_totalite = totalPrice;
  } else if (docData.CalculPrixTransportGroupe === "Manuel") {
    totalPrice = parseFloat(docData["Prix_totalite"]);
  }
  const customerPrice = calculateCustomerPrice(totalPrice);
  console.log("CUSTOMER PRICE : ", customerPrice);
  if (docData["customerPricingType"] !== "Manuel") {
    result.Dons_client = String(customerPrice);
  }
  const organismPrice = calculateOrganismPrice(totalPrice, customerPrice);
  result.Part_Organisme = String(organismPrice);
  const balancePrice = calculateBalancePrice(
    totalPrice,
    customerPrice,
    organismPrice,
  );
  result.Balance_a_payer = String(balancePrice);

  return result;
};
const buildDocumentsUpdateTransportPrix = async (transportsDocuments, mergeDocuments) => {
  const updates = [];

  const transportDataMap = new Map();
  for (const doc of mergeDocuments) {
    const parsedData = doc.data ? JSON.parse(doc.data) : {};
    transportDataMap.set(doc.documentID, parsedData);
  }

  for (const transportDocument of transportsDocuments) {
    const transportData = transportDataMap.get(transportDocument.FORMID) || {};

    const combinedDocument = {
      ...transportDocument,
      ...transportData,
    };
    console.log("Transport document: ", transportDocument);
    const transportPriceData = await calculateAllPrices(combinedDocument);

    updates.push(
      createUpdateDocument(
        transportPriceData,
        PONTIAC_FORMLAYOUTID_TRANSPORT,
        transportDocument.FORMID,
        EDITS["Planifier_Statut"],
      ),
    );
  }

  return updates;
};

const mergeDocumentsByKey = (documentsArray) => {
  const grouped = documentsArray.reduce((acc, doc) => {
    const key = `${doc.template.templateId}|${doc.documentID}|${doc.status}`;
    acc[key] = acc[key] || [];
    acc[key].push(doc);
    return acc;
  }, {});

  return Object.values(grouped).map((groupDocs) => {
    const { template, documentID, status } = groupDocs[0];
    const mergedData = Object.assign({}, ...groupDocs.map((doc) => JSON.parse(doc.data)));

    return {
      data: JSON.stringify(mergedData),
      status,
      active: true,
      template,
      documentID,
    };
  });
};

// ----- Fonction principale -----
const main = async () => {
  if (!FORMIDS || FORMIDS.size === 0) {
    showErrorBanner("Veuillez sélectionner au moins un transport");
    return;
  }

  try {
    showPopupLoading("Opération en cours");

    const uniqueFORMIDS = Array.from(FORMIDS);

    const addUsedVehicleToDocuments = (transportsDocuments, usedVehicle) => {
      for (const transportDocument of transportsDocuments) {
        const documentData = JSON.parse(transportDocument.data);
        documentData["TransportTypeDeVehiculeUtilise"] = usedVehicle;
        transportDocument.data = JSON.stringify(documentData);
      }
    };

    const transportsDocuments = await searchForms([
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Transport",
        type: "TEXT",
      },
      {
        key: "FORMID",
        operator: "IN",
        value: uniqueFORMIDS.join("|"),
        type: "TEXT",
      },
    ]);

    if (!transportsDocuments?.length) {
      showErrorBanner("Veuillez sélectionner au moins un transport");
      return;
    }

    const modele = EDITS["ModeleRemuneration"] || "";

    const documentsUpdate1 = await buildDocumentsUpdateTransportChauffeur(
      transportsDocuments,
      modele,
    );

    addUsedVehicleToDocuments(documentsUpdate1, EDITS["TransportTypeDeVehiculeUtilise"]);

    const documentsUpdate2 = await buildDocumentsUpdateTransportDistance(transportsDocuments);

    const mergeDocuments = mergeDocumentsByKey([...documentsUpdate1, ...documentsUpdate2]);

    const documentsUpdate3 = await buildDocumentsUpdateTransportPrix(
      transportsDocuments,
      mergeDocuments,
    );

    const allDocumentsToUpdate = mergeDocumentsByKey([...mergeDocuments, ...documentsUpdate3]);

    await updateManyDocuments(allDocumentsToUpdate);
  } catch (error) {
    showErrorBanner("Une erreur est survenue lors du processus de mise à jour");
    console.error(error);
  } finally {
    hidePopupLoading();
  }
};

main();
