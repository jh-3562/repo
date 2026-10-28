console.log('Function480', context);

// calcul prixtransportgroupe
if(docData.CalculPrixTransportGroupe === 'Prix au km'){
  return {
    'TauxChauffeur': true,
    'MinimumPriceRenumeration': true,
    'TAUX_KM_Chauffeur': true
  }
}
else{
  return {
    'TauxChauffeur': true,
    'MinimumPriceRenumeration': null,
    'TAUX_KM_Chauffeur': null}
}