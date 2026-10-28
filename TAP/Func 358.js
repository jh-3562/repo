console.log('Function 358', context)

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = str => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split('/')
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1]
    if (isUUID(lastpart) || lastpart === 'new') {
      parts.pop()
    }
  }
  const viewGroupUrl = parts.join('/')
  return viewGroupUrl
}

const result = {}

if (docData['STATUS'] === 'Draft') {
  result['Dates_TypeRéc'] = 'Une seule fois'
}

result['STATUS'] = docData['STATUS']
result['FORMLAYOUTID'] = docData['FORMLAYOUTID']

// Recurrence Markdown
let topOfThePageMarkdownValue = ''
if (docData['Dates_TypeRéc'] === 'Occurrence') {
  const url = viewGroupUrl() + '/' + docData.FormIDRecurrence
  topOfThePageMarkdownValue = `Vous modifiez une occurrence. [Accéder à la récurrence](${url})`
} else if (docData['STATUS'] === 'RECURRENCE') {
  topOfThePageMarkdownValue = 'Vous modifiez une récurrence'
}
result['topOfThePageMarkdown'] = topOfThePageMarkdownValue

return result
