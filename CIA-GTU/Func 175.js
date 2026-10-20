console.log("Fonction 175", context);

const USER_ROLES = context.store.moduleStore.user.roles;
const IS_CHAUFFEUR_OR_TRANSPORTEUR = USER_ROLES.some((role) =>
  ["CHAUFFEUR", "TRANSPORTEUR"].includes(role),
);
const SHOW_FIELD = IS_CHAUFFEUR_OR_TRANSPORTEUR ? null : true;

const TYPE_IDENTIFICATION = docData["Identite_TypeIdentification"];

const baseFields = {
  Demande_IdentificationIdentificationUsagerRAMQ: null,
  Identite_TypeIdentificationMarkdown: null,
  Identite_Provenance: null,
  Identite_Expiration_Required: null,
  Identite_Expiration: null,
  Demande_NumeroAssuranceMaladie: null,
  Demande_NumeroCarteAssurance: null,
  Demande_IdentificationIdentificationUsagerPrenom: null,
  Demande_IdentificationIdentificationUsagerNom: null,
  Identite_PrenomSearch: null,
  Identite_NomSearch: null,
};

switch (TYPE_IDENTIFICATION) {
  case "RAMQ":
    return {
      ...baseFields,
      Identite_TypeIdentificationMarkdown: true,
      Demande_IdentificationIdentificationUsagerRAMQ: SHOW_FIELD,
      Identite_Expiration_Required: SHOW_FIELD,
      Demande_IdentificationIdentificationUsagerPrenom: true,
      Demande_IdentificationIdentificationUsagerNom: true,
    };
  case "Carte santé d'une autre province":
    return {
      ...baseFields,
      Identite_TypeIdentificationMarkdown: true,
      Identite_Provenance: SHOW_FIELD,
      Identite_Expiration_Required: SHOW_FIELD,
      Demande_NumeroAssuranceMaladie: SHOW_FIELD,
      Demande_IdentificationIdentificationUsagerPrenom: true,
      Demande_IdentificationIdentificationUsagerNom: true,
    };
  case "Assurance privée canadienne":
    return {
      ...baseFields,
      Identite_TypeIdentificationMarkdown: true,
      Identite_Expiration: SHOW_FIELD,
      Demande_NumeroCarteAssurance: SHOW_FIELD,
      Demande_IdentificationIdentificationUsagerPrenom: true,
      Demande_IdentificationIdentificationUsagerNom: true,
    };
  case "Assurance privée étrangère":
    return {
      ...baseFields,
      Identite_TypeIdentificationMarkdown: true,
      Identite_Expiration: true,
      Demande_NumeroCarteAssurance: SHOW_FIELD,
      Demande_IdentificationIdentificationUsagerPrenom: true,
      Demande_IdentificationIdentificationUsagerNom: true,
    };
  case "Sans assurance privée":
    return {
      ...baseFields,
      Identite_TypeIdentificationMarkdown: true,
      Identite_PrenomSearch: true,
      Identite_NomSearch: true,
    };
  default:
    return {
      ...baseFields,
      Identite_Expiration: true,
      Demande_IdentificationIdentificationUsagerPrenom: true,
      Demande_IdentificationIdentificationUsagerNom: true,
    };
}
