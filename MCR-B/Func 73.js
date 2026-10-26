console.log('Function 73', context)

let result

switch (docData['Planification_Récurrence']) {
  case 'Une seule fois':
    result = {
      Planification_Date: true,
      Planification_Répéter: null,
      Planification_DateFin: null,
      Planification_MultiDate: null
    }
    break
  case 'Par semaine':
    result = {
      Planification_Date: true,
      Planification_Répéter: true,
      Planification_DateFin: true,
      Planification_MultiDate: null
    }
    break
  case 'Par jour spécifique':
    result = {
      Planification_Date: null,
      Planification_Répéter: null,
      Planification_DateFin: null,
      Planification_MultiDate: true
    }
    break
}

return result
