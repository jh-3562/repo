if (docData['4L_jeNeTrouvePasNonPlus'] === 'true') {
    return {
        '4L_Description': null, '4L_descriptionAideTechnique': null, '4L_jeNeTrouvePas': null, '4L_NumInv': null, '4L_Name': null,  '4L_soumissionAideTechnique': true, '4L_jeNeTrouvePasNonPlus': true
    }
}
else if (docData['4L_jeNeTrouvePas'] === 'true') {
    return {
        '4L_Description': null, '4L_descriptionAideTechnique': true, '4L_NumInv': null,'4L_jeNeTrouvePas': true, '4L_soumissionAideTechnique': null, '4L_jeNeTrouvePasNonPlus': true, '4L_Name': true
    }
}
else {
    return {
        '4L_Description': true, '4L_descriptionAideTechnique': null, '4L_NumInv': true, '4L_Statut': true, '4L_jeNeTrouvePas': true, '4L_soumissionAideTechnique': null, '4L_jeNeTrouvePasNonPlus': null, '4L_Name': true
    }
}