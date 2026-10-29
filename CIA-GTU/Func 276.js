//console.log("Search context:", context);

function toSuggestions(forms) {
  return forms.map((form) => {
    return {
      title: form.AdressesFrequentes_AdresseNom,
      fields: [
        {
          key: "AdressesFrequentes_Adresse",
          value: form.AdressesFrequentes_Adresse,
          name: "Adresse",
        },
      ],
    };
  });
}

const main = async () => {
  try {
    const field = inputKey || "TarifFixeEtablissementDep";
    const input = docData[field];

    const filterbase = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Adresses Fréquentes",
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    //console.log("Filter:", filter);
    const forms = await searchForms_FASTER(
      api,
      [
        ...filterbase,
        ...(input
          ? [
              {
                key: "AdressesFrequentes_AdresseNom",
                operator: "CONTAINS",
                value: input,
                type: "TEXT",
              },
            ]
          : []),
      ],
      10,
    );
    const forms2 = await searchForms_FASTER(
      api,
      [
        ...filterbase,
        ...(input
          ? [
              {
                key: "AdressesFrequentes_Adresse",
                operator: "CONTAINS",
                value: input,
                type: "TEXT",
              },
            ]
          : []),
      ],
      10,
    );
    //console.log("Search results:", forms);
    const suggestions = toSuggestions([...forms, ...forms2]);
    //console.log("Suggestions:", suggestions);
    callback({
      suggestions: {
        [field]: suggestions,
      },
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
main();

