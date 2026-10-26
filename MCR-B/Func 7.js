console.log('Function 7', context)

// Constants
const addressInput = 'SimulateurPrix_TarifSimulé'
const addressValue = docData[inputKey]

const apiFilters = [
  {
    key: 'FORMLAYOUTNAME',
    operator: 'EQUALS',
    value: 'TARIF',
    type: 'TEXT'
  },
  {
    key: 'LibelléTarif',
    operator: 'CONTAINS',
    value: addressValue,
    type: 'TEXT'
  },
  {
    key: 'STATUS',
    operator: 'NOTEQUALS',
    value: 'Supprimé(e)',
    type: 'TEXT'
  }
]

// Field mapping
const fieldMapping = {
  CalculPrix_CalculKilomètrage: {
    key: 'SimulateurPrix_CalculKilomètrage',
    name: 'Calcul kilométrage'
  },
  CalculPrix_NbKMCouvertForfaitPriseEnCharge: {
    key: 'SimulateurPrix_NbKMCouvertForfaitPriseEnCharge',
    name: 'Nombre KM couvert forfait prise en charge'
  },
  CalculPrix_PrixForfaitPriseEnChargeEuro: {
    key: 'SimulateurPrix_PrixForfaitPriseEnChargeEuro',
    name: 'Prix forfait prise en charge (€)'
  },
  CalculPrix_PrixMiniEuro: {
    key: 'SimulateurPrix_PrixMiniEuro',
    name: 'Prix minimum (€)'
  },
  CalculPrix_PrixParKmEuro: {
    key: 'SimulateurPrix_PrixParKmEuro',
    name: 'Prix par KM (€)'
  }
}

// Async functions
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters
    })
    const ids = res?.data?.ids

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.warn("Aucun ID trouvé pour le filtre 'ADRESSE'.")
      return []
    }

    return ids
  } catch (error) {
    console.error('Erreur lors de la récupération des documents :', error)
    return []
  }
}

const getAutocompleteSuggestions = async ids => {
  try {
    const res2 = await api({ local: true }).post('document/id', { ids })
    const documents = res2?.data?.documents

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error('Erreur lors de la récupération des documents.')
    }

    const allAddresses = documents
      .map(doc => {
        if (typeof doc.data !== 'string') {
          console.warn(
            "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
            doc
          )
          return null
        }

        try {
          return JSON.parse(doc.data)
        } catch (e) {
          console.warn("Impossible de parser un document d'adresse :", doc, e)
          return null
        }
      })
      .filter(d => d !== null)

    return allAddresses.map(addr => {
      const fields = Object.entries(fieldMapping).map(
        ([key, { key: departKey, name }]) => ({
          key: departKey,
          value: addr[key],
          name: name || departKey
        })
      )

      return {
        title: addr.LibelléTarif,
        fields
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions :', error)
    return []
  }
}

// Main
const main = async () => {
  const ids = (await getSuggestionsIds()).slice(0, 10)

  if (ids.length === 0) {
    callback({
      suggestions: {
        [addressInput]: [{}]
      }
    })
    return
  }

  const filteredSuggestions = await getAutocompleteSuggestions(ids)
  console.log('filteredSuggestions', filteredSuggestions)

  callback({
    suggestions: {
      [addressInput]: filteredSuggestions
    }
  })
}

main()
