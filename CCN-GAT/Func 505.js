if (docData['5L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '5L_Description': null, '5L_descriptionAideTechnique': null, '5L_jeNeTrouvePas': null, '5L_NumInv': null, '5L_Name': null,  '5L_soumissionAideTechnique': true, '5L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['5L_jeNeTrouvePas'] === 'true') {
    return {
        '5L_Description': null, '5L_descriptionAideTechnique': true, '5L_NumInv': null,  '5L_jeNeTrouvePas': true, '5L_soumissionAideTechnique': null, '5L_jeNeTrouvePasNonPlus': true, '5L_Name': true
    }
}
else {
    return {
        '5L_Description': true, '5L_descriptionAideTechnique': null, '5L_NumInv': true, '5L_Statut': true, '5L_jeNeTrouvePas': true, '5L_soumissionAideTechnique': null, '5L_jeNeTrouvePasNonPlus': null, '5L_Name': true
    }
}