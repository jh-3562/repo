console.log("Function 46", context);

const fillAdminFields = () => {
  console.log("Function 117", context);

  function getInfos() {
    const date = docData.Planification_Date;
    const heureDebut = docData.CC_Récupération;

    let heureFin;
    if (docData.CC_Retour == "true") {
      heureFin = docData.CC_Arrivée ? docData.CC_Arrivée : `23:59`;
    } else {
      heureFin =
        docData.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
          "CC_Destinations|400|Début de RDV"
        ] ||
        docData?.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
          "CC_Destinations|300|Arrivée"
        ];
    }

    // Construction des Date objets sécurisés
    let dateavecHeureDebut = new Date(`${date}T${heureDebut || "00:00"}:00`);
    let dateavecHeureFin = new Date(`${date}T${heureFin || "00:00"}:00`);

    // Formater la date et l'heure selon l'heure locale
    function formatDateLocal(dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Mois de 1 à 12
      const day = String(dateObj.getDate()).padStart(2, "0"); // Jour de 1 à 31
      const hours = String(dateObj.getHours()).padStart(2, "0"); // Heures de 00 à 23
      const minutes = String(dateObj.getMinutes()).padStart(2, "0"); // Minutes de 00 à 59

      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    }

    if (
      docData.Planification_Récurrence == "Une seule fois" ||
      docData.IdentifiantFormulaireRécurrence
    ) {
      if (date && heureDebut && heureFin) {
        return {
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureFin),
        };
      }
    } else {
      if (docData.Planification_Récurrence == "Par semaine") {
        if (docData.Planification_DateFin) {
          const dateFin = docData.Planification_DateFin;
          dateavecHeureFin = new Date(`${dateFin}T${heureFin || "00"}:00`);
          console.log("DATE AVC HEURE ", dateavecHeureFin);
          return {
            InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureDebut),
            InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureFin),
          };
        } else {
          return {
            InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureDebut),
            InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
          };
        }
      } else if (docData.Planification_Récurrence == "Par jour spécifique") {
        if (docData.Planification_MultiDate) {
          const date = docData.Planification_MultiDate.split("|")[0];
          const multiDate = docData.Planification_MultiDate.split("|");
          const latestDate = multiDate.reduce((latest, current) =>
            new Date(current) > new Date(latest) ? current : latest,
          );
          const earliestDate = multiDate.reduce((earliest, current) =>
            new Date(current) < new Date(earliest) ? current : earliest,
          );

          dateavecHeureDebut = new Date(
            `${earliestDate}T${heureDebut || "00:00"}:00`,
          );
          dateavecHeureFin = new Date(
            `${latestDate}T${heureFin || "00:00"}:00`,
          );

          return {
            Planification_Date: date,
            InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureDebut),
            InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureFin),
          };
        }
      }
    }

    // Fallback final
    return {
      InformationsAdmin_DateHeureDébut: `${date}T00:01:00`,
      InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
    };
  }

  const result = getInfos();
  console.log("result ========", result);
  return result;
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
// hides an errorPopup
const hidePopupError = () => {
  const errorPopup = document.getElementById("errorPopup");
  if (errorPopup) errorPopup.style.display = "none";
};

// shows an errorPopup
const showPopupError = (errorMessage) => {
  const popup = createOrUpdateElement(
    "errorPopup",
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
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center; position: relative; width: 310px; text-align: center;">
      <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
          <button id="closePopup" style="position: absolute; top: 0px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
          <div style="margin-top: 15px;">${errorMessage}</div>
      </div>
      `,
  );

  document
    .getElementById("closePopup")
    .addEventListener("click", hidePopupError.bind(this));
};

// to convert time in all minutes (for comparaison)
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const isRDVPec =
  docData.TypeTransport === "Retour" ? true : false;

// constant needed to calculate embarquement and arrivée time
// both checkbox needed
const manuallyEnteredHours = docData.EntrerHeuresManuellement;
const returnPriseEnCharge = docData.CC_Retour;
const loadingTime = docData.TempsEmbarquement;
const unloadingTime = docData.TempsDebarquement;
// debutRDV, finRDV, embarquement, arrivée
let meetingStart, meetingEnd, firstTravelTime, lastTravelTime, lastmeetingStart;
// attribute value only if there is one for meeting end
if (docData.CC_Destinations.length && docData.CC_Destinations.length - 1 >= 0) {
  meetingEnd =
    docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
      "CC_Destinations|600|Fin de RDV"
    ] ||
    docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
      "CC_Destinations|400|Début de RDV"
    ];

  lastmeetingStart = !isRDVPec
    ? docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
        "CC_Destinations|400|Début de RDV"
      ]
    : docData?.CC_Récupération;
  docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
    "CC_Destinations|300|Arrivée"
  ];
}

// attribute value from debutRDV, embarquement and arrivée
meetingStart = !isRDVPec
  ? docData.CC_Destinations[0]?.["CC_Destinations|400|Début de RDV"]
  : docData?.CC_Récupération;
firstTravelTime =
  docData.CC_Destinations[0]?.["CC_Destinations|200|Temps de trajet"];
lastTravelTime = docData.CC_TempsTrajet;

// function to calculate embarquement time
const calculateEmbarquementTime = (firstItem) => {
  try {
    console.log("A1");
    const missionStart = timeToMinutes(heuresMission[0]);
    console.log("Meeting start ", meetingStart);
    const startRDVTimeMinutes = timeToMinutes(meetingStart);
    console.log("A3");
    const firstTravelTimeMinutes = timeToMinutes(firstItem);
    console.log("A4");
    const loadingTimeMinutes = timeToMinutes(loadingTime);
    console.log("A5");
    const unloadingTimeMinutes = timeToMinutes(unloadingTime);
    console.log("A6");
    const embarquementDifferenceMinutes =
      startRDVTimeMinutes -
      firstTravelTimeMinutes -
      loadingTimeMinutes -
      unloadingTimeMinutes;
    const differenceStartMissionMinutes =
      embarquementDifferenceMinutes - missionStart;
    const missionStartHours = Math.floor(differenceStartMissionMinutes / 60);
    const missionRemainingMinutes = differenceStartMissionMinutes % 60;
    const missionStartFormatted = `${String(missionStartHours).padStart(
      2,
      "0",
    )}:${String(missionRemainingMinutes).padStart(2, "0")}`;
    const embarquementHours = Math.floor(embarquementDifferenceMinutes / 60);
    const embarquementRemainingMinutes = embarquementDifferenceMinutes % 60;
    const embarquementFormatted = `${String(embarquementHours).padStart(
      2,
      "0",
    )}:${String(embarquementRemainingMinutes).padStart(2, "0")}`;

    // return the value in string format
    return { embarquementFormatted, missionStartFormatted };
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// function to calculate last arrival Time when there is a return
const calculateReturnArrivalTime = (lastItem) => {
  try {
    const missionEnd = timeToMinutes(heuresMission[1]);
    const meetingEndTimeMinutes = timeToMinutes(meetingEnd);
    const lastTravelTimeMinutes = timeToMinutes(lastItem);
    const loadingTimeMinutes = timeToMinutes(loadingTime);
    const unloadingTimeMinutes = timeToMinutes(unloadingTime);
    console.log("MEETING END ", meetingEnd);
    console.log("lastTravelTime ", lastItem);
    console.log("UNLOAD ", unloadingTime);
    console.log("LOAD ", loadingTime);
    const finalArrivalDifferenceMinutes =
      meetingEndTimeMinutes +
      lastTravelTimeMinutes +
      unloadingTimeMinutes +
      loadingTimeMinutes;
    const differenceEndMissionMinutes =
      finalArrivalDifferenceMinutes + missionEnd;
    const missionEndHours = Math.floor(differenceEndMissionMinutes / 60);
    const missionEndRemainingMinutes = differenceEndMissionMinutes % 60;
    const missionEndFormatted = `${String(missionEndHours).padStart(
      2,
      "0",
    )}:${String(missionEndRemainingMinutes).padStart(2, "0")}`;
    const finalArrivalHours = Math.floor(finalArrivalDifferenceMinutes / 60);
    const finalArrivalRemainingMinutes = finalArrivalDifferenceMinutes % 60;
    const finalArrivalFormatted = `${String(finalArrivalHours).padStart(
      2,
      "0",
    )}:${String(finalArrivalRemainingMinutes).padStart(2, "0")}`;
    console.log("FINAL ARRIVAL ", finalArrivalFormatted);
    // return the value in string format
    return { finalArrivalFormatted, missionEndFormatted };
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// function that gets the fin heure Approx
const getFinHeureApprox = () => {
  if (meetingEnd) {
    if (docData.CC_Retour === "true") {
      const embarquement = timeToMinutes(docData.TempsEmbarquement);
      const debarquement = timeToMinutes(docData.TempsDebarquement);
      const meetingEndTimeMinutes = timeToMinutes(meetingEnd);
      const missionEnd = timeToMinutes(heuresMission[1]);
      const heureFinDifference =
        meetingEndTimeMinutes + missionEnd + embarquement + debarquement;
      const heureFinHours = Math.floor(heureFinDifference / 60);
      const heureFinRemainingMinutes = heureFinDifference % 60;
      const heureFinFormatted = `${String(heureFinHours).padStart(
        2,
        "0",
      )}:${String(heureFinRemainingMinutes).padStart(2, "0")}`;
      return heureFinFormatted;
    } else {
      const meetingEndTimeMinutes = timeToMinutes(meetingEnd);
      const missionEnd = timeToMinutes(heuresMission[1]);
      const heureFinDifference = meetingEndTimeMinutes + missionEnd;
      const heureFinHours = Math.floor(heureFinDifference / 60);
      const heureFinRemainingMinutes = heureFinDifference % 60;
      const heureFinFormatted = `${String(heureFinHours).padStart(
        2,
        "0",
      )}:${String(heureFinRemainingMinutes).padStart(2, "0")}`;
      return heureFinFormatted;
    }
  } else {
    const lastmeetingStartTimeMinutes = timeToMinutes(lastmeetingStart);
    const missionEnd = timeToMinutes(heuresMission[1]);
    const heureFinDifference = lastmeetingStartTimeMinutes + missionEnd;
    const heureFinHours = Math.floor(heureFinDifference / 60);
    const heureFinRemainingMinutes = heureFinDifference % 60;
    const heureFinFormatted = `${String(heureFinHours).padStart(
      2,
      "0",
    )}:${String(heureFinRemainingMinutes).padStart(2, "0")}`;
    return heureFinFormatted;
  }
};

// constants needed for origin, destination and waypoints
let Depart_GarageLat = docData?.PriseEnCharge_LatitudeDépartChauffeur;
let Depart_GarageLong = docData?.PriseEnCharge_LongitudeDépartChauffeur;
if (!Depart_GarageLat || !Depart_GarageLong) {
  showPopupError("Vous devez sélectionner un lieu de départ pour le chauffeur");
  return;
}
// replace , for .
Depart_GarageLat = Depart_GarageLat.replace(",", ".");
Depart_GarageLong = Depart_GarageLong.replace(",", ".");
// conversion to a number
Depart_GarageLat = parseFloat(Depart_GarageLat);
Depart_GarageLong = parseFloat(Depart_GarageLong);
const coordGarage = {
  lat: Depart_GarageLat,
  lng: Depart_GarageLong,
};
// const for the waypoints
const waypoints = [];
// const for lieu depart lat and long
const lieuDepartLat = Number(docData.CC_Latitude);
const lieuDepartLong = Number(docData.CC_Longitude);
// const for garage starting place lat and long
const coordDestination = { lat: Depart_GarageLat, lng: Depart_GarageLong };
// const for first embarquement lat and long
const firstEmbarLat =
  docData.CC_Destinations[0]?.["CC_Destinations|800|Latitude"];
const firstEmbarLong =
  docData.CC_Destinations[0]?.["CC_Destinations|900|Longitude"];

// push in waypoints every stop
// index to follow iteration of destinations
let index = 0;
let dernierStopLat, dernierStopLong;
waypoints.push({ lat: lieuDepartLat, lng: lieuDepartLong });
docData.CC_Destinations.forEach((destination) => {
  const latitudeKey = `CC_Destinations|800|Latitude`;
  const longitudeKey = `CC_Destinations|900|Longitude`;
  const latitude = destination[latitudeKey];
  const longitude = destination[longitudeKey];
  waypoints.push({ lat: Number(latitude), lng: Number(longitude) });
  // keep the last coord in a var
  if (index === docData.CC_Destinations.length - 1) {
    dernierStopLat = Number(latitude);
    dernierStopLong = Number(longitude);
  }
  index++;
});

const fieldNames = {
  lat_dep: "Adresse de départ",
  long_dep: "Adresse de départ",
  lat_dest: "Adresse de destination",
  long_dest: "Adresse de destination",
};

const fieldValues = {
  lat_dep: docData.CC_Latitude,
  long_dep: docData.CC_Longitude,
  lat_dest: firstEmbarLat,
  long_dest: firstEmbarLong,
};

// gets missing fields names required to compute from form
const getMissingFields = () => {
  const missingFields = [];
  Object.entries(fieldValues).forEach(([key, value]) => {
    if (!value) missingFields.push(fieldNames[key]);
  });
  return [...new Set(missingFields)];
};

let heuresMission = [];
// store the partial duration
const partialDurationList = [];
const defaultHour = "08:00";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const isoTomorrow = `${tomorrow.toISOString().split("T")[0]}T08:00:00`;

const planificationDateTime = new Date(
  `${docData.Planification_Date}T${docData.CC_Récupération || defaultHour}:00`,
);

const now = new Date();

let takeDefault = false;
if (planificationDateTime <= now) {
  console.warn(
    "La date de départ est dans le passé. L'API Google Maps refusera cette requête.",
  );
  takeDefault = true;
}

// async function to get the distance of duration in legs
const getDistanceAndDuration = async (origin, destination, waypoints = []) => {
  const waypointLength = waypoints.length;
  return new Promise((resolve, reject) => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: takeDefault
            ? new Date(isoTomorrow)
            : planificationDateTime,
          trafficModel: google.maps.TrafficModel.OPTIMISTIC,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log("google DirectionsService result :", result);
          let totalDistanceKm = 0;
          let totalDurationMin = 0;
          let partialDistanceKm = 0;
          let partialDurationMin = 0;
          let index = 0;
          const legs = result.routes[0]?.legs;
          console.log("LEGS TOTAL ", legs);
          if (legs) {
            for (const leg of legs) {
              if (!(index === 0 || index === waypointLength)) {
                partialDistanceKm += leg.distance.value / 1000;
                partialDurationMin += leg.duration.value / 60;
                const hours = Math.floor(leg.duration.value / 60 / 60);
                const minutes = Math.floor((leg.duration.value / 60) % 60);
                const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                  minutes < 10 ? "0" : ""
                }${minutes}`;
                console.log("LEGS INFO ", leg);
                partialDurationList.push(formattedDuration);
              }
              if (index === 0 || index === waypointLength) {
                const hours = Math.floor(leg.duration.value / 60 / 60);
                const minutes = Math.floor((leg.duration.value / 60) % 60);
                const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                  minutes < 10 ? "0" : ""
                }${minutes}`;
                heuresMission.push(formattedDuration);
              }
              totalDistanceKm += leg.distance.value / 1000; // km
              totalDurationMin += leg.duration.value / 60; // minute
              index++;
            }
          }

          resolve({
            totalDistanceKm,
            totalDurationMin,
            partialDistanceKm,
            partialDurationMin,
            partialDurationList,
          });
        } else {
          reject(new Error(`Google Maps API error: ${status}`));
        }
      },
    );
  });
};

const getDistanceAndDurationSansRester = async (
  origin,
  destination,
  waypoints = [],
) => {
  try {
    const waypointLength = waypoints.length;
    const destinationsLength = docData.CC_Destinations.length;
    return new Promise((resolve, reject) => {
      new google.maps.DirectionsService().route(
        {
          origin,
          destination,
          waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: takeDefault
              ? new Date(isoTomorrow)
              : planificationDateTime,
            trafficModel: google.maps.TrafficModel.OPTIMISTIC,
          },
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            console.log("google DirectionsService result :", result);
            let totalDistanceKm = 0;
            let totalDurationMin = 0;
            let partialDistanceKm = 0;
            let partialDurationMin = 0;
            let index = 0;
            const legs = result.routes[0]?.legs;
            if (legs) {
              console.log("LEGSS ", legs);
              for (const leg of legs) {
                if (
                  (index > 0 && index <= waypointLength - 4) ||
                  index === waypointLength - 1
                ) {
                  console.log("LE LEG ", leg);
                  partialDistanceKm += leg.distance.value / 1000;
                  partialDurationMin += leg.duration.value / 60;
                  const hours = Math.floor(leg.duration.value / 60 / 60);
                  const minutes = Math.floor((leg.duration.value / 60) % 60);
                  const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                    minutes < 10 ? "0" : ""
                  }${minutes}`;
                  partialDurationList.push(formattedDuration);
                }
                if (index === 0 || index === waypointLength) {
                  const hours = Math.floor(leg.duration.value / 60 / 60);
                  const minutes = Math.floor((leg.duration.value / 60) % 60);
                  const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                    minutes < 10 ? "0" : ""
                  }${minutes}`;
                  heuresMission.push(formattedDuration);
                }
                totalDistanceKm += leg.distance.value / 1000; // km
                totalDurationMin += leg.duration.value / 60; // minute
                index++;
              }
            }

            resolve({
              totalDistanceKm,
              totalDurationMin,
              partialDistanceKm,
              partialDurationMin,
              partialDurationList,
            });
          } else {
            reject(new Error(`Google Maps API error: ${status}`));
          }
        },
      );
    });
  } catch (error) {
    console.warn("Erreur lors du calcul des disatnces :", error);
  }
};

const getArrivalTime = (tempsTrajet) => {
  const pec = docData.CC_Récupération;
  const tempsTrajetMinutes = timeToMinutes(tempsTrajet);
  const pecMinutes = timeToMinutes(pec);
  const loadingTimeMinutes = timeToMinutes(loadingTime || "00:00");
  const unloadingTimeMinutes = timeToMinutes(unloadingTime || "00:00");
  const arrivalMinutes =
    pecMinutes + loadingTimeMinutes + tempsTrajetMinutes + unloadingTimeMinutes;
  const arrival = convertMinutesToHHMM(arrivalMinutes);
  console.log("ARRIVAL ", arrival);
  return arrival;
};

const convertMinutesToHHMM = (minutes) => {
  const totalMinutes = Math.ceil(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const normalizedHours = hours % 24;
  const paddedHours = String(normalizedHours).padStart(2, "0");
  const paddedMinutes = String(mins).padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}`;
};

// when it is RDV to pec
const getDriverStartTime = () => {
  const missionStart = timeToMinutes(heuresMission[0]);
  const startRDVTimeMinutes = timeToMinutes(docData?.CC_Récupération);
  const loadingTimeMinutes = timeToMinutes(loadingTime);
  const unloadingTimeMinutes = timeToMinutes(unloadingTime);
  console.log("START ", convertMinutesToHHMM(startRDVTimeMinutes));
  console.log("MISSION START ? ", convertMinutesToHHMM(missionStart));
  const embarquementDifferenceMinutes =
    startRDVTimeMinutes - loadingTimeMinutes - unloadingTimeMinutes;
  const differenceStartMissionMinutes =
    embarquementDifferenceMinutes - missionStart;
  const driverStart = convertMinutesToHHMM(differenceStartMissionMinutes);
  console.log("DRIVER START TIME ! ", driverStart);
  return driverStart;
};

// Main function
const main = async () => {
  const clone = [...docData.CC_Destinations];
  const destinations = clone.map((item) => item["CC_Destinations|100|Adresse"]);
  const result = {};
  const partialResult = {};
  const isRDVPec =
    docData.TypeTransport === "Retour" ? true : false;
  if (
    docData.TypeTransport === "Retour" &&
    !docData.CC_Récupération
  ) {
    const errorMessage = "Vous devez sélectionner une heure de prise en charge";
    showPopupError(errorMessage);
    return;
  }
  //  if everything we need we have
  if (
    docData.CC_Latitude &&
    docData.CC_Longitude &&
    firstEmbarLat &&
    firstEmbarLong
  ) {
    try {
      // Show loading popup
      showPopupLoading("Calcul en cours...");
      // if return is true
      if (docData.CC_Retour == "true") {
        if (docData.CheckboxResterAvecBene == "true") {
          try {
            // we add the last destination (the return)
            waypoints.push({ lat: lieuDepartLat, lng: lieuDepartLong });
            console.log("WAYPOINTS ", waypoints);
            // calling the function
            const distancesAndDurations = await getDistanceAndDuration(
              coordGarage,
              coordDestination,
              waypoints,
            );
            console.log("DISTANCES AND DURATIONS ", distancesAndDurations);
            // get the right distances
            result.DistanceTrajetAller =
              distancesAndDurations.totalDistanceKm.toFixed(2);
            result.partialDurationList;
            result.DureeTrajetAller = Math.round(
              distancesAndDurations.totalDurationMin,
            );
            partialResult.DistanceTrajetAller =
              distancesAndDurations.partialDistanceKm.toFixed(2);
            partialResult.DureeTrajetAller = Math.round(
              distancesAndDurations.partialDurationMin,
            );

            // put the right duration in collection
            for (let i = 0; i < destinations.length; i++) {
              console.log(
                "A TEST ",
                distancesAndDurations.partialDurationList[i],
              );
              if (isRDVPec) {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                  "CC_Destinations|300|Arrivée": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                  "CC_Destinations|400|Début de RDV": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                };
              } else {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                };
              }
            }
            const firstItem = clone[0]["CC_Destinations|200|Temps de trajet"];
            // inject the data
            const lastItem =
              partialDurationList[partialDurationList.length - 1];
            const { embarquementFormatted, missionStartFormatted } =
              calculateEmbarquementTime(firstItem);
            const newDocData = {
              CC_TempsTrajet: lastItem,
              CC_Destinations: clone,
              DistanceDepartDestination: partialResult.DistanceTrajetAller,
              DistanceGarageGarage: result.DistanceTrajetAller,
              heureDebutMission: isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted,
              heureFinMission: getFinHeureApprox(),
            };
            // if we have necessary info for embarquement time , inject it
            if (meetingStart && manuallyEnteredHours !== "true") {
              const { embarquementFormatted, missionStartFormatted } =
                calculateEmbarquementTime(firstItem);
              if (docData.TypeTransport === "Aller ou aller-retour") {
                newDocData.CC_Récupération = embarquementFormatted;
              }
              newDocData.heureDebutMission = isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted;
            }
            // if we have necessary info for final arrival time, inject it
            if (meetingEnd && manuallyEnteredHours !== "true") {
              const { finalArrivalFormatted, missionEndFormatted } =
                calculateReturnArrivalTime(lastItem);
              newDocData.CC_Arrivée = finalArrivalFormatted;
              newDocData.heureFinMission = missionEndFormatted;
            }
            injectDocData({
              fillData: newDocData,
            });
          } catch (error) {
            console.error(
              "Error fetching return trip distance/duration:",
              error,
            );
            hidePopupLoading();
            return;
          }
        }
        // here is for when we dont stay with bene and return
        else {
          try {
            console.log("WE ARE IN THE RIGHT PLACE");
            // push the garage
            waypoints.push({ lat: Depart_GarageLat, lng: Depart_GarageLong });
            // push the final destination again
            waypoints.push({ lat: dernierStopLat, lng: dernierStopLong });
            // we push the départ (the return)
            waypoints.push({ lat: lieuDepartLat, lng: lieuDepartLong });
            console.log("WAYPOINTS ", waypoints);
            const distancesAndDurations =
              await getDistanceAndDurationSansRester(
                coordGarage,
                coordDestination,
                waypoints,
              );
            // get the right distances
            result.DistanceTrajetAller =
              distancesAndDurations.totalDistanceKm.toFixed(2);
            result.partialDurationList;
            result.DureeTrajetAller = Math.round(
              distancesAndDurations.totalDurationMin,
            );
            partialResult.DistanceTrajetAller =
              distancesAndDurations.partialDistanceKm.toFixed(2);
            partialResult.DureeTrajetAller = Math.round(
              distancesAndDurations.partialDurationMin,
            );

            // put the right duration in collection
            for (let i = 0; i < destinations.length; i++) {
              if (isRDVPec) {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                  "CC_Destinations|300|Arrivée": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                  "CC_Destinations|400|Début de RDV": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                };
              } else {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                };
              }
            }
            const firstItem = clone[0]["CC_Destinations|200|Temps de trajet"];
            // inject the data
            const lastItem =
              partialDurationList[partialDurationList.length - 1];
            const { embarquementFormatted, missionStartFormatted } =
              calculateEmbarquementTime(firstItem);
            const newDocData = {
              CC_TempsTrajet: lastItem,
              CC_Destinations: clone,
              DistanceDepartDestination: partialResult.DistanceTrajetAller,
              DistanceGarageGarage: result.DistanceTrajetAller,
              heureDebutMission: isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted,
              heureFinMission: getFinHeureApprox(),
            };
            // if we have necessary info for embarquement time , inject it
            if (meetingStart && manuallyEnteredHours !== "true") {
              const { embarquementFormatted, missionStartFormatted } =
                calculateEmbarquementTime(firstItem);
              if (docData.TypeTransport === "Aller ou aller-retour") {
                newDocData.CC_Récupération = embarquementFormatted;
              }
              newDocData.heureDebutMission = isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted;
            }
            // if we have necessary info for final arrival time, inject it
            if (meetingEnd && manuallyEnteredHours !== "true") {
              const { finalArrivalFormatted, missionEndFormatted } =
                calculateReturnArrivalTime(lastItem);
              newDocData.CC_Arrivée = finalArrivalFormatted;
              newDocData.heureFinMission = missionEndFormatted;
            }
            injectDocData({
              fillData: newDocData,
            });
          } catch (error) {
            console.warn(
              "Error fetching return trip distance/duration : ",
              error,
            );
          }
        }
      } else {
        // else there is no return
        try {
          // calling the function with no return
          const distancesAndDurations = await getDistanceAndDuration(
            coordGarage,
            coordDestination,
            waypoints,
          );
          // get the duration
          result.DistanceTrajetAller =
            distancesAndDurations.totalDistanceKm.toFixed(2);
          result.partialDurationList;
          result.DureeTrajetAller = Math.round(
            distancesAndDurations.totalDurationMin,
          );
          partialResult.DistanceTrajetAller =
            distancesAndDurations.partialDistanceKm.toFixed(2);
          partialResult.DureeTrajetAller = Math.round(
            distancesAndDurations.partialDurationMin,
          );
          // put the right duration in collection
          for (let i = 0; i < destinations.length; i++) {
            if (isRDVPec) {
              console.log(
                "A TEST ",
                distancesAndDurations.partialDurationList[i],
              );
              clone[i] = {
                ...clone[i],
                "CC_Destinations|200|Temps de trajet":
                  distancesAndDurations.partialDurationList[i],
                "CC_Destinations|300|Arrivée": getArrivalTime(
                  distancesAndDurations.partialDurationList[i],
                ),
                "CC_Destinations|400|Début de RDV": getArrivalTime(
                  distancesAndDurations.partialDurationList[i],
                ),
              };
            } else {
              clone[i] = {
                ...clone[i],
                "CC_Destinations|200|Temps de trajet":
                  distancesAndDurations.partialDurationList[i],
              };
            }
          }
          const firstItem = clone[0]["CC_Destinations|200|Temps de trajet"];
          const { embarquementFormatted, missionStartFormatted } =
            calculateEmbarquementTime(firstItem);
          const newDocData = {
            CC_Destinations: clone,
            DistanceDepartDestination: partialResult.DistanceTrajetAller,
            DistanceGarageGarage: result.DistanceTrajetAller,
            heureDebutMission: isRDVPec
              ? getDriverStartTime()
              : missionStartFormatted,
            heureFinMission: getFinHeureApprox(),
          };
          // if we have necessary info for embarquement time , inject it
          if (meetingStart && manuallyEnteredHours !== "true") {
            const { embarquementFormatted, missionStartFormatted } =
              calculateEmbarquementTime(firstItem);
            if (docData.TypeTransport === "Aller ou aller-retour") {
              newDocData.CC_Récupération = embarquementFormatted;
            }
            newDocData.heureDebutMission = isRDVPec
              ? getDriverStartTime()
              : missionStartFormatted;
          }
          injectDocData({
            fillData: newDocData,
          });
        } catch (error) {
          console.error("Error fetching initial distance/duration:", error);
          hidePopupLoading();
          return; // On quitte la fonction sans injecter de données
        }
      }
    } catch (error) {
      console.error("Unexpected error in main execution:", error);
    } finally {
      // On s'assure que la popup de chargement est toujours cachée à la fin
      hidePopupLoading();
    }
  } else {
    // on cache le popup de chargement
    hidePopupLoading();
    // get missing fields name
    let errorMsg = "<p>Certaines adresses sont manquantes :</p>";
    getMissingFields().forEach((field) => {
      errorMsg += `<p>- ${field}</p>`;
    });
    // display error popup with details about missing fields
    showPopupError(errorMsg);
  }
};

// Lancer l'exécution
main();
// part 2 that updates the admin fields
const fill = fillAdminFields();
console.log("FILL", fill);
injectDocData({
  fillData: fill,
});
