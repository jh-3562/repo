console.log("Fonction 228", context);

let showValue = {};
const USER_ROLES = context.store.moduleStore.user.roles;

if (!USER_ROLES.includes("ADMIN") && !USER_ROLES.includes("RÉPARTITEUR") && !USER_ROLES.includes("DÉPARTEMENT")) {
  showValue = {
    Demande_AccompagnateurHeure: true,
  };
}

return showValue;

