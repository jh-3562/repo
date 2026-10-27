console.log("Fonction 55", context);

const TypeTransport = docData?.Transport_TypeTransport;

if (TypeTransport === "Retour") {
  return {
    Demande_AdresseRetourAller: null,
    Demande_AdresseRetourArrive: null,
  };
} else {
  return {
    Demande_AdresseRetourAller: true,
    Demande_AdresseRetourArrive: true,
  };
}
