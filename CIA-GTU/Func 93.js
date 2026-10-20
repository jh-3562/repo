console.log("Fonction 93", context);

// ----- Constantes -----
const ABITIBI_FORMLAYOUTID_TRANSPORTEUR =
  "3c0b9af1-fb35-4ee9-bcc7-394aa9a580a1";
const ABITIBI_FORMLAYOUTID_ADRESSES_FREQUENTES =
  "57b370ea-db0d-432c-adbc-3bae18ba0f59";
const ABITIBI_FORMLAYOUTID_DEMANDE = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const ABITIBI_FORMLAYOUTID_PARAMETRES_OPTIMISATION =
  "e371bcfb-1eba-4f0e-aeac-a528b22667e5";
const ABITIBI_FORMLAYOUTID_CLIENT =
  "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e";

// ----- Fonction principale -----
switch (docData.FORMLAYOUTID) {
  case ABITIBI_FORMLAYOUTID_TRANSPORTEUR:
  case ABITIBI_FORMLAYOUTID_ADRESSES_FREQUENTES:
  case ABITIBI_FORMLAYOUTID_DEMANDE:
  case ABITIBI_FORMLAYOUTID_PARAMETRES_OPTIMISATION:
  case ABITIBI_FORMLAYOUTID_CLIENT: {
    let valeur = false;

    
    if (
      docData.Demande_ModeDeTransport === "Aérien" 
    ) {
      valeur = true;
    }

    return {
      Demande_TransportTransportSimpleNomLieuDestination: valeur,
      Demande_TransportTransportSimpleAdresseCompleteDestination: valeur,
      Demande_TransportRotierDate: valeur,
      Demande_TransportTransportSimpleHeureDepartSouhaitee: true,
      Demande_TransportTransportSimpleHeureArriveeSouhaite: true,
      Demande_TransportTransportSimpleNomVilleDestination: valeur,
    };
  }
}
