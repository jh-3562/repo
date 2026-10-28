console.log('Function 364', context)

const result = {
  customerPricingTaux: null,
  MinimumPrice: null,
  MaximumPrice: null,
  customerPricingPrix: null,
  'Taux km accompagnateur': null,
  Accompagnateur_paye_raison: null,
}

const customerPricingType = docData['customerPricingType']

switch (customerPricingType) {
  case 'Paie la totalité':
    result['Taux km accompagnateur'] = true
    result['Accompagnateur_paye_raison'] = true
    break
  case 'Prix fixe':
    result['customerPricingPrix'] = true
    break
  case 'Tarification par taux':
    result['customerPricingTaux'] = true
    result['MinimumPrice'] = true
    result['MaximumPrice'] = true
    break
}

return result
