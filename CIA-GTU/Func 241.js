console.log("Fonction 241", context);

const USER_ROLES = context.store.moduleStore.user.roles;

if (USER_ROLES.includes("TRANSPORTEUR")) {
  const listUtilisateurRole = ["Chauffeur"].map((option) => ({
    label: option,
    value: option,
    text: option,
  }));

  callback({
    options: {
      Utilisateur_Role: listUtilisateurRole,
    },
  });
}
