console.log("Fonction 240", context);

const COORDS_BY_FIELD = {
  Demande_TransportTransportSimpleAdresseCompleteDepart: {
    lat: "TransportSysteme_LatitudeDepart",
    lng: "TransportSysteme_LongitudeDepart",
  },
  Demande_TransportTransportSimpleAdresseCompleteDestination: {
    lat: "TransportSysteme_LatitudeDestination",
    lng: "TransportSysteme_LongitudeDestination",
  },
  //   "Demande_TransportTransportRetourAdresseCompleteDepart": {
  //     lat: "TransportSysteme_LatitudeDepartRetour",
  //     lng: "TransportSysteme_LongitudeDepartRetour",
  //   },
  //   "Demande_TransportTransportRetourAdresseCompleteDestination": {
  //     lat: "TransportSysteme_LatitudeDestinationRetour",
  //     lng: "TransportSysteme_LongitudeDestinationRetour",
  //   },
};

const main = () => {
  const coords = COORDS_BY_FIELD[inputKey];
  if (!coords) return;

  const address = docData[inputKey];
  if (!address) return;

  if (docData[coords.lat] && docData[coords.lng]) return; // si deja remplies rien faire

  new google.maps.Geocoder().geocode(
    { address, componentRestrictions: { country: "ca" } },
    (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK) {
        console.warn("Geocoder status:", status);
        return;
      }

      const location = results[0]?.geometry?.location;
      if (!location) return;

      callback({
        data: {
          [coords.lat]: location.lat(),
          [coords.lng]: location.lng(),
        },
      });
    },
  );
};

main();
