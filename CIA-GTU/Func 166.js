console.log("Function 166", context);

const ALLOWED_ROLES = ["RÉPARTITEUR", "ADMIN"];

return {
  Demande_MoyenTransportDeLAeroport: ALLOWED_ROLES.some((element) =>
    store.moduleStore.user.roles.includes(element),
  )
    ? true
    : false,
};
