console.log("Fonction FILL FIELD")

const result = {};
if (docData["STATUS"] === "Draft") {
  result["HeureDebutIndispo"] = "00:00";
  result["HeureFinIndispo"] = "23:45";
}

return result