console.log("Function 200", context);

const showCreerUtilisateurDraft = docData.STATUS === "Draft";
const showCreerUtilisateurActif = docData.STATUS === "Actif";
const showCreerUtilisateurInactif = docData.STATUS === "Inactif";

return {
    CreerUtilisateur: showCreerUtilisateurDraft ? true : null,
    EnregistrerUtilisateur: showCreerUtilisateurDraft ? null : true,
    RendreInactifUtilisateur: showCreerUtilisateurActif ? true : null,
    RendreActifUtilisateur:  showCreerUtilisateurInactif ? true : null,
     
};
