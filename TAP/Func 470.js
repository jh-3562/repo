return docData.CalculPrixTransportGroupe === "Manuel"
  ? {
      "StopoverLocations|2000|Longitude": true,
      "StopoverLocations|3000|Latitude": true,
      "StopoverLocations|4000|StopPos": true,
      "PrixDuTransport": false,
      "TAUX_KM_Chauffeur": true
    }
  : {
      "StopoverLocations|2000|Longitude": true,
      "StopoverLocations|3000|Latitude": true,
      "StopoverLocations|4000|StopPos": true,
      "PrixDuTransport": true,
      "TAUX_KM_Chauffeur": true
    };
