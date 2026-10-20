console.log("Fonction 74", context);

const besoin = docData.Demande_TransportAccompagnementUsagerBesoinRaccompagne;

const SHOW = besoin === "Oui";
const HIDE = besoin !== "Oui";

return {
  Demande_TransportAccompagnementQuiFourniAccompagnateur: SHOW ? true : false,
  Demande_TransportAccompagnementTypeAccompagnateurRequis: SHOW ? true : false,
};
