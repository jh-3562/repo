console.log("Function 146", context);

const Adresses_AdresseLocation = docData?.Adresses_AdresseLocation;
const Adresses_VilleLocation = docData?.Adresses_VilleLocation;
const Adresses_CodePostal = docData?.Adresses_CodePostal;
const AdressesFrequentes_Longitude = docData?.AdressesFrequentes_Longitude;
const AdressesFrequentes_Latitude = docData?.AdressesFrequentes_Latitude;

const geocoder = new google.maps.Geocoder();

const geocode = (address, region) =>
  new Promise((resolve, reject) => {
    geocoder.geocode({ address, region }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        resolve(results[0]);
        return;
      }

      reject(new Error(`Google Geocoding error: ${status}`));
    });
  });

const getAddressComponent = (components, type) =>
  components.find((component) => component.types.includes(type))?.long_name ??
  null;

const normalizeAddressPart = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(\d+)\s*,\s*/, "$1 ")
    .replace(/\b(\d+)\s*(?:i[eè]me|ième)\b/gi, "$1e");

const main = async () => {
  const oldValues = {
    Adresses_AdresseLocation,
    Adresses_VilleLocation,
    Adresses_CodePostal,
    AdressesFrequentes_Longitude,
    AdressesFrequentes_Latitude,
  };

  const address = [
    Adresses_AdresseLocation,
    Adresses_VilleLocation,
    "Québec",
    Adresses_CodePostal,
    "Canada",
  ]
    .map(normalizeAddressPart)
    .filter(Boolean)
    .join(", ");

  if (!address) {
    console.warn("Google Geocoding skipped: no address was provided.");
    injectDocData({
      fillData: {},
    });
    return;
  } else {
    console.log("146 - adresse: ", address);
  }

  try {
    const result = await geocode(address, "CA");
    console.log("146 - Google Geocoding output", result);
    const components = result.address_components || [];
    const newValues = {
      Adresses_AdresseLocation: result.formatted_address ?? null,
      Adresses_VilleLocation:
        getAddressComponent(components, "locality") ||
        getAddressComponent(components, "postal_town"),
      Adresses_CodePostal: getAddressComponent(components, "postal_code"),
      AdressesFrequentes_Longitude:
        result.geometry?.location?.lng()?.toString() ?? null,
      AdressesFrequentes_Latitude:
        result.geometry?.location?.lat()?.toString() ?? null,
    };

    console.log("146 - Google Geocoding comparison", {
      Adresses_AdresseLocation: {
        new: newValues.Adresses_AdresseLocation,
        old: oldValues.Adresses_AdresseLocation,
      },
      Adresses_VilleLocation: {
        new: newValues.Adresses_VilleLocation,
        old: oldValues.Adresses_VilleLocation,
      },
      Adresses_CodePostal: {
        new: newValues.Adresses_CodePostal,
        old: oldValues.Adresses_CodePostal,
      },
      AdressesFrequentes_Longitude: {
        new: newValues.AdressesFrequentes_Longitude,
        old: oldValues.AdressesFrequentes_Longitude,
      },
      AdressesFrequentes_Latitude: {
        new: newValues.AdressesFrequentes_Latitude,
        old: oldValues.AdressesFrequentes_Latitude,
      },
    });

    injectDocData({
      fillData: newValues,
    });
  } catch (error) {
    console.error("Google Geocoding failed:", error);
  }
};

main();
