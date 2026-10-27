console.log("Fonction 50", context);

const sessionToken = new google.maps.places.AutocompleteSessionToken();
const bounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(40.3413, -80.4409),
  new google.maps.LatLng(50.8722, -70.9471),
);
const addressInput = inputKey;
const addressValue = docData[inputKey] ? docData[inputKey].toString() : "";

// Retourne la valeur d'une composante d'adresse Google selon son type.
const getComponent = (addressComponents, type) => {
  let componentValue = "";
  for (const component of addressComponents || []) {
    const types = component.types || [];
    if (types.includes(type)) {
      componentValue = component.longText || component.long_name || "";
      break;
    }
  }

  return componentValue;
};

// Valide qu'un texte ressemble a une ville (et non un code postal/province).
const isLikelyCityName = (value) => {
  let isValid = false;

  if (value) {
    // Nettoie les espaces pour normaliser la verification.
    const normalized = value.trim();
    // Rejette les valeurs contenant des chiffres (souvent rue/code postal).
    if (normalized && !/\d/.test(normalized)) {
      const upper = normalized.toUpperCase();
      // Abreviations de provinces canadiennes.
      const provinceCodes = [
        "AB",
        "BC",
        "MB",
        "NB",
        "NL",
        "NS",
        "NT",
        "NU",
        "ON",
        "PE",
        "QC",
        "SK",
        "YT",
      ];
      // Noms complets de provinces/territoires: on les exclut du champ Ville.
      const provinceNames = [
        "ALBERTA",
        "COLOMBIE-BRITANNIQUE",
        "MANITOBA",
        "NOUVEAU-BRUNSWICK",
        "TERRE-NEUVE-ET-LABRADOR",
        "NOUVELLE-ECOSSE",
        "TERRITOIRES DU NORD-OUEST",
        "NUNAVUT",
        "ONTARIO",
        "ILE-DU-PRINCE-EDOUARD",
        "QUÉBEC",
        "SASKATCHEWAN",
        "YUKON",
      ];

      isValid =
        !provinceCodes.includes(upper) && !provinceNames.includes(upper);
    }
  }

  return isValid;
};

// Choisit la ville en priorisant l'adresse affichee, puis les composantes Google.
const getCityValue = (addressComponents, formattedAddress) => {
  let cityValue = "";

  if (formattedAddress) {
    const parts = formattedAddress
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    // parts[1] correspond au segment "ville" dans la majorite des adresses formatees.
    if (isLikelyCityName(parts[1])) {
      cityValue = parts[1];
    }
  }

  if (!cityValue) {
    // Ordre de fallback pour rester coherent quand l'adresse formatee est ambigue.
    const priorityTypes = [
      "locality",
      "postal_town",
      "administrative_area_level_2",
    ];

    for (const type of priorityTypes) {
      const value = getComponent(addressComponents, type);
      if (value) {
        cityValue = value;
        break;
      }
    }
  }

  return cityValue;
};

// Interroge l'API Places et retourne toujours un tableau (meme en cas d'erreur).
const getGoogleAutocompleteSuggestions = async (input) =>
  new Promise((resolve) => {
    google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      includedRegionCodes: ["ca"],
      sessionToken,
      locationRestriction: bounds,
    })
      .then(({ suggestions }) => {
        resolve(suggestions || []);
      })
      .catch((err) => {
        console.error("Autocomplete error:", err);
        resolve([]);
      });
  });

const formatSuggestions = async (suggestions) => {
  const formattedSuggestions = [];

  for (const suggestion of suggestions) {
    const placePrediction = suggestion.placePrediction;
    if (!placePrediction) {
      continue;
    }

    const place = placePrediction.toPlace();

    await place.fetchFields({
      fields: [
        "formattedAddress",
        "displayName",
        "location",
        "addressComponents",
      ],
    });

    // Evite de dupliquer le displayName s'il est deja dans formattedAddress.
    const title = place.formattedAddress.includes(place.displayName)
      ? place.formattedAddress
      : place.displayName + ", " + place.formattedAddress;

    formattedSuggestions.push({
      title,
      fields: [
        {
          key: "AdressesFrequentes_Latitude",
          name: "Latitude",
          value: place.location ? place.location.lat().toString() : "",
        },
        {
          key: "AdressesFrequentes_Longitude",
          name: "Longitude",
          value: place.location ? place.location.lng().toString() : "",
        },
        {
          key: "Adresses_VilleLocation",
          name: "Ville",
          value: getCityValue(place.addressComponents, place.formattedAddress),
        },
        {
          key: "Adresses_CodePostal",
          name: "Code postal",
          value: getComponent(place.addressComponents, "postal_code"),
        },
      ],
    });
  }

  return formattedSuggestions;
};

const main = async () => {
  let suggestions = [];
  const data = {};

  data.AdressesFrequentes_Latitude = "";
  data.AdressesFrequentes_Longitude = "";
  data.Adresses_VilleLocation = "";
  data.Adresses_CodePostal = "";

  if (addressValue) {
    const googleSuggestions =
      await getGoogleAutocompleteSuggestions(addressValue);
    suggestions = await formatSuggestions(googleSuggestions);

    if (suggestions[0]) {
      const firstFields = suggestions[0].fields || [];
      const typedAddress = addressValue.trim().toLowerCase();
      const selectedAddress = (suggestions[0].title || "").trim().toLowerCase();

      // Remplit les champs uniquement si la valeur tapee correspond exactement a la suggestion choisie.
      if (typedAddress === selectedAddress) {
        data.AdressesFrequentes_Latitude =
          firstFields.find(
            (field) => field.key === "AdressesFrequentes_Latitude",
          )?.value || "";
        data.AdressesFrequentes_Longitude =
          firstFields.find(
            (field) => field.key === "AdressesFrequentes_Longitude",
          )?.value || "";
        data.Adresses_VilleLocation =
          firstFields.find((field) => field.key === "Adresses_VilleLocation")
            ?.value || "";
        data.Adresses_CodePostal =
          firstFields.find((field) => field.key === "Adresses_CodePostal")
            ?.value || "";
      } else {
        // Si l'utilisateur modifie l'adresse, on vide les champs derives.
        data.AdressesFrequentes_Latitude = "";
        data.AdressesFrequentes_Longitude = "";
        data.Adresses_VilleLocation = "";
        data.Adresses_CodePostal = "";
      }
    }
  }

  callback({
    suggestions: {
      [addressInput]: suggestions,
    },
    data,
  });
};

main();
