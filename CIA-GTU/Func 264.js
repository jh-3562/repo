const input = docData?.Identite_Provenance;

const base = {
  Identite_NumeroAssuranceMaladieAB: null,
  Identite_NumeroAssuranceMaladieBC: null,
  Identite_NumeroAssuranceMaladieMB: null,
  Identite_NumeroAssuranceMaladieON: null,
  Identite_NumeroAssuranceMaladieSK: null,
  Identite_NumeroAssuranceMaladieNB: null,
  Identite_NumeroAssuranceMaladieNS: null,
  Identite_NumeroAssuranceMaladiePE: null,
  Identite_NumeroAssuranceMaladieNL: null,
  Identite_NumeroAssuranceMaladieNT: null,
  Identite_NumeroAssuranceMaladieNU: null,
  Identite_NumeroAssuranceMaladieYT: null,
};

const provinceKey = `Identite_NumeroAssuranceMaladie${input ?? ""}`;
const activeKey = Object.prototype.hasOwnProperty.call(base, provinceKey)
  ? provinceKey
  : "Identite_NumeroAssuranceMaladieAB";

return {
  ...base,
  [activeKey]: true,
};

