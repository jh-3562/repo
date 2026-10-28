console.log('Function 361')
/**
 * Check if the fieldValue obtained thanks to data[fieldKey]
 * represent an empty field.
 * @param {string} fieldValue
 * @returns {bool}
 */
const fieldIsEmpty = fieldValue => {
  return [undefined, ''].includes(fieldValue)
}

let result = ''
if (!fieldIsEmpty(docData['Contrainte|1|Chauffeur'])) {
  result = docData['Contrainte|1|Chauffeur']
}

return result
