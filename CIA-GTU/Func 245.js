console.log("Fonction 245", context);

const roles = store?.moduleStore?.user?.roles || [];
const isDepartement = roles.includes("DÉPARTEMENT");
const isAdmin = roles.includes("ADMIN");
const isRepartiteur = roles.includes("RÉPARTITEUR");
const hasRolesAccess = isDepartement || isAdmin || isRepartiteur;

return {
  TransporteurResteSurPlace: hasRolesAccess ? false : true,
  TranspResteSurPlace: hasRolesAccess ? false : true, // [FIX ResteSurPlace 2026-10-14]
};
