console.log('Function 518', context);

const isCustomerManual = docData.customerPricingType === 'Manuel';
const isOrganismManual = docData.organismPricingType === 'Manuel';

return {
  Dons_client: isCustomerManual ? null : true, 
  Part_Organisme: isOrganismManual ? null : true
};