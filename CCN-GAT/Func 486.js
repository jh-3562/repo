if (docData['2L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '2L_Description': null, '2L_descriptionAideTechnique': null, '2L_jeNeTrouvePas': null, '2L_NumInv': null, '2L_Name': null, '2L_soumissionAideTechnique': true, '2L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['2L_jeNeTrouvePas'] === 'true') {
    return {
        '2L_Description': null, '2L_descriptionAideTechnique': true, '2L_NumInv': null,'2L_jeNeTrouvePas': true, '2L_soumissionAideTechnique': null, '2L_jeNeTrouvePasNonPlus': true, '2L_Name': true
    }
}
else {
    return {
        '2L_Description': true, '2L_descriptionAideTechnique': null, '2L_NumInv': true, '2L_Statut': true, '2L_jeNeTrouvePas': true, '2L_soumissionAideTechnique': null, '2L_jeNeTrouvePasNonPlus': null, '2L_Name': true
    }
}