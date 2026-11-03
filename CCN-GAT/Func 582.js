if (docData['NumeroPompeSearch']&&docData['NumeroPompeSearch']!=='') 
api({ local: true })
  .get(`https://ciussscnfwtest.r03.rtss.qc.ca/api/tabledata/InventaireGrid?&fields=TypeInventaire&values=Pompe&fields=NoUniqueInventaire&values=${docData['NumeroPompeSearch']}`)
  .then(res => {
    const rows = res?.data?.tableData?.rows;
    const ID = rows?.[0]?.documentRowID;
    const Statut=rows?.[0]?.status
    const data={
        StatutInventaire:"DISPONIBLE",
        NumDernierecommandeInventaire:'',
        LivraisonOuRecuperation:'',
        DateLivraisonInventaire:'',
        DateRecuperation:'',
        StatutPrepa:'',
        LienVersLaCommandeInventaire:''
    }
    for (let propName in data) {
        if (!data[propName]) {
            delete data[propName];
        }
    }
   
    
return api({ local: true }).put("document", {
    document: {
        data: JSON.stringify(data),
        status: Statut,
        documentID : ID,
        template: {
            templateId: "774edbbf-b1f2-4d13-86ef-b72b5218fc52",  
        }
    },
}).then(res=>callback({
    data: {
        'ValiderPompe':'',
        'EchangerPompe':'',
        'NumeroPompeSearch':''
    }
})
    )  
})
  
  
  