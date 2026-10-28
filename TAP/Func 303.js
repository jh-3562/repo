console.log('Function 303', context)

const directionsService = new google.maps.DirectionsService()

const getFileAtUrl = async url => {
  const response = await fetch(url)
  const jsonResponse = await response.json()
  return jsonResponse
}
const getTerritoriesGeoJSON = async () => {
  const pontiacGeoJSONUrl =
    window.location.origin + '/Project/mrc_geojson/mrc_s_Pontiac.geojson'
  const lesCollinesGeoJSONUrl =
    window.location.origin +
    "/Project/mrc_geojson/mrc_s_Les%20Collines-de-l'Outaouais.geojson"

  const pontiacGeoJSON = await getFileAtUrl(pontiacGeoJSONUrl)
  console.log('pontiacGeoJSON', pontiacGeoJSON)
  const lesCollinesGeoJSON = await getFileAtUrl(lesCollinesGeoJSONUrl)
  console.log('lesCollinesGeoJSON', lesCollinesGeoJSON)
  return {
    MRCPontiacGeoJSON: pontiacGeoJSON,
    MRCLesCollinesGeoJSON: lesCollinesGeoJSON
  }
}

const strTransportFormLayoutID = '6d75ae79-ced2-4a83-a41e-da016f27e530'
const strTransportDeGroupeFormLayoutID = 'de3bc87f-64fd-409b-a7bb-fcd9a505650c'
const driverName = docData['Contrainte|1|Chauffeur']
const date = docData['Dates_DateTransport']
const driverLatitude = docData['LatitudeChauffeur']
const driverLongitude = docData['LongitudeChauffeur']

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

/**
 * Check if the fieldValue obtained thanks to data[fieldKey]
 * represent an empty field.
 * @param {string} fieldValue
 * @returns {bool}
 */
const fieldIsEmpty = fieldValue => {
  return [undefined, ''].includes(fieldValue)
}
/**
 * This function check if a form is a row or a document in order to treat it correctly
 * Example 1: The formID is kept with the key 'key' in a row but in a document
 * it is the key 'documentID'
 * Example 2: document data is exhaustive but row data only contains the data of the grid.
 * @param {object} form
 * @returns {string}
 */
const isDocumentOrRow = form => {
  let result = undefined
  if ('rowID' in form) {
    result = 'row'
  } else if ('documentID' in form) {
    result = 'document'
  }
  return result
}
const stop = {
  formatStops (form) {
    const formatStop = (form, Latitude, Longitude, stopNumber) => {
      const documentOrRow = isDocumentOrRow(form)
      const stopForm = structuredClone(form)
      if (documentOrRow === 'document') {
        stopForm.data = JSON.parse(stopForm.data)
      }
      stopForm.data.Latitude = Latitude
      stopForm.data.Longitude = Longitude
      stopForm.data.stopNumber = stopNumber
      if (documentOrRow === 'document') {
        stopForm.data = JSON.stringify(stopForm.data)
      }

      return stopForm
    }

    const documentOrRow = isDocumentOrRow(form)
    let formData
    if (documentOrRow === 'document') {
      formData = JSON.parse(form.data)
    } else if (documentOrRow === 'row') {
      formData = form.data
    }
    console.log(formData)
    const result = []
    if (formData.FORMLAYOUTID === strTransportDeGroupeFormLayoutID) {
      const startLat = formData.startLatitude
      const startLng = formData.startLongitude
      const endLat = formData.endLatitude
      const endLng = formData.endLongitude
      const startPos = formData.startStopNumber ? formData.startStopNumber : 1
      const endPos = formData.endStopNumber ? formData.endStopNumber : 1

      const count = Number(formData.StopoverLocations) || 0
      const lngs = formData.LongitudeStopsCollec.split('|')
      const lats = formData.LatitudeStopsCollec.split('|')
      const poss = formData.StopPosStopsCollec.split('|')

      const mids = []
      for (let i = 0; i < count; i++) {
        const lat = lats[i]
        const lng = lngs[i]
        if (!fieldIsEmpty(lat) && !fieldIsEmpty(lng)) {
          const posRaw = poss[i]
          const posNum = Number(posRaw)
          const pos = posNum ? posNum : i + startPos
          mids.push({ lat, lng, pos })
        }
      }
      mids.sort((a, b) => a.pos - b.pos)

      if (!fieldIsEmpty(startLat) && !fieldIsEmpty(startLng)) {
        result.push(formatStop(form, startLat, startLng, startPos))
      }
      for (const s of mids) {
        result.push(formatStop(form, s.lat, s.lng, String(s.pos)))
      }
      if (!fieldIsEmpty(endLat) && !fieldIsEmpty(endLng)) {
        result.push(formatStop(form, endLat, endLng, String(endPos)))
      }
      return result
    }
    const startLatitude = formData.startLatitude
    const startLongitude = formData.startLongitude
    const startStopNumber = formData.startStopNumber
    const startStopNumberReturn = formData.startStopNumberRetour
    const endLatitude = formData.endLatitude
    const endLongitude = formData.endLongitude
    const endStopNumber = formData.endStopNumber
    const endStopNumberReturn = formData.endStopNumberRetour
    const hasStopover = formData.Destination2 === 'true'
    const stopoverLatitude = formData.Lat2Dest
    const stopoverLongitude = formData.Lgt2Dest
    const stopoverStopNumber = formData.stopoverStopNumber
    if (!fieldIsEmpty(startLatitude) && !fieldIsEmpty(startLongitude)) {
      const startStopForm = formatStop(
        form,
        startLatitude,
        startLongitude,
        startStopNumber
      )
      result.push(startStopForm)
    }
    if (!fieldIsEmpty(endLatitude) && !fieldIsEmpty(endLongitude)) {
      const endStopForm = formatStop(
        form,
        endLatitude,
        endLongitude,
        endStopNumber
      )
      result.push(endStopForm)
    }
    if (formData.TypeTransport === "ALLER/RETOUR" && !fieldIsEmpty(startLatitude) && !fieldIsEmpty(startLongitude)) {
      const startStopReturnForm = formatStop(
        form,
        startLatitude,
        startLongitude,
        startStopNumberReturn
      )
      result.push(startStopReturnForm)
    }
    if (formData.TypeTransport === "ALLER/RETOUR" && !fieldIsEmpty(endLatitude) && !fieldIsEmpty(endLongitude)) {
      const endStopReturnForm = formatStop(
        form,
        endLatitude,
        endLongitude,
        endStopNumberReturn
      )
      result.push(endStopReturnForm)
    }
    if (
      hasStopover &&
      !fieldIsEmpty(stopoverLatitude) &&
      !fieldIsEmpty(stopoverLongitude)
    ) {
      const stopoverStopForm = formatStop(
        form,
        stopoverLatitude,
        stopoverLongitude,
        stopoverStopNumber
      )
      result.push(stopoverStopForm)
    }
    console.log("STOPS :", result)
    return result
  },

  /*
  formatManyFormsStops (forms) {
    const result = []
    for (const form of forms) {
      const stops = this.formatStops(form)
      result.push(...stops)
    }
    return result
  }
  */
  formatManyFormsStops (forms) {
    const result = []

    for (const form of forms) {
      const stops = this.formatStops(form)
      result.push(...stops)
    }

    // récupération des positions domicile
    const homePositionsRaw = docData["PositionDomicileChauffeur"]

    if (homePositionsRaw) {
      const homePositions = homePositionsRaw
        .split("|")
        .map(p => Number(p.trim()))
        .filter(Boolean)

      for (const pos of homePositions) {
        const homeStopForm = structuredClone(forms[0])

        let data = JSON.parse(homeStopForm.data)

        data.Latitude = driverLatitude
        data.Longitude = driverLongitude
        data.stopNumber = pos

        homeStopForm.data = JSON.stringify(data)

        result.push(homeStopForm)
      }
    }
    return result
  } 
}

const getDocumentsForStops = async (driverName, date) => {
  const apiFilters = [
    {
      key: 'FORMLAYOUTID', // key from DB Field
      operator: 'IN', // operatorNK from DB Operator
      value: strTransportFormLayoutID + '|' + strTransportDeGroupeFormLayoutID,
      type: 'TEXT' // FieldTypeNk from DB FieldType
    },
    {
      key: 'STATUS', // key from DB Field
      operator: 'IN', // operatorNK from DB Operator
      value: 'SOUMIS|PLANIFIÉ|CONFIRMÉ',
      type: 'TEXT' // FieldTypeNk from DB FieldType
    },
    {
      key: 'Dates_DateTransport',
      operator: 'EQUALS',
      value: date,
      type: 'DATE'
    },
    {
      key: 'Contrainte|1|Chauffeur',
      operator: 'EQUALS',
      value: driverName,
      type: 'TEXT'
    }
  ]
  const result = await getDocuments(apiFilters)
  return result
}

const getDocumentsVoyageBlanc = async (driverName, date) => {
  const apiFilters = [
    {
      key: 'FORMLAYOUTID',
      operator: 'IN',
      value: strTransportFormLayoutID + '|' + strTransportDeGroupeFormLayoutID,
      type: 'TEXT'
    },
    {
      key: 'STATUS',
      operator: 'EQUALS',
      value: 'VOYAGE BLANC',
      type: 'TEXT'
    },
    {
      key: 'Dates_DateTransport',
      operator: 'EQUALS',
      value: date,
      type: 'DATE'
    },
    {
      key: 'Contrainte|1|Chauffeur',
      operator: 'EQUALS',
      value: driverName,
      type: 'TEXT'
    }
  ]
  const result = await getDocuments(apiFilters)
  return result
}

async function getRouteWithOSRM (coords) {
  console.log('getRouteWithOSRM called with:', coords)

  let osrmResult
  try {
    const response = await api().post(
      N8N_LINK_OSRM,
      
      coords
    );
    const osrmResponse = response.data
    osrmResponse.routes.sort((a, b) => a.distance - b.distance)
    osrmResult = osrmResponse
    console.log('osrmResponse', osrmResponse)
    return osrmResponse
  } catch (error) {
    console.error('Erreur OSRM', error)
  }

  // ----- Ancien calcul via OSRM -----
  /*
  const url = `http://router.project-osrm.org/route/v1/driving/${coords
    .map(c => c.join(','))
    .join(';')}?geometries=geojson&overview=full&alternatives=true`

  let osrmResult
  try {
    const response = await fetch(url)
    const osrmResponse = await response.json()
    osrmResponse.routes.sort((a, b) => a.distance - b.distance)
    osrmResult = osrmResponse
    console.log('osrmResponse', osrmResponse)
    return osrmResponse
  } catch (error) {
    console.error('Erreur OSRM', error)
  }
  */
}

const main = async () => {
  showPopupLoading('Calcul des distances en cours')
  try {
    const calculateDistancesAndInjectData = async wayPointsCoordinates => {
      const getTerritoriesData = coordinates => {
        const point = turf.point(coordinates)
        const isInMRCPontiac = turf.booleanPointInPolygon(
          point,
          turfMRCPontiacPolygon
        )
        const isInMRCLesCollines = turf.booleanPointInPolygon(
          point,
          turfMRCLesCollinesPolygon
        )
        return {
          isInMRCPontiac: isInMRCPontiac,
          isInMRCLesCollines: isInMRCLesCollines
        }
      }
      const formatDistance = distanceInMeters => {
        const distanceInKm = Math.round(distanceInMeters / 1000)
        return distanceInKm
      }
      const formatDuration = durationInSeconds => {
        const durationInMinutes = Math.round(durationInSeconds / 60)
        return durationInMinutes
      }
      const getNewCoordinatesAndRouteLegPerTerritory = OSRMRoute => {
        const routeCoordinates = OSRMRoute.routes[0].geometry.coordinates

        const usedWaypointsCoordinates = OSRMRoute.waypoints.map(
          waypoint => waypoint.location
        )

        console.log(usedWaypointsCoordinates, routeCoordinates)

        // Initialize the waypoints
        const wayPointsForOSRM = []
        const routeLegsTerritories = []
        const firstCoordinates = routeCoordinates[0]
        const firstCoordinateTerritories = getTerritoriesData(firstCoordinates)
        wayPointsForOSRM.push(firstCoordinates)
        let lastTerritories = firstCoordinateTerritories
        // Add the intermediary wayPoints
        for (
          let coordIndex = 1;
          coordIndex < routeCoordinates.length - 1;
          coordIndex++
        ) {
          const intermediaryCoordinates = routeCoordinates[coordIndex]
          const territories = getTerritoriesData(intermediaryCoordinates)
          const isAWayPoint = usedWaypointsCoordinates.some(
            usedCoordinates =>
              JSON.stringify(usedCoordinates) ===
              JSON.stringify(intermediaryCoordinates)
          )
          if (
            isAWayPoint ||
            territories.isInMRCPontiac !== lastTerritories.isInMRCPontiac ||
            territories.isInMRCLesCollines !==
              lastTerritories.isInMRCLesCollines
          ) {
            routeLegsTerritories.push({
              isInMRCPontiac: lastTerritories.isInMRCPontiac,
              isInMRCLesCollines: lastTerritories.isInMRCLesCollines
            })
            lastTerritories.isInMRCPontiac = territories.isInMRCPontiac
            lastTerritories.isInMRCLesCollines = territories.isInMRCLesCollines
            wayPointsForOSRM.push(intermediaryCoordinates)
          }
        }
        // Add the last wayPoint
        const lastCoordinates = routeCoordinates[routeCoordinates.length - 1]
        routeLegsTerritories.push({
          isInMRCPontiac: lastTerritories.isInMRCPontiac,
          isInMRCLesCollines: lastTerritories.isInMRCLesCollines
        })
        wayPointsForOSRM.push(lastCoordinates)
        return [wayPointsForOSRM, routeLegsTerritories]
      }
      const calculateDistancesAndDurations = (OSRMRoute, legsTerritories) => {
        // Count distance for each territory
        const totalDistance = formatDistance(OSRMRoute.routes[0].distance)
        const totalDuration = formatDuration(OSRMRoute.routes[0].duration)
        let distanceInMRCPontiac = 0
        let distanceInMRCLesCollines = 0
        let durationInMRCPontiac = 0
        let durationInMRCLesCollines = 0
        const legsNumber = legsTerritories.length
        for (let legIndex = 0; legIndex < legsNumber; legIndex++) {
          const legTerritories = legsTerritories[legIndex]
          const leg = OSRMRoute.routes[0].legs[legIndex]
          if (legTerritories.isInMRCPontiac) {
            distanceInMRCPontiac += leg.distance
            durationInMRCPontiac += leg.duration
          }
          if (legTerritories.isInMRCLesCollines) {
            distanceInMRCLesCollines += leg.distance
            durationInMRCLesCollines += leg.duration
          }
        }

        console.log()
        distanceInMRCPontiac = formatDistance(distanceInMRCPontiac)
        durationInMRCPontiac = formatDuration(durationInMRCPontiac)
        distanceInMRCLesCollines = formatDistance(distanceInMRCLesCollines)
        durationInMRCLesCollines = formatDuration(durationInMRCLesCollines)
        console.log('durationInMRCPontiac')

        const distanceOutMRCPontiac = totalDistance - distanceInMRCPontiac
        const durationOutMRCPontiac = totalDuration - durationInMRCPontiac
        const distanceOutMRCLesCollines =
          totalDistance - distanceInMRCLesCollines
        const durationOutMRCLesCollines =
          totalDuration - durationInMRCLesCollines
        return [
          totalDistance,
          totalDuration,
          distanceInMRCPontiac,
          distanceOutMRCPontiac,
          durationInMRCPontiac,
          durationOutMRCPontiac,
          distanceInMRCLesCollines,
          distanceOutMRCLesCollines,
          durationInMRCLesCollines,
          durationOutMRCLesCollines
        ]
      }
      const firstOSRMRoute = await getRouteWithOSRM(wayPointsCoordinates)

      const [wayPointsForOSRM, legsTerritories] =
        getNewCoordinatesAndRouteLegPerTerritory(firstOSRMRoute)

      const secondOSRMRoute = await getRouteWithOSRM(wayPointsForOSRM)

      console.log('secondOSRMRoute', secondOSRMRoute)

      const [
        totalDistance,
        totalDuration,
        InsideMRCPontiacDistance,
        OutsideMRCPontiacDistance,
        InsideMRCPontiacDuration,
        OutsideMRCPontiacDuration,
        InsideMRCCollinesDistance,
        OutsideMRCCollinesDistance,
        InsideMRCCollinesDuration,
        OutsideMRCCollinesDuration
      ] = calculateDistancesAndDurations(secondOSRMRoute, legsTerritories)
      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              backgroundColor: '#FFFFFFFF',
              borderColor: '000000FF'
            },
            geometry: secondOSRMRoute.routes[0].geometry
          }
        ]
      }

      const dataToInject = {
        'Total distance': totalDistance.toString(),
        'Total duration': totalDuration.toString(),
        GeoJson: JSON.stringify(geoJSON),
        InsideMRCPontiacDistance: InsideMRCPontiacDistance.toString(),
        OutsideMRCPontiacDistance: OutsideMRCPontiacDistance.toString(),
        InsideMRCPontiacDuration: InsideMRCPontiacDuration.toString(),
        OutsideMRCPontiacDuration: OutsideMRCPontiacDuration.toString(),
        InsideMRCCollinesDistance: InsideMRCCollinesDistance.toString(),
        OutsideMRCCollinesDistance: OutsideMRCCollinesDistance.toString(),
        InsideMRCCollinesDuration: InsideMRCCollinesDuration.toString(),
        OutsideMRCCollinesDuration: OutsideMRCCollinesDuration.toString()
      }
      console.log('dataToInject', dataToInject)
      injectDocData({
        fillData: dataToInject
      })
    }
    const formatWayPointsForDistanceCalculation = stops => {
      const driverStart = [
        parseFloat(driverLongitude),
        parseFloat(driverLatitude)
      ]
      const driverEnd = [
        parseFloat(driverLongitude),
        parseFloat(driverLatitude)
      ]
      const stopsData = stops.map(stop => JSON.parse(stop.data))
      const sortedStopsDatas = stopsData.sort(
        (stopDataA, stopDataB) =>
          parseFloat(stopDataA.stopNumber) - parseFloat(stopDataB.stopNumber)
      )
      const stopsCoordinates = sortedStopsDatas.map(stopData => [
        parseFloat(stopData.Longitude),
        parseFloat(stopData.Latitude)
      ])
      const result = []
      result.push(driverStart)
      result.push(...stopsCoordinates)
      result.push(driverEnd)
      return result
    }
    const territoriesGeoJSON = await getTerritoriesGeoJSON()
    const MRCPontiacPolygonCoords =
      territoriesGeoJSON.MRCPontiacGeoJSON.features[0].geometry.coordinates
    const MRCLesCollinesPolygonCoords =
      territoriesGeoJSON.MRCLesCollinesGeoJSON.features[0].geometry.coordinates

    const turfMRCPontiacPolygon = turf.polygon(MRCPontiacPolygonCoords)
    const turfMRCLesCollinesPolygon = turf.polygon(MRCLesCollinesPolygonCoords)
    const documentsForStops = await getDocumentsForStops(driverName, date)
    //const stops = stop.formatManyFormsStops(documentsForStops)
    const uniqueDocuments = [
      ...new Map(documentsForStops.map(doc => [doc.documentID, doc])).values()
    ]
    const stops = stop.formatManyFormsStops(uniqueDocuments)
    const stopsCoordinates = formatWayPointsForDistanceCalculation(stops)
    await calculateDistancesAndInjectData(stopsCoordinates)

    // Calcul de la distance totale sans le domicile du chauffeur
    const driverLatFloat = parseFloat(driverLatitude)
    const driverLngFloat = parseFloat(driverLongitude)
    const stopsWithoutDriver = stops.filter(s => {
      const data = JSON.parse(s.data)
      return !(
        parseFloat(data.Latitude) === driverLatFloat &&
        parseFloat(data.Longitude) === driverLngFloat
      )
    })
    if (stopsWithoutDriver.length >= 2) {
      const stopsDataWithoutDriver = stopsWithoutDriver
        .map(s => JSON.parse(s.data))
        .sort((a, b) => parseFloat(a.stopNumber) - parseFloat(b.stopNumber))
      const coordsWithoutDriver = stopsDataWithoutDriver.map(d => [
        parseFloat(d.Longitude),
        parseFloat(d.Latitude)
      ])
      const osrmRouteWithoutDriver = await getRouteWithOSRM(coordsWithoutDriver)
      const distanceSansChauffeur = Math.round(osrmRouteWithoutDriver.routes[0].distance / 1000)
      console.log('TotalDistanceSansChauffeur', distanceSansChauffeur)
      injectDocData({ fillData: { TotalDistanceSansChauffeur: distanceSansChauffeur.toString() } })
    }
  } catch (error) {
    console.log('Error during main function :', error)
  }

  // Calcul des VOYAGES BLANCS : domicile chauffeur -> point de départ de chaque transport
  try {
    let documentsVoyageBlanc = []
    try {
      documentsVoyageBlanc = await getDocumentsVoyageBlanc(driverName, date)
    } catch (error) {
      console.log('Aucun transport VOYAGE BLANC récupéré :', error)
    }
    const uniqueDocumentsVoyageBlanc = [
      ...new Map(
        documentsVoyageBlanc.map(doc => [doc.documentID, doc])
      ).values()
    ]

    const driverCoordinates = [
      parseFloat(driverLongitude),
      parseFloat(driverLatitude)
    ]
    let totalDistanceVoyageBlanc = 0
    let totalRenumerationVoyageBlanc = 0
    const voyageBlancCollection = []

    const tauxKm =
      parseFloat(docData["TAUX_KM_Chauffeur"]) || 0

    const minimumPriceRenumeration =
      parseFloat(docData["MinimumPriceRenumeration"]) 

    for (const documentVoyageBlanc of uniqueDocumentsVoyageBlanc) {
      const data = JSON.parse(documentVoyageBlanc.data)
      const client =
        data['Contrainte|2|NomClient'] ||
        data['Contrainte|2|NomClient|1'] ||
        ''
      let distance = ''
      let distanceInKm = 0

      if (!fieldIsEmpty(data.startLatitude) && !fieldIsEmpty(data.startLongitude)) {
        const startCoordinates = [
          parseFloat(data.startLongitude),
          parseFloat(data.startLatitude)
        ]

        const osrmRouteVoyageBlanc = await getRouteWithOSRM([
          driverCoordinates,
          startCoordinates
        ])

        if (osrmRouteVoyageBlanc) {
          distanceInKm = Math.round(
            osrmRouteVoyageBlanc.routes[0].distance / 1000
          )

          totalDistanceVoyageBlanc += distanceInKm
          distance = distanceInKm.toString()
        }
      } else {
        console.log('VOYAGE BLANC sans point de départ :', documentVoyageBlanc.documentID)
      }
      
      let remunerationVoyageBlanc =
        Math.round(distanceInKm * tauxKm * 100) / 100;

      if (
        docData?.CalculPrixTransportGroupe === 'Prix au km' &&
        !isNaN(minimumPriceRenumeration)
      ) {
        remunerationVoyageBlanc = Math.max(
          remunerationVoyageBlanc,
          minimumPriceRenumeration
        );
      }

      totalRenumerationVoyageBlanc += remunerationVoyageBlanc

      voyageBlancCollection.push({
        'TotalVoyageBlanc|1|client': client,
        'TotalVoyageBlanc|2|distance': distance,
        'TotalVoyageBlanc|3|renumeration':
          remunerationVoyageBlanc.toString()
      });
    }

    // Dans le formulaire, une collection est un tableau de lignes : le tableau
    // est remplacé en entier, donc les anciennes lignes disparaissent
    console.log('TotalDistanceVoyageBlanc', totalDistanceVoyageBlanc)
    console.log('voyageBlancCollection', voyageBlancCollection)
    injectDocData({
      fillData: {
        TotalDistanceVoyageBlanc: totalDistanceVoyageBlanc.toString(),
        TotalRenumerationVoyageBlanc:
          Math.round(totalRenumerationVoyageBlanc * 100) / 100,
        TotalVoyageBlanc: voyageBlancCollection
      }
    })
  } catch (error) {
    console.log('Error during VOYAGE BLANC calculation :', error)
  }
  hidePopupLoading()
}

main()
