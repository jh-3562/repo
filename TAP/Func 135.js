if (docData['Etablissement_Convention']) {api() .get('https://interface.crbe.fasterlogistic.com/webhook/cba11199-e8d3-478e-bfb1-a5606201f9b3?table=conventions&column=conventionNom&input=' + docData['Etablissement_Convention'])
    .then ( t => !console.log(t) && t && callback({suggestions:{'Etablissement_Convention': t.map(f => ({ title: f.conventionNom, fields: [{key:"ConventionRefNav", name:"Référence Navision",value: f.conventionNavisionRef}]}))}})) 
} 
else { 
api() .get('https://interface.crbe.fasterlogistic.com/webhook/cba11199-e8d3-478e-bfb1-a5606201f9b3?table=conventions&column=conventionNom&input=')
    .then ( t => !console.log(t) && t && callback({suggestions:{'Etablissement_Convention': t.map(f => ({ title: f.conventionNom, fields: [{key:"ConventionRefNav", name:"Référence Navision",value: f.conventionNavisionRef}]}))}}))
 };