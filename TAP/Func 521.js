console.log('Function 521', context);

result = {};
if (docData["STATUS"] === "ACTIF") {
  result["ModifierClientInfoProcess"] = true;
} else {
  result["ModifierClientInfoProcess"] = null;
}
return result;

