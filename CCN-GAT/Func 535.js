if (docData['10L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '10L_Description': null, '10L_descriptionAideTechnique': null, '10L_jeNeTrouvePas': null, '10L_NumInv': null, '10L_Name': null, '10L_soumissionAideTechnique': true, '10L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['10L_jeNeTrouvePas'] === 'true') {
    return {
        '10L_Description': null, '10L_descriptionAideTechnique': true, '10L_NumInv': null,'10L_jeNeTrouvePas': true, '10L_soumissionAideTechnique': null, '10L_jeNeTrouvePasNonPlus': true, '10L_Name': true
    }
}
else {
    return {
        '10L_Description': true, '10L_descriptionAideTechnique': null, '10L_NumInv': true, '10L_Statut': true, '10L_jeNeTrouvePas': true, '10L_soumissionAideTechnique': null, '10L_jeNeTrouvePasNonPlus': null, '10L_Name': true
    }
}