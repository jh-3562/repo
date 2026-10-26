console.log("Function 59", context);
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
const showPopup = () => {
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
                  <div>Veuillez recalculer les distances suite à cette modification.</div>
                  <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
                </div>
              `,
  );
};
// Necessary constants for fields and collections.
const data = docData && typeof docData === "object" ? docData : {};
const destinations = Array.isArray(data.CC_Destinations)
  ? data.CC_Destinations
  : [];
const currentInputKey = typeof inputKey === "string" ? inputKey : "";
const changedIndex = Number.isInteger(indexItemChange) ? indexItemChange : -1;
const tempsSurPlace = "CC_Destinations|500|Temps sur place";
const debutRDV = "CC_Destinations|400|Début de RDV";
const finRDV = "CC_Destinations|600|Fin de RDV";
const arrivee = "CC_Destinations|300|Arrivée";
const recuperation = "CC_Destinations|700|Récupération";

const isValidTime = (value) => {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value.trim())) {
    return false;
  }
  const [hours, minutes] = value.trim().split(":").map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
};

const timeToMinutes = (time) => {
  if (!isValidTime(time)) return null;
  const [hours, minutes] = time.trim().split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalizedMinutes / 60)).padStart(2, "0")}:${String(
    normalizedMinutes % 60,
  ).padStart(2, "0")}`;
};

const addTime = (time1, time2) => {
  const first = timeToMinutes(time1);
  const second = timeToMinutes(time2);
  return first === null || second === null ? null : formatTime(first + second);
};

const subtractTime = (time1, time2) => {
  const first = timeToMinutes(time1);
  const second = timeToMinutes(time2);
  return first === null || second === null ? null : formatTime(first - second);
};

const cloneDestinations = (source = destinations) =>
  (Array.isArray(source) ? source : []).map((destination) =>
    destination && typeof destination === "object" ? { ...destination } : {},
  );

const getChangedDestination = () =>
  changedIndex >= 0 && changedIndex < destinations.length
    ? destinations[changedIndex] || {}
    : null;

if (destinations.length) {
  const calculatedDestinationsTimesData = () => {
    if (currentInputKey === "CC_Destinations" || changedIndex < 0) return {};

    const destination = getChangedDestination();
    if (!destination) return {};

    const updatedDestinations = cloneDestinations();
    const updatedDestination = updatedDestinations[changedIndex];
    const startTime = destination[debutRDV];
    const stayDuration = destination[tempsSurPlace];
    const endTime = destination[finRDV];

    if (isValidTime(startTime)) {
      updatedDestination[arrivee] = formatTime(timeToMinutes(startTime));
    }
    if (isValidTime(startTime) && isValidTime(stayDuration)) {
      const calculatedEndTime = addTime(stayDuration, startTime);
      updatedDestination[finRDV] = calculatedEndTime;
      updatedDestination[recuperation] = calculatedEndTime;
    } else if (isValidTime(endTime)) {
      updatedDestination[recuperation] = formatTime(timeToMinutes(endTime));
    }

    return { CC_Destinations: updatedDestinations };
  };

  // function that gets the info to fill the section INFO DEV heures
  const TimelineDisplayTimesData = (updatedDocData) => {
    const date = "2001-01-01";
    const safeData =
      updatedDocData && typeof updatedDocData === "object"
        ? updatedDocData
        : {};
    const safeDestinations = Array.isArray(safeData.CC_Destinations)
      ? safeData.CC_Destinations
      : [];
    const lastDestination = safeDestinations[safeDestinations.length - 1] || {};
    const result = {};
    const addDate = (time) =>
      isValidTime(time)
        ? `${date}T${formatTime(timeToMinutes(time))}:00`
        : null;

    const start = addDate(safeData.CC_Récupération);
    const outboundEnd = addDate(lastDestination[arrivee]);
    const returnStart = addDate(lastDestination[recuperation]);
    const returnEnd = addDate(safeData.CC_Arrivée);

    if (start && outboundEnd) {
      result.InformationsAdmin_DateHeureDébutAller = start;
      result.InformationsAdmin_DateHeureFinAller = outboundEnd;
    }
    if (returnStart && returnEnd) {
      result.InformationsAdmin_DebutRetour = returnStart;
      result.InformationsAdmin_FinRetour = returnEnd;
    }
    return result;
  };

  const missionDurationData = (updatedDocData) => {
    const calculateMinutesDifference = (strTime1, strTime2) => {
      const first = timeToMinutes(strTime1);
      const second = timeToMinutes(strTime2);
      return first === null || second === null
        ? null
        : Math.abs(first - second);
    };
    const safeData =
      updatedDocData && typeof updatedDocData === "object"
        ? updatedDocData
        : {};
    const safeDestinations = Array.isArray(safeData.CC_Destinations)
      ? safeData.CC_Destinations
      : [];
    const result = { missionDuration: "" };
    const hasAReturnTrip = safeData.CC_Retour === "true";
    const driverShouldStayWithBeneficiary =
      safeData.CheckboxResterAvecBene === "true";
    const missionStartTime = safeData.CC_Récupération;

    if (safeDestinations.length) {
      const lastIndex = safeDestinations.length - 1;
      if (driverShouldStayWithBeneficiary) {
        const lastDestination = safeDestinations[lastIndex] || {};
        const missionEndTime = hasAReturnTrip
          ? safeData.CC_Arrivée
          : lastDestination[finRDV];
        const duration = calculateMinutesDifference(
          missionStartTime,
          missionEndTime,
        );
        if (duration !== null) result.missionDuration = duration;
      } else {
        const timePairs = [
          [missionStartTime, (safeDestinations[0] || {})[arrivee]],
        ];
        for (
          let destinationIndex = 1;
          destinationIndex <= lastIndex;
          destinationIndex++
        ) {
          timePairs.push([
            (safeDestinations[destinationIndex - 1] || {})[recuperation],
            (safeDestinations[destinationIndex] || {})[arrivee],
          ]);
        }
        if (hasAReturnTrip) {
          timePairs.push([
            (safeDestinations[lastIndex] || {})[recuperation],
            safeData.CC_Arrivée,
          ]);
        }
        const durations = timePairs.map(([start, end]) =>
          calculateMinutesDifference(start, end),
        );
        if (durations.every((duration) => duration !== null)) {
          result.missionDuration = durations.reduce(
            (total, duration) => total + duration,
            0,
          );
        }
      }
    }

    return result;
  };

  const fillTempsSurPlaceData = (updatedDocData) => {
    if (currentInputKey !== finRDV || changedIndex < 0) return {};
    const destination = getChangedDestination();
    const stayDuration = subtractTime(
      destination?.[finRDV],
      destination?.[debutRDV],
    );
    if (stayDuration === null) return {};
    const updatedDestinations = cloneDestinations(
      updatedDocData.CC_Destinations,
    );
    updatedDestinations[changedIndex][tempsSurPlace] = stayDuration;
    return { CC_Destinations: updatedDestinations };
  };

  if (
    (data.DistanceGarageGarage || data.DistanceDepartDestination) &&
    changedIndex < 0
  ) {
    showPopup();
    const closePopupButton = document.getElementById("closePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
  }
  const calculatedDestinations = calculatedDestinationsTimesData();
  const updatedDocData = { ...data, ...calculatedDestinations };
  const calculatedTempsSurPlace = fillTempsSurPlaceData(updatedDocData);
  const finalDocData = { ...updatedDocData, ...calculatedTempsSurPlace };
  result = {
    ...calculatedDestinations,
    ...calculatedTempsSurPlace,
    ...TimelineDisplayTimesData(finalDocData),
    ...missionDurationData(finalDocData),
  };
  return result;
}
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
