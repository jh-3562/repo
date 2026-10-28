if (docData['Patient_Nom']) {api() .get('https://dynamicsnavwsval.croix-rouge.be:8148/CroixRougeTest-NUP/OData/Company(\'DG%20Test\')/Patient?$filter=substringof(%27' + docData['Patient_Nom'] + '%27,Name)&$top=10', { auth: { username:'FASTERCOM', password:'3kE39KoOJd2Jr7e2Ll45BiIuBqhz4/kMb84Y5hJ3d3I='}})
    .then ( t => !console.log(t) && t && callback({suggestions: t.map(f => ({ title: f.Name}))})) 
} 
else { 
callback([]);
 };