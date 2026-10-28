console.log('Function 212', context)
if (docData['AdresseDestination2'] && !(docData['GeocodeBing3'] === 'true')) {
  new google.maps.places.AutocompleteService().getPlacePredictions(
    {
      input: docData['AdresseDestination2'],
      types: ['address'],
      componentRestrictions: { country: 'ca' }
    },
    result =>
      !console.log(result) &&
      callback({
        suggestions: {
          AdresseDestination2: result.map(item => ({
            title: item.description
          }))
        }
      })
  )
} else if (
  docData['AdresseDestination2'] &&
  docData['GeocodeBing3'] === 'true'
) {
  const requete = `https://dev.virtualearth.net/REST/v1/Autosuggest?query=${encodeURIComponent(
    docData['AdresseDestination2']
  )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`
  fetch(requete)
    .then(response => response.json())
    .then(data => {
      const suggestions = data?.resourceSets[0]?.resources[0]?.value
      if (suggestions && suggestions.length > 0) {
        const addresses = suggestions.map(
          suggestion => suggestion.address.formattedAddress
        )
        callback({
          suggestions: {
            AdresseDestination2: addresses.map(item => ({ title: item }))
          }
        })
      } else {
        callback({ suggestions: { AdresseDestination2: [] } })
      }
    })
} else {
  callback([])
}
