console.log('Function 359', context)

const TRANSPORTFORMLAYOUTID = '6d75ae79-ced2-4a83-a41e-da016f27e530'
const TRANSPORTGROUPEFORMLAYOUTID = 'de3bc87f-64fd-409b-a7bb-fcd9a505650c'

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup) loadingPopup.style.display = 'none'
}

const showPopupLoading = loadingMessage => {
  let loadingPopup = document.getElementById('loadingPopup')
  if (!loadingPopup) {
    loadingPopup = document.createElement('div')
    loadingPopup.id = 'loadingPopup'
    document.body.appendChild(loadingPopup)
  }

  loadingPopup.style = `
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `
  loadingPopup.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
      <div>${loadingMessage}</div>
      <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
    </div>
  `

  if (!document.getElementById('spinnerStyle')) {
    const spinnerStyle = document.createElement('style')
    spinnerStyle.id = 'spinnerStyle'
    spinnerStyle.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(spinnerStyle)
  }
}

//======================= Helper Functions ===============================

/**
 * This function takes french week days as a parameter and returns their indices
 * @param {string} multiselectFieldValue
 * @returns {array}
 */
const getFrenchWeekDayIndices = multiselectFieldValue => {
  result = []
  frenchDays = multiselectFieldValue.split('|')
  const frenchDayIndexMapping = {
    Dimanche: 0,
    Lundi: 1,
    Mardi: 2,
    Mercredi: 3,
    Jeudi: 4,
    Vendredi: 5,
    Samedi: 6
  }
  for (const frenchDay of frenchDays) {
    if (frenchDay in frenchDayIndexMapping) {
      result.push(frenchDayIndexMapping[frenchDay])
    } else {
      console.error('${frenchDay} is unknown from frenchDayIndexMapping')
    }
  }
  return result
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

  const arrFormIds = filterResponseData.data.ids

  const documents = await getDocumentsByIds(arrFormIds)

  return documents
}

/**
 * Returns the minimum of the 2 strings that are in input.
 * @param {string} str_1
 * @param {string} str_2
 * @returns {string}
 */
const minString = (str_1, str_2) => {
  let result = str_1
  if (str_2 <= str_1) {
    result = str_2
  }
  return result
}

/**
 * Returns the maximum of the 2 strings that are in input.
 * @param {string} str_1
 * @param {string} str_2
 * @returns {string}
 */
const maxString = (str_1, str_2) => {
  let result
  result = str_1
  if (str_1 <= str_2) {
    result = str_2
  }
  return result
}

//======================= Interpretation Functions =======================

/**
 * This function check if a form is a row or a document in order to treat it correctly
 * Example 1: The formID is kept with the key 'key' in a row but in a document
 * it is the key 'documentID'
 * Example 2: document data is exhaustive but row data only contains the data of the grid.
 * @param {object} form
 * @returns {string}
 */
const isDocumentOrRow = form => {
  let result = undefined
  if ('rowID' in form) {
    result = 'row'
  } else if ('documentID' in form) {
    result = 'document'
  }
  return result
}

const getDocumentsByIds = async formIds => {
  const documentResponseData = await api({ local: true }).post(`document/id`, {
    ids: formIds
  })

  if (documentResponseData.status !== 200) {
    throw new Error('Problem during document/id api call')
  }

  return documentResponseData.data.documents
}

const getFormData = form => {
  const documentOrRow = isDocumentOrRow(form)
  let result
  if (documentOrRow === 'document') {
    result = JSON.parse(form.data)
  } else {
    result = form.data
  }
  return result
}

const getFormID = form => {
  let formID
  switch (isDocumentOrRow(form)) {
    case 'row':
      formID = form.key
      break
    case 'document':
      formID = form.documentID
      break
    default:
      console.error(
        'The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed',
        formatedForm
      )
  }
  return formID
}

/**
 * Check if the fieldValue obtained thanks to data[fieldKey]
 * represent an empty field.
 * @param {string} fieldValue
 * @returns {bool}
 */
const fieldIsEmpty = fieldValue => {
  return [undefined, ''].includes(fieldValue)
}

class Interpretation {
  static transitionStatus = 'Draft' // The status you want to use if an error occurs during the process (usefull until active = false works with API Calls)
  static instances = []
  constructor (config) {
    this.config = config
    Interpretation.instances.push(this)
  }
  /**
   * This functions interpret many source forms at one time.
   * The interpretationLimits are here to handle the case where the interpretation can be infinite
   * Example : A recurrence that never ends
   * @param {object} sourceForms
   * @param {any} interpretationLimits
   * @returns
   */
  interpretForms = (sourceForms, interpretationLimits = undefined) => {
    if (
      this.config.needsInterpretationLimits &&
      interpretationLimits === undefined
    ) {
      throw new Error('Interpretation limits needs to be defined')
    }
    const result = []
    for (const sourceForm of sourceForms) {
      const interpretedForms = this.config.interpretOneForm(
        sourceForm,
        interpretationLimits
      )
      for (const interpretedForm of interpretedForms) {
        interpretedForm.interpretation = this.config.id
        interpretedForm.sourceForm = sourceForm
        result.push(interpretedForm)
      }
    }

    return result
  }
  /**
   * This function is useful when you need to create forms that have been interpreted.
   * Example : You need to access a form, you want to modify a value or need its formID.
   * This functions will give a key to each created forms and keep these keys in the source form
   * in order to know which form has been already created for futur interpretations.
   * @param {object[]} formsToCreate
   * @returns
   */
  static createForms = async formsToCreate => {
    const getUpToDateSourceDocuments = async interpretedForms => {
      const sourceFormsIdToGet = []
      const sourceFormsIdToGetToInterpretedForms = []
      const addNewSourceFormIdToGet = (sourceFormId, interpretedForms) => {
        const sourceFormIdIndex = sourceFormsIdToGet.findIndex(
          formId => formId === sourceFormId
        )
        if (sourceFormIdIndex === -1) {
          sourceFormsIdToGet.push(sourceFormId)
          sourceFormsIdToGetToInterpretedForms.push([...interpretedForms])
        } else {
          sourceFormsIdToGetToInterpretedForms[sourceFormIdIndex].push(
            ...interpretedForms
          )
        }
      }
      const sourceFormsToCreate = {}
      const sourceFormsToCreateToInterpretedForms = {}
      const addNewSourceFormToCreate = (sourceForm, interpretedForm) => {
        const interpretationUsed = sourceForm.interpretation
        if (!(interpretationUsed in sourceFormsToCreate)) {
          sourceFormsToCreate[interpretationUsed] = []
          sourceFormsToCreateToInterpretedForms[interpretationUsed] = []
        }
        // Verify that the sourceForm is not already listed
        const sourceFormIndex = sourceFormsToCreate[
          interpretationUsed
        ].findIndex(
          listedSourceForm =>
            JSON.stringify(listedSourceForm) === JSON.stringify(sourceForm)
        )
        if (sourceFormIndex === -1) {
          sourceFormsToCreate[interpretationUsed].push(sourceForm)
          sourceFormsToCreateToInterpretedForms[interpretationUsed].push([
            interpretedForm
          ])
        } else {
          sourceFormsToCreateToInterpretedForms[interpretationUsed][
            sourceFormIndex
          ].push(interpretedForm)
        }
      }

      // Sort source forms that needs to be created from them who are already created
      for (const interpretedForm of interpretedForms) {
        const sourceForm = interpretedForm.sourceForm
        if ('sourceForm' in sourceForm) {
          // If the form do not exist from what we know of this code
          addNewSourceFormToCreate(sourceForm, interpretedForm)
        } else {
          addNewSourceFormIdToGet(getFormID(sourceForm), [interpretedForm])
        }
      }

      // Create the source forms that are not created yet
      // TODO : Make sure this loop is useful, createForms may be specific to the class and not the instance
      for (const interpretationInstanceId of Object.keys(sourceFormsToCreate)) {
        // Create source forms that needs to be created
        const createdSourceFormsIds = await Interpretation.createForms(
          sourceFormsToCreate[interpretationInstanceId]
        )
        // add the new source form id
        for (const [
          index,
          createdSourceFormId
        ] of createdSourceFormsIds.entries()) {
          addNewSourceFormIdToGet(
            createdSourceFormId,
            sourceFormsToCreateToInterpretedForms[interpretationInstanceId][
              index
            ]
          )
        }
        sourceFormsIdToGet.push(...createdSourceFormsIds)
      }
      // Get up to date forms
      const upToDateSourceDocuments = await getDocumentsByIds(
        sourceFormsIdToGet
      )

      const result = []
      // Format the result
      // TODO, use this format from the begining of this function in order to clean up the code
      for (const upToDateSourceDocument of upToDateSourceDocuments) {
        const sourceDocumentIndex = sourceFormsIdToGet.findIndex(
          sourceDocumentId =>
            sourceDocumentId === getFormID(upToDateSourceDocument)
        )
        const resultItem = {
          upToDateSourceDocument: upToDateSourceDocument,
          interpretedFormsToInterpretAgain:
            sourceFormsIdToGetToInterpretedForms[sourceDocumentIndex]
        }
        result.push(resultItem)
      }

      return result
    }
    const getUpToDateInterpretedDocuments = step2Results => {
      const interpretFormsAgain = (newSourceForm, interpretedForms) => {
        const result = []
        // Sort interpreted forms per interpretations
        const interpretedFormsByInterpretation = {}
        for (const interpretedForm of interpretedForms) {
          const interpretationId = interpretedForm.interpretation
          if (!(interpretationId in interpretedFormsByInterpretation)) {
            interpretedFormsByInterpretation[interpretationId] = []
          }
          interpretedFormsByInterpretation[interpretationId].push(
            interpretedForm
          )
        }
        // Interpret again
        for (const interpretationId of Object.keys(
          interpretedFormsByInterpretation
        )) {
          const interpretedFormsToInterpretAgain =
            interpretedFormsByInterpretation[interpretationId]
          const interpretationInstance =
            Interpretation.getInstance(interpretationId)

          // List the interpretedForms Keys in order to know which interpreted forms to keep
          const interpretedFormsKeysToKeep = []
          for (const interpretedFormToInterpretAgain of interpretedFormsToInterpretAgain) {
            const interpretedData = getFormData(interpretedFormToInterpretAgain)
            const interpretedFormKey =
              interpretedData[
                interpretationInstance.config.interpretedFormKeyFieldKey
              ]
            interpretedFormsKeysToKeep.push(interpretedFormKey)
          }

          // Interpret the source form
          let AllUpToDateInterpretedForms
          if (interpretationInstance.config.needsInterpretationLimits) {
            const interpretedFormKeys = interpretedFormsToInterpretAgain.map(
              form => {
                const formData = getFormData(form)
                return formData[
                  interpretationInstance.config.interpretedFormKeyFieldKey
                ]
              }
            )
            const interpretationLimits =
              interpretationInstance.config.getInterpretationLimits(
                interpretedFormKeys
              )
            AllUpToDateInterpretedForms = interpretationInstance.interpretForms(
              [newSourceForm],
              interpretationLimits
            )
          } else {
            AllUpToDateInterpretedForms = interpretationInstance.interpretForms(
              [newSourceForm]
            )
          }
          // Keep the good interpreted forms
          for (const upToDateInterpretedForm of AllUpToDateInterpretedForms) {
            const interpretedData = getFormData(upToDateInterpretedForm)
            const interpretedFormKey =
              interpretedData[
                interpretationInstance.config.interpretedFormKeyFieldKey
              ]
            if (interpretedFormsKeysToKeep.includes(interpretedFormKey)) {
              result.push(upToDateInterpretedForm)
            }
          }
        }
        return result
      }

      const result = []
      for (const step2Result of step2Results) {
        const sourceDocument = step2Result.upToDateSourceDocument
        const sourceDocumentInterpretedForms =
          step2Result.interpretedFormsToInterpretAgain
        const upToDateInterpretedForms = interpretFormsAgain(
          sourceDocument,
          sourceDocumentInterpretedForms
        )
        result.push(...upToDateInterpretedForms)
      }
      return result
    }
    const createInterpretedDocumentsWithExistingSourceDocuments =
      async interpretedDocumentsToCreate => {
        const createInactiveInterpretedDocuments =
          async interpretedDocuments => {
            const documentsToCreateWithAPI = []
            for (const interpretedDocument of interpretedDocuments) {
              documentsToCreateWithAPI.push({
                data: interpretedDocument.data,
                status: Interpretation.transitionStatus,
                active: false,
                template: interpretedDocument.template
              })
            }
            return await api({ local: true }).post('document/Many', {
              documents: documentsToCreateWithAPI
            })
          }
        const activateCreatedFormsAndUpdateSourceForms =
          async documentCreationAPIAnswer => {
            const documentsToUpdate = []
            for (const [
              index,
              ApiResponseCreatedDocument
            ] of documentCreationAPIAnswer.data.docs.entries()) {
              const interpretedDocument = interpretedDocumentsToCreate[index]

              // Get the sourceDocumentToUpdate
              const sourceDocumentToUpdateId =
                interpretedDocument.sourceForm.documentID
              let sourceDocumentToUpdate = documentsToUpdate.find(
                doc => doc.documentID === sourceDocumentToUpdateId
              )
              if (sourceDocumentToUpdate === undefined) {
                const sourceDocumentData = getFormData(
                  interpretedDocument.sourceForm
                )
                sourceDocumentToUpdate = {
                  data: JSON.stringify(sourceDocumentData),
                  status: interpretedDocument.sourceForm.status,
                  active: true,
                  template: interpretedDocument.sourceForm.template,
                  documentID: interpretedDocument.sourceForm.documentID
                }
                documentsToUpdate.push(sourceDocumentToUpdate)
              }

              // Update the sourceDocument data
              const interpretationId = interpretedDocument.interpretation
              const interpretationInstance =
                Interpretation.getInstance(interpretationId)

              interpretationInstance.updateSourceDocumentData(
                sourceDocumentToUpdate,
                interpretedDocument
              )

              // Add the interpreted document to the documents to update in order to activate it
              const createdInterpretedDocument =
                interpretedDocumentsToCreate[index]

              const createdInterpretedDocumentToUpdate = {
                status: createdInterpretedDocument.status,
                active: true,
                template: createdInterpretedDocument.template,
                documentID: ApiResponseCreatedDocument.docID
              }
              documentsToUpdate.push(createdInterpretedDocumentToUpdate)
            }
            const updateResponse = await api({ local: true })
              .put('document/Many', {
                documents: documentsToUpdate
              })
              .catch(error =>
                console.error(
                  'An error has occured during updating the forms :',
                  error
                )
              )
            return updateResponse
          }
        const result = []
        if (interpretedDocumentsToCreate.length > 0) {
          // Step 1 : Create the interpreted forms to inactive
          const documentCreationAPIAnswer =
            await createInactiveInterpretedDocuments(
              interpretedDocumentsToCreate
            )
          // Step 2 : Activate the newly created forms and update the source forms at the same time
          await activateCreatedFormsAndUpdateSourceForms(
            documentCreationAPIAnswer
          )
          result.push(
            ...documentCreationAPIAnswer.data.docs.map(doc => doc.docID)
          )
        }
        return result
      }
    // Step 1 : Sort already created forms from the other ones to create
    const interpretedForms = []
    const alreadyCreatedForms = []
    for (const form of formsToCreate) {
      if ('sourceForm' in form) {
        interpretedForms.push(form)
      } else {
        alreadyCreatedForms.push(form)
      }
    }
    // Step 2 : Make sure all the source forms exists or create them
    const sourceDocumentsWithInterpretedForms =
      await getUpToDateSourceDocuments(interpretedForms)
    // Step 3 : Interpret a new time the sourceForm and get the up to date interpretedForm
    // If the interpretedForm was already created, it is not interpreted and thus not created.
    // TODO : CreateForms should also return the id of the already created document in case it is the source form we want to get.
    const upToDateInterpretedDocuments = getUpToDateInterpretedDocuments(
      sourceDocumentsWithInterpretedForms
    )
    // Step 4 : Create the interpretedForms that do not exist
    const createdFormsIds =
      await createInterpretedDocumentsWithExistingSourceDocuments(
        upToDateInterpretedDocuments
      )
    // Step 5 : Returns the new forms ids
    createdFormsIds.push(...alreadyCreatedForms.map(form => getFormID(form)))
    return createdFormsIds
  }
  /**
   * This function helps you get an interpretation instance thanks to its id.
   * @param {string} id
   * @returns
   */
  static getInstance (id) {
    return Interpretation.instances.find(instance => instance.config.id === id)
  }
  /**
   * This function update the source document data following the creation of one of its interpretation
   * The source document can then be sent to FasterWeb with the API for update
   * @param {object} sourceDocument
   * @param {object} interpretedDocument
   */
  updateSourceDocumentData = (sourceDocument, interpretedDocument) => {
    const sourceDocumentData = getFormData(sourceDocument)
    const interpretedDocumentData = getFormData(interpretedDocument)
    const interpretedDocumentInterpretationKey =
      interpretedDocumentData[this.config.interpretedFormKeyFieldKey]
    let generatedFormsKeys = []
    if (
      !fieldIsEmpty(sourceDocumentData[this.config.generatedFormsKeyFieldKey])
    ) {
      const strGeneratedFormsKeys =
        sourceDocumentData[this.config.generatedFormsKeyFieldKey]
      generatedFormsKeys.push(...strGeneratedFormsKeys.split('|'))
    }
    generatedFormsKeys.push(interpretedDocumentInterpretationKey)
    sourceDocumentData[this.config.generatedFormsKeyFieldKey] =
      generatedFormsKeys.join('|')
    sourceDocument.data = JSON.stringify(sourceDocumentData)
  }
}

// TODO : Make needExistingSourceFormToInterpret useful

// ================================ Interpretation configuration ===================================

const returnTripConfig = {
  id: 'returnTrip',
  generatedFormsKeyFieldKey: 'returnTripGenerated',
  interpretedFormKeyFieldKey: 'returnTripKey',
  sourceFormId: 'returnTripSourceFormID',
  needExistingSourceFormToInterpret: true,
  canExist: true,
  /**
   * This function returns how the document data should be interpreted.
   * @param {Object} recurrenceData
   * @param {string} occurrenceStringDate
   * @param {string} sourceFormId
   * @returns
   */
  interpretOneForm (sourceForm, interpretationLimits = undefined) {
    const needsInterpretation = sourceForm => {
      const sourceFormData = getFormData(sourceForm)
      const isRoundTrip =
        sourceFormData['TypeTransport'] === 'ALLER/RETOUR' ||
        sourceFormData['CollectionClientsTA|4|TypeTransportTA'] ===
          'ALLER/RETOUR'

      const isRecurrenceSourceForm = !['Une seule fois', 'Occurrence'].includes(
        sourceFormData['Dates_TypeRéc']
      )
      const returnTripAlreadyGenerated =
        sourceFormData['returnTripGenerated'] === 'true'
      sourceForm.data = JSON.stringify(sourceFormData)
      return (
        isRoundTrip && !isRecurrenceSourceForm && !returnTripAlreadyGenerated
      )
    }
    const sourceFormID = getFormID(sourceForm)
    let sourceFormData = getFormData(sourceForm)

    const result = []

    if (needsInterpretation(sourceForm)) {
      const returnTripForm = structuredClone(sourceForm)
      const returnTripData = structuredClone(sourceFormData)
      const transportationType = 'ALLER/RETOUR (RETOUR)'

      returnTripData['returnTripSourceFormID'] = sourceFormID
      returnTripData[this.interpretedFormKeyFieldKey] = 'true'

      if (returnTripData['FORMLAYOUTID'] === TRANSPORTFORMLAYOUTID) {
        returnTripData['TypeTransport'] = transportationType
        returnTripData['EtablissementDest_HeureRDV'] =
          sourceFormData['DétailTransport_HeureRetour']
        returnTripData['Etablissement_NomLieu'] =
          sourceFormData['EtablissementDest_NomLieu']
        returnTripData['EtablissementDest_NomLieu'] =
          sourceFormData['Etablissement_NomLieu']
        returnTripData['Etablissement_Adresse'] =
          sourceFormData['EtablissementDest_Adresse']
        returnTripData['EtablissementDest_Adresse'] =
          sourceFormData['Etablissement_Adresse']
        returnTripData['TypeLieuDépart'] = sourceFormData['TypeLieuDestination']
        returnTripData['TypeLieuDestination'] = sourceFormData['TypeLieuDépart']
      } else if (
        returnTripData['FORMLAYOUTID'] === TRANSPORTGROUPEFORMLAYOUTID
      ) {
        returnTripData['CollectionClientsTA|4|TypeTransportTA'] =
          transportationType
        returnTripData['Visiteurs_adresse'] = sourceFormData['Stop_Destination']
        returnTripData['Stop_Destination'] = sourceFormData['Visiteurs_adresse']
        delete returnTripData['Stop_Heure']

        // Remove intermediate addresses for group transport return trips
        Object.keys(returnTripData).forEach(key => {
          if (key.includes('StopoverLocations')) {
            delete returnTripData[key]
          }
        })
      }

      console.log('data from retour', returnTripData)
      Object.assign(returnTripForm, {
        data: JSON.stringify(returnTripData)
      })
      result.push(returnTripForm)
    }
    return result
  }
}

const recurrenceConfig = {
  id: 'recurrence', // Useful to identify with which interpretation a form has been interpreted.
  generatedFormsKeyFieldKey: 'recurrenceExceptionDays', // Source form field that contains the created occurrence ID
  interpretedFormKeyFieldKey: 'occurrenceKey', // Occurrence form field that contains the occurrence ID = the original date of the occurrence
  sourceFormIdFieldKey: 'FormIDRecurrence', // Occurrence form field that contains the source form ID
  needExistingSourceFormToInterpret: true,
  canExist: true,
  needsInterpretationLimits: true,
  getInterpretationLimits (interpretedFormKeys) {
    if (interpretedFormKeys.length === 0) {
      throw new Error(
        'InterpretedFormKeys is an empty list during interpretation limit'
      )
    }
    let dateWindow = [interpretedFormKeys[0], interpretedFormKeys[0]]
    for (const interpretedFormKey of interpretedFormKeys) {
      if (minString(interpretedFormKey, dateWindow[0]) === interpretedFormKey) {
        dateWindow[0] = interpretedFormKey
      }
      if (maxString(interpretedFormKey, dateWindow[1]) === interpretedFormKey) {
        dateWindow[1] = interpretedFormKey
      }
    }
    return dateWindow
  },
  interpretOneForm (sourceForm, interpretationLimit) {
    const dateWindow = interpretationLimit
    const isInPauseRange = (dateStr, pauseRange) => {
      if (fieldIsEmpty(pauseRange)) return false

      const [, start, end] = pauseRange.match(
        /(\d{4}-\d{2}-\d{2})\s*\|\s*(\d{4}-\d{2}-\d{2})/
      )

      return start <= dateStr && dateStr <= end
    }

    const getOccurrenceDates = (data, dateWindow) => {
      const result = []
      switch (data['Dates_TypeRéc']) {
        case 'Une seule fois':
          // Nothing to interpret, the sourceForm doesn't need to be interpreted
          break
        case 'Occurrence':
          // Nothing to interpret, the sourceForm doesn't need to be interpreted
          break
        case 'Par jour spécifique':
          const specificOccurrenceDates = data.Dates_Multidates.split('|')
          const validOccurrencesDates = specificOccurrenceDates.filter(
            date => dateWindow[0] <= date && date <= dateWindow[1]
          )
          result.push(...validOccurrencesDates)
          break
        case 'Par semaine': {
          const recurrenceStartDate = fieldIsEmpty(data['Dates_DebutRec'])
            ? '0001-01-01'
            : data['Dates_DebutRec']
          const recurrenceEndDate = fieldIsEmpty(data['Dates_FinRec'])
            ? '9999-01-01'
            : data['Dates_FinRec']

          const intervalType = data['IntervalleHebdomadaire'] || 'Chaque semaine'

          const occurrencesToGenerateDateWindow = [
            new Date(maxString(recurrenceStartDate, dateWindow[0])),
            new Date(minString(recurrenceEndDate, dateWindow[1]))
          ]
          const recurrenceStart = new Date(recurrenceStartDate)
          const validWeekDays = getFrenchWeekDayIndices(data['Dates_Lundi'])
          let currentDate = new Date(occurrencesToGenerateDateWindow[0])

          while (currentDate <= occurrencesToGenerateDateWindow[1]) {
            const dayMatches = validWeekDays.includes(currentDate.getUTCDay())

            if (dayMatches) {
              let shouldGenerate = true
              if (intervalType === 'Chaque 2 semaine') {
                const diffTime = currentDate - recurrenceStart
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                const weekIndex = Math.floor(diffDays / 7)
                shouldGenerate = weekIndex % 2 === 0
              }
              if (shouldGenerate) {
                const isoDate = currentDate.toISOString().split('T')[0]

                if (!isInPauseRange(isoDate, data['Dates_RecPauseRange'])) {
                  result.push(isoDate)
                }
              }
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1)
          }
          break
        }
        case 'Par mois': {
          const recurrenceStartDate = fieldIsEmpty(data['Dates_DebutRec'])
            ? '0001-01-01'
            : data['Dates_DebutRec']

          const recurrenceEndDate = fieldIsEmpty(data['Dates_FinRec'])
            ? '9999-01-01'
            : data['Dates_FinRec']

          const typeMensuel = data['TypeMensuel'] || 'Jour relatif'
          const intervalType = data['IntervalleMensuel'] || 'Premier'

          const startDate = new Date(maxString(recurrenceStartDate, dateWindow[0]))
          const endDate = new Date(minString(recurrenceEndDate, dateWindow[1]))

          let currentDate = new Date(startDate)
          currentDate.setUTCDate(1)

          const occurrenceIndexMap = {
            'Premier': 0,
            'Deuxième': 1,
            'Troisième': 2,
            'Quatrième': 3,
            'Dernier': -1
          }

          while (currentDate <= endDate) {
            const month = currentDate.getUTCMonth()
            const year = currentDate.getUTCFullYear()
            
            // JOUR RELATIF
            if (typeMensuel === 'Jour relatif') {
              const validWeekDays = getFrenchWeekDayIndices(data['Dates_Lundi'])
              const daysInMonth = []

              let dayCursor = new Date(Date.UTC(year, month, 1))

              while (dayCursor.getUTCMonth() === month) {
                if (validWeekDays.includes(dayCursor.getUTCDay())) {
                  daysInMonth.push(new Date(dayCursor))
                }
                dayCursor.setUTCDate(dayCursor.getUTCDate() + 1)
              }

              const occurrenceIndex = occurrenceIndexMap[intervalType]

              if (occurrenceIndex !== undefined && daysInMonth.length > 0) {
                validWeekDays.forEach(weekday => {
                  const matchingDays = daysInMonth.filter(
                    d => d.getUTCDay() === weekday
                  )

                  if (matchingDays.length === 0) return

                  let selectedDay = null

                  if (occurrenceIndex === -1) {
                    selectedDay = matchingDays[matchingDays.length - 1]
                  } else {
                    selectedDay = matchingDays[occurrenceIndex]
                  }

                  if (selectedDay) {
                    const isoDate = selectedDay.toISOString().split('T')[0]

                    if (dateWindow[0] <= isoDate &&
                        isoDate <= dateWindow[1] &&
                        !isInPauseRange(isoDate, data['Dates_RecPauseRange'])) {
                      result.push(isoDate)
                    }
                  }
                })
              }
            }
            // JOUR FIXE
            else if (typeMensuel === 'Jour fixe') {
              if (!fieldIsEmpty(data['Dates_Multidates'])) {
                const daysOfMonth = [...new Set(
                  data['Dates_Multidates']
                    .split('|')
                    .map(d => {
                      const parts = d.split('-')
                      return parseInt(parts[2], 10)
                    })
                    .filter(d => !isNaN(d) && d >= 1 && d <= 31)
                )]
                daysOfMonth.forEach(day => {
                  const date = new Date(Date.UTC(year, month, day))
                  // éviter les dates invalides (ex: 31 février)
                  if (date.getUTCMonth() !== month) return
                  const isoDate = date.toISOString().split('T')[0]
                  if (
                    recurrenceStartDate <= isoDate &&
                    isoDate <= recurrenceEndDate &&
                    dateWindow[0] <= isoDate &&
                    isoDate <= dateWindow[1] &&
                    !isInPauseRange(isoDate, data['Dates_RecPauseRange'])
                  ) {
                    result.push(isoDate)
                  }
                })
              }
            }
            // Mois suivant
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
            currentDate.setUTCDate(1)
          }
          break
        }
        default:
          console.error(
            data['Dates_TypeRéc'],
            'is not known as a recurrence rule'
          )
      }
      return result
    }
    /**
     * Returns a list with the occurrence documents
     * @param {object} sourceForm - The document that needs to be interpreted
     * @param {array} stringDates - The dates on which we want to create an occurrence
     * @returns {array}
     */
    const formatOccurrenceForms = (sourceForm, stringDates) => {
      const formatOccurrenceForm = (sourceForm, stringDate) => {
        const formatOccurrenceData = (
          recurrenceData,
          occurrenceStringDate,
          sourceFormId
        ) => {
          const heureDebut = recurrenceData['DateTime_Start']
            .split('T')[1]
            .slice(0, 5)
          const heureFin = recurrenceData['DateTime_End']
            .split('T')[1]
            .slice(0, 5)

          const dateAvecHeureDebut =
            occurrenceStringDate + 'T' + heureDebut + ':00'
          const dateAvecHeureFin = occurrenceStringDate + 'T' + heureFin + ':00'
          return {
            ...recurrenceData,
            [this.sourceFormIdFieldKey]: sourceFormId,
            [this.interpretedFormKeyFieldKey]: stringDate,
            Dates_TypeRéc: 'Occurrence',
            Dates_DateTransport: occurrenceStringDate,
            DateTime_Start: dateAvecHeureDebut, // For display on timeline/agenda
            DateTime_End: dateAvecHeureFin // For display on timeline/agenda
          }
        }
        const sourceData =
          typeof sourceForm.data === 'string'
            ? JSON.parse(sourceForm.data)
            : sourceForm.data
        const chauffeur = sourceData['Contrainte|1|Chauffeur']
        const status =
          chauffeur && chauffeur.trim() !== '' ? 'PLANIFIÉ' : 'SOUMIS'
        const result = structuredClone(sourceForm)
        Object.assign(result, {
          data: JSON.stringify(
            formatOccurrenceData(sourceData, stringDate, getFormID(sourceForm))
          ),
          occurrenceDate: stringDate,
          status: status
        })
        return result
      }
      const data =
        typeof sourceForm.data === 'string'
          ? JSON.parse(sourceForm.data)
          : sourceForm.data
      const result = []
      const exceptions = data[this.generatedFormsKeyFieldKey]
        ? data[this.generatedFormsKeyFieldKey]
            .split('|')
            .map(date => new Date(date).toISOString().split('T')[0])
        : []

      for (const stringDate of stringDates) {
        if (!exceptions.includes(stringDate)) {
          const newOccurrence = formatOccurrenceForm(sourceForm, stringDate)
          result.push(newOccurrence)
        }
      }
      return result
    }

    let sourceFormdata = getFormData(sourceForm)

    const occurrenceDates = getOccurrenceDates(sourceFormdata, dateWindow)
    return formatOccurrenceForms(sourceForm, occurrenceDates)
  }
}

const recurrenceInterpretation = new Interpretation(recurrenceConfig)
const returnTripInterpretation = new Interpretation(returnTripConfig)

// ================================= Main function =================================================

const formatApiFilterForDatetimes = (apiFilters, dateWindow) => {
  const rangeDateDebut = '0001-01-01|' + dateWindow[1]
  const rangeDateFin = dateWindow[0] + '|9999-12-31'

  return [
    ...apiFilters,
    {
      key: 'DateTime_Start',
      operator: 'BETWEEN',
      value: rangeDateDebut,
      type: 'DATETIME'
    },
    {
      key: 'DateTime_End',
      operator: 'BETWEEN',
      value: rangeDateFin,
      type: 'DATETIME'
    },
    {
      key: 'STATUS',
      operator: 'NOTIN',
      value: 'SUPPRIMÉ|SUPPRIMÉE',
      type: 'TEXT'
    }
  ]
}

/**
 * Gather documents that can be recurrences and interpret them in order to return the occurences
 * @param {*} filters
 * @param {*} dateWindow
 * @returns {Object[]} The list of documents
 * one document = {data, documentID, doesExist : bool}
 */
const getRecurrenceDocuments = async (filters, dateWindow) => {
  // Step 1 : Format the api filters
  let apiFilters = filters
  if (dateWindow !== null) {
    apiFilters = formatApiFilterForDatetimes(filters, dateWindow)
  }

  // Step 2 : Get the documents
  console.log('apiFilters', apiFilters)

  const documentsToInterpret = await getDocuments(apiFilters)

  // Step 3 : Interpret the documents thanks to the dateWindow
  return recurrenceInterpretation.interpretForms(
    documentsToInterpret,
    dateWindow
  )
}

const main = async () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup && loadingPopup.style.display !== 'none') return

  showPopupLoading('Génération des occurrences en cours')

  try {
  const generateOccurrences = async () => {
    const occurrenceGenerationDateRange =
      store.pageContentStore.processData[0].edits[
        'GenerateOccurrencesOnDateRange'
      ]
    const dateWindow = occurrenceGenerationDateRange.split('|')

    let apiFilters = [
      {
        key: 'FORMLAYOUTNAME',
        operator: 'IN',
        value: 'Transport|Transport de groupe',
        type: 'TEXT'
      }
    ]

    apiFilters = formatApiFilterForDatetimes(apiFilters, dateWindow)
    const transportDocuments = await getDocuments(apiFilters)

    const interpretedOccurrences = recurrenceInterpretation.interpretForms(
      transportDocuments,
      dateWindow
    )

    const createdOccurrences = await Interpretation.createForms(
      interpretedOccurrences
    )
  }
  // const generateReturnTrip = async () => {
  //   const occurrenceGenerationDateRange =
  //     store.pageContentStore.processData[0].edits[
  //       'GenerateOccurrencesOnDateRange'
  //     ]
  //   const dateWindow = occurrenceGenerationDateRange.split('|')

  //   let apiFilters = [
  //     {
  //       key: 'FORMLAYOUTNAME',
  //       operator: 'IN',
  //       value: 'Transport|Transport de groupe',
  //       type: 'TEXT'
  //     }
  //   ]

  //   apiFilters = formatApiFilterForDatetimes(apiFilters, dateWindow)
  //   const transportDocuments = await getDocuments(apiFilters)
  //   const transportDocumentsWithoutRecurrenceSource = transportDocuments.filter(
  //     document => {
  //       const documentData = getFormData(document)
  //       return ['Une seule fois', 'Occurrence'].includes(
  //         documentData['Dates_TypeRéc']
  //       )
  //     }
  //   )
  //   const interpretedReturnTrips = returnTripInterpretation.interpretForms(
  //     transportDocumentsWithoutRecurrenceSource
  //   )
  //   const createdReturnTrip = await Interpretation.createForms(
  //     interpretedReturnTrips
  //   )
  // }

  await generateOccurrences()
  } finally {
    hidePopupLoading()
  }
  // await generateReturnTrip()
}

main()