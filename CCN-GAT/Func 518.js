if (docData['7L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '7L_Description_Ch2': null, '7L_descriptionAideTechnique_Ch2': null, '7L_jeNeTrouvePas_Ch2': null, '7L_NumCh1': null, '7L_NomCh2': null, '7L_soumissionAideTechnique_Ch2': true, '7L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['7L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '7L_Description_Ch2': null, '7L_descriptionAideTechnique_Ch2': true, '7L_NumCh1': null, '7L_jeNeTrouvePas_Ch2': true, '7L_soumissionAideTechnique_Ch2': null, '7L_jeNeTrouvePasNonPlus_Ch2': true, '7L_NomCh2': true }
}
else {
    return { '7L_Description_Ch2': true, '7L_descriptionAideTechnique_Ch2': null, '7L_NumCh1': true, '7L_Statut_Ch2': true, '7L_jeNeTrouvePas_Ch2': true, '7L_soumissionAideTechnique_Ch2': null, '7L_jeNeTrouvePasNonPlus_Ch2': null, '7L_NomCh2': true }
}