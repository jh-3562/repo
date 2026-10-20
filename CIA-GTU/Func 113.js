console.log("Fonction 113", context);

const mode = docData?.Demande_ModeDeTransport;


const showSection =
  mode === "Aérien" || mode === "Routier"
    ? true
    : null;

return {
  FormDemande_TransportInformationTransportSection: showSection
};
