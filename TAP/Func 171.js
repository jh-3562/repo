return {
  TransportAdapte:
    docData["Adapte_check"] === "Oui - transférable" ||
    docData["Adapte_check"] === "Oui - non transférable" ||
    docData["Adapte_check"] === "Temporaire"
      ? true
      : null,
};