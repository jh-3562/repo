console.log("Function197", context);

const isEntraID = docData.Utilisateur_MethodeConnexion === "EntraID";
const isDraft = docData.STATUS === "Draft";
const isCourriel = docData.Utilisateur_MethodeConnexion === "Courriel";

return {
  Utilisateur_CodeWindows: isEntraID ? true : null,
  Utilisateur_MotDePasse: isCourriel && isDraft ? true : null,
};

