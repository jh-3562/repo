if (docData["5L_Valid"]==="Confirmer"){
    return{"5L_NomFinal":docData["5L_Description"],"5L_NumFinal":docData["5L_NumInv"],'5L_StatutFinal':docData["5L_Statut"]}}
else if (docData["5L_ValidCh2"]==="Confirmer"){
    return{"5L_NomFinal":docData["5L_Description_Ch2"],"5L_NumFinal":docData["5L_NumCh1"],'5L_StatutFinal':docData["5L_Statut_Ch2"]}}
else {
    return undefined}