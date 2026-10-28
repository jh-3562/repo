console.log('Function 309')

const necessaryVehicleType = docData['VehiculeNecessaire']
const transportationUsedVehicleType = necessaryVehicleType

const mapping = {
  'Autobus scolaire': 'Autobus',
  'Autobus scolaire adapté': 'Autobus',
  'Mini bus adapté': 'Minibus',
  'Mini bus collectif': 'Minibus',
  Taxi: 'Taxi',
  'Taxi adapté': 'Taxi adapté',
  'Taxi auto': 'Taxi',
  'Taxi SUV': 'Taxi'
}

return {
  TransportTypeDeVehiculeUtilise: transportationUsedVehicleType,
  CatégorieVehiculeStatistique: mapping[transportationUsedVehicleType]
}
