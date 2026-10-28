console.log('Function 77', context)
return {
  DétailTransport_HeureRetour:
    docData['TypeTransport'] === 'Aller retour fixe' ||
    docData['TypeTransport'] === 'ALLER/RETOUR' ||
    docData['TypeTransport'] === 'Aller retour sur appel'
      ? true
      : null
}
