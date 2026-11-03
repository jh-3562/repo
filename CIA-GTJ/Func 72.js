console.log("Fonction 72", context);

const MAX_SUGGESTIONS = 5;

// Bounds for Abitibi region (limite ouest = frontière de l'Ontario)
const getAbitibiBounds = async () => {
  const { LatLng, LatLngBounds } = await google.maps.importLibrary("core");

  return new LatLngBounds(
    new LatLng(47.0, -79.5),
    new LatLng(49.5, -76.0),
  );
};

// Interroge l'API Places et retourne toujours un tableau (meme en cas d'erreur).
const fetchSuggestions = async (input, zoneOptions) => {
  try {
    const { AutocompleteSuggestion } =
      await google.maps.importLibrary("places");

    const { suggestions } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        includedRegionCodes: ["ca"],
        ...zoneOptions,
      });

    return suggestions || [];
  } catch (error) {
    console.error("Erreur autocomplete Fonction 72:", error);
    return [];
  }
};

// Adresses de l'Abitibi en premier, complétées par celles d'ailleurs jusqu'à 5 (sans doublons).
const getGoogleAutocompleteSuggestions = async (input) => {
  const abitibiBounds = await getAbitibiBounds();

  const [abitibiSuggestions, otherSuggestions] = await Promise.all([
    fetchSuggestions(input, { locationRestriction: abitibiBounds }),
    fetchSuggestions(input, {}),
  ]);

  const seenPlaceIds = new Set();
  return [...abitibiSuggestions, ...otherSuggestions]
    .filter((suggestion) => {
      const placeId = suggestion.placePrediction?.placeId;
      if (!placeId || seenPlaceIds.has(placeId)) {
        return false;
      }
      seenPlaceIds.add(placeId);
      return true;
    })
    .slice(0, MAX_SUGGESTIONS);
};

const getSuggestionTitle = (suggestion) => {
  return (
    suggestion?.placePrediction?.text?.toString?.() ||
    suggestion?.placePrediction?.text ||
    suggestion?.placePrediction?.mainText?.toString?.() ||
    ""
  );
};

// main
const main = async () => {
  const inputValue = String(docData?.[inputKey] || "").trim();

  if (!inputValue) {
    callback({
      suggestions: {
        [inputKey]: [],
      },
    });

    return [];
  }

  try {
    let suggestions = await getGoogleAutocompleteSuggestions(inputValue);

    suggestions = suggestions
      .map((suggestion) => {
        const title = getSuggestionTitle(suggestion);

        return {
          title,
          fields: [],
        };
      })
      .filter((suggestion) => suggestion.title);

    callback({
      suggestions: {
        [inputKey]: suggestions,
      },
    });

    return suggestions;
  } catch (error) {
    console.error("Erreur autocomplete Fonction 72:", error);

    callback({
      suggestions: {
        [inputKey]: [],
      },
    });

    return [];
  }
};

main();
