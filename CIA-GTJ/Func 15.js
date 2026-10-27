console.log("Fonction 15", context);

const TypeTransporteur = docData?.Transporteur_Type;

let result = {};


if (TypeTransporteur === "Bénévole") {
  result = {
    Transporteur_BenevoleIdentification: true,
    Transporteur_BenevoleÉquipement: true,
    Transporteur_Particularite: true,
    Transporteur_AgentDetails: null,
    Transporteur_GardaDetails: null,
    Transporteur_Vehicule: true,
  };
} else if (TypeTransporteur === "Agent Centre") {
  result = {
    Transporteur_BenevoleIdentification: null,
    Transporteur_BenevoleÉquipement: null,
    Transporteur_AgentDetails: true,
    Transporteur_GardaDetails: null,
    Transporteur_Particularite: null,
    Transporteur_Vehicule: null,
  };
} else if (TypeTransporteur === "Garda") {
  result = {
    Transporteur_BenevoleIdentification: null,
    Transporteur_BenevoleÉquipement: null,
    Transporteur_Particularite: null,
    Transporteur_AgentDetails: null,
    Transporteur_GardaDetails: true,
    Transporteur_Vehicule: null,
  };
} else {
  result = {
    Transporteur_BenevoleIdentification: null,
    Transporteur_BenevoleÉquipement: null,
    Transporteur_AgentDetails: null,
    Transporteur_Particularite: null,
    Transporteur_GardaDetails: null,
    Transporteur_Vehicule: null,
  };
}

return result;
