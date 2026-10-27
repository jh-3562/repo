console.log("Fonction 51", context);

const type = String(docData.Utilisateur_Type || "").trim();

let nomComplet = "";

if (type === "Intervenant") {
  nomComplet = [
    docData.Utilisateur_PrenomIntervenant,
    docData.Utilisateur_NomIntervenant
  ]
    .filter(Boolean)
    .join(" ");
} else {
  nomComplet = [
    docData.Utilisateur_Prenom,
    docData.Utilisateur_Nom
  ]
    .filter(Boolean)
    .join(" ");
}

return {
  Identification_Utilisateur_NomComplet: nomComplet
};
