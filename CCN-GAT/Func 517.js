if (docData['7L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '7L_Description': null, '7L_descriptionAideTechnique': null, '7L_jeNeTrouvePas': null, '7L_NumInv': null, '7L_Name': null, '7L_soumissionAideTechnique': true, '7L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['7L_jeNeTrouvePas'] === 'true') {
    return {
        '7L_Description': null, '7L_descriptionAideTechnique': true, '7L_NumInv': null, '7L_jeNeTrouvePas': true, '7L_soumissionAideTechnique': null, '7L_jeNeTrouvePasNonPlus': true, '7L_Name': true
    }
}
else {
    return {
        '7L_Description': true, '7L_descriptionAideTechnique': null, '7L_NumInv': true, '7L_Statut': true, '7L_jeNeTrouvePas': true, '7L_soumissionAideTechnique': null, '7L_jeNeTrouvePasNonPlus': null, '7L_Name': true
    }
}