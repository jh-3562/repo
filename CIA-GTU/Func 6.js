console.log(
  "Fonction 6 - onchangeDemande_IdentificationIdentificationUsagerAutochtone SHOW SECTION",
  context
);

return {
  FormDemande_IdentificationStatutAutochtoneSection:
    docData.Demande_IdentificationIdentificationUsagerAutochtone == "true"
      ? true
      : null,
};
