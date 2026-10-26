console.log('Function 4', context);

return {
  AnnulationDemandéPar:
    docData['RaisonAnnulation'] == 'Annulation par le bénéficiaire ou tiers'
      ? true
      : null,
  DescriptionDeLannulation: docData['RaisonAnnulation'] == 'Autre' ? true : null
}
