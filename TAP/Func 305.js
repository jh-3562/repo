console.log('Function 305')
armchairDevices = [
  'Fauteuil gériatrique',
  'Fauteuil roulant',
  'Fauteuil motorisé',
  'Quadriporteur'
]

const devices =
  typeof docData['Appareil_liste'] === 'string'
    ? docData['Appareil_liste'].split('|')
    : []
console.log(devices)

let mobileOrArmchair
if (devices.some(element => armchairDevices.includes(element))) {
  mobileOrArmchair = 'Fauteuil'
} else {
  mobileOrArmchair = 'Ambulant'
}

return { AmbulantOuFauteuil: mobileOrArmchair }