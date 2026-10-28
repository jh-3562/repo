console.log('Function 360', context)

const transportFormLayoutId = '6d75ae79-ced2-4a83-a41e-da016f27e530'

const tourneeFormLayoutId = '94e653b0-9a07-4be6-ad9b-6efaa44d9982'

const result = {}

const formLayoutId = docData['FORMLAYOUTID']

if (!['Draft', 'RECURRENCE'].includes(docData['STATUS'])) {
  result['Dates_TypeRéc'] = true
  //result['EnvoieFeuilleDeRoute'] = true
}

if (formLayoutId === transportFormLayoutId) {
  result['customerPricingType'] = true
  result['customerPricingPrix'] = true
  result['customerPricingTaux'] = true
  result['MinimumPrice'] = true
  result['MaximumPrice'] = true
  result['organismPricingType'] = true
  result['organismPricingTaux'] = true
  result['MinimumPriceOrganism'] = true
  result['MaximumPriceOrganism'] = true
  result['organismPrincingPrix'] = true
  result['Accompagnateur_paye_raison'] = true
  result['Taux km accompagnateur'] = true
  result['TAUX_KM_Chauffeur'] = true
}

if (formLayoutId === tourneeFormLayoutId) {
  result['TotalChauffeur'] = true
  result['TAUX_KM_Chauffeur'] = true
}

return result
