if (docData['4L_jeNeTrouvePasNonPlus_Ch2'] === 'true') {
    return { '4L_Description_Ch2': null, '4L_descriptionAideTechnique_Ch2': null, '4L_jeNeTrouvePas_Ch2': null, '4L_NumCh1': null, '4L_NomCh2': null, '4L_soumissionAideTechnique_Ch2': true, '4L_jeNeTrouvePasNonPlus_Ch2': true }
}
else if (docData['4L_jeNeTrouvePas_Ch2'] === 'true') {
    return { '4L_Description_Ch2': null, '4L_descriptionAideTechnique_Ch2': true, '4L_NumCh1': null, '4L_jeNeTrouvePas_Ch2': true, '4L_soumissionAideTechnique_Ch2': null, '4L_jeNeTrouvePasNonPlus_Ch2': true, '4L_NomCh2': true }
}
else {
    return { '4L_Description_Ch2': true, '4L_descriptionAideTechnique_Ch2': null, '4L_NumCh1': true, '4L_Statut_Ch2': true, '4L_jeNeTrouvePas_Ch2': true, '4L_soumissionAideTechnique_Ch2': null, '4L_jeNeTrouvePasNonPlus_Ch2': null, '4L_NomCh2': true }
}