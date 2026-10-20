console.log("Fonction 73 - Afficher champs accompagnateur ", context);

const v = (docData.Demande_TransportAccompagnementQuiFourniAccompagnateur || "")
  .trim()
  .toLowerCase();

const isRappel = v === "liste de rappel";
const isUnite =
  v === "de notre unité" || v === "internes(escortes spécialisés)";
const isTransporteur = v === "organisme";

const show = (b) => (b ? true : null);

return {
  Demande_AccompagnateurMatricule: show(isRappel),
  Demande_TransportAccompagnementPrenomAccompagnateurConfirme: show(isRappel),
  Demande_TransportAccompagnementNomAccompagnateurConfirme: show(isRappel),
  Demande_TransportAccompagnementTitreEmploiConfirme: show(isRappel),
  Demande_TransportAccompagnementAutresInformationsConfirme: show(isRappel),

  Demande_TransportAccompagnementPrenomAccompagnateur: show(isUnite),
  Demande_TransportAccompagnementNomAccompagnateur: show(isUnite),
  Demande_TransportAccompagnementAutresInformations: show(isUnite),
  Demande_CommentaireAssignation: show(isUnite || isTransporteur),
};
