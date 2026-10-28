const nom = docData['ClientNom']||'';
const prenom = docData['ClientPrenom']||'';

const fullName = `${nom} ${prenom}`;

return {"Contrainte|2|NomClient" : fullName};