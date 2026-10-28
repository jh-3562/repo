console.log('Function 294')

const companionNumber = docData['Accompagné'] === 'Oui' ? '1' : '0'

return {
  NombreAccompagnant: companionNumber,
  NombreAccompagnateursObligatoires: companionNumber
}
