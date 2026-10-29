console.log("Fonction 205 ", context);

let result = {
  Demande_TransportUMachette: "",
  Demande_TransportEMachette: "",
};

const field = inputKey;

// si le champ modifié est coché
if (docData[field] === "true") {
  result[field] = "true";
}

return result;
