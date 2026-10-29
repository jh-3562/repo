console.log("109", context);

if (Number(docData.NUMBER) === 0) {

  return {
    FormDemande_IdentificationIdentificationDemandeSectionDraft: null,
    FormDemande_IdentificationIdentificationDemandeSection: true,
    FormDemande_IdentificationBoutton: true
  };

} else if (docData.STATUS === "Draft") {

  return {
    FormDemande_IdentificationIdentificationDemandeSectionDraft: true,
    FormDemande_IdentificationIdentificationDemandeSection: null,
    FormDemande_IdentificationBoutton: null
  };
  
} else {

  return {
    FormDemande_IdentificationIdentificationDemandeSectionDraft: null
  };
}

return {};
