console.log("Fonction 4", context);

let result = {};

const age = docData?.Demande_IdentificationIdentficationUsagerÂge;



let typeSiege = "";

if (age <= 0) {
  typeSiege = "Coquille ";
}
else if (age <= 2 ) {
  typeSiege = "Siège enfant orienté vers l'arrière";
}
else if (age > 2 && age < 6 ) {
  typeSiege = "Siège enfant orienté vers l'avant";
}
else if (age >= 6 && age < 9 ) {
  typeSiege = "Siège d'appoint (booster)";
}
else if (age >= 9 ) {
  typeSiege = "Aucun siège requis";
}
else if (age > 12) {
  typeSiege = "Peut s'asseoir à l'avant";
}

result.Transport_TypeSiege = typeSiege;

return result;
