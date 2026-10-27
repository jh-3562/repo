console.log("Function 59", context);
const docStatus = docData.STATUS;

return {
  BatchAdresseActif: docStatus === "Inactif" ? true : null,
  BatchAdresseInactif: docStatus === "Actif" ? true : null,
};
