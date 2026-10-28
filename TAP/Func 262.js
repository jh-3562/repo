if (['COMPLÉTÉ','FACTURÉ','CLOTURÉ'].includes(docData['STATUS'])) {
    console.log('Test')
    var GrandTotalKm=parseInt(docData['Factu_TotalDistance'])||parseFloat(docData['Factu_TotalDistance'])||0
    var TauxChauffeur = parseFloat(docData["TAUX_KM_Chauffeur"]) || 0.54;
    var TotalChauffeur$ = Math.max((GrandTotalKm * TauxChauffeur).toFixed(2), 9)
    var  PrixOrganisme = parseInt(docData['Prix_transport']) ||0;
    var CoutAutre=parseFloat(docData["COut_parking"]) || 0.00 + parseFloat(docData["Cout_divers"]) || 0.00;
    var GrandTotal$= (TotalChauffeur$ - parseFloat(PrixOrganisme)+CoutAutre).toFixed(2)
    console.log(PrixOrganisme)
    return {
        'Grand_Total': GrandTotal$.toString(),
        'Dons_client':PrixOrganisme.toString(),
        'Factu_Total_Chauffeur':TotalChauffeur$.toString()


    }
}
