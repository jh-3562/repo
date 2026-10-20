console.log("Fonction 84", context);

const besoin = docData.Demande_TransportMobiliteUsagerBesoinAideMobilite;

const SHOW = besoin === "Oui";
const HIDE = besoin !== "Oui";

return {
  Demande_TransportMobiliteUsagerTypeAideRequis: SHOW ? true : false,
  Demande_TransportMobiliteUsagerPositionTransport: SHOW ? true : false,
  Demande_TransportMobiliteUsagerQuiFournitEquipement: SHOW ? true: false,
};
