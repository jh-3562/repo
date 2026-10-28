console.log('Function 254', context)
const CalculKm = async (depart, arrivee) => {
  return new Promise(resolve => {
    new google.maps.DirectionsService().route(
      {
        origin: depart,
        destination: arrivee,
        travelMode: google.maps.TravelMode.DRIVING
      },
      result => {
        !console.log(result) &&
          resolve(
            ((result.routes[0]?.legs[0]?.distance.value || 0.0) / 1000)
              .toFixed(2)
              .toString()
          )
      }
    )
  })
}

if (store.moduleStore.tableDatas['Grille Complétés Validés'].rows.length > 0) {
  const rows = store.moduleStore.tableDatas['Grille Complétés Validés'].rows

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (
      row.data.Chauffeur_Adresse &&
      row.data.Domicile_Adresse &&
      (!row.data.TOTAL_KM_Chauffeur ||
        parseFloat(row.data.TOTAL_KM_Chauffeur) === 0)
    ) {
      const Domicile_Adresse = row.data.Domicile_Adresse
      const Chauffeur_Adresse = row.data.Chauffeur_Adresse
      console.log(Domicile_Adresse, Chauffeur_Adresse)

      CalculKm(Domicile_Adresse, Chauffeur_Adresse).then(KM => {
        console.log(KM)

        const data = {
          KM_TH_Chauffeur: KM,
          TOTAL_KM_Chauffeur: (parseFloat(KM) * 2.0).toString()
        }

        console.log(data, row.key)

        for (let propName in data) {
          if (!data[propName]) {
            delete data[propName]
          }
        }

        api({ local: true })
          .put('document', {
            document: {
              data: JSON.stringify(data),
              status: 'Complété',
              active: true,
              template: {
                templateId: '6d75ae79-ced2-4a83-a41e-da016f27e530'
              },
              documentID: row.key
            }
          })
          .then(res => callback())
      })
    }
  }
}
