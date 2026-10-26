console.log("Function 64", context);
// constants
const addressInput = "Contact_AdresseRésidence";
const addressValue = docData[addressInput];

const sessionToken = new google.maps.places.AutocompleteSessionToken();
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);

const collecKeys = {
  key: "AdressePreférées",
  adresse: "AdressePreférées|100|Adresse",
  denom: "AdressePreférées|200|Dénomination",
  rue: "AdressePreférées|500|Rue",
  numero: "AdressePreférées|510|Numéro",
  code: "AdressePreférées|520|Code_postal",
  ville: "AdressePreférées|530|Ville",
  pays: "AdressePreférées|540|Pays",
};

const geocodingMapping = {
  country: "CoorFactu_Pays",
  postal_code: "CoorFactu_Code postal",
  locality: "CoorFactu_Ville",
  street_number: "CoorFactu_Numéro",
  route: "CoorFactu_Rue",
};

// Key name mapping
const keyNameMapping = {
  "CoorFactu_Code postal": "Code Postal",
  CoorFactu_Rue: "Rue",
  CoorFactu_Numéro: "Numéro",
  CoorFactu_Pays: "Pays",
  CoorFactu_Ville: "Ville",
};

// sync functions
// returns the value of a specific address component based on its type
const getComponent = (addressComponents, type) => {
  for (c in addressComponents) {
    const types = addressComponents[c].types;
    if (types.includes(type)) return addressComponents[c].longText;
  }
  return "";
};

// returns the AdressePreférées collection formatted as a suggestion
const addCollection = () => {
  const suggestions = [];
  const collectionLength = docData.AdressePreférées?.length;
  for (let i = 0; i < collectionLength; i++) {
    const adresse = docData.AdressePreférées[i][`${collecKeys.adresse}`];
    const rue = docData.AdressePreférées[i][`${collecKeys.rue}`];
    const numero = docData.AdressePreférées[i][`${collecKeys.numero}`];
    const code = docData.AdressePreférées[i][`${collecKeys.code}`];
    const ville = docData.AdressePreférées[i][`${collecKeys.ville}`];
    const pays = docData.AdressePreférées[i][`${collecKeys.pays}`];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "CoorFactu_Rue",
            name: "Rue",
            value: rue ?? "",
          },
          {
            key: "CoorFactu_Numéro",
            name: "Numéro",
            value: numero ?? "",
          },
          {
            key: "CoorFactu_Code postal",
            name: "Code postal",
            value: code ?? "",
          },
          {
            key: "CoorFactu_Ville",
            name: "Ville",
            value: ville ?? "",
          },
          {
            key: "CoorFactu_Pays",
            name: "Pays",
            value: pays ?? "",
          },
        ],
      });
    }
  }
  return suggestions;
};

// async functions
// Returns a list of suggested places, in order of relevance.
const getGoogleAutocompleteSuggestions = async (address) => {
  return new Promise((resolve, reject) => {
    google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: address,
      sessionToken: sessionToken,
      locationRestriction: bounds,
    }).then(({ suggestions }) => {
      resolve(suggestions);
    });
  });
};

// Fetches the formatted address and its components
// and returns a formatted list containing these fields
const formatSuggestions = async (suggestions) => {
  formattedSuggestions = [];

  const places = suggestions.map((suggestion) =>
    suggestion.placePrediction.toPlace(),
  );

  promises = places.map((place) =>
    place.fetchFields({
      fields: ["formattedAddress", "addressComponents", "displayName"],
    }),
  );

  await Promise.all(promises);

  for (const place of places) {
    const title = place.formattedAddress.includes(place.displayName)
      ? place.formattedAddress
      : place.displayName + ", " + place.formattedAddress;

    formattedSuggestions.push({
      title: title,
      fields: [
        {
          key: "CoorFactu_Rue",
          name: "Rue",
          value: getComponent(place.addressComponents, "route"),
        },
        {
          key: "CoorFactu_Numéro",
          name: "Numéro",
          value: getComponent(place.addressComponents, "street_number"),
        },
        {
          key: "CoorFactu_Code postal",
          name: "Code postal",
          value: getComponent(place.addressComponents, "postal_code"),
        },
        {
          key: "CoorFactu_Ville",
          name: "Ville",
          value: getComponent(place.addressComponents, "locality"),
        },
        {
          key: "CoorFactu_Pays",
          name: "Pays",
          value: getComponent(place.addressComponents, "country"),
        },
      ],
    });
  }
  return formattedSuggestions;
};

// main
const main = async () => {
  console.log("64 - addressValue", addressValue);
  let suggestions = [];

  if (!addressValue) {
    // Use collection 'Adresses préférées'
    suggestions = addCollection();
  } else {
    // Autocomplete the address entered in the field with Google
    const googleSuggestions =
      await getGoogleAutocompleteSuggestions(addressValue);

    suggestions = await formatSuggestions(googleSuggestions);
  }
  console.log("64 - suggestions", suggestions);

  callback({
    suggestions: {
      [addressInput]: suggestions,
    },
  });
};

main();
