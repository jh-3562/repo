console.log('Function 99', context);

// fills field DateEnregistrement in forms Mission & Bénéficiaire
const { STATUS } = docData;
const today = new Date();
const formattedDate = today.toISOString().split('T')[0]; // Formate en YYYY-MM-DD

return STATUS === 'Draft' ? { 'DateEnregistrement': formattedDate, CC_NbAccompagnateur: '0' } : {undefined, undefined};