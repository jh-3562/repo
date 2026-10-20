console.log("Function 168", context);

const isAerien = docData?.Demande_ModeDeTransport === "Aérien";

const moyenTransport = isAerien
  ? docData?.ChoixTransportAerien
  : docData?.ChoixTransport;

let natureDepense = "";

if (moyenTransport) {
  switch (moyenTransport) {
    case "Ambulance":
      natureDepense = "9460 - Ambulance";
      break;
    case "Taxi/Transport alternatif/Bénévole/Transport adapté":
    case "Transport médical adapté":
      natureDepense = "9450 - Autres modes de transport";
      break;
    case "EVAQ":
      natureDepense = "9471 - Avion ÉVAQ";
      break;
    case "Navette multipatients":
    case "Avion nolisé":
      natureDepense = "9470 - Avion (Autre que ÉVAQ)";
      break;
    default:
      natureDepense = "9450 - Autres modes de transport";
      break;
  }
}

return {
  Demande_AgentPayeurNaturePaiement: natureDepense,
};
