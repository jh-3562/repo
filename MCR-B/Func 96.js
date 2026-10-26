console.log('Function 96', context);

const reccurence = docData.Planification_Récurrence;
const hasRecurrence = docData.IdentifiantFormulaireRécurrence || (reccurence && reccurence !== 'Une seule fois');

return { MarkdownRécurrenceDispo: hasRecurrence ? true : null };