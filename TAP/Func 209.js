console.log('Function 209', context)

const collection = docData['CollectionClientsTA']

const currentRow = collection[indexItemChange]

if (currentRow['CollectionClientsTA|6|AdresseDep']) {
  new google.maps.places.AutocompleteService().getPlacePredictions(
    {
      input: currentRow['CollectionClientsTA|6|AdresseDep'],
      types: ['address'],
      componentRestrictions: { country: 'ca' }
    },
    result =>
      !console.log(result) &&
      callback({
        suggestions: {
          'CollectionClientsTA|6|AdresseDep': result.map(item => ({
            title: item.description
          }))
        }
      })
  )
} else {
  callback([])
}

return { CollectionClientsTA: collection }
