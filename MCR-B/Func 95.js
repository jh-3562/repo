console.log('Function 95', context)

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

if (docData.IdentifiantFormulaireRécurrence) {
  const url = viewGroupUrl() + '/' + docData.IdentifiantFormulaireRécurrence
  return {
    MarkdownRécurrenceDispo: `Vous modifiez une occurrence. [Modifier la récurrence](${url})`
  }
}

if (
  docData.Planification_Récurrence &&
  docData.Planification_Récurrence != 'Une seule fois'
) {
  return {
    MarkdownRécurrenceDispo: `Vous modifiez une suite de formulaires`
  }
}
