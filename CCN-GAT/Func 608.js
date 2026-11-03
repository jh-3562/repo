console.log("Fonction 608", context);

let showValue = {};
const userRoles = context.store.moduleStore.user.roles;

if (!userRoles.includes("ADMIN") && !userRoles.includes("AGENTPARC")) {
  showValue = {
    PretType: true,
  };
}

return showValue;
