console.log("Function 145", context);

const heureDepart = docData?.DemandeAllerD_Heure;
const depart = {
  latitude: docData?.Transport_Latitude,
  longitude: docData?.Transport_Longitude,
};
const arrivee = {
  latitude: docData?.Transport_LatitudeAllerA,
  longitude: docData?.Transport_LongitudeAllerA,
};

const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";

const toCoordinate = (value) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const addDurationToTime = (time, durationSeconds) => {
  const match = String(time).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const totalMinutes = hours * 60 + minutes + Math.ceil(durationSeconds / 60);
  const arrivalMinutes = totalMinutes % (24 * 60);
  const arrivalHours = Math.floor(arrivalMinutes / 60);
  const arrivalMinute = arrivalMinutes % 60;

  return `${String(arrivalHours).padStart(2, "0")}:${String(
    arrivalMinute,
  ).padStart(2, "0")}`;
};

const main = async () => {
  const origin = {
    latitude: toCoordinate(depart.latitude),
    longitude: toCoordinate(depart.longitude),
  };
  const destination = {
    latitude: toCoordinate(arrivee.latitude),
    longitude: toCoordinate(arrivee.longitude),
  };

  if (
    !heureDepart ||
    Object.values(origin).some((value) => value === null) ||
    Object.values(destination).some((value) => value === null)
  ) {
    console.log("Missing required data");
    return;
  }

  try {
    const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const response = await fetch(
      `${OSRM_ROUTE_URL}/${coordinates}?overview=false`,
    );

    if (!response.ok) {
      throw new Error(`OSRM API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const durationSeconds = Number(data?.routes?.[0]?.duration);
    if (data?.code !== "Ok" || !Number.isFinite(durationSeconds)) {
      throw new Error("OSRM API returned no route duration");
    }

    const heureArrivee = addDurationToTime(heureDepart, durationSeconds);
    if (!heureArrivee) {
      throw new Error(`Invalid departure time: ${heureDepart}`);
    }

    console.log("Calculated arrival time:", {
      heureDépart: heureDepart,
      IntervalleSecondes: durationSeconds,
      HeureArrivée: heureArrivee,
    });
    callback({
      data: {
        DemandeAllerA_Heure: heureArrivee,
      },
    });
  } catch (error) {
    console.error("Unable to calculate arrival time with OSRM:", error);
  }
};

main();
