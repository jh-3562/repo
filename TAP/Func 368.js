console.log('Function 368', context)

const getDocuments = async arrApiFilters => {
  const filterResponseData = await api({ local: true }).post(
    'document/id/filter',
    {
      filters: arrApiFilters
    }
  )

  if (filterResponseData.status !== 200) {
    throw new Error('Problem during document/id/filter api call')
  }

  const arrFormIds = filterResponseData.data.ids

  const documentResponseData = await api({ local: true }).post(`document/id`, {
    ids: arrFormIds
  })

  if (documentResponseData.status !== 200) {
    throw new Error('Problem during document/id api call')
  }

  return documentResponseData.data.documents
}

// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup) loadingPopup.style.display = 'none'
}
// function to show the popup loading
const showPopupLoading = loadingMessage => {
  // function to create the popup loading element
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
  createOrUpdateElement(
    'loadingPopup',
    'div',
    `
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
            `,
    `
              <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
                <div>${loadingMessage}</div>
                <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
              </div>
            `
  )
  if (!document.getElementById('spinnerStyle')) {
    let style = document.createElement('style')
    style.id = 'spinnerStyle'
    style.innerHTML = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
    document.head.appendChild(style)
  }
}

const HOME_POSITIONS_KEY = 'PositionDomicileChauffeur'

// Positions des retours au domicile lues dans la base (le formulaire ouvert peut ne plus être à jour)
const getTourHomePositions = async () => {
  const response = await api({ local: true }).post('document/id', { ids: [docData.FORMID] })
  if (response.status !== 200) throw new Error('Problem during document/id api call (tour)')
  const tourData = JSON.parse(response.data.documents?.[0]?.data || '{}')
  const value = tourData[HOME_POSITIONS_KEY]
  const values = Array.isArray(value) ? value : String(value || '').split('|')
  return values.map(Number).filter(position => position > 0).sort((a, b) => a - b)
}

// Donne les prochaines positions libres en sautant celles des retours au domicile
const createPositionAllocator = homePositions => {
  let nextPosition = 1
  const take = count => {
    const positions = []
    while (positions.length < count) {
      if (!homePositions.includes(nextPosition)) positions.push(nextPosition)
      nextPosition++
    }
    return positions
  }
  return { take, lastPosition: () => nextPosition - 1 }
}

// Les retours placés après le dernier arrêt sont ramenés juste après lui
const placeHomesAfterLastStop = (homePositions, lastStopPosition) => {
  let nextPosition = lastStopPosition + 1
  return homePositions.map(position => (position <= lastStopPosition ? position : nextPosition++))
}

const saveTourHomePositions = async homePositions => {
  const value = homePositions.join('|')
  await api({ local: true }).put('document', {
    document: {
      documentID: docData.FORMID,
      data: JSON.stringify({ [HOME_POSITIONS_KEY]: value }),
      status: docData.STATUS,
      active: true,
      template: { templateId: docData.FORMLAYOUTID }
    },
    // Sans notification : évite l'alerte « modifié par un autre utilisateur » sur la tournée ouverte
    preventNotify: 'DOCUMENT'
  })
  context.injectDocData?.({ fillData: { [HOME_POSITIONS_KEY]: value } })
}

const main = async () => {
  showPopupLoading('Attribution en cours')
  try {
    const getTransportationDocuments = async () => {
      const apiFilters = [
        {
          key: 'FORMLAYOUTNAME',
          operator: 'IN',
          value: 'Transport|Transport de groupe',
          type: 'TEXT'
        },
        {
          key: 'Contrainte|1|Chauffeur',
          operator: 'EQUALS',
          value: docData['Contrainte|1|Chauffeur'],
          type: 'TEXT'
        },
        {
          key: 'Dates_DateTransport',
          operator: 'EQUALS',
          value: docData['Dates_DateTransport'],
          type: 'DATE'
        },
        {
          key: 'STATUS',
          operator: 'NOTIN',
          value: 'SUPPRIMÉ|VOYAGE BLANC',
          type: 'TEXT'
        }
      ]
      console.log('apiFilters', apiFilters)
      const transportationDocuments = await getDocuments(apiFilters)
      return transportationDocuments
    }
    const prepareDocumentsToUpdate = (transportationDocuments, allocator) => {
      const sortedTransportationDocuments = transportationDocuments.sort(
        (transportation1, transportation2) => {
          const data1 = JSON.parse(transportation1.data)
          const data2 = JSON.parse(transportation2.data)
          let h1 =0,m1 =0,h2 =0,m2=0;
          if (data1['EtablissementDest_HeureRDV']) {
            [h1, m1] = data1['EtablissementDest_HeureRDV']
              .split(':')
              .map(Number)
          }  else if (data1["Stop_Heure"]) {
            [h1, m1] = data1['Stop_Heure']
              .split(':')
              .map(Number)
          }
          if (data2['EtablissementDest_HeureRDV']) {
            [h2, m2] = data2['EtablissementDest_HeureRDV']
            .split(':')
            .map(Number)
          } else if (data2["Stop_Heure"]) {
            [h2, m2] = data2['Stop_Heure']
              .split(':')
              .map(Number)
          }
          return h1 * 60 + m1 - (h2 * 60 + m2)
        }
      )

      const documentsToUpdate = []

      for (const transportationDocument of sortedTransportationDocuments) {
        const current = JSON.parse(transportationDocument.data)
        const isGroup = current.FORMLAYOUTID === 'de3bc87f-64fd-409b-a7bb-fcd9a505650c'

        const isGroupRoundTrip =
          current['CollectionClientsTA|4|TypeTransportTA'] === 'ALLER/RETOUR'

        // Groupe aller/retour : départ, destination puis retour, sans les arrêts intermédiaires pour l'instant
        if (isGroup && isGroupRoundTrip) {
          const [start, end, endReturn, startReturn] = allocator.take(4)
          const newData = {
            startStopNumber: String(start),
            endStopNumber: String(end),
            endStopNumberRetour: String(endReturn),
            startStopNumberRetour: String(startReturn)
          }
          documentsToUpdate.push({
            data: JSON.stringify(newData),
            status: transportationDocument.status,
            active: true,
            template: transportationDocument.template,
            documentID: transportationDocument.documentID
          })
          continue
        }

        if (isGroup) {
          let count = 0
          if (Array.isArray(current.StopoverLocations)) {
            count = current.StopoverLocations.length
          } else {
            count = Number(current.StopoverLocations) || 0
          }

          const groupPositions = allocator.take(count + 2)
          const startPos = groupPositions[0]
          const midPositions = groupPositions.slice(1, -1).map(String)
          const endPos = groupPositions[groupPositions.length - 1]
          console.log(current)
          const newData = {}
          newData['startStopNumber'] = String(startPos)
          newData['endStopNumber'] = String(endPos)
          newData['StopPosStopsCollec'] = midPositions.join('|')

          if (Array.isArray(current.StopoverLocations)) {
            const updatedStops = current.StopoverLocations.map((row, idx) => {
              const r = { ...row }
              r['StopoverLocations|4000|StopPos'] = midPositions[idx] || ''
              return r
            })
            newData['StopoverLocations'] = updatedStops
          } else {
             let index = 1;
             midPositions.forEach((pos) => {
                 newData[`StopoverLocations|4000|StopPos|${index}`] = pos
                 index += 1
             })
          }

          const document = {
            data: JSON.stringify(newData),
            status: transportationDocument.status,
            active: true,
            template: transportationDocument.template,
            documentID: transportationDocument.documentID
          }
          documentsToUpdate.push(document)
        } else {
          let newData
          if (current.Destination2 === "true") {
            // Cas avec arrêt intermédiaire
            if (current.TypeTransport === 'ALLER/RETOUR') {
              const [start, stopover, end, endReturn, startReturn] = allocator.take(5)
              newData = {
                startStopNumber: String(start),
                stopoverStopNumber: String(stopover),
                endStopNumber: String(end),
                endStopNumberRetour: String(endReturn),
                startStopNumberRetour: String(startReturn)
              }
            } else {
              const [start, stopover, end] = allocator.take(3)
              newData = {
                startStopNumber: String(start),
                stopoverStopNumber: String(stopover),
                endStopNumber: String(end)
              }
            }
          } else {
            // Cas sans arrêt intermédiaire
            if (current.TypeTransport === 'ALLER/RETOUR') {
              const [start, end, endReturn, startReturn] = allocator.take(4)
              newData = {
                startStopNumber: String(start),
                endStopNumber: String(end),
                endStopNumberRetour: String(endReturn),
                startStopNumberRetour: String(startReturn)
              }
            } else {
              const [start, end] = allocator.take(2)
              newData = {
                startStopNumber: String(start),
                endStopNumber: String(end)
              }
            }
          }
          const document = {
            data: JSON.stringify(newData),
            status: transportationDocument.status,
            active: true,
            template: transportationDocument.template,
            documentID: transportationDocument.documentID
          }
          documentsToUpdate.push(document)
        }
      }

      return documentsToUpdate
    }
    const [transportationDocuments, homePositions] = await Promise.all([getTransportationDocuments(), getTourHomePositions()])
    console.log('transportationDocuments', transportationDocuments)
    const allocator = createPositionAllocator(homePositions)
    const documentsToUpdate = prepareDocumentsToUpdate(transportationDocuments, allocator)
    console.log('documentsToUpdate', documentsToUpdate)
    const updateResponse = await api({ local: true }).put('document/Many', {
      documents: documentsToUpdate
    })
    const newHomePositions = placeHomesAfterLastStop(homePositions, allocator.lastPosition())
    if (newHomePositions.join('|') !== homePositions.join('|')) await saveTourHomePositions(newHomePositions)
  } catch (error) {
    console.log('ERROR during function 368 :', error)
  }
  hidePopupLoading()
}

main()
