console.log('Function 369', context)

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
        return JSON.stringify(excludeKeys(data, ['FORMID', 'NUMBER']))
    }
    try {
        const formLayoutId = docData['FORMLAYOUTID']
        const document = {
            data: formatDataAPI(docData),
            status: newStatus,
            active: true,
            template: { templateId: formLayoutId }
        }
        const res = await api({ local: true }).post('document', { document })
        return res
    } catch (error) {
        console.error('Erreur lors de la création du formulaire :', error)
        throw error
    }
}

const getDocuments = async arrApiFilters => {
    const filterResponseData = await api({ local: true }).post(
        'document/id/filter',
        {
            filters: arrApiFilters
        }
    )

    if (filterResponseData.status !== 200) {
        throw new Error('Problem during document/id/filter api call')
    }

    const arrFormIds = filterResponseData.data.ids || []
    if (!arrFormIds.length) return []

    const documentResponseData = await api({ local: true }).post(`document/id`, {
        ids: arrFormIds
    })

    if (documentResponseData.status !== 200) {
        throw new Error('Problem during document/id api call')
    }

    return documentResponseData.data.documents
}

const fieldIsEmpty = fieldValue =>
    fieldValue === undefined ||
    fieldValue === null ||
    (typeof fieldValue === 'string' && fieldValue.trim() === '')

const getTransportType = data => {
    return data['TypeTransport'] || ''
}

const getDuplicateDateFilters = data => {
    const recurrenceType = String(data['Dates_TypeRéc'] || '').trim()

    if (recurrenceType === 'Une seule fois') {
        return !fieldIsEmpty(data['Dates_DateTransport'])
            ? [
                  {
                      key: 'Dates_DateTransport',
                      operator: 'EQUALS',
                      value: data['Dates_DateTransport'],
                      type: 'DATE'
                  }
              ]
            : []
    }

    if (recurrenceType === 'Par jour spécifique') {
        return !fieldIsEmpty(data['Dates_Multidates'])
            ? [
                  {
                      key: 'Dates_Multidates',
                      operator: 'EQUALS',
                      value: data['Dates_Multidates'],
                      type: 'DATE'
                  }
              ]
            : []
    }

    if (recurrenceType === 'Par semaine') {
        if (
            fieldIsEmpty(data['Dates_Lundi']) ||
            fieldIsEmpty(data['IntervalleHebdomadaire']) ||
            fieldIsEmpty(data['Dates_DebutRec']) ||
            fieldIsEmpty(data['Dates_FinRec'])
        ) {
            return []
        }

        return [
            {
                key: 'Dates_Lundi',
                operator: 'EQUALS',
                value: data['Dates_Lundi'],
                type: 'TEXT'
            },
            {
                key: 'IntervalleHebdomadaire',
                operator: 'EQUALS',
                value: data['IntervalleHebdomadaire'],
                type: 'TEXT'
            },
            {
                key: 'Dates_DebutRec',
                operator: 'EQUALS',
                value: data['Dates_DebutRec'],
                type: 'DATE'
            },
            {
                key: 'Dates_FinRec',
                operator: 'EQUALS',
                value: data['Dates_FinRec'],
                type: 'DATE'
            }
        ]
    }

    if (recurrenceType === 'Par mois') {
        if (
            fieldIsEmpty(data['Dates_Multidates']) ||
            fieldIsEmpty(data['Dates_DebutRec']) ||
            fieldIsEmpty(data['Dates_FinRec'])
        ) {
            return []
        }

        return [
            {
                key: 'Dates_Multidates',
                operator: 'EQUALS',
                value: data['Dates_Multidates'],
                type: 'DATE'
            },
            {
                key: 'Dates_DebutRec',
                operator: 'EQUALS',
                value: data['Dates_DebutRec'],
                type: 'DATE'
            },
            {
                key: 'Dates_FinRec',
                operator: 'EQUALS',
                value: data['Dates_FinRec'],
                type: 'DATE'
            }
        ]
    }

    return []
}

const shouldRunDuplicateCheck = () => {
    const status = (docData['STATUS'] || '').toString().trim().toLowerCase()
    const isDraft = status === 'draft'

    const client = docData['Contrainte|2|NomClient']
    const typeTransport = getTransportType(docData)
    const hasDateFilter = getDuplicateDateFilters(docData).length > 0

    const hasAllLCu =
        !fieldIsEmpty(client) &&
        hasDateFilter &&
        !fieldIsEmpty(typeTransport)

    return isDraft && hasAllLCu
}

const buildTransportUrl = (formId, formLayoutId) => {
    const origin = window.location.origin
    if (formId && formLayoutId) {
        return `${origin}/missions/${formId}/${formLayoutId}`
    }
    return `${origin}/missions/${formId}`
}

const getTransportDuplicates = async () => {
    const apiFilters = [
        {
            key: 'FORMLAYOUTNAME',
            operator: 'EQUALS',
            value: 'Transport',
            type: 'TEXT'
        },
        {
            key: 'STATUS',
            operator: 'NOTIN',
            value: 'SUPPRIMÉ|SUPPRIMÉE|ANNULÉ|ANNULÉE',
            type: 'TEXT'
        },
        {
            key: 'Contrainte|2|NomClient',
            operator: 'EQUALS',
            value: docData['Contrainte|2|NomClient'],
            type: 'TEXT'
        }
    ]

    if (docData['FORMID']) {
        apiFilters.push({
            key: 'FORMID',
            operator: 'NOTEQUALS',
            value: docData['FORMID'],
            type: 'TEXT'
        })
    }

    apiFilters.push(...getDuplicateDateFilters(docData))

    const candidateDocuments = await getDocuments(apiFilters)
    const targetTypeTransport = getTransportType(docData)

    const normalizeStatus = value =>
        String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()

    const filtered = candidateDocuments.filter(document => {
        const parsed = JSON.parse(document.data)
        const candidateType = getTransportType(parsed)
        const statusValue =
            document.status || parsed.STATUS || document.metaData?.STATUS || ''
        const normalizedStatus = normalizeStatus(statusValue)
        const isCancelled = normalizedStatus.includes('annul')

        return candidateType === targetTypeTransport && !isCancelled
    })

    const uniqueLinks = new Map()
    for (const document of filtered) {
        const parsed = JSON.parse(document.data)
        const isOccurrence = parsed['Dates_TypeRéc'] === 'Occurrence'
        const sourceFormId =
            isOccurrence && parsed['FormIDRecurrence']
                ? parsed['FormIDRecurrence']
                : document.metaData?.['FORMID']

        if (!sourceFormId || uniqueLinks.has(sourceFormId)) continue

        uniqueLinks.set(sourceFormId, {
            formId: sourceFormId,
            url: buildTransportUrl(
                sourceFormId,
                document.metaData?.['FORMLAYOUTID']
            ),
            isRecurrenceLink: isOccurrence && Boolean(parsed['FormIDRecurrence']),
            number: document.metaData?.['NUMBER'] || '',
            client: parsed['Contrainte|2|NomClient'] || '',
            date:
                parsed['Dates_DateTransport'] ||
                parsed['Dates_Multidates'] ||
                parsed['Dates_DebutRec'] ||
                '',
            typeTransport: getTransportType(parsed)
        })
    }

    return Array.from(uniqueLinks.values())
}

const getDuplicatePopupMessage = () => {
    const recurrenceType = String(docData['Dates_TypeRéc'] || '').trim()

    if (
        recurrenceType === 'Une seule fois' ||
        recurrenceType === 'Par jour spécifique'
    ) {
        return 'Un ou plusieurs transports similaires ont été demandés pour ce client à la même date.'
    }

    if (recurrenceType === 'Par semaine') {
        return 'Un ou plusieurs transports similaires ont été demandés pour ce client avec la même récurrence hebdomadaire (jours, intervalle et période).'
    }

    if (recurrenceType === 'Par mois') {
        return 'Un ou plusieurs transports similaires ont été demandés pour ce client avec la même récurrence mensuelle (date et période).'
    }

    return 'Un ou plusieurs transports similaires ont été demandés pour ce client avec les mêmes critères de récurrence.'
}

const showDuplicatesPopup = duplicates => {
    return new Promise(resolve => {
        const overlay = document.createElement('div')
        overlay.style.position = 'fixed'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.width = '100%'
        overlay.style.height = '100%'
        overlay.style.backgroundColor = 'rgba(0,0,0,0.4)'
        overlay.style.display = 'flex'
        overlay.style.alignItems = 'center'
        overlay.style.justifyContent = 'center'
        overlay.style.zIndex = '10000'

        const popup = document.createElement('div')
        popup.style.backgroundColor = 'white'
        popup.style.padding = '24px'
        popup.style.borderRadius = '10px'
        popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)'
        popup.style.width = '520px'
        popup.style.maxWidth = '90%'
        popup.style.maxHeight = '80vh'
        popup.style.overflowY = 'auto'
        popup.style.fontFamily = 'Arial, sans-serif'

        const listItems = duplicates
            .map((item, index) => {
                const suffix = item.isRecurrenceLink ? ' (lien de récurrence)' : ''
                const numberLabel = item.number ? `#${item.number}` : 'sans numéro'
                return `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:#1976d2;text-decoration:underline;font-weight:600;">Transport ${numberLabel}${suffix}</a><br><span style="font-size:12px;color:#5f6b7a;">Client: ${item.client || '-'} | Date: ${item.date || '-'} | Type: ${item.typeTransport || '-'}</span></li>`
            })
            .join('')

        popup.innerHTML = `
      <div style="font-size:18px;font-weight:bold;color:#d35400;margin-bottom:12px;">
        Attention
      </div>
      <div style="font-size:14px;line-height:1.5;margin-bottom:12px;">
        ${getDuplicatePopupMessage()}
      </div>
      <div style="font-size:14px;line-height:1.5;margin-bottom:8px;font-weight:bold;">
        Liste des transports similaires :
      </div>
      <ul style="margin-top:0;margin-bottom:20px;padding-left:20px;">${listItems}</ul>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="duplicateCancelBtn" style="padding:8px 14px;background:#f1f2f6;color:#1e272e;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Annuler</button>
        <button id="duplicateProceedBtn" style="padding:8px 14px;background:#2e86de;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Continuer</button>
      </div>
    `

        overlay.appendChild(popup)
        document.body.appendChild(overlay)

        const closeWith = value => {
            overlay.remove()
            resolve(value)
        }

        popup
            .querySelector('#duplicateCancelBtn')
            .addEventListener('click', () => closeWith(false))
        popup
            .querySelector('#duplicateProceedBtn')
            .addEventListener('click', () => closeWith(true))
    })
}

const checkDuplicateBeforeSubmit = async () => {
    if (!shouldRunDuplicateCheck()) return true

    const duplicates = await getTransportDuplicates()
    if (!duplicates.length) return true

    return await showDuplicatesPopup(duplicates)
}

const submitActualFormToStatus = async newStatus => {
    if (isValidDocument(t, docData) === undefined) {
        const response = await saveActualFormToStatus(newStatus)
        console.log('response', response)

        redirectToViewGroup()
    }
}

const main = async () => {
    try {
        const canSubmit = await checkDuplicateBeforeSubmit()
        if (!canSubmit) return

        showPopupLoading('Ajout du transport')
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