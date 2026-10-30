console.log("Function143", context);

const rdvPec =
  docData?.TypeTransport === "Retour" ? true : false;

return rdvPec ? { CheckboxResterAvecBene: false, CC_Retour: false } : {};
