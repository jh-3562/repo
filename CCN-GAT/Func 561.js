if (docData["4L_Valid"]==="Confirmer"){
    return{"4L_NomFinal":docData["4L_Description"],"4L_NumFinal":docData["4L_NumInv"],'4L_StatutFinal':docData["4L_Statut"]}}
else if (docData["4L_ValidCh2"]==="Confirmer"){
    return{"4L_NomFinal":docData["4L_Description_Ch2"],"4L_NumFinal":docData["4L_NumCh1"],'4L_StatutFinal':docData["4L_Statut_Ch2"]}}
else {
    return undefined}