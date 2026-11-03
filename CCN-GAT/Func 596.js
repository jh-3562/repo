console.log("Function 596", context);
const isChecked = docData[inputKey];
let showValue = {};

const getEquipementToClearIndex = (inputKey) => {
  let index = 0;

  if (inputKey === "AddFirstEquipment") {
    index = 1;
  } else {
    index = Number(inputKey.match(/^(\d+)L_[aA]dd$/)[1]) + 1;
  }
  return index;
};

const clearEquipement = (index) => {
  const fieldsToClear = [
    "jeNeTrouvePas",
    "descriptionAideTechnique",
    "jeNeTrouvePasNonPlus",
    "Description",
    "RemarqueAgent",
    "soumissionAideTechnique",
    "NumInv",
    "Name",
    "Valid",
    "Priority",
    "Envoi",
    "Statut",
    "NoRequisitionGRM",
    "NumFinal",
    "NomFinal",
    "StatutFinal",
    "BIN",
  ];
  const nameExceptions = {
    jeNeTrouvePas: { 1: "jeNeTrouvePas" },
    descriptionAideTechnique: { 1: "descriptionAideTechnique" },
    jeNeTrouvePasNonPlus: { 1: "jeNeTrouvePasNonPlus" },
    soumissionAideTechnique: { 1: "soumissionAideTechnique" },
    Priority: { 1: "1L_Priorite" },
  };
  let showValue = {};

  if (index !== 0) {
    fieldsToClear.forEach((fieldName) => {
      if (nameExceptions[fieldName]?.[index]) {
        Object.assign(showValue, { [nameExceptions[fieldName][index]]: "" });
      } else {
        Object.assign(showValue, { [`${index}L_${fieldName}`]: "" });
      }
    });
  }
  return showValue;
};

if (isChecked === "false") {
  const index = getEquipementToClearIndex(inputKey);
  showValue = clearEquipement(index);
}

return showValue;
