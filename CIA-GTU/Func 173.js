console.log("Fonction 173 ", context);

let result = {
  "Moniteur+DéfibrilateurT": "",
  "Moniteur+Défibrilateur": "",
};

const field = inputKey;

// si le champ modifié est coché
if (docData[field] === "true") {
  result[field] = "true";
}

return result;
