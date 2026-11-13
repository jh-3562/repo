console.log('Function 543', context)

const COLLECTION_KEY = 'StopoverLocations'
const LATITUDE_KEY = 'StopoverLocations|3000|Latitude'
const LONGITUDE_KEY = 'StopoverLocations|2000|Longitude'
const POSITION_KEY = 'StopoverLocations|4000|StopPos'
const PICKUP_ORDER_KEY = 'StopoverLocations|110|PositionAller'
const DROPOFF_ORDER_KEY = 'StopoverLocations|120|PositionRetour'
const CLIENT_KEY = 'StopoverLocations|50|NomClient'
const ADDRESS_KEY = 'StopoverLocations|100|Address'
const ROUTE_KEYS = ['Visiteurs_adresse', 'Stop_Destination', 'startLatitude', 'startLongitude', 'endLatitude', 'endLongitude']

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

const showBanner = (message, color) => {
  const banner = createOrUpdateElement(
    'errorBanner',
    'div',
    'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); min-width: 300px; min-height: 50px; background-color: white; color: black; display: flex; justify-content: center; align-items: center; z-index: 10000; border-radius: 5px; padding: 0 20px; box-shadow: 0 0 10px rgba(0,0,0,0.5); font-family: var(--chakra-fonts-body);',
    `<div style="margin-right: 10px; color: ${color};">&#x26A0;</div><div>${message}</div>`
  )
  setTimeout(() => { banner.style.display = 'none' }, 6000)
}

const showErrorBanner = message => showBanner(message, 'red')
const showInfoBanner = message => showBanner(message, '#3182ce')

// ============================================================================
// TRAJET DU FORMULAIRE
// ============================================================================
const hasValue = value => value !== undefined && value !== null && String(value).trim() !== ''

// Lignes « Destinations intermédiaires » du formulaire, dans l'ordre affiché
const getFormStopovers = () => (Array.isArray(docData[COLLECTION_KEY]) ? docData[COLLECTION_KEY] : [])

// Groupe placé dans une tournée : ses numéros de tournée, dans l'ordre des lignes ; sinon 1, 2, 3…
const getPositions = stopovers => {
  const ordinalPositions = stopovers.map((_, index) => String(index + 1))
  const isInTour = Number(docData.startStopNumber) > 0
  const positions = stopovers.map(row => Number(row[POSITION_KEY])).filter(position => Number.isFinite(position) && position > 0)
  if (!isInTour || positions.length !== stopovers.length) return ordinalPositions
  return positions.sort((a, b) => a - b).map(String)
}

const isRanked = rank => Number.isInteger(rank) && rank >= 1

// Ordre du retour (numéros de ligne) : les destinations sans P. Dest. (ajoutées) en premier, dans l'ordre inverse de l'aller, puis les autres dans l'ordre P. Dest.
const getReturnOrder = ranks => {
  const indexes = ranks.map((_, index) => index)
  const ranked = indexes.filter(index => isRanked(ranks[index]))
  if (new Set(ranked.map(index => ranks[index])).size !== ranked.length) return indexes.reverse()
  const added = indexes.filter(index => !isRanked(ranks[index])).reverse()
  return [...added, ...ranked.sort((a, b) => ranks[a] - ranks[b])]
}

// P. Dest. renuméroté de 1 à n en gardant l'ordre du retour choisi
const getDropoffRanks = stopovers => {
  const newRanks = []
  getReturnOrder(stopovers.map(row => Number(row[DROPOFF_ORDER_KEY])))
    .forEach((index, offset) => { newRanks[index] = String(offset + 1) })
  return newRanks
}

// P. Dép. = ordre de passage à l'aller ; P. Dest. = ordre de dépôt au retour, seulement pour un aller/retour
const withOrders = stopovers => {
  const positions = getPositions(stopovers)
  const isRoundTrip = docData['CollectionClientsTA|4|TypeTransportTA'] === 'ALLER/RETOUR'
  const dropoffRanks = getDropoffRanks(stopovers)
  return stopovers.map((row, index) => ({
    ...row,
    [POSITION_KEY]: positions[index],
    [PICKUP_ORDER_KEY]: String(index + 1),
    [DROPOFF_ORDER_KEY]: isRoundTrip ? dropoffRanks[index] : ''
  }))
}

// Enregistrement à plat : « Collection|n|Champ|ligne » + nombre de lignes, comme en base
const buildRouteData = stopovers => {
  const positions = stopovers.map(row => row[POSITION_KEY])
  const data = { [COLLECTION_KEY]: String(stopovers.length) }
  stopovers.forEach((row, index) => {
    Object.keys(row)
      .filter(key => key.startsWith(`${COLLECTION_KEY}|`) && key.split('|').length === 3)
      .forEach(key => { data[`${key}|${index + 1}`] = row[key] ?? '' })
  })
  data.LatitudeStopsCollec = stopovers.map(row => row[LATITUDE_KEY] ?? '').join('|')
  data.LongitudeStopsCollec = stopovers.map(row => row[LONGITUDE_KEY] ?? '').join('|')
  data.StopPosStopsCollec = positions.join('|')
  ROUTE_KEYS.filter(key => docData[key] !== undefined).forEach(key => { data[key] = docData[key] })
  return data
}

const getStopoversWithoutCoordinates = stopovers => stopovers
  .filter(row => !hasValue(row[LATITUDE_KEY]) || !hasValue(row[LONGITUDE_KEY]))
  .map(row => row[CLIENT_KEY] || row[ADDRESS_KEY] || 'une destination')

const saveRoute = async data => {
  const response = await api({ local: true }).put('document', {
    document: {
      documentID: docData.FORMID,
      data: JSON.stringify(data),
      status: docData.STATUS,
      active: true,
      template: { templateId: docData.FORMLAYOUTID }
    },
    // Sans notification : évite l'alerte « modifié par un autre utilisateur » sur le groupe ouvert
    preventNotify: 'DOCUMENT'
  })
  if (response.status < 200 || response.status >= 300) throw new Error('Problem during document api call')
}

const main = async () => {
  try {
    if (!docData.FORMID) {
      showErrorBanner('Enregistrez d’abord le transport de groupe, puis actualisez la carte et les arrêts.')
      return
    }
    showPopupLoading('Actualisation de la carte et des arrêts…')
    const stopovers = withOrders(getFormStopovers())
    await saveRoute(buildRouteData(stopovers))
    context.injectDocData?.({ fillData: { [COLLECTION_KEY]: stopovers } })
    const withoutCoordinates = getStopoversWithoutCoordinates(stopovers)
    if (withoutCoordinates.length) {
      showInfoBanner(`Sans coordonnées, pas de marqueur sur la carte pour : ${withoutCoordinates.join(', ')}. Cochez « Calculer la distance et la durée du transport », puis actualisez.`)
    }
  } catch (error) {
    console.error('Erreur Function 543 :', error)
    showErrorBanner('La carte et les arrêts n’ont pas pu être actualisés. Réessayez ou contactez le soutien.')
  } finally {
    hidePopupLoading()
  }
}

main()