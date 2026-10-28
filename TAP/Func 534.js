console.log("Function 534", context);

const FIELD_ID = "567f8bcd-f061-42c5-972d-deb9402bbaf3";

const configurations = {
  Etablissement_NomLieu: {
    mapping: [
      {
        from: "AdresseInstitution",
        to: "Visiteurs_adresse",
      },
    ],
  },

  EtablissementDest_NomLieu: {
    mapping: [
      {
        from: "AdresseInstitution",
        to: "Stop_Destination",
      },
    ],
  },
};

const filters = [];
const config = configurations[inputKey];
const searchValue = docData?.[inputKey];

console.log("Champ déclenché :", inputKey);
console.log("Valeur recherchée :", searchValue);

if (!config || !searchValue) {
  callback([]);
} else {
  api({ local: true })
    .get(
      `suggestion?fieldID=${FIELD_ID}&fieldValue=${encodeURIComponent(
        searchValue,
      )}`,
    )
    .then((res) => {
      const suggestions = res?.data?.suggestions || [];

      const mappedSuggestions = suggestions
        .filter(
          (suggestion) =>
            filters.length === 0 ||
            filters.every((filter) =>
              (suggestion?.autoFill || []).some(
                (autoFillField) =>
                  autoFillField[filter.key] === filter.value,
              ),
            ),
        )
        .map((suggestion) => ({
          title: suggestion?.value,

          fields: config.mapping
            .map((mapping) => {
              const autoFillField = (
                suggestion?.autoFill || []
              ).find((field) => field.key === mapping.from);

              if (!autoFillField) {
                return null;
              }

              return {
                ...autoFillField,
                key: mapping.to,
                value: autoFillField.value || "",
              };
            })
            .filter(Boolean),
        }));

      console.log(
        "Suggestions envoyées :",
        mappedSuggestions,
      );

      callback({
        suggestions: {
          [inputKey]: mappedSuggestions,
        },
      });
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des suggestions :",
        error,
      );

      callback([]);
    });
}