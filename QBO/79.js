// const { TypeIntervention, SousCatégorie1 } = docData;

// const isNumerique = SousCatégorie1 === "Numérique";
// const isDeploiementNumerique =
//   isNumerique && TypeIntervention === "Déploiement";
// const isInterventionNumerique = isNumerique && TypeIntervention === "Numérique";

// const res = {
//   Photo_NumeroDeSerie:
//     isDeploiementNumerique || isInterventionNumerique ? true : null,
//   Photo_FaceInt: isInterventionNumerique ? true : null,
//   Photo_FaceExt: isInterventionNumerique ? true : null,
// };

// return res;

// const { Demande_TypeAdresseDepart, Demande_TypeAdresseDestination, Demande_MemeAdresseUsager, Demande_MemeAdresseUsagerRetour } = docData;

// const isCliniqueDepart = Demande_TypeAdresseDepart === "Clinique externe";

// const isCliniqueDestination = Demande_TypeAdresseDestination === "Clinique externe";

// const res = {
//   Demande_AccessibilitéPointDeDépart:
//     Demande_MemeAdresseUsager === "true" || isCliniqueDepart ? true : null,

//   Demande_AccessibilitéPointDeDestination:
//     Demande_MemeAdresseUsagerRetour === "true" || isCliniqueDestination ? true : null,
// };

// return res;

const {
  Demande_TypeAdresseDepart,
  Demande_TypeAdresseDestination,
  Demande_TransportTransportSimpleNomLieuDepart,
  Demande_TransportTransportSimpleNomLieuDestination
} = docData;

const res = {
  Demande_TransportTransportSimpleNomLieuDepart:
    Demande_TypeAdresseDepart === "Domicile"
      ? "Domicile"
      : Demande_TransportTransportSimpleNomLieuDepart,

  Demande_TransportTransportSimpleNomLieuDestination:
    Demande_TypeAdresseDestination === "Domicile"
      ? "Domicile"
      : Demande_TransportTransportSimpleNomLieuDestination
};

return res;




const {
  Demande_TypeAdresseDepart,
  Demande_TypeAdresseDestination,
  Demande_TransportTransportSimpleNomLieuDepart,
  Demande_TransportTransportSimpleNomLieuDestination
} = docData;

const res = {
  Demande_TransportTransportSimpleNomLieuDepart:
    Demande_TypeAdresseDepart === "Domicile"
      ? "Domicile"
      : Demande_TransportTransportSimpleNomLieuDepart,

  Demande_TransportTransportSimpleNomLieuDestination:
    Demande_TypeAdresseDestination === "Domicile"
      ? "Domicile"
      : Demande_TransportTransportSimpleNomLieuDestination
};

return res;
