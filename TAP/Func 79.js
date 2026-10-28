return {
  'Etablissement_NomLieu':
    docData['TypeLieuDépart'] === 'Institution' ||
    docData['TypeLieuDépart'] === 'Domicile' ||
    docData['TypeLieuDépart'] === 'Autre'
      ? true
      : true
};