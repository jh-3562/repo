console.log("Function144", context);

const rdvPec =
  docData?.TypeTransport === "RDV au lieu de prise en charge" ? true : false;

return rdvPec
  ? { CheckboxResterAvecBene: true, CC_Retour: true }
  : { CheckboxResterAvecBene: false, CC_Retour: false };
