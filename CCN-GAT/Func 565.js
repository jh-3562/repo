if (docData["8L_Valid"]==="Confirmer"){
    return{"8L_NomFinal":docData["8L_Description"],"8L_NumFinal":docData["8L_NumInv"],'8L_StatutFinal':docData["8L_Statut"]}}
else if (docData["8L_ValidCh2"]==="Confirmer"){
    return{"8L_NomFinal":docData["8L_Description_Ch2"],"8L_NumFinal":docData["8L_NumCh1"],'8L_StatutFinal':docData["8L_Statut_Ch2"]}}
else {
    return undefined}