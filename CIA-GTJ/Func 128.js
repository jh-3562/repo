console.log("Fonction 128", context);

const TypeTransport = docData?.Transport_TypeTransport;
console.log("TypeTransport:", TypeTransport);
let result = {};

if (TypeTransport === "Aller") {
  result = {
    DemandeAllerD_Date: true,
  };
} else if (TypeTransport === "Retour") {
  result = {
    DemandeRetourA_Date: true,
    DemandeRetourA_Heure: true,
  };
} else if (TypeTransport === "Aller/Retour") {
  result = {
    DemandeAllerD_Date: true,
    DemandeRetourA_Date: true,
    DemandeRetourA_Heure: true,
  };
} else {
  result = {
    DemandeAllerD_Date: false,
    DemandeAllerD_Heure: false,
    DemandeRetourA_Date: false,
    DemandeRetourA_Heure: false,
  };
}

return result;
