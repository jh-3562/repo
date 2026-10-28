// console.log('Function 103', context)
// Fonction inutilisée. Suppression en attente de validation

// if (docData['EtablissementDest_Adresse']) {
//   const geocodeWithBing = docData['GeocodeBing2'] === 'true'
//   if (geocodeWithBing) {
//     const requete = `https://dev.virtualearth.net/REST/v1/Autosuggest?query=${encodeURIComponent(
//       docData['EtablissementDest_Adresse']
//     )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`
//     fetch(requete)
//       .then(response => response.json())
//       .then(data => {
//         const suggestions = data?.resourceSets[0]?.resources[0]?.value
//         if (suggestions && suggestions.length > 0) {
//           const addresses = suggestions.map(
//             suggestion => suggestion.address.formattedAddress
//           )
//           callback({
//             suggestions: {
//               EtablissementDest_Adresse: addresses.map(item => ({
//                 title: item
//               }))
//             }
//           })
//         } else {
//           callback({ suggestions: { EtablissementDest_Adresse: [] } })
//         }
//       })
//   } else {
//     new google.maps.places.AutocompleteService().getPlacePredictions(
//       {
//         input: docData['EtablissementDest_Adresse'],
//         componentRestrictions: { country: 'ca' }
//       },
//       result => {
//         console.log(result)
//         callback({
//           suggestions: {
//             EtablissementDest_Adresse: result.map(item => ({
//               title: item.description
//             }))
//           }
//         })
//       }
//     )
//   }
// } else {
//   callback([])
// }
