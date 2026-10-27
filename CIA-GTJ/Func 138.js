console.log("Fonction 138", context);
const status = docData.STATUS;
//console.log("138-status", status);

if (status === "Inactif" || status === "Actif") {
  return {
    Taux_TypeDeTaux: true,
    Taux_CatégorieDuTransporteur: true,
    Taux_TypeDeSurface: true,
    Taux_TypeDeRepas: true,
  };
}
