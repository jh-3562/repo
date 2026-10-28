console.log("Fonction 530", context);

const isSecuriteRevenu = docData?.Prix_transport === "Sécurité du Revenu" || docData?.Prix_transport === "Sécurité du revenu + collines";

return {
    InfosSup_Feuille: isSecuriteRevenu ? "Oui" : "Non"
};
