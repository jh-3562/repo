console.log("Fonction 612", context);

let showValue = {};
const userRoles = context.store.moduleStore.user.roles;

if (!userRoles.includes("ADMIN")) {
  showValue = {
    SectionCache: false,
  };
}

return showValue;
