console.log('Function 133', context);

return docData.STATUS === 'Archivé' || docData.STATUS === 'Enregistré'
  ? { MotifArchivage: true }
  : { MotifArchivage: null }
