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
    const prepareDocumentsToUpdate = transportationDocuments => {
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
      let stopPosition = 1

      for (const transportationDocument of sortedTransportationDocuments) {
        const current = JSON.parse(transportationDocument.data)
        const isGroup = current.FORMLAYOUTID === 'de3bc87f-64fd-409b-a7bb-fcd9a505650c'

        if (isGroup) {
          let count = 0
          if (Array.isArray(current.StopoverLocations)) {
            count = current.StopoverLocations.length
          } else {
            count = Number(current.StopoverLocations) || 0
          }

          const startPos = stopPosition
          const midPositions = Array.from({ length: count }, (_, i) =>
            String(startPos + 1 + i)
          )
          const endPos = startPos + count + 1
          stopPosition = endPos + 1
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
          const startPos = stopPosition
          if (current.Destination2 === "true") {
            // Cas avec arrêt intermédiaire
            if (current.TypeTransport === 'ALLER/RETOUR') {
              newData = {
                startStopNumber: String(startPos),
                stopoverStopNumber: String(startPos + 1),
                endStopNumber: String(startPos + 2),
                endStopNumberRetour: String(startPos + 3),
                startStopNumberRetour: String(startPos + 4)
              }
              stopPosition += 5
            } else {
              newData = {
                startStopNumber: String(startPos),
                stopoverStopNumber: String(startPos + 1),
                endStopNumber: String(startPos + 2)
              }
              stopPosition += 3
            }
          } else {
            // Cas sans arrêt intermédiaire
            if (current.TypeTransport === 'ALLER/RETOUR') {
              newData = {
                startStopNumber: String(startPos),
                endStopNumber: String(startPos + 1),
                endStopNumberRetour: String(startPos + 2),
                startStopNumberRetour: String(startPos + 3)
              }
              stopPosition += 4
            } else {
              newData = {
                startStopNumber: String(startPos),
                endStopNumber: String(startPos + 1)
              }
              stopPosition += 2
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
    const transportationDocuments = await getTransportationDocuments()
    console.log('transportationDocuments', transportationDocuments)
    const documentsToUpdate = prepareDocumentsToUpdate(transportationDocuments)
    console.log('documentsToUpdate', documentsToUpdate)
    const updateResponse = await api({ local: true }).put('document/Many', {
      documents: documentsToUpdate
    })
  } catch (error) {
    console.log('ERROR during function 368 :', error)
  }
  hidePopupLoading()
}

main()
