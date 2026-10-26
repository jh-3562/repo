console.log('Function 85', context)

const isChecked = docData.RendezVousPrisParTiers

return isChecked === 'true'
  ? { NomDeLappelant: true, TéléphoneDeLappelant: true, callerStatus: true }
  : { NomDeLappelant: null, TéléphoneDeLappelant: null, callerStatus: null }
