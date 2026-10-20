console.log(
  "Fonction 12 onchangeDemande_TransportInformationTransportTransportAllerRetour SHOW SECTION",
  context,
);

const SHOW =
  docData.Demande_TransportInformationTransportTransportAllerRetour === "true"
    ? true
    : null;

return {
  FormDemande_TransportTransportRetourSectionDepart: SHOW,
  FormDemande_TransportTransportRetourSectionDestination: SHOW,
  Demande_TitreRetour: SHOW,
  Demande_TitreAller: SHOW,
};
