console.log('Function 230', context)
return docData['Type_Indispo'] === 'Par jour spécifique'
  ? {
      Dates_Multidates: true,
      Dates_Lundi: null,
      IntervalleDate: null
    }
  : docData['Type_Indispo'] === 'Par semaine'
  ? {
      Dates_Multidates: null,
      Dates_Lundi: true,
      IntervalleDate: true
    }
  : {
      Dates_Multidates: null,
      Dates_Lundi: null,
      IntervalleDate: null
    }
