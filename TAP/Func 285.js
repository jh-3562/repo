let show={
    "StopArret|4|Adresse":null
}

if (docData["Stop_Type"]==='Départ') {
    show["StopArret|4|Adresse"]=true;
}

else if (docData["Stop_Type"]==='Arrêt') {
    show["StopArret|4|Adresse"]=null;
}

return show