console.log('Function 289', context)

const result = { Dates_DateTransport: true }
if (['Par mois', 'Par semaine', 'Par jour spécifique'].includes(docData['Dates_TypeRéc'])) {
  result['Dates_DateTransport'] = null
}

return result
