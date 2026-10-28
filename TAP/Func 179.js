console.log('Function 179', context)
return docData['TACheckbox'] === 'true'
  ? {
      DateTime_Start: null,
      DateTime_End: null,
      Dispo_HeureDEbut: true,
      Dispo_HeureFin: true,
      Dates_Lundi: true
    }
  : {
      DateTime_Start: true,
      DateTime_End: true,
      Dispo_HeureDEbut: null,
      Dispo_HeureFin: null,
      Dates_Lundi: null
    }
