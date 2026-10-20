console.log("Function 269", context);

const roles = store?.moduleStore?.user?.roles || [];

const isAdmin = roles.includes("ADMIN");
const isRepartiteur = roles.includes("RÉPARTITEUR");
const isTransporteur = roles.includes("TRANSPORTEUR");
const hasRolesAccess =
isAdmin || isRepartiteur || isTransporteur;

return {
ImprimerDemande: hasRolesAccess ? true : false,
};
