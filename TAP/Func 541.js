console.log('Function 541', context)

const POSITION_LABELS = {
  startStopNumber: 'Montée',
  endStopNumber: 'Descente',
  endStopNumberRetour: 'Descente R.',
  startStopNumberRetour: 'Montée R.',
  stopoverStopNumber: 'Arrêt'
}
const STOPOVER_POSITIONS_KEY = 'StopPosStopsCollec'
const STOPOVER_COLLECTION_KEY = 'StopoverLocations'
const STOPOVER_ROW_POSITION_KEY = 'StopoverLocations|4000|StopPos'
const HOME_POSITIONS_KEY = 'PositionDomicileChauffeur'
const HOME_LABEL = 'Retour au domicile du chauffeur'

// ============================================================================
// UTILITAIRES
// ============================================================================
const createOrUpdateElement = (id, tag, style, innerHTML = '') => {
  let element = document.getElementById(id)
  if (!element) {
    element = document.createElement(tag)
    element.id = id
    document.body.appendChild(element)
  }
  element.style = style
  element.innerHTML = innerHTML
  return element
}

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup) loadingPopup.style.display = 'none'
}

const showPopupLoading = loadingMessage => {
  createOrUpdateElement(
    'loadingPopup',
    'div',
    'position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;',
    `<div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center; font-family: var(--chakra-fonts-body);">
      <div>${loadingMessage}</div>
      <div style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
    </div>`
  )
  if (!document.getElementById('spinnerStyle')) {
    const style = document.createElement('style')
    style.id = 'spinnerStyle'
    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
    document.head.appendChild(style)
  }
}

const showErrorBanner = errorMessage => {
  const errorBanner = createOrUpdateElement(
    'errorBanner',
    'div',
    'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); min-width: 300px; min-height: 50px; background-color: white; color: black; display: flex; justify-content: center; align-items: center; z-index: 10000; border-radius: 5px; padding: 0 20px; box-shadow: 0 0 10px rgba(0,0,0,0.5); font-family: var(--chakra-fonts-body);',
    `<div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
     <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>`
  )
  const progressElement = document.getElementById('errorBannerProgress')
  let width = 0
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval)
      errorBanner.style.display = 'none'
      return
    }
    width++
    progressElement.style.width = width + '%'
  }, 55)
}

// Popup avec une liste de choix ; renvoie la valeur choisie, ou null si annulé
const askChoice = ({ title, label, options, defaultValue, confirmLabel }) =>
  new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.style = 'position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 9999;'
    const optionsHTML = options
      .map(({ value, text }) => `<option value="${value}" ${String(value) === String(defaultValue) ? 'selected' : ''}>${text}</option>`)
      .join('')
    overlay.innerHTML = `
      <div style="background: white; border-radius: 0.375rem; padding: 15px 25px; width: 500px; max-width: 90vw; box-shadow: 0 2px 10px rgba(0,0,0,0.2); font-family: var(--chakra-fonts-body); color: #202127;">
        <h2 style="margin: 0 0 20px; font-size: 1.25rem; font-weight: bold; font-family: var(--chakra-fonts-heading);">${title}</h2>
        <label style="display: block; margin-bottom: 5px; font-size: 12px;">${label}</label>
        <select id="askChoiceSelect" style="width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 0.375rem; font-size: 1rem; font-family: inherit; margin-bottom: 20px;">${optionsHTML}</select>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="askChoiceCancel" style="border: none; padding: 6px 30px; border-radius: 0.375rem; cursor: pointer; font-weight: 600; font-size: 0.875rem; font-family: inherit; background: #f5f5f6; color: #2c2d32;">Annuler</button>
          <button id="askChoiceOk" style="border: none; padding: 6px 30px; border-radius: 0.375rem; cursor: pointer; font-weight: 600; font-size: 0.875rem; font-family: inherit; background: #3182ce; color: #f2f7fb;">${confirmLabel}</button>
        </div>
      </div>`
    document.body.appendChild(overlay)
    const close = value => {
      document.body.removeChild(overlay)
      resolve(value)
    }
    overlay.querySelector('#askChoiceCancel').onclick = () => close(null)
    overlay.querySelector('#askChoiceOk').onclick = () => close(overlay.querySelector('#askChoiceSelect').value)
  })

// ============================================================================
// DONNÉES DE LA TOURNÉE
// ============================================================================
const getDocuments = async filters => {
  const idsResponse = await api({ local: true }).post('document/id/filter', { filters })
  if (idsResponse.status !== 200) throw new Error('Problem during document/id/filter api call')
  const ids = idsResponse.data.ids || []
  if (!ids.length) return []
  const documentsResponse = await api({ local: true }).post('document/id', { ids })
  if (documentsResponse.status !== 200) throw new Error('Problem during document/id api call')
  return documentsResponse.data.documents
}

// Mêmes critères que « Attribuer automatiquement les positions » (Func 368)
const getTourTransports = async () => {
  const documents = await getDocuments([
    { key: 'FORMLAYOUTNAME', operator: 'IN', value: 'Transport|Transport de groupe', type: 'TEXT' },
    { key: 'Contrainte|1|Chauffeur', operator: 'EQUALS', value: docData['Contrainte|1|Chauffeur'], type: 'TEXT' },
    { key: 'Dates_DateTransport', operator: 'EQUALS', value: docData['Dates_DateTransport'], type: 'DATE' },
    { key: 'STATUS', operator: 'NOTIN', value: 'SUPPRIMÉ|VOYAGE BLANC', type: 'TEXT' }
  ])
  return documents.map(document => ({ document, data: JSON.parse(document.data) }))
}

const parseHomePositions = value => {
  const values = Array.isArray(value) ? value : String(value || '').split('|')
  return values.map(Number).filter(position => position > 0).sort((a, b) => a - b)
}

// Positions lues dans la base : les données de la page ne sont pas fiables dans une fonction
const getSavedHomePositions = async () => {
  const response = await api({ local: true }).post('document/id', { ids: [docData.FORMID] })
  if (response.status !== 200) throw new Error('Problem during document/id api call (tour)')
  const tourData = JSON.parse(response.data.documents?.[0]?.data || '{}')
  return parseHomePositions(tourData[HOME_POSITIONS_KEY])
}

const toPosition = value => {
  const position = Number(value)
  return value !== '' && value !== null && value !== undefined && position > 0 ? position : null
}

const getClientName = data => data['Contrainte|2|NomClient'] || data['Transports|1|Client'] || ''

const listTourStops = (transports, homePositions) => {
  const stops = []
  transports.forEach(({ data }) => {
    Object.entries(POSITION_LABELS).forEach(([key, type]) => {
      const position = toPosition(data[key])
      if (position) stops.push({ position, type, client: getClientName(data) })
    })
    String(data[STOPOVER_POSITIONS_KEY] || '')
      .split('|')
      .map(toPosition)
      .filter(Boolean)
      .forEach(position => stops.push({ position, type: 'Arrêt', client: getClientName(data) }))
  })
  homePositions.forEach(position => stops.push({ position, type: HOME_LABEL, client: '' }))
  return stops.sort((a, b) => a.position - b.position)
}

// ============================================================================
// DÉCALAGE DES POSITIONS
// ============================================================================
const shiftValue = (value, fromPosition, delta) => {
  const position = toPosition(value)
  return position && position >= fromPosition ? String(position + delta) : value
}

const shiftStopoverCollection = (data, fromPosition, delta, newData) => {
  const collection = data[STOPOVER_COLLECTION_KEY]
  if (Array.isArray(collection)) {
    newData[STOPOVER_COLLECTION_KEY] = collection.map(row => ({
      ...row,
      [STOPOVER_ROW_POSITION_KEY]: shiftValue(row[STOPOVER_ROW_POSITION_KEY], fromPosition, delta)
    }))
    return
  }
  Object.keys(data)
    .filter(key => key.startsWith(STOPOVER_ROW_POSITION_KEY + '|'))
    .forEach(key => {
      newData[key] = shiftValue(data[key], fromPosition, delta)
    })
}

// Décale de « delta » toutes les positions des transports à partir de « fromPosition »
const buildShiftedTransports = (transports, fromPosition, delta) =>
  transports
    .map(({ document, data }) => {
      const newData = {}
      Object.keys(POSITION_LABELS).forEach(key => {
        if (toPosition(data[key])) newData[key] = shiftValue(data[key], fromPosition, delta)
      })
      if (data[STOPOVER_POSITIONS_KEY]) {
        newData[STOPOVER_POSITIONS_KEY] = String(data[STOPOVER_POSITIONS_KEY])
          .split('|')
          .map(value => shiftValue(value, fromPosition, delta))
          .join('|')
        shiftStopoverCollection(data, fromPosition, delta, newData)
      }
      const hasChanged = Object.keys(newData).some(key => JSON.stringify(newData[key]) !== JSON.stringify(data[key]))
      if (!hasChanged) return null
      return {
        documentID: document.documentID,
        data: JSON.stringify(newData),
        status: document.status,
        active: true,
        template: document.template
      }
    })
    .filter(Boolean)

const saveTour = async (shiftedTransports, homePositions) => {
  if (shiftedTransports.length) {
    const response = await api({ local: true }).put('document/Many', { documents: shiftedTransports })
    // document/Many répond sans contenu : tout statut 2xx est un succès
    if (response.status < 200 || response.status >= 300) throw new Error('Problem during document/Many api call')
  }
  await api({ local: true }).put('document', {
    document: {
      documentID: docData.FORMID,
      data: JSON.stringify({ [HOME_POSITIONS_KEY]: homePositions.join('|') }),
      status: docData.STATUS,
      active: true,
      template: { templateId: docData.FORMLAYOUTID }
    }
  })
}

// ============================================================================
// AJOUT D'UN RETOUR AU DOMICILE
// ============================================================================
const describeStop = ({ position, type, client }) => `#${position} • ${type}${client ? ' • ' + client : ''}`

const isHomeStop = stop => stop?.type === HOME_LABEL

// Pas deux retours au domicile de suite : on retire les étapes juste avant ou juste après un retour existant
const buildInsertOptions = stops => {
  const lastIndex = stops.length - 1
  const startOption = isHomeStop(stops[0]) ? [] : [{ value: 1, text: 'Au début de la tournée' }]
  const afterStopOptions = stops
    .map((stop, index) => ({ stop, next: stops[index + 1], isLast: index === lastIndex }))
    .filter(({ stop, next }) => !isHomeStop(stop) && !isHomeStop(next))
    .map(({ stop, isLast }) => ({
      value: stop.position + 1,
      text: isLast ? `À la fin de la tournée (après l'arrêt ${describeStop(stop)})` : `Après l'arrêt ${describeStop(stop)}`
    }))
  return [...startOption, ...afterStopOptions]
}

const askInsertPosition = stops => {
  const options = buildInsertOptions(stops)
  return askChoice({
    title: 'Ajouter un retour au domicile du chauffeur',
    label: 'À quelle étape le chauffeur retourne-t-il à son domicile ?',
    options,
    defaultValue: options[options.length - 1].value,
    confirmLabel: 'Ajouter'
  })
}

const main = async () => {
  try {
    if (!docData['Contrainte|1|Chauffeur'] || !docData['Dates_DateTransport']) {
      showErrorBanner("Choisissez d'abord le chauffeur et la date de la tournée.")
      return
    }
    showPopupLoading('Chargement des arrêts…')
    const [transports, homePositions] = await Promise.all([getTourTransports(), getSavedHomePositions()])
    hidePopupLoading()
    const stops = listTourStops(transports, homePositions)
    if (!buildInsertOptions(stops).length) {
      showErrorBanner("Aucune étape possible : un retour au domicile ne peut pas être placé juste avant ou juste après un autre.")
      return
    }
    const chosenValue = await askInsertPosition(stops)
    if (!chosenValue) return
    const newPosition = Number(chosenValue)

    showPopupLoading('Ajout du retour au domicile…')
    const shiftedTransports = buildShiftedTransports(transports, newPosition, 1)
    const newHomePositions = [...homePositions.map(position => (position >= newPosition ? position + 1 : position)), newPosition].sort((a, b) => a - b)
    await saveTour(shiftedTransports, newHomePositions)
    location.reload()
  } catch (error) {
    console.error('Erreur Function 541 :', error)
    showErrorBanner("Le retour au domicile n'a pas pu être ajouté. Réessayez ou contactez le soutien.")
  } finally {
    hidePopupLoading()
  }
}

main()
