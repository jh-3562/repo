console.log('Fonction 226', context);

return {
  NomTransporteurSearch:
    docData['Utilisateur_Role'] === 'Transporteur' || docData['Utilisateur_Role'] === 'Chauffeur' || docData['Utilisateur_Role'] === 'Répartiteur'
      ? true
      : null,
  Demande_TransportIdentificationDemandeurCourrielDemandeur:
    docData['Utilisateur_Role'] === 'Département' || docData['Utilisateur_Role'] === 'Gestionnaire'
      ? true
      : null,
};
