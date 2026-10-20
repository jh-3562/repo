console.log("Fonction 126", context);

// [FIX Accompagnateur 2026-10-14] Les champs « Accompagnateur » ne s'affichent que si
// « L'usager a-t-il besoin d'un accompagnateur ? » = Oui (avant : visibles dès l'ouverture).
const besoinAccompagnateur =
  docData.Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur === "Oui";

const typeAccompagnateur =
  docData.Demande_TransportAccompagnementQuiFourniAccompagnateur;

const estListeDeRappel = typeAccompagnateur === "Liste de rappel";

// Même logique qu'avant (choix 1 et 2 pour la liste de rappel, « Accompagnateur » sinon),
// conditionnée au besoin d'accompagnateur.
return {
  Accompagnateur_Emploi: besoinAccompagnateur && !estListeDeRappel ? "true" : null,
  Accompagnateur_Emploi2: besoinAccompagnateur && estListeDeRappel ? "true" : null,
  Accompagnateur_Emploi3: besoinAccompagnateur && estListeDeRappel ? "true" : null,
  Demande_TransportAccompagnementQuiFourniAccompagnateur: besoinAccompagnateur ? "true" : null, // [FIX Provenance]
};
