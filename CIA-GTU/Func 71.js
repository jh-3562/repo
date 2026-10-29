console.log(
  "Fonction71",
  context
);

const userRoles = store.moduleStore.user.roles;
const INVALID_ROLE = "TRANSPORTEUR";
const isNotTransporteur = !userRoles.includes(INVALID_ROLE);

return {
  Demande_OccurenceReccurence:
    isNotTransporteur && docData.TransportSysteme_IdReccurence && String(docData.TransportSysteme_IdReccurence).trim() !== ""
      ? true
      : null,
};

