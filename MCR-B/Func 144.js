console.log("Function144", context);

const rdvPec =
  docData?.TypeTransport === "Retour" ? true : false;

return rdvPec
  ? { CheckboxResterAvecBene: true, CC_Retour: true }
  : { CheckboxResterAvecBene: false, CC_Retour: false };
