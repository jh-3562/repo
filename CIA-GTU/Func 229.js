console.log("Fonction 229", context);

const isAutreDemandeurChecked =
  docData["Demande_TransportIdentificationDemandeurEstAutreDemandeur"] === "true";
let showValue = {};

if (isAutreDemandeurChecked) {
  showValue = {
    Demande_TransportIdentificationDemandeurPrenomDemandeur: null,
    Demande_TransportIdentificationDemandeurNomDemandeur: null,
    //Demande_TransportIdentificationDemandeurTelephoneDemandeur: null,
    //Demande_TransportIdentificationDemandeurPoste: null,
    //Demande_TransportIdentificationDemandeurCourrielDemandeur: null,
    Demande_TransportIdentificationDemandeurPrenom: null,
    Demande_TransportIdentificationDemandeurNom: null,
    //Demande_TransportIdentificationDemandeurTelephone: true,
    //Demande_TransportIdentificationDemandeurPosteDemandeur: true,
    //Demande_TransportIdentificationDemandeurCourriel: true,
  };
} else {
  showValue = {
    Demande_TransportIdentificationDemandeurPrenomDemandeur: null,
    Demande_TransportIdentificationDemandeurNomDemandeur: null,
    //Demande_TransportIdentificationDemandeurTelephoneDemandeur: true,
    //Demande_TransportIdentificationDemandeurPoste: true,
    //Demande_TransportIdentificationDemandeurCourrielDemandeur: true,
    Demande_TransportIdentificationDemandeurPrenom: null,
    Demande_TransportIdentificationDemandeurNom: null,
    //Demande_TransportIdentificationDemandeurTelephone: null,
    //Demande_TransportIdentificationDemandeurPosteDemandeur: null,
    //Demande_TransportIdentificationDemandeurCourriel: null,
  };
}

return showValue;
