console.log("Function20", context);
 
const address = docData[inputKey];
const prefix = context?.parameters?.prefix || "Adresse";
 
const SW = new google.maps.LatLng(46.70, -79.75); 
const NE = new google.maps.LatLng(49.10, -76.00); 
const BOUNDS = new google.maps.LatLngBounds(SW, NE);
const SESSION_TOKEN = new google.maps.places.AutocompleteSessionToken();
 
const getGoogleAutocompleteSuggestions = async (address) => {
  return google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: address,
    sessionToken: SESSION_TOKEN,
    locationBias: BOUNDS,
  }).then(({ suggestions }) => suggestions);
};
 
const getComponent = (addressComponents, type) => {
  for (const c of addressComponents) {
    if (c.types.includes(type)) return c.longText;
  }
  return "";
};


 
const resolveTitle = (place) => place.formattedAddress;
const resolveFields = (place) => {
  return [
    {
      key: "AdressesFrequentes_NoCivique",
      name: "Civique",
      value: `${getComponent(place.addressComponents, "street_number")}`.trim(),
    },
    {
      key: "AdressesFrequentes_Appartement",
      name: "Appartement",
      value: `${getComponent(place.addressComponents, "subpremise")}`.trim(),
    },
    {
      key: "AdressesFrequentes_Rue",
      name: "Rue",
      value: getComponent(place.addressComponents, "route"),
    },
    {
      key: "AdressesFrequentes_CodePostal", 
      name: "Code postal",
      value: getComponent(place.addressComponents, "postal_code"),
    },
    {
      key: "AdressesFrequentes_Ville",
      name: "Ville",
      value: getComponent(place.addressComponents, "locality"),
    },
    {
      key: "AdressesFrequentes_Province",
      name: "Province",
      value: getComponent(place.addressComponents, "administrative_area_level_1"),
    },
      {
      key: "AdressesFrequentes_Latitude",
      name: "Latitude",
      value: place.location.lat(),
    },
    {
      key: "AdressesFrequentes_Longitude",
      name: "Longitude",
      value: place.location.lng(),
    },
  ];
};
 
 
const main = async () => {
  if (!address?.trim()) {
    console.log("Adresse vide, aucune suggestion.");
    callback({ suggestions: { [inputKey]: [] } });
    return;
  }
 
  const ggSuggestions = await getGoogleAutocompleteSuggestions(address);
  const suggestions = [];
 
  for (const ggSuggestion of ggSuggestions) {
    const place = ggSuggestion.placePrediction.toPlace();

    await place.fetchFields({
      fields: [
        "formattedAddress",
        "displayName",
        "location",
        "addressComponents",
        "nationalPhoneNumber",
      ],
    });
 
    suggestions.push({
      title: resolveTitle(place),
      fields: resolveFields(place),
    });
  }
 
  console.log("Suggestions générées:", suggestions);
 
  callback({
    suggestions: {
      [inputKey]: suggestions,
    },
  });
};
 
main();
 
