console.log('Function 87', context);

const isChecked = docData.CheckboxResterAvecBene;
const vehiculeAller = docData.PriseEnCharge_VéhiculeUtilisé;

return isChecked === "true"
  ? { PriseEnCharge_VéhiculeUtiliséRetour: vehiculeAller }
  : null;
