console.log("Function 17", context);

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isValidRDVRange = (debut, fin) => {
  return timeToMinutes(fin) > timeToMinutes(debut);
};

const clone = [...docData.CC_Destinations];

const addTime = (time1, time2) => {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);

  const totalMinutes = h1 * 60 + m1 + (h2 * 60 + m2);
  const hours = Math.floor(totalMinutes / 60) % 24; // Garde dans la plage 0-23
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

if (
  clone[indexItemChange]["CC_Destinations|400|Début de RDV"] &&
  clone[indexItemChange]["CC_Destinations|500|Temps sur place"]
) {
  const debut = clone[indexItemChange]["CC_Destinations|400|Début de RDV"];

  const fin = addTime(
    debut,
    clone[indexItemChange]["CC_Destinations|500|Temps sur place"],
  );

  if (!isValidRDVRange(debut, fin)) {
    console.log("Fin de RDV doit être après Début de RDV");
    return {};
  }

  clone[indexItemChange] = {
    ...clone[indexItemChange],
    "CC_Destinations|600|Fin de RDV": fin,
  };

  const newDocData = { ...docData, CC_Destinations: clone };
  return { ...newDocData, ...getInfos(newDocData) };
}

// function that gets the info to fill the section INFO DEV heures
function getInfos(newDocData) {
  // gets the necessary const
  const date = "2001-01-01";
  const heureDebut = newDocData.CC_Récupération;
  let result = {};

  const heureFin =
    newDocData.CC_Destinations[newDocData.CC_Destinations.length - 1]?.[
      "CC_Destinations|300|Arrivée"
    ]; // take the last entry
  const heureFinRetour = newDocData.CC_Arrivée;
  const heureDebutRetour =
    newDocData.CC_Destinations[newDocData.CC_Destinations.length - 1]?.[
      "CC_Destinations|700|Récupération"
    ]; // take the last entry
  // if all info is there return all
  if (date && heureDebut && heureFin && heureFinRetour && heureDebutRetour) {
    // creates the date and starting/arrival time combined
    const dateStartingTime = date + "T" + heureDebut + ":00";
    const dateFinishTime = date + "T" + heureFin + ":00";
    // start time
    const dateDebut = {
      InformationsAdmin_DateHeureDébutAller: dateStartingTime,
      InformationsAdmin_DateHeureFinAller: dateFinishTime,
    };
    // creates the date and starting/arrival time combined
    const dateStartingTimeRetour = date + "T" + heureDebutRetour + ":00";
    const dateFinishTimeRetour = date + "T" + heureFinRetour + ":00";
    // endtime
    const dateFin = {
      InformationsAdmin_DebutRetour: dateStartingTimeRetour,
      InformationsAdmin_FinRetour: dateFinishTimeRetour,
    };
    result = { ...dateDebut, ...dateFin };
  } else if (date && heureDebut && heureFin) {
    // creates the date and starting/arrival time combined
    const dateStartingTime = date + "T" + heureDebut + ":00";
    const dateFinishTime = date + "T" + heureFin + ":00";
    // starttime
    const dateDebut = {
      InformationsAdmin_DateHeureDébutAller: dateStartingTime,
      InformationsAdmin_DateHeureFinAller: dateFinishTime,
    };
    result = dateDebut;
  } else if (date && heureFinRetour && heureDebutRetour) {
    // creates the date and starting/arrival time combined
    const dateStartingTimeRetour = date + "T" + heureDebutRetour + ":00";
    const dateFinishTimeRetour = date + "T" + heureFinRetour + ":00";
    // endtime
    const dateFin = {
      InformationsAdmin_DebutRetour: dateStartingTimeRetour,
      InformationsAdmin_FinRetour: dateFinishTimeRetour,
    };
    result = dateFin;
  } else {
    result = "";
  }
  return result;
}
