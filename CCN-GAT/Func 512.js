if (docData['6L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '6L_Description_Ch2': null, '6L_descriptionAideTechnique_Ch2': null, '6L_jeNeTrouvePas_Ch2': null, '6L_NumCh1': null, '6L_NomCh2': null, '6L_soumissionAideTechnique_Ch2': true, '6L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['6L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '6L_Description_Ch2': null, '6L_descriptionAideTechnique_Ch2': true, '6L_NumCh1': null, '6L_jeNeTrouvePas_Ch2': true, '6L_soumissionAideTechnique_Ch2': null, '6L_jeNeTrouvePasNonPlus_Ch2': true, '6L_NomCh2': true }
}
else {
    return { '6L_Description_Ch2': true, '6L_descriptionAideTechnique_Ch2': null, '6L_NumCh1': true, '6L_Statut_Ch2': true, '6L_jeNeTrouvePas_Ch2': true, '6L_soumissionAideTechnique_Ch2': null, '6L_jeNeTrouvePasNonPlus_Ch2': null, '6L_NomCh2': true }
}