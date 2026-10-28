console.log('Function 300', context)

// Étape 1 :
// On se redirige vers la page précédente avant de créer les formulaires
// pour que la création des formulaires mettent à jour les grilles potentiellement sur la page.
// Si on le fait après, le navigateur risque d'utiliser son cache et de ne pas afficher les
// grilles mises à jour.
window.history.go(-2)

// Étape 2 :
// On créer les formulaires

const indisponibiliteTemplateID = '1EAA6EA3-6724-4802-BBF8-5804CCB35635'
const newStatus = 'INDISPONIBLE'

const typeIndispo = docData['Type_Indispo']
const HeureDebutIndispo = (docData['HeureDebutIndispo'] ?? '00:00') + ':00'
const HeureFinIndispo = (docData['HeureFinIndispo'] ?? '23:59') + ':00'

console.log('Début :', HeureDebutIndispo, 'Fin :', HeureFinIndispo)

const newDocuments = []
const newDatas = []
const defaultData = {
  'Contrainte|1|Chauffeur': docData['Contrainte|1|Chauffeur'],
  Raison_Indispo: docData['Raison_Indispo']
}

switch (typeIndispo) {
  case 'Par jour spécifique':
    console.log('Création des formulaires aux dates spécifiques')
    const dateSpecifiques = docData['Dates_Multidates']
    // On vérifie que dateSpecifiques a bien une valeur
    if (typeof dateSpecifiques === 'string') {
      // On récupère les dates
      const listeDatesSpecifiques = dateSpecifiques.split('|')
      for (const date of listeDatesSpecifiques) {
        const dateTimeStart = date + 'T' + HeureDebutIndispo
        const dateTimeEnd = date + 'T' + HeureFinIndispo
        const newData = structuredClone(defaultData)
        newData.DateTime_Start = dateTimeStart
        newData.DateTime_End = dateTimeEnd
        newDatas.push(newData)
      }
    }
    break
  case 'Par semaine':
    console.log('Création des formulaires de manière hebdomadaire')
    const Dates_Lundi = docData['Dates_Lundi']
    const IntervalleDate = docData['IntervalleDate']
    if (
      typeof Dates_Lundi === 'string' &&
      typeof IntervalleDate === 'string'
    ) {
      // On récupère la liste des jours de la semaine d'indisponibilité sous forme de numéro de la semaine
      const mappingJours = {
        dimanche: 0,
        lundi: 1,
        mardi: 2,
        mercredi: 3,
        jeudi: 4,
        vendredi: 5,
        samedi: 6
      }
      const listeJoursIndispoNum = Dates_Lundi.split('|').map(
        jour => mappingJours[jour.toLowerCase()]
      )
      // On récupère la date de début et de fin des indisponbilités
      const listeIntervalleDate = IntervalleDate.split('|')
      const startDate = new Date(listeIntervalleDate[0])
      const endDate = new Date(listeIntervalleDate[1])

      // On parcourt tous les jours entre les deux dates de début et de fin.
      let currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getUTCDay()
        // On vérifie si le jour de la semaine est bon pour ajouter l'indisponibilité si c'est le cas
        if (listeJoursIndispoNum.includes(dayOfWeek)) {
          const dateTimeStart =
            currentDate.toISOString().split('T')[0] + 'T' + HeureDebutIndispo
          const dateTimeEnd =
            currentDate.toISOString().split('T')[0] + 'T' + HeureFinIndispo
          const newData = structuredClone(defaultData)
          newData.DateTime_Start = dateTimeStart
          newData.DateTime_End = dateTimeEnd
          newDatas.push(newData)
        }
        // Incrémente de 1 jour
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }
    }
    break
  default:
    console.log("Création d'aucun formulaire")
}

// On ajoute chaque nouveau formulaire à la liste des documents pour l'appel API
for (const newData of newDatas) {
  newDocuments.push({
    data: JSON.stringify(newData),
    status: newStatus,
    active: true,
    template: { templateId: indisponibiliteTemplateID }
  })
}
console.log(newDocuments)

async function createDocuments (documents) {
  requests = documents.map(document =>
    api({ local: true }).post('document', {
      document: document,
      preventNotify: 'FULL'
    })
  )
  try {
    const results = await Promise.all(requests)
    console.log('Résultats des requêtes :', results)
  } catch (error) {
    console.error("Erreur lors de l'exécution des requêtes :", error)
  }
}

createDocuments(newDocuments)
