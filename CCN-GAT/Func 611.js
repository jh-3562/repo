console.log("Fonction 611", context);

let showValue = {};
const userRoles = context.store.moduleStore.user.roles;
const status = docData.STATUS;

const allowedStatuses = [
  "Complétée",
  "Validée",
  "Demande particulière",
  "Soumise",
  "Planifiée",
  "Equipement manquant",
];

if (
  !allowedStatuses.includes(status) ||
  (status === "Demande particulière" && userRoles.includes("AGENTPARC"))
) {
  showValue = {
    BatchImprimerSection: null,
  };
}

return showValue;
