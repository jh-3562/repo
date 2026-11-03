console.log("Fonction 605", context);

// Check if fields are present in docData (not just if they're empty)
const hasRecuperationField = "Recuperation" in docData;

// Get the first item from Recuperation array (if it exists and is not empty)
const recuperationItem =
  hasRecuperationField &&
  Array.isArray(docData.Recuperation) &&
  docData.Recuperation.length > 0
    ? docData.Recuperation[0]
    : null;

const noInventaireValue = recuperationItem
  ? String(recuperationItem["Recuperation|1|NoInventaire"] || "").trim()
  : "";

// Check for AddFirstEquipment checkbox
const addFirstEquipmentChecked =
  docData["AddFirstEquipment"] === "true" ||
  docData["AddFirstEquipment"] === true;

// Check for any equipment checkboxes
let hasAnyEquipmentAdded = addFirstEquipmentChecked;

// Check all other equipment add checkboxes (1L_Add through 10L_Add)
if (!hasAnyEquipmentAdded) {
  for (let i = 1; i <= 10; i++) {
    const equipmentAddKey = `${i}L_Add`;
    const isEquipmentAdded =
      docData[equipmentAddKey] === "true" || docData[equipmentAddKey] === true;
    if (isEquipmentAdded) {
      hasAnyEquipmentAdded = true;
      break;
    }
  }
}

const hasNoInventaire =
  noInventaireValue !== "" && noInventaireValue.toLowerCase() !== "undefined";
const remarqueRecupValue = String(docData["RemarqueRecup"] || "").trim();
const hasRemarqueRecup =
  remarqueRecupValue !== "" && remarqueRecupValue.toLowerCase() !== "undefined";
// Check RecupSansNo group (e.g. RecupSansNo|1|Description, RecupSansNo|2|Statut)
const hasRecupSansNoField = "RecupSansNo" in docData;
const recupSansNoItem =
  hasRecupSansNoField &&
  Array.isArray(docData.RecupSansNo) &&
  docData.RecupSansNo.length > 0
    ? docData.RecupSansNo[0]
    : null;
const recupSansNoDesc = recupSansNoItem
  ? String(recupSansNoItem["RecupSansNo|1|Description"] || "").trim()
  : "";
const recupSansNoStatut = recupSansNoItem
  ? String(recupSansNoItem["RecupSansNo|2|Statut"] || "").trim()
  : "";
const hasRecupSansNo =
  (recupSansNoDesc !== "" && recupSansNoDesc.toLowerCase() !== "undefined") ||
  (recupSansNoStatut !== "" && recupSansNoStatut.toLowerCase() !== "undefined");

const hasRecuperation = hasNoInventaire || hasRemarqueRecup || hasRecupSansNo;
const hasDescription = hasAnyEquipmentAdded;

let typeDemande = null;

if (hasRecuperation && hasDescription) {
  typeDemande = "Livraison-Récupération";
} else if (hasRecuperation) {
  typeDemande = "Récupération";
} else if (hasDescription) {
  typeDemande = "Livraison";
}

return { TypedeDemande: typeDemande };
