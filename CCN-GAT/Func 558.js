if (docData["1L_Valid"]==="Confirmer"){
    return{"1L_NomFinal":docData["1L_Description"],"1L_NumFinal":docData["1L_NumInv"],'1L_StatutFinal':docData["1L_Statut"]}}
else if (docData["1L_ValidCh2"]==="Confirmer"){
    return{"1L_NomFinal":docData["1L_Description_Ch2"],"1L_NumFinal":docData["1L_NumCh1"],'1L_StatutFinal':docData["1L_Statut_Ch2"]}}
else {
    return undefined}