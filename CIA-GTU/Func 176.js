console.log("Fonction 176", context);

const TYPE_IDENTIFICATION = docData["Identite_TypeIdentification"];
const PRIVATE_INSURANCE_TYPES = new Set([
  "Assurance privée canadienne",
  "Assurance privée étrangère",
  "Sans assurance privée",
]);
const PROVINCE_FIELDS = {
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

if (TYPE_IDENTIFICATION === "RAMQ") {
  return {
    ...PROVINCE_FIELDS,
    Identite_RAMQ: true,
    Identite_TypeIdentificationMarkdown: true,
    Identite_Provenance: null,
    Identite_NumeroCarteAssurance: null,
    Identite_Expiration: null,
    Identite_Expiration_Required: true,
  };
} else if (TYPE_IDENTIFICATION === "Carte santé d'une autre province") {
  return {
    ...PROVINCE_FIELDS,
    Identite_RAMQ: null,
    Identite_TypeIdentificationMarkdown: true,
    Identite_Provenance: true,
    Identite_NumeroAssuranceMaladieAB: true,
    Identite_NumeroCarteAssurance: null,
    Identite_Expiration: null,
    Identite_Expiration_Required: true,
  };
} else if (PRIVATE_INSURANCE_TYPES.has(TYPE_IDENTIFICATION)) {
  return {
    ...PROVINCE_FIELDS,
    Identite_RAMQ: null,
    Identite_TypeIdentificationMarkdown: true,
    Identite_Provenance: null,
    Identite_NumeroCarteAssurance: true,
    Identite_Expiration: true,
    Identite_Expiration_Required: null,
  };
} else {
  return {
    ...PROVINCE_FIELDS,
    Identite_TypeIdentificationMarkdown: null,
    Identite_Provenance: null,
    Identite_NumeroCarteAssurance: null,
    Identite_Expiration: null,
    Identite_Expiration_Required: null,
  };
}
