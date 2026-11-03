if (docData['10L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '10L_Description_Ch2': null, '10L_descriptionAideTechnique_Ch2': null, '10L_jeNeTrouvePas_Ch2': null, '10L_NumCh1': null, '10L_NomCh2': null, '10L_soumissionAideTechnique_Ch2': true, '10L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['10L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '10L_Description_Ch2': null, '10L_descriptionAideTechnique_Ch2': true, '10L_NumCh1': null, '10L_jeNeTrouvePas_Ch2': true, '10L_soumissionAideTechnique_Ch2': null, '10L_jeNeTrouvePasNonPlus_Ch2': true, '10L_NomCh2': true }
}
else {
    return { '10L_Description_Ch2': true, '10L_descriptionAideTechnique_Ch2': null, '10L_NumCh1': true, '10L_Statut_Ch2': true, '10L_jeNeTrouvePas_Ch2': true, '10L_soumissionAideTechnique_Ch2': null, '10L_jeNeTrouvePasNonPlus_Ch2': null, '10L_NomCh2': true }
}