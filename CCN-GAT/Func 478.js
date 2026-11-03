if (docData['jeNeTrouvePasNonPlus_Ch2']==='true'){
  return {'1L_Description_Ch2':null,'descriptionAideTechnique_Ch2':null,'jeNeTrouvePas_Ch2':null,'1L_NumCh1':null,'1L_NomCh2':null,'soumissionAideTechnique_Ch2':true,'jeNeTrouvePasNonPlus_Ch2':true}
}
else if (docData['jeNeTrouvePas_Ch2']==='true'){
  return {'1L_Description_Ch2':null,'descriptionAideTechnique_Ch2':true,'1L_NumCh1':null,'jeNeTrouvePas_Ch2':true,'soumissionAideTechnique_Ch2':null,'jeNeTrouvePasNonPlus_Ch2':true,'1L_NomCh2':true}
}
else {
  return{'1L_Description_Ch2':true,'descriptionAideTechnique_Ch2':null,'1L_NumCh1':true,'1L_Statut_Ch2':true,'jeNeTrouvePas_Ch2':true,'soumissionAideTechnique_Ch2':null,'jeNeTrouvePasNonPlus_Ch2':null,'1L_NomCh2':true}
}