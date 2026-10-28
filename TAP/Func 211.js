return docData['Destination2'] === 'true'
  ? {
      Transport_PositionArret: true,
      Nomdulieu2: true,
      AdresseDestination2: true,
      Nomdulieu22: true,
      Heure2emedest: true,
      Raison_transport2: true,
      GeocodeBing3: true,
      stopoverStopNumber: true,
      GeocodeAzureMapsDestination2: true
    }
  : {
      Transport_PositionArret: null,
      Heure2emedest: null,
      Nomdulieu2: null,
      Nomdulieu22: null,
      AdresseDestination2: null,
      Raison_transport2: null,
      GeocodeBing3: null,
      stopoverStopNumber: null,
      GeocodeAzureMapsDestination2: null
    }
