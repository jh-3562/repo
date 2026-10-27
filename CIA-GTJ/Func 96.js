console.log("Function 96", context);

const mdv = docData?.Operation_Facture_MilieuDeVie;

const milieuDeVie = {
  naturel: ["Parents", "Père", "Mère"],
  crdi: ["CRDI"],
  accueil: ["Famille d'accueil"],
};

return {
  Operation_Facture_PointService: milieuDeVie.naturel.includes(mdv)
    ? true
    : null,
  Operation_Facture_Unite: milieuDeVie.crdi.includes(mdv) ? true : null,
  Operation_Facture_ClairFoyer: milieuDeVie.accueil.includes(mdv) ? true : null,
  EMPTY5: Object.values(milieuDeVie).some((arr) => arr.includes(mdv))
    ? null
    : false,
};
