if (docData["2L_Valid"]==="Confirmer"){
    return{"2L_NomFinal":docData["2L_Description"],"2L_NumFinal":docData["2L_NumInv"],'2L_StatutFinal':docData["2L_Statut"]}}
else if (docData["2L_ValidCh2"]==="Confirmer"){
    return{"2L_NomFinal":docData["2L_Description_Ch2"],"2L_NumFinal":docData["2L_NumCh1"],'2L_StatutFinal':docData["2L_Statut_Ch2"]}}
else {
    return undefined}