console.log("Fonction 55 - Durée trajet ALLER ", context);

// Google Directions: returns array of leg durations (in minutes)
const getTravelDuration = async (origin, destination, waypoints = []) => {
  return new Promise((resolve, reject) => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const legs = result.routes?.[0]?.legs || [];
          const durations = legs.map((leg) =>
            Math.floor((leg?.duration?.value || 0) / 60),
          );
          resolve(durations);
        } else {
          reject(new Error(`Google Maps API error: ${status}`));
        }
      },
    );
  });
};

const pad2 = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

(async () => {
  const latDep = parseFloat(docData?.TransportSysteme_LatitudeDepart);
  const lngDep = parseFloat(docData?.TransportSysteme_LongitudeDepart);
  const latDest = parseFloat(docData?.TransportSysteme_LatitudeDestination);
  const lngDest = parseFloat(docData?.TransportSysteme_LongitudeDestination);

  if (
    Number.isFinite(latDep) &&
    Number.isFinite(lngDep) &&
    Number.isFinite(latDest) &&
    Number.isFinite(lngDest)
  ) {
    const origin = new google.maps.LatLng(latDep, lngDep);
    const destination = new google.maps.LatLng(latDest, lngDest);

    try {
      const durations = await getTravelDuration(origin, destination, []);
      console.log("les durations du voyage: ", durations);
      const total = durations.reduce(
        (s, m) => s + (Number.isFinite(m) ? m : 0),
        0,
      );
      console.log("Durée totale (minutes):", total);

      callback({ data: { TransportSysteme_DureeTrajetAller: total } });
    } catch (e) {
      console.error("Erreur Directions:", e);
    }
  } else {
    console.warn("Coordonnées invalideschamp vide");
  }
})();
