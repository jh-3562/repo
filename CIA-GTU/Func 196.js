console.log("Fonction 196", context);

const emploiAccompagnateur = docData.Accompagnateur_Emploi;
const emploiAccompagnateur2 = docData.Accompagnateur_Emploi2;
const emploiAccompagnateur3 = docData.Accompagnateur_Emploi3;

return {
  Demande_TransportDetailsDemandeUsagerPrecisez:
    emploiAccompagnateur === "Autre (Spécifiez)" ||
    emploiAccompagnateur3 === "Autre (Spécifiez)"
      ? "true"
      : null,

  Demande_TransportDetailsDemandeUsagerPrecisez2:
    emploiAccompagnateur2 === "Autre (Spécifiez)" ? "true" : null,
};
