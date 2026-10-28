return {
  'EtablissementDest_NomLieu':
    docData['TypeLieuDestination'] === 'Institution' ||
    docData['TypeLieuDestination'] === 'Domicile' ||
    docData['TypeLieuDestination'] === 'Autre'
      ? true
      : true
};