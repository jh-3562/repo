console.log("Function 139", context);

const isActif = docData.STATUS === "Actif";
const isInactif = docData.STATUS === "Inactif";

return {
  Adresse_RendreInactif: isActif ? true : null,
  Adresse_RendreActif: isInactif ? true : null,
  Adresse_Supprimer: (isActif || isInactif) ? true : null,
  Adresse_Enregistrer: (isActif || isInactif) ? true : null,
};
