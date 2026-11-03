if (docData['9L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '9L_Description': null, '9L_descriptionAideTechnique': null, '9L_jeNeTrouvePas': null, '9L_NumInv': null, '9L_Name': null, '9L_soumissionAideTechnique': true, '9L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['9L_jeNeTrouvePas'] === 'true') {
    return {
        '9L_Description': null, '9L_descriptionAideTechnique': true, '9L_NumInv': null, '9L_jeNeTrouvePas': true, '9L_soumissionAideTechnique': null, '9L_jeNeTrouvePasNonPlus': true, '9L_Name': true
    }
}
else {
    return {
        '9L_Description': true, '9L_descriptionAideTechnique': null, '9L_NumInv': true, '9L_Statut': true, '9L_jeNeTrouvePas': true, '9L_soumissionAideTechnique': null, '9L_jeNeTrouvePasNonPlus': null, '9L_Name': true
    }
}