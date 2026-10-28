console.log('Function 501', context);

// calcul prixtransportgroupe
if(docData["CollectionClientsTA|4|TypeTransportTA"] === 'ALLER/RETOUR' || 
  docData["CollectionClientsTA|4|TypeTransportTA"] === 'ALLER/RETOUR (RETOUR)' ||
  docData["TypeTransport"] === 'ALLER/RETOUR' ||
  docData["TypeTransport"] === 'ALLER/RETOUR (RETOUR)'){
  return {
    'DureeTrajetRetourMinute': true,
    'DistanceTrajetRetour': true
  }
}
else{
  return {
    'DureeTrajetRetourMinute': null,
    'DistanceTrajetRetour': null
    }
}