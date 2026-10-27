console.log('135 show markdown', docData);
const {
    Transport_AvecRecurrence,
    Demande_Transport_IdRecurrence
} = docData;


const conditionRecurrence = Transport_AvecRecurrence && Transport_AvecRecurrence === 'true';
console.log('conditionRecurrence (Transport_AvecRecurrence === "true"):', conditionRecurrence);

const conditionFormId = Demande_Transport_IdRecurrence ? true : false;
console.log('conditionFormId (Demande_Transport_IdRecurrence exists):', conditionFormId);

const result = (conditionRecurrence || conditionFormId) ? true : null;
console.log('Final result returned:', result);

return {
    MarkdownRecurrenceDemande: result
};
