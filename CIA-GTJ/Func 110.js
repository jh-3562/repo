console.log("Function 110", context);

return {
  Bouttons_Taux: docData.STATUS === "Draft" ? true : null,
  Bouttons_TauxActif: docData.STATUS === "Inactif" ? true : null,
  Bouttons_TauxInactif: docData.STATUS === "Actif" ? true : null,


};
