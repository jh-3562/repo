console.log(
  "Fonction 88",
  context
);

const SHOW =
  docData.Demande_TypeDeTransport2== "Retour à domicile"
    ? true
    : null;

return {
  Demande_TransportSimpleEntrééAdapté: SHOW,
  Demande_TransportEtageAppartement: SHOW,
  Demande_TransportAscenceur: SHOW,
 };
