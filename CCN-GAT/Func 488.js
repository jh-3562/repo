if (docData['2L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '2L_Description_Ch2': null, '2L_descriptionAideTechnique_Ch2': null, '2L_jeNeTrouvePas_Ch2': null, '2L_NumCh1': null, '2L_NomCh2': null,  '2L_soumissionAideTechnique_Ch2': true, '2L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['2L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '2L_Description_Ch2': null, '2L_descriptionAideTechnique_Ch2': true, '2L_NumCh1': null, '2L_jeNeTrouvePas_Ch2': true, '2L_soumissionAideTechnique_Ch2': null, '2L_jeNeTrouvePasNonPlus_Ch2': true, '2L_NomCh2': true }
}
else {
    return { '2L_Description_Ch2': true, '2L_descriptionAideTechnique_Ch2': null, '2L_NumCh1': true, '2L_Statut_Ch2': true, '2L_jeNeTrouvePas_Ch2': true, '2L_soumissionAideTechnique_Ch2': null, '2L_jeNeTrouvePasNonPlus_Ch2': null, '2L_NomCh2': true }
}