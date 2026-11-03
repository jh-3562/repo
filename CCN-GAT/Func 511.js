if (docData['6L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '6L_Description': null, '6L_descriptionAideTechnique': null, '6L_jeNeTrouvePas': null, '6L_NumInv': null, '6L_Name': null,  '6L_soumissionAideTechnique': true, '6L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['6L_jeNeTrouvePas'] === 'true') {
    return {
        '6L_Description': null, '6L_descriptionAideTechnique': true, '6L_NumInv': null, '6L_jeNeTrouvePas': true, '6L_soumissionAideTechnique': null, '6L_jeNeTrouvePasNonPlus': true, '6L_Name': true
    }
}
else {
    return {
        '6L_Description': true, '6L_descriptionAideTechnique': null, '6L_NumInv': true, '6L_Statut': true, '6L_jeNeTrouvePas': true, '6L_soumissionAideTechnique': null, '6L_jeNeTrouvePasNonPlus': null, '6L_Name': true
    }
}