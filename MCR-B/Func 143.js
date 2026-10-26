console.log("Function143", context);

const rdvPec =
  docData?.TypeTransport === "RDV au lieu de prise en charge" ? true : false;

return rdvPec ? { CheckboxResterAvecBene: false, CC_Retour: false } : {};
