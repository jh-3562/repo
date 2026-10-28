console.log('Function 306', context)

result = {}

switch (eventType) {
  case 'ONCHANGE':
    if (docData['Dates_TypeRéc'] === 'Une seule fois') {
      result['RégulierOuOccasionnel'] = 'Occasionnel'
    } else if (docData['Dates_TypeRéc'] === 'Par mois') {
      result['RégulierOuOccasionnel'] = 'Régulier'
    } else if (docData['Dates_TypeRéc'] === 'Par semaine') {
      result['RégulierOuOccasionnel'] = 'Régulier'
    } else if (docData['Dates_TypeRéc'] === 'Par jour spécifique') {
      result['RégulierOuOccasionnel'] = 'Régulier'
    }
    break
  case 'ONLOAD':
    if (docData['STATUS'] === 'Draft') {
      result['RégulierOuOccasionnel'] = 'Occasionnel'
    }
}

return result
