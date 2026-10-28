console.log('Function 159', context)
const result = {}
if (['Par mois', 'Par semaine', 'Par jour spécifique'].includes(docData['Dates_TypeRéc'])) {
  result['Dates_DateTransport'] = ''
  if (docData['Dates_TypeRéc'] === 'Par semaine') {
    result['Dates_DebutRec'] = docData['Dates_DateTransport']
  }
}

return result
