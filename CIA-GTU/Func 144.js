console.log("144", context);

const status = docData.STATUS;
console.log("statut",status);

return {
  Transport_Planifier:
    status === "Soumise" || status === "Refusée" ? true : null,

  Transport_ButtonConifrmerRefuser:
    status === "Planifiée" ? true : null,

  Transport_ButtonEnRoute:
    status === "Confirmée" ? true : null,

  Transport_ButtonCompleter:
    status === "En route" ? true : null,
};

