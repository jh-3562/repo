let date = encodeURIComponent(store.pageContentStore.processData[0].filters[2].value);  
let statut=encodeURIComponent(store.pageContentStore.processData[0].filters[0].value);  
let Service=encodeURIComponent(store.pageContentStore.processData[0].filters[1].value);  
api().get(`https://interface.e360-saint-jerome.fastercom.io/webhook/e449ba8b-6053-41d8-949e-049b9178a8a1?date=`+date+`&statut=`+statut+`&Service=`+Service)  .then(console.log('Envoi lancé') &&callback([]));