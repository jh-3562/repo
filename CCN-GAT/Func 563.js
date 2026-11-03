if (docData["6L_Valid"]==="Confirmer"){
    return{"6L_NomFinal":docData["6L_Description"],"6L_NumFinal":docData["6L_NumInv"],'6L_StatutFinal':docData["6L_Statut"]}}
else if (docData["6L_ValidCh2"]==="Confirmer"){
    return{"6L_NomFinal":docData["6L_Description_Ch2"],"6L_NumFinal":docData["6L_NumCh1"],'6L_StatutFinal':docData["6L_Statut_Ch2"]}}
else {
    return undefined}