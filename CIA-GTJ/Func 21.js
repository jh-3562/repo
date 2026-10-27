console.log('function 21', context);

const abitibiBounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(47.0, -80.5),
  new google.maps.LatLng(49.5, -76.0)
);

const getGoogleAutocompleteSuggestions = async (input) => {
  const { suggestions } =
    await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      locationBias: abitibiBounds,
      includedRegionCodes: ['ca'],
    });

  return suggestions || []; //renvoyer liste vide au lieu de undefined
};

const getCityFromAddressComponents = (components = []) => {
  const cityComponent =
    components.find((c) => c.types.includes('locality')) ||
    components.find((c) => c.types.includes('postal_town')) ||
    components.find((c) => c.types.includes('administrative_area_level_3')) ||
    components.find((c) => c.types.includes('administrative_area_level_2')) ||
    components.find((c) => c.types.includes('administrative_area_level_1'));

  return cityComponent?.longText || cityComponent?.long_name || '';
};

const getPlaceDetailsFromSuggestion = async (suggestion) => {
  const placePrediction = suggestion.placePrediction;

  if (!placePrediction) {
    return null;
  }

  const place = placePrediction.toPlace();

  await place.fetchFields({
    fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
  });

  return {
    title: place.displayName || placePrediction.text?.text || place.formattedAddress || '',
    address: place.formattedAddress || placePrediction.text?.text || '',
    city: getCityFromAddressComponents(place.addressComponents || []),
    lat: place.location?.lat ? place.location.lat() : '',
    lon: place.location?.lng ? place.location.lng() : '',
  };
};

const possibleTriggers = [
  'DemandeAllerD_NomDuLieu',
  'DemandeAllerA_NomDuLieu',
  'DemandeRetourD_NomDuLieu',
  'DemandeRetourA_NomDuLieu',

  'DemandeAllerD_Adresse',
  'DemandeAllerA_Adresse',
  'DemandeRetourD_Adresse',
  'DemandeRetourA_Adresse',
];

const updated = Array.isArray(context?.updatedKeys) ? context.updatedKeys : [];
const triggerField = updated.find((k) => possibleTriggers.includes(k));

if (!triggerField) {
  callback({ suggestions: {} });
  return;
}

const needle = String(docData?.[triggerField] ?? '').trim();

if (!needle) {
  callback({ suggestions: { [triggerField]: [] } });
  return;
}

const fieldMap = {
  DemandeAllerD_NomDuLieu: {
    nom: 'DemandeAllerD_NomDuLieu',
    adresse: 'DemandeAllerD_Adresse',
    ville: 'DemandeAllerD_Ville',
    lat: 'Transport_Latitude',
    lon: 'Transport_Longitude',
    tel: 'DemandeAllerD_Telephone',
    poste: 'DemandeAllerD_Poste',
  },
  DemandeAllerD_Adresse: {
    nom: 'DemandeAllerD_NomDuLieu',
    adresse: 'DemandeAllerD_Adresse',
    ville: 'DemandeAllerD_Ville',
    lat: 'Transport_Latitude',
    lon: 'Transport_Longitude',
    tel: 'DemandeAllerD_Telephone',
    poste: 'DemandeAllerD_Poste',
  },

  DemandeAllerA_NomDuLieu: {
    nom: 'DemandeAllerA_NomDuLieu',
    adresse: 'DemandeAllerA_Adresse',
    ville: 'DemandeAllerA_Ville',
    lat: 'Transport_LatitudeAllerA',
    lon: 'Transport_LongitudeAllerA',
    tel: 'DemandeAllerA_Telephone',
    poste: 'DemandeAllerA_Poste',
  },
  DemandeAllerA_Adresse: {
    nom: 'DemandeAllerA_NomDuLieu',
    adresse: 'DemandeAllerA_Adresse',
    ville: 'DemandeAllerA_Ville',
    lat: 'Transport_LatitudeAllerA',
    lon: 'Transport_LongitudeAllerA',
    tel: 'DemandeAllerA_Telephone',
    poste: 'DemandeAllerA_Poste',
  },

  DemandeRetourD_NomDuLieu: {
    nom: 'DemandeRetourD_NomDuLieu',
    adresse: 'DemandeRetourD_Adresse',
    ville: 'DemandeRetourD_Ville',
    lat: 'Transport_LatitudeRetourD',
    lon: 'Transport_LongitudeRetourD',
    tel: 'DemandeRetourD_Telephone',
    poste: 'DemandeRetourD_Poste',
  },
  DemandeRetourD_Adresse: {
    nom: 'DemandeRetourD_NomDuLieu',
    adresse: 'DemandeRetourD_Adresse',
    ville: 'DemandeRetourD_Ville',
    lat: 'Transport_LatitudeRetourD',
    lon: 'Transport_LongitudeRetourD',
    tel: 'DemandeRetourD_Telephone',
    poste: 'DemandeRetourD_Poste',
  },

  DemandeRetourA_NomDuLieu: {
    nom: 'DemandeRetourA_NomDuLieu',
    adresse: 'DemandeRetourA_Adresse',
    ville: 'DemandeRetourA_Ville',
    lat: 'Transport_LatitudeRetourA',
    lon: 'Transport_LongitudeRetourA',
    tel: 'DemandeRetourA_Telephone',
    poste: 'DemandeRetourA_Poste',
  },
  DemandeRetourA_Adresse: {
    nom: 'DemandeRetourA_NomDuLieu',
    adresse: 'DemandeRetourA_Adresse',
    ville: 'DemandeRetourA_Ville',
    lat: 'Transport_LatitudeRetourA',
    lon: 'Transport_LongitudeRetourA',
    tel: 'DemandeRetourA_Telephone',
    poste: 'DemandeRetourA_Poste',
  },
};

const targets = fieldMap?.[triggerField];
if (!targets) {
  callback({ suggestions: { [triggerField]: [] } });
  return;
}

const isAddressTrigger = triggerField.endsWith('_Adresse');

const searchField = isAddressTrigger ? 'Adresses_AdresseLocation' : 'Adresses_NomLocation';

// ===================== FILTRES API =====================
const apiFilters = [
  {
    key: 'FORMLAYOUTNAME',
    operator: 'EQUALS',
    value: 'Adresses',
    type: 'TEXT',
  },
  { key: 'STATUS', operator: 'EQUALS', value: 'Actif', type: 'TEXT' },
  {
    key: searchField,
    operator: 'CONTAINS',
    value: needle,
    type: 'TEXT',
  },
];

// ===================== MAIN =====================
const main = async () => {
  try {
    const res = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters,
    });

    const ids = (res?.data?.ids || []).slice(0, 10);

    // Si aucune adresse n'est trouvée dans la base de données,
    // on cherche dans Google Maps avec AutocompleteSuggestion.
    if (ids.length === 0) {
      const googlePredictions = await getGoogleAutocompleteSuggestions(needle);

      const googleSuggestions = await Promise.all(
        googlePredictions.map(async (suggestion) => {
          const details = await getPlaceDetailsFromSuggestion(suggestion);

          if (!details) {
            return null;
          }

          return {
            title: details.title,
            fields: [
              //{
              //  key: targets.nom,
              //  name: "Nom du lieu",
              //  value: isAddressTrigger ? "" : details.title,
              //},
              {
                key: targets.adresse,
                name: 'Adresse',
                value: details.address,
              },
              {
                key: targets.ville,
                name: 'Ville',
                value: details.city,
              },
              {
                key: targets.lat,
                name: 'Latitude',
                value: details.lat,
              },
              {
                key: targets.lon,
                name: 'Longitude',
                value: details.lon,
              },
            ],
          };
        })
      );

      callback({
        suggestions: {
          [triggerField]: googleSuggestions.filter(Boolean),
        },
      });

      return;
    }

    const res2 = await api({ local: true }).post('document/id', { ids });
    const documents = res2?.data?.documents || [];

    const suggestions = documents.map((doc) => {
      const data = JSON.parse(doc.data);

      return {
        title: isAddressTrigger
          ? data.Adresses_AdresseLocation || ''
          : data.Adresses_NomLocation || '',
        fields: [
          {
            key: targets.nom,
            name: 'Nom du lieu',
            value: data.Adresses_NomLocation || '',
          },
          {
            key: targets.adresse,
            name: 'Adresse',
            value: data.Adresses_AdresseLocation || '',
          },
          {
            key: targets.ville,
            name: 'Ville',
            value: data.Adresses_VilleLocation || '',
          },
          {
            key: targets.lat,
            name: 'Latitude',
            value: data.AdressesFrequentes_Latitude || '',
          },
          {
            key: targets.lon,
            name: 'Longitude',
            value: data.AdressesFrequentes_Longitude || '',
          },
          {
            key: targets.tel,
            name: 'Telephone',
            value: data.Adresses_TelephoneLocation || '',
          },
          {
            key: targets.poste,
            name: 'Poste',
            value: data.Adresses_Poste || '',
          },
        ],
      };
    });

    callback({ suggestions: { [triggerField]: suggestions } });
  } catch (error) {
    console.error('function 21 error', error);
    callback({ suggestions: { [triggerField]: [] } });
  }
};

main();
