console.log(
  "Function106",
  context
);

const SHOW =
  docData.Demande_PPH == "Oui"
    ? true
    : false;

return {
  Demande_TypeClientele: SHOW,
  Demande_MembreTransportAdapte: SHOW,
  Demande_AideSociale: SHOW,
};

