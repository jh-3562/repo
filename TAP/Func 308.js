console.log('Function 308')
const usedVehicleType = docData['TransportTypeDeVehiculeUtilise']

const mapping = {
	'Autobus scolaire' : 'Autobus',
	'Autobus scolaire adapté' : 'Autobus',
	'Mini bus adapté' : 'Minibus',
	'Mini bus collectif' : 'Minibus',
	'Taxi' : 'Taxi',
	'Taxi adapté' : 'Taxi adapté',
	'Taxi auto' : 'Taxi',
	'Taxi SUV' : 'Taxi'
}

return {
	CatégorieVehiculeStatistique : mapping[usedVehicleType]
}