if (docData['5L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '5L_Description_Ch2': null, '5L_descriptionAideTechnique_Ch2': null, '5L_jeNeTrouvePas_Ch2': null, '5L_NumCh1': null, '5L_NomCh2': null, '5L_soumissionAideTechnique_Ch2': true, '5L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['5L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '5L_Description_Ch2': null, '5L_descriptionAideTechnique_Ch2': true, '5L_NumCh1': null, '5L_jeNeTrouvePas_Ch2': true, '5L_soumissionAideTechnique_Ch2': null, '5L_jeNeTrouvePasNonPlus_Ch2': true, '5L_NomCh2': true }
}
else {
    return { '5L_Description_Ch2': true, '5L_descriptionAideTechnique_Ch2': null, '5L_NumCh1': true, '5L_Statut_Ch2': true, '5L_jeNeTrouvePas_Ch2': true, '5L_soumissionAideTechnique_Ch2': null, '5L_jeNeTrouvePasNonPlus_Ch2': null, '5L_NomCh2': true }
}