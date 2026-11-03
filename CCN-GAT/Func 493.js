if (docData['3L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '3L_Description': null, '3L_descriptionAideTechnique': null, '3L_jeNeTrouvePas': null, '3L_NumInv': null, '3L_Name': null, '3L_soumissionAideTechnique': true, '3L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['3L_jeNeTrouvePas'] === 'true') {
    return {
        '3L_Description': null, '3L_descriptionAideTechnique': true, '3L_NumInv': null, '3L_jeNeTrouvePas': true, '3L_soumissionAideTechnique': null, '3L_jeNeTrouvePasNonPlus': true, '3L_Name': true
    }
}
else {
    return {
        '3L_Description': true, '3L_descriptionAideTechnique': null, '3L_NumInv': true, '3L_Statut': true, '3L_jeNeTrouvePas': true, '3L_soumissionAideTechnique': null, '3L_jeNeTrouvePasNonPlus': null, '3L_Name': true
    }
}