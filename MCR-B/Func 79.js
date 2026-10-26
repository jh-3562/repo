console.log("Function 79", context);

const isChecked = docData.EntrerHeuresManuellement;
if (isChecked === "true") {
  return {
    "CC_Destinations|300|Arrivée": true,
    "CC_Destinations|700|Récupération": true,
    "CC_Destinations|400|Début de RDV": true,
    "CC_Destinations|500|Temps sur place": true,
    "CC_Destinations|600|Fin de RDV": true,
  };
} else if (
  (isChecked === "false" || !isChecked) &&
  docData.TypeTransport === "RDV à la destination"
) {
  return {
    "CC_Destinations|300|Arrivée": true,
    "CC_Destinations|700|Récupération": null,
    "CC_Destinations|400|Début de RDV": true,
    "CC_Destinations|500|Temps sur place": true,
    "CC_Destinations|600|Fin de RDV": true,
  };
} else {
  return {
    "CC_Destinations|300|Arrivée": true,
    "CC_Destinations|700|Récupération": null,
    "CC_Destinations|400|Début de RDV": null,
    "CC_Destinations|500|Temps sur place": null,
    "CC_Destinations|600|Fin de RDV": null,
  };
}
