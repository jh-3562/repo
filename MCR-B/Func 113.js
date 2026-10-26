console.log('Function 113', context);

return docData['CoorFactu_Réception'] === 'Courrier électronique'
  ? { CoorFactu_Courrier: true }
  : { CoorFactu_Courrier: null }
