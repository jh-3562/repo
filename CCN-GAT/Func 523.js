if (docData['8L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '8L_Description': null, '8L_descriptionAideTechnique': null, '8L_jeNeTrouvePas': null, '8L_NumInv': null, '8L_Name': null, '8L_soumissionAideTechnique': true, '8L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['8L_jeNeTrouvePas'] === 'true') {
    return {
        '8L_Description': null, '8L_descriptionAideTechnique': true, '8L_NumInv': null, '8L_jeNeTrouvePas': true, '8L_soumissionAideTechnique': null, '8L_jeNeTrouvePasNonPlus': true, '8L_Name': true
    }
}
else {
    return {
        '8L_Description': true, '8L_descriptionAideTechnique': null, '8L_NumInv': true, '8L_Statut': true, '8L_jeNeTrouvePas': true, '8L_soumissionAideTechnique': null, '8L_jeNeTrouvePasNonPlus': null, '8L_Name': true
    }
}