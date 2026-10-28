console.log('Function 514', context)

const getFormuleRemuneration = async () => {
  const apiFilters = [
    {
      key: 'FORMLAYOUTNAME',
      operator: 'EQUALS',
      value: 'Formule de rémunération',
      type: 'TEXT'
    },
    {
      key: 'STATUS',
      operator: 'EQUALS',
      value: 'Actif',
      type: 'TEXT'
    }
  ]

  try {
    const { data } = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters
    })

    if (!data?.ids?.length) return []

    const res = await api({ local: true }).post('document/id', {
      ids: data.ids
    })

    return res?.data?.documents || []
  } catch (error) {
    console.error('Erreur récupération Formules de rémunération:', error)
    return []
  }
}

const main = async () => {
  const documents = await getFormuleRemuneration()

  const modelesRemuneration = [
    ...new Set(
      documents
        .map(doc => {
          if (!doc?.data) return null
          try {
            return JSON.parse(doc.data).ModeleRemuneration
          } catch {
            return null
          }
        })
        .filter(Boolean)
    )
  ]

  const options = modelesRemuneration.map(modele => ({
    key: modele,
    value: modele,
    text: modele,
    items: null
  }))

  if (!options.length) {
    console.warn('Aucun modèle de rémunération trouvé')
  }

  callback({
    options: {
      ModeleRemuneration: options
    }
  })
}

main()
