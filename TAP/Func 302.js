console.log("Fonction SHOW SECTION");
result = {};
if (docData["STATUS"] === "Draft") {
  result["IndisponibiliteHoraire"] = null;
} else {
  result["IndisponibilitePlanification"] = null;
  result["IndisponibilitéBatchButtons"] = null;
}
return result;
