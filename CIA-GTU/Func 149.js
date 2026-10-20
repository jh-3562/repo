console.log("Fonction 149", context);

const v = docData.Demande_IdentificationRisqueContagionTypePrecaution;

const SHOW =
  v == "Aérienne" ||
  v == "Aériennes / contact" ||
  v == "Aériennes / contact-renforcées " ||
  v == "Contact" ||
  v == "Contact renforcées" ||
  v == "Gouttelettes" ||
  v == "Gouttelettes / contact" ||
  v == "Gouttelettes / contact renforcées avec N-95 ";

return {
  Markdown_Precaution: SHOW ? true : false,
  Demande_IdentificationRisqueContagionPrecisions: SHOW ? true : false,
};
