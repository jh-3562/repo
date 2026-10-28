console.log('Function 362')
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
if (!fieldIsEmpty(docData['Dates_DateTransport'])) {
  result = docData['Dates_DateTransport']
}

return result
