 console.log(
  "Fonction 42  ",
  context
);

const SHOW =
  docData.Demande_TransportIdentificationDemandeurEstAutreDemandeur == "true"
    ? true
    : null;

return {
  Demande_TransportIdentificationDemandeurPrenom: SHOW,
  Demande_TransportIdentificationDemandeurNom: SHOW,
  Demande_TransportIdentificationDemandeurTelephone: SHOW,
  Demande_TransportIdentificationDemandeurCourriel: SHOW,
  Demande_TransportIdentificationDemandeurPosteDemandeur: SHOW,
  
};
