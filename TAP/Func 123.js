if (docData['Patient_Nom']) {api() .get('https://interface.crbe.fasterlogistic.com/webhook/8f966647-3fc9-4ff2-8436-96b78bdceec1?input=' + docData['Patient_Nom'])
    .then ( t => !console.log(t) && t && callback({suggestions:{ 'Patient_Nom' : t.map(f => ({ title: f.Surname, fields : [{key:"Patient_Prenom", name:"Prénom",value: f.First_Name}]}))}})) 
} 
else { 
callback([]);
 };