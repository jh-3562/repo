console.log("Fonction 147", context);

if (docData?.Demande_IdentificationIdentificationUsagerDiabétique === "true") {
  return {
    Demande_TransportERepas: true
  };
}

return {};
