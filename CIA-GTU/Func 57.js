console.log("Fonction 57 - Durée trajet RETOUR ", context);

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
          const durations = legs.map(leg => Math.floor((leg?.duration?.value || 0) / 60));
          resolve(durations);
        } else {
          reject(new Error(`Google Maps API error: ${status}`));
        }
      }
    );
  });
};

(async () => {
  const latDep  = parseFloat(docData?.TransportSysteme_LatitudeDepartRetour);
  const lngDep  = parseFloat(docData?.TransportSysteme_LongitudeDepartRetour);
  const latDest = parseFloat(docData?.TransportSysteme_LatitudeDestinationRetour);
  const lngDest = parseFloat(docData?.TransportSysteme_LongitudeDestinationRetour);

  if (
    Number.isFinite(latDep) && Number.isFinite(lngDep) &&
    Number.isFinite(latDest) && Number.isFinite(lngDest)
  ) {
    const origin = new google.maps.LatLng(latDep, lngDep);
    const destination = new google.maps.LatLng(latDest, lngDest);

    try {
      const durations = await getTravelDuration(origin, destination, []);
      const total = durations.reduce((s, m) => s + (Number.isFinite(m) ? m : 0), 0);
      console.log("Durée totale (minutes):", total);

      
      callback({ data: { TransportSysteme_DureeTrajetRetour: total } });
    } catch (e) {
      console.error("Erreur Directions:", e);
    }
  } else {
    console.warn("Coordonnées invalideschamp vide");
  }
})();
