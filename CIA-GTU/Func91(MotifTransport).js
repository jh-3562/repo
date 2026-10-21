console.log("Fonction 91", context);

const FORM_TRANSPORTEUR = "3c0b9af1-fb35-4ee9-bcc7-394aa9a580a1";
const FORM_ADRESSES_FREQUENTES = "57b370ea-db0d-432c-adbc-3bae18ba0f59";
const FORM_DEMANDE = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const FORM_PARAMETRES_OPTIMISATION = "e371bcfb-1eba-4f0e-aeac-a528b22667e5";
const FORM_CLIENT = "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e";

const typeTransport = String(docData.Demande_TypeDeTransport2 || "").trim();

const estRdv =
  typeTransport === "Rendez-vous médical" ||
  typeTransport === "Rendez-vous personnel";

switch (docData.FORMLAYOUTID) {
  case FORM_TRANSPORTEUR:
  case FORM_ADRESSES_FREQUENTES:
  case FORM_DEMANDE:
  case FORM_PARAMETRES_OPTIMISATION:
  case FORM_CLIENT:
    return {
      Demande_TransportTransportSimpleHeurePriseEnCharge: estRdv,

      // Heures calculées = readonly tout le temps
      Demande_TransportTransportSimpleHeureArriveeSouhaite: true,
      Demande_TransportTransportSimpleHeureDepartSouhaitee: true,
    };

  default:
    return {};
}
