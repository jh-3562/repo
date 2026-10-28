console.log('Function 469', context)

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
  const lesCollinesGeoJSON = await getFileAtUrl(lesCollinesGeoJSONUrl)
  return {
    MRCPontiacGeoJSON: pontiacGeoJSON,
    MRCLesCollinesGeoJSON: lesCollinesGeoJSON
  }
}

const getTerritoriesData = (
  coordinates,
  turfMRCPontiacPolygon,
  turfMRCLesCollinesPolygon
) => {
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

// === Optional: keep turf helpers if you still need territory flags later ===
// const getTerritoriesGeoJSON = async () => { ... }
// const getTerritoriesData = (coordinates, turfMRCPontiacPolygon, turfMRCLesCollinesPolygon) => { ... }

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup) loadingPopup.style.display = 'none'
}

const showPopupLoading = loadingMessage => {
  const createOrUpdateElement = (id, tag, style, innerHTML = '') => {
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement(tag)
      el.id = id
      document.body.appendChild(el)
    }
    el.style = style
    el.innerHTML = innerHTML
    return el
  }
  createOrUpdateElement(
    'loadingPopup',
    'div',
    `
      position: fixed; left:0; top:0; width:100%; height:100%;
      background: rgba(0,0,0,.5); display:flex; justify-content:center; align-items:center; z-index:9999;
    `,
    `
      <div style="background:white; padding:20px; border-radius:8px; display:flex; flex-direction:column; align-items:center;">
        <div>${loadingMessage}</div>
        <div class="loader" style="border:6px solid #f3f3f3; border-top:6px solid #3498db; border-radius:50%; width:40px; height:40px; margin-top:20px; animation: spin 1s linear infinite;"></div>
      </div>
    `
  )
  if (!document.getElementById('spinnerStyle')) {
    const style = document.createElement('style')
    style.id = 'spinnerStyle'
    style.innerHTML = `@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`
    document.head.appendChild(style)
  }
}

const geocodeWithBing = async address => {
  const result = {}
  try {
    const url = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
      address
    )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`
    const response = await fetch(url)
    const data = await response.json()
    const res = data.resourceSets?.[0]?.resources?.[0]
    if (res) {
      result.coordinates = res.geocodePoints?.[0]?.coordinates ?? []
      result.municipality = res.address?.locality ?? ''
      result.country = res.address?.countryRegion ?? ''
      result.postalCode = res.address?.postalCode ?? ''
      const parsedStreet = parseStreetFromAddressLine(res.address?.addressLine)
      result.streetNumber = parsedStreet.streetNumber
      result.street = parsedStreet.street
    }
  } catch (e) {
    console.log('Bing geocode error:', e?.message)
  }
  return result
}

const geocodeWithGoogle = async address => {
  return new Promise(resolve => {
    const out = {}
    if (!address) return resolve(out)
    new google.maps.Geocoder().geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        const loc = results[0].geometry.location
        const addressComponents = results[0].address_components
        out.coordinates = [loc.lat(), loc.lng()]
        out.municipality = getAddressComponent(addressComponents, 'locality')
        out.country = getAddressComponent(addressComponents, 'country')
        out.postalCode = getAddressComponent(addressComponents, 'postal_code')
        out.streetNumber = getAddressComponent(addressComponents, 'street_number')
        out.street = getAddressComponent(addressComponents, 'route')
      }
      resolve(out)
    })
  })
}

const getAddressComponent = (addressComponents, type) =>
  addressComponents.find(component => component.types.includes(type))
    ?.long_name

const parseStreetFromAddressLine = (addressLine = '') => {
  const trimmedAddressLine = addressLine.trim()
  if (!trimmedAddressLine) {
    return { streetNumber: '', street: '' }
  }

  const match = trimmedAddressLine.match(/^([0-9A-Za-z\-\/]+)\s+(.*)$/)
  if (!match) {
    return { streetNumber: '', street: trimmedAddressLine }
  }

  return {
    streetNumber: match[1],
    street: match[2]
  }
}

const mapAddressFields = (geoResult, prefix) => ({
  [`${prefix}_Rue`]: geoResult.street || '',
  [`${prefix}_Ville`]: geoResult.municipality || '',
  [`${prefix}_CodePostal`]: geoResult.postalCode || '',
  [`${prefix}_Pays`]: geoResult.country || '',
  [`${prefix}_Numero`]: geoResult.streetNumber || ''
})

const calculateDistanceWithGoogle = async (origin, destination, waypoints) => {
  return new Promise(resolve => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const legs = result.routes?.[0]?.legs || []
          let totalDistance = 0
          let totalDuration = 0
          const distances = []
          const durations = []
          for (const leg of legs) {
            totalDistance += leg.distance.value // meters
            totalDuration += leg.duration.value // seconds
            distances.push(leg.distance.value)
            durations.push(leg.duration.value)
          }
          // Keep compatibility fields from the old code
          const DureeLeg1 = durations[0] ?? 0
          const DureeLeg2 = durations[1] ?? 0 // fix: use legs[1] when it exists
          resolve({
            totalDistance,
            totalDuration,
            distances,
            durations,
            DureeLeg1,
            DureeLeg2
          })
        } else {
          resolve(null)
        }
      }
    )
  })
}

const convertMinutesToHHMM = totalMinutes => {
  const mins24 = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(mins24 / 60)
  const m = Math.floor(mins24 % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const deriveDateFilters = doc => {
  // Keep previous behavior; fall back if DateTime_* already present.
  if (doc.DateTime_Start && doc.DateTime_End) {
    return {
      DateTime_Start: doc.DateTime_Start,
      DateTime_End: doc.DateTime_End
    }
  }
  const out = {}
  const t = doc['Dates_TypeRéc']
  if (t === 'Une seule fois' || t === 'Occurrence') {
    const d = doc['Dates_DateTransport']
    if (d) {
      out.DateTime_Start = `${d}T00:00:00`
      out.DateTime_End = `${d}T23:59:59`
    }
  } else if (t === 'Par semaine' || t === 'Par mois') {
    if (doc['Dates_DebutRec'])
      out.DateTime_Start = `${doc['Dates_DebutRec']}T00:00:00`
    if (doc['Dates_FinRec'])
      out.DateTime_End = `${doc['Dates_FinRec']}T23:59:59`
  } else if (t === 'Par jour spécifique' && doc['Dates_Multidates']) {
    const dates = doc['Dates_Multidates'].split('|').filter(Boolean)
    if (dates.length) {
      const min = dates.reduce((a, b) => (new Date(a) < new Date(b) ? a : b))
      const max = dates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
      out.DateTime_Start = `${min}T00:00:00`
      out.DateTime_End = `${max}T23:59:59`
    }
  }
  return out
}

const buildDataToFill = async doc => {
  const useBingStart = doc['GeocodeBing1'] === 'true'
  const useBingEnd = doc['GeocodeBing2'] === 'true'
  const dataToFill = {}

  // 1) Geocode START (Visiteurs_adresse)
  let start = { lat: 0, lng: 0 }
  if (doc['Visiteurs_adresse']) {
    const geo = useBingStart
      ? await geocodeWithBing(doc['Visiteurs_adresse'])
      : await geocodeWithGoogle(doc['Visiteurs_adresse'])
    if (geo?.coordinates?.length === 2) {
      start.lat = Number(geo.coordinates[0])
      start.lng = Number(geo.coordinates[1])
    }
    Object.assign(dataToFill, mapAddressFields(geo, 'Etablissement'))
  }

  // 2) Geocode STOPS (StopoverLocations array)
  const stops = Array.isArray(doc['StopoverLocations'])
    ? doc['StopoverLocations']
    : []
  const enrichedStops = []
  for (let i = 0; i < stops.length; i++) {
    const row = { ...stops[i] }
    // read embedded coords if present
    let lat = row['StopoverLocations|3000|Latitude']
    let lng = row['StopoverLocations|2000|Longitude']

    // If missing, try to geocode the address field
    if (lat == null || lat === '' || lng == null || lng === '') {
      const addr = row['StopoverLocations|100|Address'] || ''
      if (addr) {
        // You can choose Bing or Google for stops; we’ll default to Google here
        const g = await geocodeWithGoogle(addr)
        if (g?.coordinates?.length === 2) {
          lat = g.coordinates[0]
          lng = g.coordinates[1]
        }
      }
    }

    // Normalize & assign StopPos
    row['StopoverLocations|3000|Latitude'] = (lat ?? '').toString()
    row['StopoverLocations|2000|Longitude'] = (lng ?? '').toString()
    row['StopoverLocations|4000|StopPos'] = String(i + 1)

    enrichedStops.push(row)
  }

  // 3) Geocode END (Stop_Destination)
  let end = { lat: 0, lng: 0 }
  if (doc['Stop_Destination']) {
    const geo = useBingEnd
      ? await geocodeWithBing(doc['Stop_Destination'])
      : await geocodeWithGoogle(doc['Stop_Destination'])
    if (geo?.coordinates?.length === 2) {
      end.lat = Number(geo.coordinates[0])
      end.lng = Number(geo.coordinates[1])
    }
    Object.assign(dataToFill, mapAddressFields(geo, 'EtablissementDest'))
  }

  // 4) Build route points: Start -> stops... -> End -> Start (if ALLER/RETOUR)
  const startOK =
    Number.isFinite(start.lat) &&
    Number.isFinite(start.lng) &&
    (start.lat || start.lng)
  const endOK =
    Number.isFinite(end.lat) && Number.isFinite(end.lng) && (end.lat || end.lng)
  const stopPoints = enrichedStops
    .map(s => {
      const slat = Number(s['StopoverLocations|3000|Latitude'])
      const slng = Number(s['StopoverLocations|2000|Longitude'])
      if (Number.isFinite(slat) && Number.isFinite(slng) && (slat || slng)) {
        return { lat: slat, lng: slng, raw: s }
      }
      return null
    })
    .filter(Boolean)

  const typeTransport = (
    doc['CollectionClientsTA|4|TypeTransportTA'] ||
    doc['TypeTransport'] ||
    ''
  ).toUpperCase()
  const isRoundTrip = ['ALLER', 'ALLER/RETOUR'].includes(typeTransport)

  const waypoints = []

  if (startOK && endOK) {
    // push all stops in order
    for (const p of stopPoints) {
      waypoints.push({ location: { lat: p.lat, lng: p.lng }, stopover: true })
    }
    // ensure END is last waypoint before returning to START
    waypoints.push({ location: { lat: end.lat, lng: end.lng }, stopover: true })

    const route = await calculateDistanceWithGoogle(
      { lat: start.lat, lng: start.lng },
      // destination: loop back to start if round trip; otherwise end
      isRoundTrip
        ? { lat: start.lat, lng: start.lng }
        : { lat: end.lat, lng: end.lng },
      isRoundTrip ? waypoints : []
    )

    let start_chauffeur = { lat: 0, lng: 0 }
    let chauffeurAllerKm = 0
    let chauffeurRetourKm = 0

    if (doc['Chauffeur_Adresse']) {
      const geo = useBingStart
        ? await geocodeWithBing(doc['Chauffeur_Adresse'])
        : await geocodeWithGoogle(doc['Chauffeur_Adresse'])
      if (geo?.coordinates?.length === 2) {
        start_chauffeur.lat = Number(geo.coordinates[0])
        start_chauffeur.lng = Number(geo.coordinates[1])
      }

      const routeAllerChauffeur = await calculateDistanceWithGoogle(
        { lat: start_chauffeur.lat, lng: start_chauffeur.lng },
        { lat: start.lat, lng: start.lng },
        []
      )
      const routeRetourChauffeur = await calculateDistanceWithGoogle(
        { lat: end.lat, lng: end.lng },
        { lat: start_chauffeur.lat, lng: start_chauffeur.lng },
        []
      )

      chauffeurAllerKm = (routeAllerChauffeur?.totalDistance || 0) / 1000
      chauffeurRetourKm = (routeRetourChauffeur?.totalDistance || 0) / 1000
    }

    if (route) {
      const kmTotal =
        route.totalDistance / 1000 + chauffeurAllerKm + chauffeurRetourKm
      const minTotal = Math.round(route.totalDuration / 60)
      dataToFill['NombreKm'] = kmTotal.toFixed(2)
      // Per-leg (meters & seconds) → produce arrays in km/min for convenience
      const legsKm = route.distances.map(m => (m / 1000).toFixed(2))
      const legsMin = route.durations.map(s => Math.round(s / 60))

      const totalMinutes =
        legsMin.length > 1
          ? legsMin.slice(0, -1).reduce((sum, m) => sum + m, 0)
          : legsMin[0]

      const legsMinR = isRoundTrip ? legsMin[legsMin.length - 1] : legsMin[0]

      dataToFill['DureeTrajetAllerMinute'] = totalMinutes
      dataToFill['DureeTrajetRetourMinute'] = legsMinR

      const totalDistance =
        legsKm.length > 1
          ? legsKm.slice(0, -1).reduce((sum, m) => sum + Number(m), 0)
          : Number(legsKm[0])

      const legsKmR = isRoundTrip ? legsKm[legsKm.length - 1] : legsKm[0]

      dataToFill['DistanceTrajet'] = totalDistance
      dataToFill['DistanceTrajetRetour'] = legsKmR

      // Compatibility fields with your previous payload
      /*dataToFill['KM_THEORIQUE'] = kmTotal.toString();              // total km for the whole built route
      dataToFill['KM_TH'] = (route.distances[0] / 1000).toFixed(2); // first leg km (as before)
      dataToFill['Dispatch_DuréeTransportTheo'] = String(minTotal); // total minutes

      // New: expose detailed legs
      dataToFill['Legs_KM_Array'] = JSON.stringify(legsKm);   // ["12.34","5.67",...]
      dataToFill['Legs_MIN_Array'] = JSON.stringify(legsMin); // [18,7,...]

      // Expose first two legs’ durations like before (seconds → minutes rounded)
      dataToFill['DureeLeg1'] = String(Math.round((route.DureeLeg1 || 0) / 60));
      dataToFill['DureeLeg2'] = String(Math.round((route.DureeLeg2 || 0) / 60));*/
    }
  }

  // 5) Write back coordinates for Start/End (string like before)
  if (startOK) {
    dataToFill['startLatitude'] = start.lat.toString()
    dataToFill['startLongitude'] = start.lng.toString()
  }
  if (endOK) {
    dataToFill['endLatitude'] = end.lat.toString()
    dataToFill['endLongitude'] = end.lng.toString()
  }

  // 6) Return the enriched StopoverLocations (with StopPos/Lat/Lng)
  //    NOTE: we mirror your nested naming back into the flat data payload
  dataToFill['LatitudeStopsCollec'] = ''
  dataToFill['LongitudeStopsCollec'] = ''
  dataToFill['StopPosStopsCollec'] = ''
  enrichedStops.forEach((row, idx) => {
    // Persist the three computed fields for each stop
    dataToFill[`StopoverLocations|2000|Longitude|${idx}`] =
      row['StopoverLocations|2000|Longitude']
    dataToFill[`StopoverLocations|3000|Latitude|${idx}`] =
      row['StopoverLocations|3000|Latitude']
    dataToFill[`StopoverLocations|4000|StopPos|${idx}`] =
      row['StopoverLocations|4000|StopPos']
    dataToFill['LatitudeStopsCollec'] +=
      row['StopoverLocations|3000|Latitude'] + '|'
    dataToFill['LongitudeStopsCollec'] +=
      row['StopoverLocations|2000|Longitude'] + '|'
    dataToFill['StopPosStopsCollec'] +=
      row['StopoverLocations|4000|StopPos'] + '|'
  })
  dataToFill['LatitudeStopsCollec'] = dataToFill['LatitudeStopsCollec'].slice(
    0,
    -1
  )
  dataToFill['LongitudeStopsCollec'] = dataToFill['LongitudeStopsCollec'].slice(
    0,
    -1
  )
  dataToFill['StopPosStopsCollec'] = dataToFill['StopPosStopsCollec'].slice(
    0,
    -1
  )
  dataToFill[`StopoverLocations`] = enrichedStops

  // 7) Time filters (like before)
  Object.assign(dataToFill, deriveDateFilters(doc))

  return dataToFill
}

const main = async () => {
  showPopupLoading('Calcul en cours')
  try {
    const getTerritoriesDataToFill = async upToDateDocData => {
      const territoriesGeoJSON = await getTerritoriesGeoJSON()
      const MRCPontiacPolygonCoords =
        territoriesGeoJSON.MRCPontiacGeoJSON.features[0].geometry.coordinates
      const MRCLesCollinesPolygonCoords =
        territoriesGeoJSON.MRCLesCollinesGeoJSON.features[0].geometry
          .coordinates
      const turfMRCPontiacPolygon = turf.polygon(MRCPontiacPolygonCoords)
      const turfMRCLesCollinesPolygon = turf.polygon(
        MRCLesCollinesPolygonCoords
      )

      const destinationCoordinates = [
        upToDateDocData['endLongitude'],
        upToDateDocData['endLatitude']
      ]
      console.log('destinationCoordinates', destinationCoordinates)

      const territoriesData = getTerritoriesData(
        destinationCoordinates,
        turfMRCPontiacPolygon,
        turfMRCLesCollinesPolygon
      )

      const result = {}
      result['inMRCPontiac'] = territoriesData.isInMRCPontiac
        ? 'En territoire'
        : 'Hors territoire'
      result['inMRCLesCollines'] = territoriesData.isInMRCLesCollines
        ? 'En territoire'
        : 'Hors territoire'
      return result
    }
    const upToDateDocData = structuredClone(docData) // assumes docData in scope (same as your previous environment)
    const dataToFill = await buildDataToFill(upToDateDocData)
    Object.assign(upToDateDocData, dataToFill)
    console.log('dataToFill (multi-stops)', dataToFill)

    console.log('upToDateDocData', upToDateDocData)
    console.log('dataToFill', dataToFill)

    Object.assign(dataToFill, await getTerritoriesDataToFill(upToDateDocData))

    callback({ data: dataToFill })
  } catch (error) {
    console.log('Error during function 469', error)
    //callback({ data: { CalculateDuration: 'false' } });
  }
  hidePopupLoading()
}

main()
