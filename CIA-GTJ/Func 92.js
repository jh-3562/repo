console.log("Function 92", context);

const raison = String(
  docData?.Transport_RaisonHorsDelai || ""
).trim();

return {
  Demande_Particularites: raison ? true : null
};
