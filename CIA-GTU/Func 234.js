console.log("Fonction 234", context);
const role = docData["Utilisateur_Role"];

return {
  DemandeTransportUniteAdmin: role === "Département" ? "Utilisateur (Département)" : "",
};
