console.log("onUpdate Demande_TransportDetailsDemandeTypeTransport", context);

const updates = {};

// Quand la valeur change → on vide les autres champs
if (docData?.Demande_TransportDetailsDemandeTypeTransport != null) {
  updates.Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur = null;
  updates.Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport = null;
  updates.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = null;
  updates.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = null;
  updates.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = null;
}

return updates;

