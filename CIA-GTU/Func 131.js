console.log("Fonction 131", context);

const isMemeAdresseUsager = docData?.Demande_MemeAdresseUsager === "true" || docData?.Demande_MemeAdresseUsagerRetour === "true";
const showSection = isMemeAdresseUsager ? true : null;

return {
  FormDemande_InformationsAdditionnelle: showSection,
};
