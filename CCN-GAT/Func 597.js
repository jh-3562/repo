console.log("Function 597", context);
const isChecked = docData[inputKey];
let showValue = {};

const getEquipementToSetDefault = (inputKey) => {
  let index = 0;

  if (inputKey === "AddFirstEquipment") {
    index = 1;
  } else {
    index = Number(inputKey.match(/^(\d+)L_[aA]dd$/)[1]) + 1;
  }
  return index;
};

const setDefaultEquipment = (index) => {
  let showValue = {};

  if (index !== 0) {
    if (index === 1) {
      showValue = {
        jeNeTrouvePas: true,
        descriptionAideTechnique: null,
        jeNeTrouvePasNonPlus: null,
        "1L_Description": true,
        soumissionAideTechnique: null,
        "1L_NumInv": true,
        "1L_Name": true,
        "1L_Statut": true,
      };
    } else {
      showValue = {
        [`${index}L_jeNeTrouvePas`]: true,
        [`${index}L_descriptionAideTechnique`]: null,
        [`${index}L_jeNeTrouvePasNonPlus`]: null,
        [`${index}L_Description`]: true,
        [`${index}L_soumissionAideTechnique`]: null,
        [`${index}L_NumInv`]: true,
        [`${index}L_Name`]: true,
        [`${index}L_Statut`]: true,
      };
    }
  }
  console.log(showValue);
  return showValue;
};

if (isChecked === "false") {
  const index = getEquipementToSetDefault(inputKey);
  showValue = setDefaultEquipment(index);
}

return showValue;
