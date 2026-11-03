if (docData['3L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '3L_Description_Ch2': null, '3L_descriptionAideTechnique_Ch2': null, '3L_jeNeTrouvePas_Ch2': null, '3L_NumCh1': null, '3L_NomCh2': null, '3L_soumissionAideTechnique_Ch2': true, '3L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['3L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '3L_Description_Ch2': null, '3L_descriptionAideTechnique_Ch2': true, '3L_NumCh1': null, '3L_jeNeTrouvePas_Ch2': true, '3L_soumissionAideTechnique_Ch2': null, '3L_jeNeTrouvePasNonPlus_Ch2': true, '3L_NomCh2': true }
}
else {
    return { '3L_Description_Ch2': true, '3L_descriptionAideTechnique_Ch2': null, '3L_NumCh1': true, '3L_Statut_Ch2': true, '3L_jeNeTrouvePas_Ch2': true, '3L_soumissionAideTechnique_Ch2': null, '3L_jeNeTrouvePasNonPlus_Ch2': null, '3L_NomCh2': true }
}