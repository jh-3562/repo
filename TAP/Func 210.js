console.log('Function 210', context)

const collection = docData['CollectionClientsTA']

const currentRow = collection[indexItemChange]

if (currentRow['CollectionClientsTA|7|AdresseDest']) {
  new google.maps.places.AutocompleteService().getPlacePredictions(
    {
      input: currentRow['CollectionClientsTA|7|AdresseDest'],
      types: ['address'],
      componentRestrictions: { country: 'ca' }
    },
    result =>
      !console.log(result) &&
      callback({
        suggestions: {
          'CollectionClientsTA|7|AdresseDest': result.map(item => ({
            title: item.description
          }))
        }
      })
  )
} else {
  callback([])
}

return { CollectionClientsTA: collection }
