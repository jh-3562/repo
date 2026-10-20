console.log("Fonction 172 ", context);

let result = {
  Demande_TransportEOxygeneT: "",
  Demande_TransportEOxygene: "",
  //Demande_TransportAutreEquipements: "",
};

const field = inputKey;

// si le champ modifié est coché
if (docData[field] === "true") {
  result[field] = "true";
}

return result;
