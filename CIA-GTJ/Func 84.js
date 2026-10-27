return {
  BatchCreerUtilisateur: docData.STATUS === "Draft" ? true : null,
  Utilisateur_BatchEdit: docData.STATUS === "Actif" ? true : null,
  Utilisateur_BatchReactiver: docData.STATUS === "Inactif" ? true : null,
};
