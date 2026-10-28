console.log('Function 537 - Vider les champs accompagnateur', context)

try {
  if (docData['customerPricingType'] !== 'Paie la totalité') {
    return {
      'Taux km accompagnateur': '',
      Accompagnateur_paye_raison: '',
    }
  }

  return {}
} catch (error) {
  console.error('Erreur lors du vidage des champs accompagnateur :', error)
  return {}
}
