console.log("Fonction 148", context);

const prenom = (docData?.Identite_Prenom || docData?.Demande_IdentificationIdentificationUsagerPrenom || "").trim();
const nom    = (docData?.Identite_Nom || docData?.Demande_IdentificationIdentificationUsagerNom || "").trim();

const nomComplet = [prenom, nom]
  .filter(Boolean)
  .join(" ");

return {
  Usager_NomComplet: nomComplet,
};
