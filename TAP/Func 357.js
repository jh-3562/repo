console.log('Function 357', context)

const userRoles = store.moduleStore.user.roles
const formlayoutID = docData.FORMLAYOUTID
const transportFormLayoutId = '6d75ae79-ced2-4a83-a41e-da016f27e530'

const result = {}

switch (formlayoutID) {
  case transportFormLayoutId:
    if (userRoles.includes('DEVELOPPEUR')) {
      result['Info_dev_Transport'] = true
    } else {
      result['Info_dev_Transport'] = null
    }
    
    result['BOUTON BATCH Transport Draft'] = null
    result['BOUTON BATCH Transport RECURRENCE'] = null
    switch (docData['STATUS']) {
      case 'Draft':
        result['BOUTON BATCH Transport Draft'] = true
        break
      case 'RECURRENCE':
        result['BOUTON BATCH Transport RECURRENCE'] = true
        break
    }
}

return result
