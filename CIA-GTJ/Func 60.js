console.log("function 60", context);

const result = {};

const prenom = docData?.Demande_IdentificationIdentficationUsagerPrénom || "";
const nom = docData?.Demande_IdentificationIdentficationUsagerNom || "";

result.NomCompletUsager = (prenom + " " + nom).trim();

return result;
