console.log('Function 401', context)

const userRoles = store.moduleStore.user.roles

const result = {}


if (userRoles.includes('DEVELOPPEUR')) {
  result['Info_dev_Transport_Groupe'] = true
} else {
  result['Info_dev_Transport_Groupe'] = null
}

result['BOUTON BATCH Transport Groupe Draft'] = null
result['BOUTON BATCH Transport Groupe RECURRENCE'] = null
switch (docData['STATUS']) {
  case 'Draft':
    result['BOUTON BATCH Transport Groupe Draft'] = true
    break
  case 'RECURRENCE':
    result['BOUTON BATCH Transport Groupe RECURRENCE'] = true
    break
}
return result
