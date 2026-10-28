console.log('Function 100', context)
new google.maps.places.AutocompleteService().getQueryPredictions(
  { input: docData['APICall'] },
  t => console.log(t)
)
return null
