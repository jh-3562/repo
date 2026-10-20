console.log("Fonction 279", context);

const searchValue = docData[inputKey] || "";

const searchListe = (recherche) => {
  const texte = String(recherche || "")
    .trim()
    .toLowerCase();

  if (!texte) {
    return [];
  }

  return UNITES_ADMINISTRATIVES
    .filter((item) =>
      item.toLowerCase().includes(texte)
    )
    .slice(0, 5);
};

const suggestionFields = (value) => {
  return [
    {
      key: inputKey,
      name: inputKey,
      value,
    },
  ];
};

const main = async () => {
  const suggestions = {
    suggestions: {
      [inputKey]: [],
    },
  };

  const resultats = searchListe(searchValue);

  suggestions.suggestions[inputKey] = resultats.map((item) => {
    return {
      title: item,
      fields: suggestionFields(item),
    };
  });

  callback(suggestions);
};

main();
