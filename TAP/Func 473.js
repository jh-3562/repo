return docData.CalculPrixTransportGroupe === "Manuel"
  ? {
      "PrixDuTransport": false,
    }
  : {
      "PrixDuTransport": true,
    };
