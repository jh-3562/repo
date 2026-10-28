console.log('Function 217', context)

  if (docData['Dates_TypeRéc'] === 'Par jour spécifique') {
    return {
      Dates_Multidates: true,
      Dates_Lundi: null,
      Dates_DebutRec: null,
      Dates_FinRec: null
    }
  } else if (docData['Dates_TypeRéc'] === 'Par semaine') {
    return {
      Dates_Multidates: null,
      Dates_Lundi: true,
      Dates_DebutRec: true,
      Dates_FinRec: true
    }
  }

