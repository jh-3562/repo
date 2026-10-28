/* console.log('Funciton 231', context)

// Results variables
const result = {}
let userContribution
let organismContribution
// Gather useful data from DocData
const princingType = docData['Client_paye']
const organism = docData['Prix_transport']
const transportationType = docData['TypeTransport'] // Can take the values "ALLER" "RETOUR" or "ALLER/RETOUR"
const isAccessibleTransportation = docData['Adapte_check']
const estimatedKMForTravelCompanionPriceCalculation = parseFloat(
  docData['KM_TH']
)
const estimatedKMForCustomerPriceCalculation = parseFloat(
  docData['KM_THEORIQUE']
)
const estimatedKMForTotalPriceCalculation = parseFloat(
  docData['Km_pour_calcul_de_la_totalite']
)
const doesTheCompanionPay = docData['Accompagnateur_paye']
// Declare the necessary variables for the cost calculation
let travelCompanionRatePerKM
if ('Taux km accompagnateur' in docData) {
  travelCompanionRatePerKM = parseFloat(docData['Taux km accompagnateur'])
} else {
  travelCompanionRatePerKM = 0.05
  result['Taux km accompagnateur'] = travelCompanionRatePerKM.toString()
}

if ('Accompagnateur_paye_raison' in docData) {
  travelCompanionMinimumPrice = parseFloat(
    docData['Accompagnateur_paye_raison']
  )
} else {
  travelCompanionMinimumPrice = 5
  result['Accompagnateur_paye_raison'] = travelCompanionMinimumPrice.toString()
}
const driverRatePerKM = 0.64
let customerRatePerKM
let customerMinimumPrice
let customerMaximumPrice
if (isAccessibleTransportation === 'Non') {
  customerRatePerKM = 0.18
  customerMinimumPrice = 8
  customerMaximumPrice = 30
} else {
  customerRatePerKM = 0.17
  customerMinimumPrice = 6
  customerMaximumPrice = 25
}

function transportationCost (
  distance,
  ratePerDistanceUnit,
  minimumPrice = null,
  maximumPrice = null
) {
  let transportationCost = distance * ratePerDistanceUnit
  if (minimumPrice !== null) {
    transportationCost = Math.max(transportationCost, minimumPrice)
  }
  if (maximumPrice !== null) {
    transportationCost = Math.min(transportationCost, maximumPrice)
  }
  return transportationCost
}

// Verify the status of the transport form in order not to change values once the transport has been done.
if (!['COMPLÉTÉ', 'FACTURÉ', 'CLOTURÉ'].includes(docData['STATUS'])) {
  userContribution = 0
  organismContribution = 0
  const totalPrice = Math.round(
    transportationCost(estimatedKMForTotalPriceCalculation, driverRatePerKM)
  )
  const CustomerPrice = transportationCost(
    estimatedKMForCustomerPriceCalculation,
    customerRatePerKM,
    customerMinimumPrice,
    customerMaximumPrice
  )
  switch (princingType) {
    case 'Client paye - cancer':
      userContribution = 10
      break
    case 'Client paye - Montréal et les environs':
      userContribution = 150
      break
    case 'Client paye':
      userContribution = CustomerPrice
      break
    case 'Client paye la totalité':
      userContribution = Math.max(totalPrice, customerMinimumPrice)
      break
    case 'Client et organisme payent':
      userContribution = CustomerPrice
      organismContribution = totalPrice - userContribution
      break
    case 'Organisme paye la totalité':
      organismContribution = totalPrice
      break
    case 'Organisme paye - Montréal et les environs':
      organismContribution = 150
      break
  }

  // Travel companion price calculation
  if (doesTheCompanionPay === "L'accompagnateur paye") {
    userContribution += Math.max(
      estimatedKMForTravelCompanionPriceCalculation * travelCompanionRatePerKM,
      travelCompanionMinimumPrice
    )
  }

  userContribution = Math.round(userContribution)
  organismContribution = Math.round(organismContribution)

  // Main result
  result['Dons_client'] = userContribution.toString()
  result['Part_Organisme'] = organismContribution.toString()
  result['Prix_totalite'] = totalPrice
  // Data in order to understand the result and the chosen rate
  result['TAUX_KM_Chauffeur'] = driverRatePerKM
  result['Taux_KM'] = customerRatePerKM

  return result
}
 */