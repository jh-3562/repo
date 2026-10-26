console.log("Function 36", context);

// Constants
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);
const sessionToken = new google.maps.places.AutocompleteSessionToken();

// Utiliser des constantes réutilisables pour les clés
const FIELD_KEYS = {
  LATITUDE: "CC_Destinations|800|Latitude",
  LONGITUDE: "CC_Destinations|900|Longitude",
  DENOMINATION: "CC_Destinations|110|Dénomination",
  TELEPHONE: "CC_Destinations|920|Telephone",
  VILLE: "VilleDestination",
  CP: "CodePostalDestination",
};

const getInputValue = () => {
  const prefix = inputKey.split("|")[0];
  return docData[prefix]?.[indexItemChange]?.[inputKey];
};

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

// Helper pour extraire un composant d'adresse
const getComponent = (addressComponents, type) => {
  return addressComponents.find((c) => c.types.includes(type))?.longText || "";
};

// Returns suggestions based on the AdressePreférées collection
const getPreferredAddressSuggestions = () => {
  const collection = "AdressePreférées|100|Adresse";
  const collectionDeno = "AdressePreférées|200|Dénomination";
  const collectionLat = "AdressePreférées|800|Latitude";
  const collectionLng = "AdressePreférées|810|Longitude";
  const suggestions = [];

  for (const item of docData.AdressePreférées) {
    const adresse = item[collection];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "CC_Destinations|110|Dénomination",
            value: item[collectionDeno] ?? "",
            name: "Dénomination",
          },
          {
            key: FIELD_KEYS.VILLE,
            name: "Ville",
            value: item["AdressePreférées|530|Ville"] ?? "",
          },
          {
            key: FIELD_KEYS.CP,
            name: "Code postal",
            value: item["AdressePreférées|520|Code_postal"] ?? "",
          },
          {
            key: "CC_Destinations|800|Latitude",
            name: "Latitude",
            value: item[collectionLat] ?? "",
          },
          {
            key: "CC_Destinations|900|Longitude",
            name: "Longitude",
            value: item[collectionLng] ?? "",
          },
        ],
      });
    }
  }
  return suggestions;
};

// Récupère les suggestions Google Autocomplete
const getGoogleAutocompleteSuggestions = (address) => {
  return google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
    {
      input: address,
      sessionToken: sessionToken,
      locationRestriction: bounds,
    },
  ).then(({ suggestions }) => suggestions);
};

// Formate les suggestions avec les détails du lieu
const formatSuggestions = async (suggestions) => {
  const places = suggestions.map((s) => s.placePrediction.toPlace());

  await Promise.all(
    places.map((place) =>
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
    ),
  );

  return places.map((place) => ({
    title: place.formattedAddress,
    fields: [
      {
        key: FIELD_KEYS.DENOMINATION,
        name: "Dénomination",
        value: place.formattedAddress.includes(place.displayName)
          ? ""
          : place.displayName,
      },
      {
        key: FIELD_KEYS.LATITUDE,
        name: "Latitude",
        value: place.location.lat(),
      },
      {
        key: FIELD_KEYS.LONGITUDE,
        name: "Longitude",
        value: place.location.lng(),
      },
      {
        key: FIELD_KEYS.VILLE,
        name: "Ville",
        value: getComponent(place.addressComponents, "locality"),
      },
      {
        key: FIELD_KEYS.CP,
        name: "Code postal",
        value: getComponent(place.addressComponents, "postal_code"),
      },
      {
        key: FIELD_KEYS.TELEPHONE,
        name: "Téléphone",
        value:
          place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      },
    ],
  }));
};

// Fonction principale
const main = async () => {
  const addressValue = getInputValue();
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

  console.log("36 - suggestions", suggestions);

  callback({
    suggestions: {
      [inputKey]: suggestions,
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
