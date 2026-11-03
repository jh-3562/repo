if (docData['TypeLivraisonTPN']==='Livraison'){
    return {'DateDebutTraitement':true,'DateFinTraitement':null}
}
else if (docData['TypeLivraisonTPN']==='Récupération') {
    return {'DateDebutTraitement':null,'DateFinTraitement':true}
}

else {
    return {'DateDebutTraitement':true,'DateFinTraitement':true}
}