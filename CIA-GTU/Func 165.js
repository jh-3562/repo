console.log("Function165", context);

const isAerien = docData.Demande_ModeDeTransport === "Aérien"; //Aérien

if (isAerien) {
  return {
    Demande_TransportMobiliteUsagerPositionTransport: " ",
  };
}
