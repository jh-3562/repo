console.log("Function 68", context);
const docStatus = docData.STATUS;

return {
  BatchTransporteurDraft: docStatus === "Draft" ? true : null,
  BatchTransporteurActif: docStatus === "Actif" ? true : null,
  BatchTransporteurInactif: docStatus === "Inactif" ? true : null,
  Transporteur_Disponibilites_Indisponibilites_creation:
    docStatus === "Draft" ? null : true,
  Transporteur_Disponibilites_Indisponibilites_table:
    docStatus === "Draft" ? null : true,
};
