console.log('Function 403', context)


// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup) loadingPopup.style.display = 'none'
}
// function to show the popup loading
const showPopupLoading = loadingMessage => {
  // function to create the popup loading element
  const createOrUpdateElement = (id, tag, style, innerHTML = '') => {
    let element = document.getElementById(id)
    if (!element) {
      element = document.createElement(tag)
      element.id = id
      document.body.appendChild(element)
    }
    element.style = style
    element.innerHTML = innerHTML
    return element
  }
  createOrUpdateElement(
    'loadingPopup',
    'div',
    `
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
            `,
    `
              <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
                <div>${loadingMessage}</div>
                <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
              </div>
            `
  )
  if (!document.getElementById('spinnerStyle')) {
    let style = document.createElement('style')
    style.id = 'spinnerStyle'
    style.innerHTML = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
    document.head.appendChild(style)
  }
}

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  /**
   * Get the viewGroup Url
   * This can be usefull in order to redirect the users
   * @returns
   */
  const viewGroupUrl = () => {
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
  window.location.href = viewGroupUrl()
}

const saveActualFormToStatus = async newStatus => {
  const formatDataAPI = data => {
    const DataCollection = (key, array) => {
      let result = {}
      let itemCount = array?.length
      array.forEach((obj, index) => {
        Object.keys(obj).forEach(key => {
          let newKey = `${key}|${index + 1}`
          result[newKey] = obj[key]
        })
      })
      result[key] = itemCount.toString()
      return result
    }

    const excludeKeys = (obj, keys) =>
      Object.keys(obj).reduce((result, key) => {
        if (!keys.includes(key)) {
          result[key] = obj[key]
        }
        return result
      }, {})
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data = { ...data, ...DataCollection(key, data[key]) }
      }
    })

    const recurrenceType = data['Dates_TypeRéc']
    let startDate = undefined
    let endDate = undefined

    switch (recurrenceType) {
      case 'Une seule fois':
        startDate = data['Dates_DateTransport']
        endDate = data['Dates_DateTransport']
        break
      case 'Par semaine':
        startDate = data['Dates_DebutRec']
        endDate = data['Dates_FinRec']
        break
      case 'Par mois':
        startDate = data['Dates_DebutRec']
        endDate = data['Dates_FinRec']
        break
      case 'Par jour spécifique':
        const allDates = data['Dates_Multidates'].split('|')
        startDate = allDates.reduce((date1, date2) =>
          new Date(date1) < new Date(date2) ? date1 : date2
        )
        endDate = allDates.reduce((date1, date2) =>
          new Date(date1) < new Date(date2) ? date2 : date1
        )
        break
    }

    if (startDate !== undefined) {
      data['DateTime_Start'] = startDate + 'T00:00:00'
    }
    if (endDate !== undefined) {
      data['DateTime_End'] = endDate + 'T23:59:59'
    }
    return JSON.stringify(excludeKeys(data, ['FORMID', 'NUMBER']))
  }
  try {
    const formLayoutId = docData['FORMLAYOUTID']
    const document = {
      data: formatDataAPI(docData),
      status: newStatus,
      active: true,
      template: { templateId: 'de3bc87f-64fd-409b-a7bb-fcd9a505650c' }
    }
    const res = await api({ local: true }).post('document', { document })
    return res
  } catch (error) {
    console.error('Erreur lors de la création du formulaire :', error)
    throw error
  }
}
const submitActualFormToStatus = async newStatus => {
  if (isValidDocument(t, docData) === undefined) {
    const response = await saveActualFormToStatus(newStatus)
    console.log('response', response)

    redirectToViewGroup()
  }
}

const main = async () => {
  showPopupLoading('Ajout du transport')
  try {
    const getNewStatus = () => {
      let result = 'SOUMIS'
      const isRecurrence = !(docData['Dates_TypeRéc'] === 'Une seule fois')
      if (isRecurrence) {
        result = 'RECURRENCE'
      }
      return result
    }
    const newStatus = getNewStatus()
    await submitActualFormToStatus(newStatus)
  } catch (error) {
    console.log('Error during function 369 :', error)
  }
  hidePopupLoading()
}

main()

