console.log('Function 253', context)
if (docData['Chauffeur_Adresse'] && docData['Domicile_Adresse']) {
  new google.maps.DirectionsService().route(
    {
      origin: docData['Chauffeur_Adresse'],
      destination: docData['Domicile_Adresse'],
      travelMode: google.maps.TravelMode.DRIVING
    },
    result =>
      callback({
        data: {
          KM_TH_Chauffeur: (
            (result.routes[0]?.legs[0]?.distance.value || 0.0) / 1000
          )
            .toFixed(2)
            .toString(),
          TOTAL_KM_Chauffeur: (
            (result.routes[0]?.legs[0]?.distance.value || 0.0) / 500
          )
            .toFixed(2)
            .toString(),
          Factu_TotalDistance: (
            parseFloat(
              (
                (result.routes[0]?.legs[0]?.distance.value || 0.0) / 1000
              ).toFixed(2)
            ) +
            parseFloat(
              (
                (result.routes[0]?.legs[0]?.distance.value || 0.0) / 500
              ).toFixed(2)
            )
          ).toFixed(2)
        }
      })
  )
}
