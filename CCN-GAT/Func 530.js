if (docData['9L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '9L_Description_Ch2': null, '9L_descriptionAideTechnique_Ch2': null, '9L_jeNeTrouvePas_Ch2': null, '9L_NumCh1': null, '9L_NomCh2': null, '9L_soumissionAideTechnique_Ch2': true, '9L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['9L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '9L_Description_Ch2': null, '9L_descriptionAideTechnique_Ch2': true, '9L_NumCh1': null, '9L_jeNeTrouvePas_Ch2': true, '9L_soumissionAideTechnique_Ch2': null, '9L_jeNeTrouvePasNonPlus_Ch2': true, '9L_NomCh2': true }
}
else {
    return { '9L_Description_Ch2': true, '9L_descriptionAideTechnique_Ch2': null, '9L_NumCh1': true, '9L_Statut_Ch2': true, '9L_jeNeTrouvePas_Ch2': true, '9L_soumissionAideTechnique_Ch2': null, '9L_jeNeTrouvePasNonPlus_Ch2': null, '9L_NomCh2': true }
}