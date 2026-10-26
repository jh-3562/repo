console.log('Function 75', context);
const { CoorFactu_Qualité } = docData;

const returnFields = CoorFactu_Qualité === 'Bénéficiaire' ? 
{ 
    INFODEV_NomComplet: `${docData.Prénom} ${docData.Nom}`,
    CoorFactu_Prénom: docData.Prénom,
    CoorFactu_Nom: docData.Nom,
} : 
{ 
    INFODEV_NomComplet: `${docData.Prénom} ${docData.Nom}`,
};

return returnFields;