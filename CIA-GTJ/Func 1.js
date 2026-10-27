console.log("Fonction 1", context);

const natureTransport =
  docData.Demande_Transport_InformationGénéral_NatureDuTransport === "Autre (précisez)";


return {
  Transport_NaturePrecision: natureTransport ? "true" : null
};
