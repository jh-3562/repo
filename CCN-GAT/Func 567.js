if (docData["10L_Valid"]==="Confirmer"){
    return{"10L_NomFinal":docData["10L_Description"],"10L_NumFinal":docData["10L_NumInv"],'10L_StatutFinal':docData["10L_Statut"]}}
else if (docData["10L_ValidCh2"]==="Confirmer"){
    return{"10L_NomFinal":docData["10L_Description_Ch2"],"10L_NumFinal":docData["10L_NumCh1"],'10L_StatutFinal':docData["10L_Statut_Ch2"]}}
else {
    return undefined}