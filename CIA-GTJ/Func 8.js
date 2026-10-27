console.log("Fonction 8", context);

const TypeTransport = docData?.Transport_TypeTransport;

let result = {};

if (TypeTransport === "Aller") {
  result = {
    Demande_TitreAller: true,
    DemandeAller_Depart: true,
    DemandeAller_Destination: true,
    Demande_TitreRetour: null,
    DemandeRetour_Depart: null,
    DemandeRetour_Destination: null,
  };
}
else if (TypeTransport === "Retour") {
  result = {
    Demande_TitreAller: null,
    DemandeAller_Depart: null,
    DemandeAller_Destination: null,
    Demande_TitreRetour: true,
    DemandeRetour_Depart: true,
    DemandeRetour_Destination: true,
  };
}
else if (TypeTransport === "Aller/Retour") {
  result = {
    Demande_TitreAller: true,
    DemandeAller_Depart: true,
    DemandeAller_Destination: true,
    Demande_TitreRetour: true,
    DemandeRetour_Depart: true,
    DemandeRetour_Destination: true,
  };
}
else {
  result = {
    Demande_TitreAller: null,
    DemandeAller_Depart: null,
    DemandeAller_Destination: null,
    Demande_TitreRetour: null,
    DemandeRetour_Depart: null,
    DemandeRetour_Destination: null,
  };
}

return result;
