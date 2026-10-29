const result = {
  TarifFixeVilleArrivee: null,
  TarifFixeVilleDepart: null,
  TarifFixeEtablissementDep: null,
  TarifFixeEtablissementDest: null,
};

switch (docData.Tarif_TypeTarif) {
  case "Fixe (ville à ville)":
    return {
      ...result,
      TarifFixeVilleDepart: true,
      TarifFixeVilleArrivee: true,
    };
    break;
  case "Fixe (établissement à établissement)":
    return {
      ...result,
      TarifFixeEtablissementDep: true,
      TarifFixeEtablissementDest: true,
    };
    break;

  default:
    break;
}

return result;

