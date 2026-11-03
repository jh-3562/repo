if (docData["3L_Valid"]==="Confirmer"){
    return{"3L_NomFinal":docData["3L_Description"],"3L_NumFinal":docData["3L_NumInv"],'3L_StatutFinal':docData["3L_Statut"]}}
else if (docData["3L_ValidCh2"]==="Confirmer"){
    return{"3L_NomFinal":docData["3L_Description_Ch2"],"3L_NumFinal":docData["3L_NumCh1"],'3L_StatutFinal':docData["3L_Statut_Ch2"]}}
else {
    return undefined}