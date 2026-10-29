
console.log("79", context);

const number = Number(docData.NUMBER);
const status = docData.TEMPORARY_STATUS;

return {
  FormClient_InformationClientButton:
    number === 0 ? true : null,

  Buttons_ClientInactif:
    number !== 0 && status === "Actif" ? true : null,

  Buttons_ClientActif:
    number !== 0 && status === "Inactif" ? true : null,
};

