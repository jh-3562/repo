console.log("Fonction 50", context);

const autocompleteService = new google.maps.places.AutocompleteService();
const geocoder = new google.maps.Geocoder();
const bounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(40.3413, -80.4409),
  new google.maps.LatLng(50.8722, -70.9471),
);

const getGoogleAutocompleteSuggestions = async (input) =>
  new Promise((resolve, reject) => {
    autocompleteService.getPlacePredictions(
      {
        input,
        locationRestriction: bounds, // bias within bounds
        // no types -> allows addresses + establishments
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(predictions || []);
        } else if (
          status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          resolve([]);
        } else {
          reject("Autocomplete error: " + status);
        }
      },
    );
  });

// main
const main = async () => {
  let suggestions = await getGoogleAutocompleteSuggestions(
    docData[inputKey].toString(),
  );
  console.log("suggestions", suggestions);
  suggestions = suggestions.map((suggestion) => {
    return {
      title: suggestion.description,
      fields: [],
    };
  });
  console.log("suggestionsFormatted", suggestions);

  if (suggestions[0]) {
    new google.maps.Geocoder().geocode(
      { address: suggestions[0].title, bounds: bounds },
      (result, status) => {
        console.log("status", status);
        if (status === google.maps.GeocoderStatus.OK) {
          // prevents error on ZERO_RESULTS
          //console.log(result);
          if (result[0].geometry.location) {
            suggestions[0].fields.push({
              key: "Adresses_VilleLocation", // the field in your form
              name: "Ville", // What you want the name to appear as in the suggestion
              value: result[0].address_components.find((obj) =>
                obj.types.includes("locality"),
              ).long_name, // the value to return
            });
            suggestions[0].fields.push({
              key: "Adresses_CodePostale",
              name: "Code postal",
              value: result[0].address_components.find((obj) =>
                obj.types.includes("postal_code"),
              ).long_name,
            });
            suggestions[0].fields.push({
              key: "AdressesFrequentes_Latitude",
              name: "Latitude",
              value: result[0].geometry.location.lat(),
            });
            suggestions[0].fields.push({
              key: "AdressesFrequentes_Longitude",
              name: "Longitude",
              value: result[0].geometry.location.lng(),
            });
            console.log("suggestions before callback", suggestions);
            callback({
              suggestions: {
                inputKey: suggestions,
              },
            });
          }
        }
      },
    );
  }

  callback({
    suggestions,
  });
};

main();
