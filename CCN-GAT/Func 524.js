if (docData['8L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '8L_Description_Ch2': null, '8L_descriptionAideTechnique_Ch2': null, '8L_jeNeTrouvePas_Ch2': null, '8L_NumCh1': null, '8L_NomCh2': null, '8L_soumissionAideTechnique_Ch2': true, '8L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['8L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '8L_Description_Ch2': null, '8L_descriptionAideTechnique_Ch2': true, '8L_NumCh1': null,  '8L_jeNeTrouvePas_Ch2': true, '8L_soumissionAideTechnique_Ch2': null, '8L_jeNeTrouvePasNonPlus_Ch2': true, '8L_NomCh2': true }
}
else {
    return { '8L_Description_Ch2': true, '8L_descriptionAideTechnique_Ch2': null, '8L_NumCh1': true, '8L_Statut_Ch2': true, '8L_jeNeTrouvePas_Ch2': true, '8L_soumissionAideTechnique_Ch2': null, '8L_jeNeTrouvePasNonPlus_Ch2': null, '8L_NomCh2': true }
}