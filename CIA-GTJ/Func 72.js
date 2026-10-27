console.log("Fonction 72", context);

// Bounds for Abitibi region
const getAbitibiBounds = async () => {
  const { LatLng, LatLngBounds } = await google.maps.importLibrary("core");

  return new LatLngBounds(
    new LatLng(47.0, -80.5),
    new LatLng(49.5, -76.0),
  );
};

// Returns Google autocomplete suggestions for the given input
const getGoogleAutocompleteSuggestions = async (input) => {
  const { AutocompleteSuggestion } =
    await google.maps.importLibrary("places");

  const locationRestriction = await getAbitibiBounds();

  const request = {
    input,
    locationRestriction,
    includedRegionCodes: ["ca"],
  };

  const { suggestions } =
    await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

  return suggestions || [];
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

    console.log("suggestions", suggestions);

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
