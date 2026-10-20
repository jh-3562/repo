console.log("Fonction 34", context);

const provenance = docData?.Demande_TransportDetailsDemandeProvenanceUsager;
const typeTransport = docData?.Demande_TransportDetailsDemandeTypeTransport;
const besoinAccompagnateur = docData?.Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur;


const declencheurs = ["SAD", "RI", "RPA"];

let result = {};


if (
  declencheurs.includes(provenance) 
) {
  if (besoinAccompagnateur === "Oui") {
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Usager/Bénévole";
  } else if (besoinAccompagnateur === "Non") {
    result.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = "Proche aidant";
  }
}

return result;
