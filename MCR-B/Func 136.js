console.log('Function 136', context);
const { CoorFactu_Qualité, PrénomSelected, Nom } = docData;

return CoorFactu_Qualité === 'Bénéficiaire' ?
    {
        CoorFactu_Prénom: PrénomSelected || '',
        CoorFactu_Nom: Nom || '',
    } : {};