console.log("Function 30", context);
// constants
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);
const sessionToken = new google.maps.places.AutocompleteSessionToken();

function toggleLoadingPopup(show, success, errorMessage, loadingMessage) {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      // Création du popup de chargement s'il n'existe pas
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
              position: fixed; 
              left: 0; 
              top: 0; 
              width: 100%; 
              height: 100%; 
              background-color: rgba(0,0,0,0.5); 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              z-index: 9999;
            `;
      document.body.appendChild(loadingPopup);

      // Ajout du CSS pour l'animation du spinner
      if (!document.getElementById("spinnerStyle")) {
        let style = document.createElement("style");
        style.id = "spinnerStyle";
        style.innerHTML = `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `;
        document.head.appendChild(style);
      }
    }
    // Mise à jour ou création du contenu du popup de chargement
    loadingPopup.innerHTML = `
          <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
            <div>${loadingMessage}</div>
            <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
          </div>
        `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
  } else {
    if (loadingPopup) loadingPopup.style.display = "none";
    if (success === false && errorMessage) {
      if (!errorBanner) {
        // Création du banner d'erreur s'il n'existe pas
        errorBanner = document.createElement("div");
        errorBanner.id = "errorBanner";
        errorBanner.style = `
                position: fixed; 
                top: 20px; 
                left: 50%;
                transform: translateX(-50%);
                width: auto; 
                min-width: 300px;
                height: 50px; 
                background-color: white; 
                color: black; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                z-index: 9999;
                border-radius: 5px;
                padding: 0 20px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
              `;
        document.body.appendChild(errorBanner);
      }
      // Mise à jour ou création du contenu du banner d'erreur
      errorBanner.innerHTML = `
            <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
            <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
          `;
      errorBanner.style.display = "flex";
      // Initialisation ou réinitialisation de la barre de progression
      let progressElement = document.getElementById("errorBannerProgress");
      let width = 0;
      let interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          errorBanner.style.display = "none";
        } else {
          width++;
          progressElement.style.width = width + "%";
        }
      }, 55); // La barre progresse sur 5 secondes
    }
  }
}

const getInputValue = () => {
  return docData["CC_AdresseDépart"];
};

// sync functions
// returns the value of a specific address component based on its type
const getComponent = (addressComponents, type) => {
  return (
    addressComponents.find((component) => component.types.includes(type))
      ?.longText ?? ""
  );
};

// Returns suggestions based on the AdressePreférées collection
const getPreferredAddressSuggestions = () => {
  const suggestions = [];

  for (const item of docData.AdressePreférées) {
    const adresse = item["AdressePreférées|100|Adresse"];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "Dénomination",
            value: item["AdressePreférées|200|Dénomination"] ?? "",
            name: "Dénomination",
          },
          {
            key: "VilleDépart",
            value: item["AdressePreférées|530|Ville"] ?? "",
            name: "Ville",
          },
          {
            key: "CodePostalDépart",
            value: item["AdressePreférées|520|Code_postal"] ?? "",
            name: "Code postal",
          },
          {
            key: "CC_Latitude",
            name: "Latitude",
            value: item["AdressePreférées|800|Latitude"] ?? "",
          },
          {
            key: "CC_Longitude",
            name: "Longitude",
            value: item["AdressePreférées|810|Longitude"] ?? "",
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
  const { suggestions } =
    await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
      {
        input: address,
        sessionToken: sessionToken,
        locationRestriction: bounds,
      },
    );
  return suggestions;
};

const getPlacesFromSuggestions = (suggestions) => {
  return suggestions
    .filter((suggestion) => suggestion?.placePrediction)
    .map((suggestion) => suggestion.placePrediction.toPlace());
};

const fetchPlacesFields = async (places) => {
  const promises = places.map((place) =>
    place.fetchFields({
      fields: [
        "formattedAddress",
        "displayName",
        "location",
        "addressComponents",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
      ],
    }),
  );

  await Promise.all(promises);
};

const getPlaceComponents = (place) => {
  const addressComponents = place.addressComponents ?? [];

  return {
    city: getComponent(addressComponents, "locality"),
    postalCode: getComponent(addressComponents, "postal_code"),
  };
};

const buildFormattedSuggestion = (place) => {
  const location = place.location;
  if (!location) return null;

  const formattedAddress = place.formattedAddress ?? "";
  const displayName = place.displayName ?? "";
  const components = getPlaceComponents(place);

  return {
    title: formattedAddress,
    fields: [
      {
        key: "Dénomination",
        name: "Dénomination",
        value:
          displayName && formattedAddress.includes(displayName)
            ? ""
            : displayName,
      },
      {
        key: "CC_Latitude",
        name: "Latitude",
        value: location.lat(),
      },
      {
        key: "CC_Longitude",
        name: "Longitude",
        value: location.lng(),
      },
      {
        key: "VilleDépart",
        name: "Ville",
        value: components.city,
      },
      {
        key: "CodePostalDépart",
        name: "Code postal",
        value: components.postalCode,
      },
      {
        key: "TelephoneNumber",
        name: "Téléphone",
        value:
          place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      },
    ],
  };
};

// Fetches the formatted address and geolocation
// and returns a formatted list containing these fields
const formatSuggestions = async (suggestions) => {
  const places = getPlacesFromSuggestions(suggestions);
  await fetchPlacesFields(places);

  return places
    .map((place) => buildFormattedSuggestion(place))
    .filter((suggestion) => suggestion !== null);
};

// main
const main = async () => {
  const addressValue = getInputValue();
  console.log("30 - addressValue", addressValue);
  let suggestions = [];
  let showErrorBanner = false;
  let errorMessage = "";

  if (addressValue) {
    toggleLoadingPopup(true, true, "", "Recherche en cours...");

    try {
      const googleSuggestions =
        await getGoogleAutocompleteSuggestions(addressValue);

      const formattedSuggestions = await formatSuggestions(googleSuggestions);

      if (formattedSuggestions.length > 0) {
        suggestions = formattedSuggestions;
      } else {
        suggestions = getPreferredAddressSuggestions();
      }
    } catch (error) {
      console.error("30 - google suggestions error", error);
      suggestions = getPreferredAddressSuggestions();
      showErrorBanner = true;
      errorMessage = "Erreur lors de la recherche des adresses.";
    }
  } else {
    suggestions = getPreferredAddressSuggestions();
  }

  console.log("30 - suggestions", suggestions);

  callback({
    suggestions: {
      CC_AdresseDépart: suggestions,
    },
  });

  toggleLoadingPopup(
    false,
    !showErrorBanner,
    showErrorBanner ? errorMessage : "",
    "Recherche en cours...",
  );
};

main();
