console.log('Function 365', context)

const result = {
  organismPrincingPrix: null,
  organismPricingTaux: null,
  MinimumPriceOrganism: null,
  MaximumPriceOrganism: null
}
const organismPricingType = docData['organismPricingType']

switch (organismPricingType) {
  case 'Paie la totalité après déduction de la part usager':
    break
  case 'Prix fixe':
    result['organismPrincingPrix'] = true
    break
  case 'Tarification par taux':
    result['organismPricingTaux'] = true,
    result['MinimumPriceOrganism'] = true,
    result['MaximumPriceOrganism'] = true
    break
}

return result
