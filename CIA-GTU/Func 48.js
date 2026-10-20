console.log("Fonction 48", context);

const lat = docData?.AdressesFrequentes_Latitude;
const lng = docData?.AdressesFrequentes_Longitude;

if (lat && lng) {
  return {
    Adressesfrequentes_map:
      "https://www.google.com/maps/embed/v1/place" +
      "?key=AIzaSyD1CjWaKXHwU6qvwStRNa2HUHve6LPvNDE" +
      "&q=" + lat + "," + lng +
      "&zoom=15"
  };
} else {
  return { Adressesfrequentes_map: null };
}
