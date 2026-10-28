const nom = docData['NomChauffeurFacade']||'';
const prenom = docData['PrenomChauffeurFacade']||'';

const fullName = `${prenom} ${nom}`;

return {"Contrainte|1|Chauffeur" : fullName};