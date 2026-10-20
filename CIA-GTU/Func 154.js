console.log("Fonction 154 ", context);

let result = {
  Demande_TransportUFauteuilStandardU: "",
  Demande_TransportUFauteuilMultiPositionU: "",
  Demande_TransportUFauteuilBariatiqueU: "",
  Demande_TransportUFauteuilMotoriseU: "",
  Demande_TransportTFauteuilBariatiqueT: "",
  Demande_TransportTFauteuilMultiPositionT: "",
  Demande_TransportTFauteuilStandardT: "",
  Demande_TransportFauteuilStandardE: ""
};

const field = inputKey;

// si le champ modifié est coché
if (docData[field] === "true") {
  result[field] = "true";
}

return result;
