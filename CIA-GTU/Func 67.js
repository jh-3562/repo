console.log("Fonction 67", context);

const freq = (docData.Demande_TransportInformationTransportFrequence || "").trim();

if (freq === "Journées fixes") {
  return {
    Demande_TransportInformationTransportJourneesFixes: true,
    Demande_TransportInformationTransportJourneesApplicables: null,
    Demande_TransportInformationTransportDateDebutReccurence: null,
    Demande_TransportInformationTransportDateFinReccurence: null
  };
}

if (freq === "Hebdomadaire" || freq === "Aux 2 semaines") {
  return {
    Demande_TransportInformationTransportJourneesFixes: null,
    Demande_TransportInformationTransportJourneesApplicables: true,
    Demande_TransportInformationTransportDateDebutReccurence: true,
    Demande_TransportInformationTransportDateFinReccurence: true
  };
}

return {
  Demande_TransportInformationTransportJourneesFixes: null,
  Demande_TransportInformationTransportJourneesApplicables: null,
  Demande_TransportInformationTransportDateDebutReccurence: null,
  Demande_TransportInformationTransportDateFinReccurence: null
};
