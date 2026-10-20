console.log(
  "Fonction 7 - onchangeDemande_ListeRappelIdentificationDemandeurEstAutreDemandeur SHOW FIELD",
  context
);

const SHOW =
  docData.Demande_ListeRappelIdentificationDemandeurEstAutreDemandeur == "true"
    ? true
    : null;

return {
  Demande_ListeRappelIdentificationDemandeurPrenom: SHOW,
  Demande_ListeRappelIdentificationDemandeurNom: SHOW,
  Demande_ListeRappelIdentificationDemandeurTelephone: SHOW,
  Demande_ListeRappelIdentificationDemandeurPoste: SHOW,
  Demande_ListeRappelIdentificationDemandeurCourriel: SHOW,
};
