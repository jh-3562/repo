console.log('Function 169', context);

const MIN_CHARACTERS = 2;

// === CONFIGURATION ===
const configMap = {
    "Etablissement_Adresse": {
        ADDRESS: "Etablissement_Adresse",
        GEOCODE_AZURE_MAPS: "GeocodeAzureMapsDepart",
        LONGITUDE: "startLongitude",
        LATITUDE: "startLatitude",
        RUE: "Etablissement_Rue",
        VILLE: "Etablissement_Ville",
        CODE_POSTAL: "Etablissement_CodePostal",
        COUNTRY: "Etablissement_Pays",
    },

    "Visiteurs_adresse": {
        ADDRESS: "Visiteurs_adresse",
        GEOCODE_AZURE_MAPS: "GeocodeAzureMapsDepart",
        LONGITUDE: "startLongitude",
        LATITUDE: "startLatitude",
        RUE: "Etablissement_Rue",
        VILLE: "Etablissement_Ville",
        CODE_POSTAL: "Etablissement_CodePostal",
        COUNTRY: "Etablissement_Pays",
    },

    "EtablissementDest_Adresse": {
        ADDRESS: "EtablissementDest_Adresse",
        GEOCODE_AZURE_MAPS: "GeocodeAzureMapsDestination",
        LONGITUDE: "endLongitude",
        LATITUDE: "endLatitude",
        RUE: "EtablissementDest_Rue",
        VILLE: "EtablissementDest_Ville",
        CODE_POSTAL: "EtablissementDest_CodePostal",
        COUNTRY: "EtablissementDest_Pays",
    },

    "Stop_Destination": {
        ADDRESS: "Stop_Destination",
        GEOCODE_AZURE_MAPS: "GeocodeAzureMapsDestination",
        LONGITUDE: "endLongitude",
        LATITUDE: "endLatitude",
        RUE: "EtablissementDest_Rue",
        VILLE: "EtablissementDest_Ville",
        CODE_POSTAL: "EtablissementDest_CodePostal",
        COUNTRY: "EtablissementDest_Pays",
    },
};

const config = {
    KEY: configMap[inputKey],
};

// === API UTILS ===
const apiUtils = {
    fetchGoogle: async (address) => {
        const geocoder = new google.maps.Geocoder();
        const data = await geocoder.geocode({address});
        if (!data.results?.length) throw new Error('Google API error: No results found');
        return data;
    },

    fetchAzure: async (address) => {
        const url = new URL("https://atlas.microsoft.com/search/address/json");
        url.search = new URLSearchParams({
            "api-version": "1.0",
            "subscription-key": AZURE_MAPS_KEY,
            query: address,
            limit: "5",
            language: "fr-FR",
            countrySet: "CA",
        });
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Azure API error: ${response.status}`);
        const data = await response.json();
        if (!data.results?.[0]) throw new Error('Azure API error: No results found');
        return data;
    },
};

// === ACTIONS ===
const actions = {
    searchWithGoogle: async (address) => {
        const format = ({ results }) => {
            const result = results[0];

            const getComponent = (type) =>
                result.address_components.find(c => c.types.includes(type))?.long_name || null;

            return {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
                street: getComponent("route"),
                locality: getComponent("locality"),
                postalCode: getComponent("postal_code"),
            };
        };

        const raw = await apiUtils.fetchGoogle(address);
        return format(raw);
    },

    searchWithAzure: async (address) => {
        const format = (data) => {
            const result = data.results[0];
            const address = result.address || {};

            return {
                lat: result.position.lat,
                lng: result.position.lon,
                street: address.streetName || null,
                locality: address.localName || null,
                postalCode: address.extendedPostalCode || null,
            };
        };

        const raw = await apiUtils.fetchAzure(address);
        return format(raw);
    },
};

// === MAIN PROCESS ===
const main = async () => {
    try {
        if (!config.KEY) {
            console.error(`Unsupported inputKey: ${inputKey}`);
            return callback({});
        }

        const address = docData[config.KEY.ADDRESS]?.trim();

        if (!address || address.length < MIN_CHARACTERS) {
            return callback({});
        }

        const useAzure =
            String(docData[config.KEY.GEOCODE_AZURE_MAPS]).toLowerCase() === "true";

        console.log("Provider:", useAzure ? "Azure" : "Google");

        const geo = useAzure
            ? await actions.searchWithAzure(address)
            : await actions.searchWithGoogle(address);

        console.log("geocodeResult", geo);

        callback({
            data: {
                [config.KEY.LONGITUDE]: geo.lng,
                [config.KEY.LATITUDE]: geo.lat,
                [config.KEY.RUE]: geo.street,
                [config.KEY.VILLE]: geo.locality,
                [config.KEY.CODE_POSTAL]: geo.postalCode,
            },
        });
    } catch (error) {
        console.error("ERROR:", error.message);
    }
};

main();