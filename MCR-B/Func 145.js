console.log("Function145", context);

const rdvPec =
  docData?.TypeTransport === "Retour" ? true : false;

if (
  docData.EntrerHeuresManuellement === "false" ||
  !docData.EntrerHeuresManuellement
) {
  return rdvPec
    ? {
        CC_TempsTrajet: null,
        CC_Arrivée: null,
        "CC_Destinations|300|Arrivée": true,
        "CC_Destinations|400|Début de RDV": null,
        "CC_Destinations|500|Temps sur place": null,
        "CC_Destinations|600|Fin de RDV": null,
      }
    : {
        CC_TempsTrajet: true,
        CC_Arrivée: true,
        "CC_Destinations|400|Début de RDV": true,
        "CC_Destinations|500|Temps sur place": true,
        "CC_Destinations|600|Fin de RDV": true,
      };
} else {
  return rdvPec
    ? {
        CC_TempsTrajet: null,
        CC_Arrivée: null,
      }
    : {
        CC_TempsTrajet: true,
        CC_Arrivée: true,
      };
}
