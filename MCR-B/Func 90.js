console.log('Function 90', context)

const DataCollection = (key, array) => {
  let result = {}
  let itemCount = array?.length
  array.forEach((obj, index) => {
    Object.keys(obj).forEach(key => {
      let newKey = `${key}|${index + 1}`
      result[newKey] = obj[key]
    })
  })
  result[key] = itemCount.toString()
  return result
}

const excludeKeys = (obj, keys) =>
  Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key]
    }
    return result
  }, {})

const formatDataAPI = data => {
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) }
    }
  })
  return JSON.stringify(excludeKeys(data, ['FORMID', 'NUMBER']))
}

const createDisponibilitéForm = async (formData, status, formLayoutId) => {
  try {
    const response = await api({ local: true }).post('document', {
      document: {
        data: formatDataAPI(formData),
        status: status,
        active: true,
        template: { templateId: formLayoutId }
      }
    })
    console.log("Réponse de l'API :", response)
    return response
  } catch (error) {
    console.error("Erreur lors de l'appel API :", error)
    throw error
  }
}

const updateDisponibiliteForm = async (
  formId,
  formData,
  formLayoutId,
  status
) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: status,
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId
    }

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put('document', { document })

    console.log('Mise à jour réussie du formulaire mission :', res)
    return res
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour du formulaire mission :',
      error
    )
    throw error
  }
}

const getForm = async id => {
  try {
    const apiFilters = [
      {
        key: 'FORMID',
        operator: 'EQUALS',
        value: id,
        type: 'TEXT'
      }
    ]

    const res = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters
    })

    console.log("Réponse de l'API :", res)

    const doc = res?.data?.document

    return doc // Retourne l'ID du formulaire existant ou null
  } catch (error) {
    console.error('Erreur lors de la vérification du bénéficiaire :', error)
    throw error
  }
}

const main = async () => {
  const id = store.pageContentStore?.active[0]
  const form = store.pageContentStore.prepareDataRows.find(
    row => row.rowID === id
  )
  console.log('clicked on form :', form)
  if (!form) {
    console.error("Aucune donnée trouvée pour l'ID :", id)
    return
  }

  const key = form.key

  const completeForm = await getForm(key)
  const data = JSON.parse(completeForm?.data)
  console.log('data', data)
  const formLayoutId = form?.formLayoutId

  let createData = data
  const updateData = data

  let url_id = key
  if (
    !createData.IdentifiantFormulaireRécurrence &&
    createData.Planification_Récurrence !== 'Une seule fois'
  ) {
    createData = {
      ...createData,
      Planification_Date:
        createData.InformationsAdmin_DateHeureDébut.split('T')[0],
      Planification_Récurrence: 'Une seule fois',
      IdentifiantFormulaireRécurrence: key
    }
    const newUpdateData = {
      Exception_Récurrence: updateData.Exception_Récurrence
        ? `${updateData.Exception_Récurrence} | ${
            updateData.InformationsAdmin_DateHeureDébut.split('T')[0]
          }`
        : `${updateData.InformationsAdmin_DateHeureDébut.split('T')[0]}`
    }

    delete createData.customContextMenuProcesses
    delete createData.customOpenProcess

    try {
      const res = await createDisponibilitéForm(
        createData,
        form.status,
        formLayoutId
      )

      if (res?.data?.id) {
        // Update
        const resUpdate = await updateDisponibiliteForm(
          key,
          newUpdateData,
          formLayoutId,
          form.status
        )

        if (resUpdate) {
          console.log('Formulaire mis à jour avec succès :', resUpdate)
          url_id = res.data.id
        } else {
          console.error(
            'Erreur lors de la mise à jour du formulaire :',
            resUpdate
          )
        }
      } else {
        console.error("ID non trouvé dans la réponse de l'API")
      }
    } catch (error) {
      console.error('Erreur lors de la création du formulaire :', error)
    }
  }

  const url = new URL(window.location.href)

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split('/')

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex(seg => seg.startsWith('mcr.'))

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex]
    const section = segments[mcrIndex + 1] // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`
    url.pathname = newPath

    window.open(url.toString(), '_blank')
  } else {
    console.error('Segment MCR introuvable dans l’URL.')
  }
}

main()
