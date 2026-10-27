console.log("Fonction 3", context);

const isSecuritaire = docData?.Transport_TransportSecuritaire;


const showDetails =
  isSecuritaire ==='true'
    ? true
    : null;

return {
  FormDemande_TransportDETAILSDUTRANSPORTSECURITAIRE: showDetails
};
