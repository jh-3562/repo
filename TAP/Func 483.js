console.log('Function 483', context)
if (docData['AdresseInstitution'] && docData['GeocodeBing5'] === 'true') {
  const requete = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
    docData['AdresseInstitution']
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
            LatitudeInstitution: Latitude,
            LongitudeInstitution: Longitude
          }
        })
      } else {
        callback([])
      }
    })
} else if (docData['AdresseInstitution']) {
  new google.maps.Geocoder().geocode(
    { address: docData['AdresseInstitution'] },
    result =>
      callback({
        data: {
          LongitudeInstitution: result[0].geometry.location.lng(),
          LatitudeInstitution: result[0].geometry.location.lat()
        }
      })
  )
} else {
  callback([])
}
