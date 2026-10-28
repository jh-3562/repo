 console.log('Function 371', context);

  const searchValue = docData['Contrainte|2|NomClient'];
  const fieldKey = 'Contrainte|2|NomClient';

  // Si le champ est vide, effacer toutes les informations du client
  if (!searchValue || searchValue.trim() === '') {
    callback({
      suggestions: { [fieldKey]: [] },
      data: {
        'Patient_DateNaissance': '',
        'Patient_Sexe': '',
        'Domicile_CodePostal': '',
        'Domicile_Adresse': '',
        'Domicile_Ville': '',
        'Adapte_check': '',
        'Appareil_liste': '',
        'Organisme_client': '',
        'Langue_parlees': '',
        'Age': '',
        'LatitudeClient': '',
        'LongitudeClient': '',
        'Fauteuil_Taille': '',
        'VehiculeNecessaire': '',
        'Telephone1': '',
        'Telephone2': '',
        'Contrainte': []
      }
    });
    return;
  }

  // Si moins de 2 caracteres, pas de recherche mais pas d'effacement
  if (searchValue.length < 2) {
    callback({ suggestions: { [fieldKey]: [] } });
    return;
  }

  const apiFilters = [
    { key: 'FORMLAYOUTNAME', operator: 'EQUALS', value: 'Client', type: 'TEXT' },
    { key: 'STATUS', operator: 'NOTIN', value: 'SUPPRIME', type: 'TEXT' }
  ];

  api({ local: true })
    .post('document/id/filter', { filters: apiFilters })
    .then(filterResponse => {
      if (filterResponse.status !== 200 || !filterResponse.data.ids?.length) {
        callback({ suggestions: { [fieldKey]: [] } });
        throw new Error('No results');
      }
      return api({ local: true }).post('document/id', { ids: filterResponse.data.ids.slice(0, 100) });
    })
    .then(docResponse => {
      if (!docResponse || docResponse.status !== 200) {
        callback({ suggestions: { [fieldKey]: [] } });
        return;
      }

      const clients = docResponse.data.documents.map(doc => ({
        ...doc,
        data: JSON.parse(doc.data)
      }));

      const searchLower = searchValue.toLowerCase().trim();

      const uniqueClients = {};
      clients.forEach(c => {
        const clientName = (c.data['Contrainte|2|NomClient'] || '').trim();
        if (clientName && clientName.toLowerCase().includes(searchLower) && !uniqueClients[clientName]) {
          uniqueClients[clientName] = c.data;
        }
      });

      Object.entries(uniqueClients).map(([clientName, clientData]) => (
        console.log('Client trouvé:', clientName, clientData)
      ));
      const contraintes = [];
      
      const suggestions = Object.entries(uniqueClients).map(
        ([clientName, clientData]) => {

          
          const count = Number(clientData.Contrainte) || 0;

          for (let i = 1; i <= count; i++) {
            contraintes.push({
              'Contrainte|1|Chauffeur': clientData[`Contrainte|1|Chauffeur|${i}`] || '',
              'Contrainte|2|NomClient': clientData[`Contrainte|2|NomClient`] || '',
              'Contrainte|3|Commentaire': clientData[`Contrainte|3|Commentaire|${i}`] || '',
            });
          }
          
          console.log('Contrainte Value:', contraintes);
          
          return {title: clientName,
          fields: [
            { key: 'Patient_DateNaissance', name: 'Date de naissance', value: clientData['Patient_DateNaissance'] || '' },
            { key: 'Patient_Sexe', name: 'Sexe', value: clientData['Patient_Sexe'] || '' },
            { key: 'Domicile_CodePostal', name: 'Code postal', value: clientData['Domicile_CodePostal'] || '' },
            { key: 'Domicile_Adresse', name: 'Adresse', value: clientData['Domicile_Adresse'] || '' },
            { key: 'Domicile_Ville', name: 'Ville', value: clientData['Domicile_Ville'] || '' },
            { key: 'Adapte_check', name: 'Transport adapte', value: clientData['Adapte_check'] || '' },
            { key: 'Appareil_liste', name: 'Appareils', value: clientData['Appareil_liste'] || '' },
            { key: 'Organisme_client', name: 'Organisme', value: clientData['Organisme_client'] || '' },
            { key: 'Langue_parlees', name: 'Langues', value: clientData['Langue_parlees'] || '' },
            { key: 'Age', name: 'Age', value: clientData['Age'] || '' },
            { key: 'LatitudeClient', name: 'Latitude', value: clientData['LatitudeClient'] || '' },
            { key: 'LongitudeClient', name: 'Longitude', value: clientData['LongitudeClient'] || '' },
            { key: 'Fauteuil_Taille', name: 'Taille fauteuil', value: clientData['Fauteuil_Taille'] || '' },
            { key: 'VehiculeNecessaire', name: 'Type vehicule', value: clientData['VehiculeNecessaire'] || '' },
            { key: 'Telephone1', name: 'Telephone 1', value: clientData['Telephone1'] || '' },
            { key: 'Telephone2', name: 'Telephone 2', value: clientData['Telephone2'] || '' },
          ]};
        }
      );


      console.log('Suggestions:', suggestions);

      callback({
        suggestions: {
          [fieldKey]: suggestions
        },
        data: {Contrainte: contraintes}
      });
    })
    .catch(error => {
      if (error.message !== 'No results') {
        console.error('Erreur:', error);
      }
      callback({ suggestions: { [fieldKey]: [] } });
    });

