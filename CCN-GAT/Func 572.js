if (docData["TypeInventaire"]==='Aide technique'){ 
    return {'S1_FL11':true,'S4_FL11':true,'InformationsInventaire':null} 
}
else if (docData["TypeInventaire"]) {return {'S1_FL11':null,'S4_FL11':null,'InformationsInventaire':true} 
}
else {return {'S1_FL11':null,'S4_FL11':null,'InformationsInventaire':null} }