if (docData["7L_Valid"]==="Confirmer"){
    return{"7L_NomFinal":docData["7L_Description"],"7L_NumFinal":docData["7L_NumInv"],'7L_StatutFinal':docData["7L_Statut"]}}
else if (docData["7L_ValidCh2"]==="Confirmer"){
    return{"7L_NomFinal":docData["7L_Description_Ch2"],"7L_NumFinal":docData["7L_NumCh1"],'7L_StatutFinal':docData["7L_Statut_Ch2"]}}
else {
    return undefined}