console.log('Function 520', context);

const PONTIAC_FORMLAYOUTID_TRANSPORT = "6d75ae79-ced2-4a83-a41e-da016f27e530";
const EDITS = store?.pageContentStore?.processData?.[0]?.edits
const selectedDate = EDITS['Dates_DateTransport_Client'];

const newDate = new Date();
newDate.setFullYear(newDate.getFullYear() + 100);
const futureDate = newDate.toISOString().split("T")[0];

const apiFilters = [
	{
		key: "FORMLAYOUTNAME",
		operator: "EQUALS",
		value: "Transport",
		type: "TEXT"
	},
	{
		key: "STATUS",
		operator: "NOTIN",
		value: "SUPPRIMÉE|SUPPRIMÉ|ANNULÉ",
		type: "TEXT",
	},
	{
		key: "Contrainte|2|NomClient",
		operator: "EQUALS",
		value: docData['Contrainte|2|NomClient'],
		type: "TEXT",
	},
	{
		key: "Dates_DateTransport",
		operator: "BETWEEN",
		value: `${selectedDate}|${futureDate}`,
		type: "DATE"
	}
];

const getDocuments = async (arrApiFilters) => {
	const filterResponseData = await api({ local: true }).post(
		"document/id/filter",
		{ filters: arrApiFilters }
	);

	if (filterResponseData.status !== 200) {
		throw new Error("Problem during document/id/filter api call");
	}

	const arrFormIds = filterResponseData.data.ids;

	const documentResponseData = await api({ local: true }).post(
		"document/id",
		{ ids: arrFormIds }
	);

	if (documentResponseData.status !== 200) {
		throw new Error("Problem during document/id api call");
	}

	return documentResponseData.data.documents.map(doc => ({
		...doc,
		data: JSON.parse(doc.data)
	}));
};

const updateManyDocuments = async (documents) => {
  try {
    return await api({ local: true }).put("document/Many", {
      documents: documents,
    });
  } catch (error) {
    console.log("Erreur lors de la modification des documents.");
  }
};

const createUpdateDocument = (data, templateId, documentID, status) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId: templateId },
    documentID: documentID,
  };
};

const geocodeWithBing = async address => {
  const result = {}
  try {
    const url = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
      address
    )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`
    const response = await fetch(url)
    const data = await response.json()
    result['coordinates'] =
      data.resourceSets[0].resources[0].geocodePoints[0].coordinates
    result['municipality'] = data.resourceSets[0].resources[0].address.locality
    result['country'] = data.resourceSets[0].resources[0].address.countryRegion
    result['postalCode'] = data.resourceSets[0].resources[0].address.postalCode
  } catch (error) {
    console.log('Error while geocoding with Bing:', error.message)
  }
  return result
}
const geocodeWithGoogle = async address => {
  return new Promise(resolve => {
    new google.maps.Geocoder().geocode({ address }, (results, status) => {
      const result = {}
      if (status === google.maps.GeocoderStatus.OK) {
        const location = results[0]?.geometry.location
        result['coordinates'] = [location.lat(), location.lng()]
        result['municipality'] = results[0].address_components.find(component =>
          component.types.includes('locality')
        )?.long_name
        result['country'] = results[0].address_components.find(component =>
          component.types.includes('country')
        )?.long_name
        result['postalCode'] = results[0].address_components.find(component =>
          component.types.includes('postal_code')
        )?.long_name
      }
      resolve(result)
    })
  })
}
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
          let totalDistance = 0
          let totalDuration = 0
          let DistanceAller = 0
          let DistanceRetour = 0
          let DureeLeg1 = 0
          let DureeLeg2 = 0
          const distances = []
          const durations = []
          const legs = result.routes[0]?.legs
          if (legs) {
            for (const leg of legs) {
              totalDistance += leg.distance.value
              totalDuration += leg.duration.value
              distances.push(leg.distance.value)
              durations.push(leg.duration.value)
            }
            DureeLeg1 = legs[0]?.duration.value || 0
            DureeLeg2 = legs[1]?.duration.value || 0
            DistanceRetour = legs[legs.length - 1].distance.value
            DistanceAller = totalDistance - DistanceRetour
          }

          resolve({
            totalDistance,
            distances,
            durations,
            totalDuration,
            DistanceAller,
            DistanceRetour,
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
const calculateTransportData = async docData => {
  const resultData = {}
  const getFiltersDatetimes = () => {
    const result = {}
    const recurrenceType = docData['Dates_TypeRéc']

    let startDate = undefined
    let endDate = undefined
    switch (recurrenceType) {
      case 'Une seule fois':
        startDate = docData['Dates_DateTransport']
        endDate = docData['Dates_DateTransport']
        break
      case 'Par semaine':
        startDate = docData['Dates_DebutRec']
        endDate = docData['Dates_FinRec']
        break
      case 'Par mois':
        startDate = docData['Dates_DebutRec']
        endDate = docData['Dates_FinRec']
        break
      case 'Par jour spécifique':
        const allDates = docData['Dates_Multidates'].split('|')
        startDate = allDates.reduce((date1, date2) =>
          new Date(date1) < new Date(date2) ? date1 : date2
        )
        endDate = allDates.reduce((date1, date2) =>
          new Date(date1) < new Date(date2) ? date2 : date1
        )
        break
    }

    if (startDate != undefined) {
      result['DateTime_Start'] = startDate + 'T00:00:00'
    }
    if (endDate != undefined) {
      result['DateTime_End'] = endDate + 'T23:59:59'
    }
    return result
  }

  const convertMinutesToHHMM = totalMinutes => {
    const totalMinutes24H = totalMinutes % (24 * 60)

    const hours = Math.floor(totalMinutes24H / 60)
    const minutes = Math.floor(totalMinutes24H % 60)

    const formattedTime =
      String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
    return formattedTime
  }

  const geocodeAddress = async (address, useBing) => {
    let geocodeResult = null
    if (useBing) {
      geocodeResult = await geocodeWithBing(address)
    } else {
      geocodeResult = await geocodeWithGoogle(address)
    }
    return geocodeResult
  }
  let startLatitude = 0.0
  let startLongitude = 0.0
  let endLatitude = 0.0
  let endLongitude = 0.0
  let stopoverLatitude = 0.0
  let stopoverLongitude = 0.0
  let kmForTotalPrice = 0
  let kmForCustomerPrice = 0
  let kmForCompanionPrice = 0
  let dureeLeg1 = 0
  let dureeLeg2 = 0
  let dispatchDureeTransportTheo = 0
  const isStopoverAtFirstTrip =
    docData['Transport_PositionArret'] === "À l'aller"
  const driverLatitude = docData['LatitudeChauffeur']
  const driverLongitude = docData['LongitudeChauffeur']

  let distanceAllerKm = 0.0
  let distanceRetourKm = 0.0
  let durationAllerMin = 0.0
  let durationRetourMin = 0.0

  // Geocode the departure address
  let startLocationGeocodeResult = {
    coordinates: ['', ''],
    municipality: '',
    country: '',
    postalCode: ''
  }
  if (docData['Etablissement_Adresse']) {
    if (docData['GeocodeBing1'] === 'true') {
      startLocationGeocodeResult = await geocodeWithBing(
        docData['Etablissement_Adresse']
      )
    } else {
      startLocationGeocodeResult = await geocodeWithGoogle(
        docData['Etablissement_Adresse']
      )
    }
    if (
      startLocationGeocodeResult &&
      startLocationGeocodeResult.coordinates.length > 0
    ) {
      startLatitude = startLocationGeocodeResult.coordinates[0]
      startLongitude = startLocationGeocodeResult.coordinates[1]
    }
  }
  Object.assign(resultData, {
    startLatitude: startLocationGeocodeResult.coordinates[0].toString(),
    startLongitude: startLocationGeocodeResult.coordinates[1].toString(),
    Etablissement_Ville: startLocationGeocodeResult.municipality,
    Etablissement_Pays: startLocationGeocodeResult.country,
    Etablissement_CodePostal: startLocationGeocodeResult.postalCode
  })
  // Geocode the destination address
  let endLocationGeocodeResult = {
    coordinates: ['', ''],
    municipality: '',
    country: '',
    postalCode: ''
  }
  if (docData['EtablissementDest_Adresse']) {
    if (docData['GeocodeBing2'] === 'true') {
      endLocationGeocodeResult = await geocodeWithBing(
        docData['EtablissementDest_Adresse']
      )
    } else {
      endLocationGeocodeResult = await geocodeWithGoogle(
        docData['EtablissementDest_Adresse']
      )
    }
    if (
      endLocationGeocodeResult &&
      endLocationGeocodeResult.coordinates.length > 0
    ) {
      endLatitude = endLocationGeocodeResult.coordinates[0]
      endLongitude = endLocationGeocodeResult.coordinates[1]
    }
  }
  Object.assign(resultData, {
    endLatitude: endLocationGeocodeResult.coordinates[0].toString(),
    endLongitude: endLocationGeocodeResult.coordinates[1].toString(),
    EtablissementDest_Ville: endLocationGeocodeResult.municipality,
    EtablissementDest_Pays: endLocationGeocodeResult.country,
    EtablissementDest_CodePostal: endLocationGeocodeResult.postalCode
  })

  // Geocode the stopover address
  let stopOverLocationGeocodeResult = {
    coordinates: ['', ''],
    municipality: '',
    country: '',
    postalCode: ''
  }
  if (docData['AdresseDestination2']) {
    if (docData['GeocodeBing3'] === 'true') {
      stopOverLocationGeocodeResult = await geocodeWithBing(
        docData['AdresseDestination2']
      )
    } else {
      stopOverLocationGeocodeResult = await geocodeWithGoogle(
        docData['AdresseDestination2']
      )
    }
    if (
      stopOverLocationGeocodeResult &&
      stopOverLocationGeocodeResult.coordinates.length > 0
    ) {
      stopoverLatitude = stopOverLocationGeocodeResult.coordinates[0]
      stopoverLongitude = stopOverLocationGeocodeResult.coordinates[1]
    }
  }

  Object.assign(resultData, {
    Lat2Dest: stopOverLocationGeocodeResult.coordinates[0].toString(),
    Lgt2Dest: stopOverLocationGeocodeResult.coordinates[1].toString()
  })

  const driverLocation =
    driverLatitude !== undefined && driverLongitude !== undefined
      ? { lat: Number(driverLatitude), lng: Number(driverLongitude) }
      : null
  const startLocation =
    startLatitude !== 0.0 && startLongitude !== 0.0
      ? { lat: startLatitude, lng: startLongitude }
      : null
  const endLocation =
    endLatitude !== 0.0 && endLongitude !== 0.0
      ? { lat: endLatitude, lng: endLongitude }
      : null
  const stopoverLocation =
    stopoverLatitude !== 0.0 && stopoverLongitude !== 0.0
      ? { lat: stopoverLatitude, lng: stopoverLongitude }
      : null
  // Ask distances to Google
  let map = []
  if (endLocation && startLocation) {
    // Calculate distance for customer price
    const {
      totalDistance,
      distances,
      durations,
      totalDuration,
      DureeLeg1,
      DureeLeg2
    } = await calculateDistanceWithGoogle(startLocation, startLocation, [
      { location: endLocation, stopover: true }
    ])
    kmForCustomerPrice = (totalDistance / 1000).toFixed(2)
    kmForCompanionPrice = (distances[0] / 1000).toFixed(2)
    dureeLeg1 = (DureeLeg1 / 60).toFixed(0)
    dureeLeg2 = (DureeLeg2 / 60).toFixed(0)
    dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0)

    distanceAllerKm = (distances[0] / 1000).toFixed(2)
    distanceRetourKm = (distances[1] / 1000).toFixed(2)
    durationAllerMin = (durations[0] / 60).toFixed(0)
    durationRetourMin = (durations[1] / 60).toFixed(0)

    // Calculate distance for total price
    const effectiveStartLocation =
      driverLocation &&
      Number(driverLocation.lat) !== 0 &&
      Number(driverLocation.lng) !== 0
        ? driverLocation
        : startLocation
    if (driverLocation) {
      if (stopoverLocation) {
        let stopoversForGoogle
        if (isStopoverAtFirstTrip) {
          stopoversForGoogle = [
            { location: startLocation, stopover: true },
            { location: stopoverLocation, stopover: true },
            { location: endLocation, stopover: true },
            { location: startLocation, stopover: true }
          ]
        } else {
          stopoversForGoogle = [
            { location: startLocation, stopover: true },
            { location: endLocation, stopover: true },
            { location: stopoverLocation, stopover: true },
            { location: startLocation, stopover: true }
          ]
        }
        const {
          totalDistance,
          distances,
          durations,
          totalDuration,
          DureeLeg1,
          DureeLeg2
        } = await calculateDistanceWithGoogle(
          effectiveStartLocation,
          effectiveStartLocation,
          stopoversForGoogle
        )
        kmForTotalPrice = (totalDistance / 1000).toFixed(2)
        dureeLeg1 = (DureeLeg1 / 60).toFixed(0)
        dureeLeg2 = (DureeLeg2 / 60).toFixed(0)
        dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0)

        distanceAllerKm = ((distances[1] + distances[2]) / 1000).toFixed(2)
        distanceRetourKm = (distances[3] / 1000).toFixed(2)
        durationAllerMin = ((durations[1] + durations[2]) / 60).toFixed(0)
        durationRetourMin = (durations[3] / 60).toFixed(0)
      } else {
        const {
          totalDistance,
          distances,
          durations,
          totalDuration,
          DureeLeg1,
          DureeLeg2
        } = await calculateDistanceWithGoogle(
          effectiveStartLocation,
          effectiveStartLocation,
          [
            { location: startLocation, stopover: true },
            { location: endLocation, stopover: true },
            { location: startLocation, stopover: true }
          ]
        )
        kmForTotalPrice = (totalDistance / 1000).toFixed(2)
        dureeLeg1 = (DureeLeg1 / 60).toFixed(0)
        dureeLeg2 = (DureeLeg2 / 60).toFixed(0)
        dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0)
      }
    }
  }

  const transportationDate = docData['Dates_DateTransport']
  let typeTransport = 'ALLER'
  let heureRdv = '00:00'
  let heurePriseEnCharge = '00:00'
  let heureRetour = '00:00'
  let dureeEmbarquement = 5
  let dureeDebarquement = 5
  let dureeTransport = dureeLeg1 + dureeLeg2 || 30

  let dureeAttente = 0
  let prioriteRdv = true

  if (docData['TypeTransport']) {
    typeTransport = docData['TypeTransport']
  }

  if (docData['EtablissementDest_HeureRDV']) {
    heureRdv = docData['EtablissementDest_HeureRDV']
    prioriteRdv = true
  } else if (docData['Depart_HeurePEC']) {
    heurePriseEnCharge = docData['Depart_HeurePEC']
    prioriteRdv = false
  }

  if (docData['DétailTransport_HeureRetour']) {
    heureRetour = docData['DétailTransport_HeureRetour']
  }

  if (docData['Etablissement_DureePEC']) {
    dureeEmbarquement =
      parseInt(docData['Etablissement_DureePEC']) || dureeEmbarquement
  }

  if (docData['EtablissementDest_DureeDebarq']) {
    dureeDebarquement =
      parseInt(docData['EtablissementDest_DureeDebarq']) || dureeDebarquement
  }

  if (docData['Attente_Prevue']) {
    let heureAttente = docData['Attente_Prevue']
    let a = heureAttente.split(':')
    dureeAttente = +a[0] * 60 + +a[1]
  }

  let minutesRdv = 0
  let minutesPec = 0
  if (prioriteRdv === true) {
    let a = heureRdv.split(':')
    minutesRdv = +a[0] * 60 + +a[1]
    minutesPec =
      minutesRdv - (dureeEmbarquement + dureeTransport + dureeDebarquement)
  } else {
    let a = heurePriseEnCharge.split(':')
    minutesPec = +a[0] * 60 + +a[1]
    minutesRdv =
      minutesPec + dureeEmbarquement + dureeTransport + dureeDebarquement
  }

  heurePriseEnCharge = convertMinutesToHHMM(minutesPec)
  heureRdv = convertMinutesToHHMM(minutesRdv)

  Object.assign(resultData, {
    KM_THEORIQUE: kmForCustomerPrice.toString(),
    Km_pour_calcul_de_la_totalite: kmForTotalPrice,
    KM_TH: kmForCompanionPrice.toString(),
    Dispatch_DuréeTransportTheo: dispatchDureeTransportTheo.toString()
    //EtablissementDest_HeureRDV: heureRdv
  })

  if (typeTransport === 'ALLER/RETOUR') {
    const minutesRetour = minutesRdv + dureeAttente
    resultData['DétailTransport_HeureRetour'] =
      convertMinutesToHHMM(minutesRetour)
  } else {
    resultData['DétailTransport_HeureRetour'] = ''
  }

  Object.assign(resultData, getFiltersDatetimes())

  Object.assign(resultData, {
    DureeTrajetAllerMinute: durationAllerMin.toString(),
    DureeTrajetRetourMinute: durationRetourMin.toString(),
    DistanceTrajet: distanceAllerKm.toString(),
    DistanceTrajetRetour: distanceRetourKm.toString()
  })

  return resultData
}

const buildDocumentsUpdateTransportDistance = async transportsDocuments => {
  const updates = []

  for (const transportDocument of transportsDocuments) {

    const parsedData = JSON.parse(transportDocument.data);

    const transportData = await calculateTransportData(parsedData);

    const mergedData = {
      ...parsedData,
      ...transportData
    }

    updates.push(
      createUpdateDocument(
        mergedData,
        PONTIAC_FORMLAYOUTID_TRANSPORT,
        transportDocument.documentID,
        transportDocument.status
      )
    )
  }

  return updates;
}

const main = async () => {

    try {
        showPopupLoading("Opération en cours");

        const transports = await getDocuments(apiFilters);
        console.log(transports);

        const updateDocuments = [];

        for (const transport of transports) {
            const updatedData = {
                ...transport.data,

                Domicile_Adresse: docData['Domicile_Adresse'],
                LongitudeClient: docData['LongitudeClient'],
                LatitudeClient: docData['LatitudeClient'],
                Telephone1: docData['Telephone1'],
                Telephone2: docData['Telephone2'],
                
                Adapte_check: docData['Adapte_check'],
                Appareil_liste: docData['Appareil_liste'],
                startDate: docData['startDate'],
                endDate: docData['endDate'],
            };

            if (transport.data.TypeLieuDépart === "Domicile") {
                updatedData.Etablissement_Adresse = docData['Domicile_Adresse'];
            }

            if (transport.data.TypeLieuDestination === "Domicile") {
                updatedData.EtablissementDest_Adresse = docData['Domicile_Adresse'];
            }

            if (transport.data.Nomdulieu2 === "Domicile") {
                updatedData.AdresseDestination2 = docData['Domicile_Adresse'];
            }

            updateDocuments.push(
                createUpdateDocument(
                    updatedData,
                    PONTIAC_FORMLAYOUTID_TRANSPORT,
                    transport.documentID,
                    transport.status
                )
            );
        }
        const updatedTransportDistance = await buildDocumentsUpdateTransportDistance(updateDocuments);
        await updateManyDocuments(updatedTransportDistance);
    } catch (error) {
        showErrorBanner("Une erreur est survenue lors du processus de mise à jour");
        console.error(error);
    } finally {
        hidePopupLoading();
    }
};

main();