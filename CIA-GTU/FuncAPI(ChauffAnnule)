{
  "document": {
    "text": [
      [{"text": "Nom de l'usager: ", "type": "STATIC"}, "SystemeCache_NomPrenomUsager"],
      [{"text": "Heure de départ: ", "type": "STATIC"}, "Demande_TransportTransportSimpleHeureDepartSouhaitee"],
      [{"text": "Départ: ", "type": "STATIC"}, "Demande_TransportTransportSimpleAdresseCompleteDepart"],
      [{"text": "Destination: ", "type": "STATIC"}, "Demande_TransportTransportSimpleAdresseCompleteDestination"],
      [{"text": "Motif de transport: ", "type": "STATIC"}, "Demande_TypeDeTransport2"],
      [{"text": "Numéro de la demande: ", "type": "STATIC"}, "SystemeCache_Nombre"]
    ]
  },
  "prepareData": "
    const maskRows = store?.pageContentStore?.maskRows; 

    const colorMap = { 
      'Départ en cours': '#F7E6A3', 
      'En route': '#F7E6A3', 
      'Arrivée': '#F7E6A3', 
      'Attente imprévue': '#FADAC0', 
      'En attente': '#FADAC0', 
      'Confirmée': '#E5CBE6', 
      'Non complétée': '#F1E1D6', 
      'Complétée': '#C9DFC3',
      'Annulée': '#FFFFFF'
    }; 

    if (!maskRows) return maskRows; 

    return maskRows.map(row => { 
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data; 
      const status = data?.STATUS || ''; 
      const color = colorMap[status] || '#FFFFFF'; 
      
      return { 
        ...row, 
        backgroundColor: color, 
        borderColor: color 
      }; 
    });
  ",
  "height": 500
}