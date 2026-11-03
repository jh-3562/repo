if (docData['jeNeTrouvePasNonPlus']==='true'){
  return {'1L_Description':null,'descriptionAideTechnique':null,'jeNeTrouvePas':null,'1L_NumInv':null,'1L_Name':null,'soumissionAideTechnique':true,'jeNeTrouvePasNonPlus':true}
}
else if (docData['jeNeTrouvePas']==='true'){
  return {'1L_Description':null,'descriptionAideTechnique':true,'1L_NumInv':null,'jeNeTrouvePas':true,'soumissionAideTechnique':null,'jeNeTrouvePasNonPlus':true,'1L_Name':true}
}
else {
  return{'1L_Description':true,'descriptionAideTechnique':null,'1L_NumInv':true,'1L_Statut':true,'jeNeTrouvePas':true,'soumissionAideTechnique':null,'jeNeTrouvePasNonPlus':null,'1L_Name':true}
}