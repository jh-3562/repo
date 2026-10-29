console.log(
  "Function110",
  context
);

const SHOW =
  docData.Demande_IdentificationRisqueContagionTypePrecaution == "Autre"
    ? true
    : false;

return {
  Demande_IdentificationRisqueContagionPrecisions: SHOW,
 
};

