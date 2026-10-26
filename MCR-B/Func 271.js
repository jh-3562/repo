console.log('Function 271', context);

const roles = store.moduleStore.user.roles || [];

const privilegedRoles = [
  "1. ADMIN",
  "1. COORDINATEUR",
  "1. DISPATCHEUR",
  "1. RESPONSABLE D'ACTIVITÉ",
  "1. DEVELOPPEUR"
];

const hasPrivilegedRole = roles.some(role =>
  privilegedRoles.includes(role)
);

const hasChauffeurRole = roles.some(role =>
  role.toUpperCase().includes("CHAUFFEUR")
);

if (hasChauffeurRole && !hasPrivilegedRole) {
  return {
    PrénomSelected: true,
    NomFormMission: true,
    DateDeNaissance: true,
  };
}
