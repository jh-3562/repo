console.log('Function 213', context)

const result = {
  Dates_Multidates: null,
  Dates_Lundi: null,
  Dates_DebutRec: null,
  Dates_FinRec: null,
  IntervalleHebdomadaire: null,
  IntervalleMensuel: null,
  TypeMensuel: null,
  Dates_RecPauseRange: null
}

// Premier niveau
switch (docData['Dates_TypeRéc']) {
  case 'Par jour spécifique':
    result['Dates_Multidates'] = true
    break

  case 'Par semaine':
    result['Dates_Lundi'] = true
    result['Dates_DebutRec'] = true
    result['Dates_FinRec'] = true
    result['IntervalleHebdomadaire'] = true
    result['Dates_RecPauseRange'] = true
    break

  case 'Par mois':
    result['TypeMensuel'] = true

    // Deuxième niveau (TypeMensuel)
    if (docData['TypeMensuel'] === 'Jour relatif') {
      result['Dates_Lundi'] = true
      result['Dates_DebutRec'] = true
      result['Dates_FinRec'] = true
      result['IntervalleMensuel'] = true
      result['Dates_RecPauseRange'] = true
    } else if (docData['TypeMensuel'] === 'Jour fixe') {
      result['Dates_Multidates'] = true
      result['Dates_DebutRec'] = true
      result['Dates_FinRec'] = true
      result['Dates_RecPauseRange'] = true
      result['Dates_Lundi'] = null
      result['IntervalleMensuel'] = null
    }

    break
}

return result