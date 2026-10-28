console.log('Function 154', context)
return {
  DétailTransport_HeureRetour:
    docData['TypeAllerRetour'] === 'Retour fixe' ||
    docData['TypeAllerRetour'] === 'Retour sur appel'
      ? null
      : true
}
