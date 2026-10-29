//console.log("Search context:", context);

function toSuggestions(forms) {
  return forms.map((form) => {
    return { title: form.NomTransporteur };
  });
}

const main = async () => {
  try {
    const input = docData[inputKey];
    const filter = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Transporteur",
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
      ...(input
        ? [
            {
              key: "NomTransporteur",
              operator: "CONTAINS",
              value: input,
              type: "TEXT",
            },
          ]
        : []),
    ];
    //console.log("Filter:", filter);
    const forms = await searchForms_FASTER(api, filter, 20);
    //console.log("Search results:", forms);
    const suggestions = toSuggestions(forms);
    //console.log("Suggestions:", suggestions);
    callback({
      suggestions: {
        Tarif_Transporteur: suggestions,
      },
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
main();

