if (docData["9L_Valid"]==="Confirmer"){
    return{"9L_NomFinal":docData["9L_Description"],"9L_NumFinal":docData["9L_NumInv"],'9L_StatutFinal':docData["9L_Statut"]}}
else if (docData["9L_ValidCh2"]==="Confirmer"){
    return{"9L_NomFinal":docData["9L_Description_Ch2"],"9L_NumFinal":docData["9L_NumCh1"],'9L_StatutFinal':docData["9L_Statut_Ch2"]}}
else {
    return undefined}