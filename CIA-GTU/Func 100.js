console.log("Fonction 100", context);

const SHOW =
  docData.Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur === "Oui";

return {
  Demande_TransportAccompagnementQuiFourniAccompagnateur: SHOW ? "true" : null, // [FIX Provenance Non]
  Demande_AccompagnateurHeure:                            SHOW ? "true" : null,
  Demande_AccompagnateurAccompagnement:                   SHOW ? "true" : null,
  Demande_AccompagnateurRester:                           SHOW ? "true" : null,
  Demande_AutreAccompagnementCollec:                      SHOW ? "true" : null,
  Accompagnateur_Emploi:                                   SHOW ? "true" : null,
  
  Demande_TransportAccompagnementPrenomAccompagnateur:   null,
  Demande_TransportAccompagnementNomAccompagnateur:      null,
  Demande_TransportAccompagnementAutresInformations:     null,
  Demande_TransportAccompagnementPrenomAccompagnateurConfirme:     null,
  Demande_TransportAccompagnementNomAccompagnateurConfirme:        null,
  Demande_TransportAccompagnementTitreEmploiConfirme:              null,
  Demande_TransportAccompagnementAutresInformationsConfirme:       null,
  Accompagnateur_Emploi2:null,
  Accompagnateur_Emploi3:null,
};
