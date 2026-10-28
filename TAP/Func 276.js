console.log('Function 276', context)
if (
  docData['Chauffeur_AdresseSecondaire'] &&
  docData['GeocodeBing6'] === 'true'
) {
  const requete = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
    docData['Chauffeur_AdresseSecondaire']
  )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`

  fetch(requete)
    .then(response => !console.log(response) && response.json())
    .then(res => {
      !console.log(res)
      const Points = res?.resourceSets[0]?.resources[0]?.bbox
      console.log(Points)
      if (Points && Points.length > 0) {
        const Latitude = Points[0]
        const Longitude = Points[1]
        callback({
          data: {
            LatitudeSecondaireChauffeur: Latitude,
            LongitudeSecondaireChauffeur: Longitude
          }
        })
      } else {
        callback([])
      }
    })
} else if (docData['Chauffeur_AdresseSecondaire']) {
  new google.maps.Geocoder().geocode(
    { address: docData['Chauffeur_AdresseSecondaire'] },
    result =>
      callback({
        data: {
          LongitudeSecondaireChauffeur: result[0].geometry.location.lng(),
          LatitudeSecondaireChauffeur: result[0].geometry.location.lat()
        }
      })
  )
} else {
  callback([])
}
