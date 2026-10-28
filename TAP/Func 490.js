console.log('Function490', context);

if(docData.CalculPrixTransportGroupe === 'Prix au km'){
  return {
    'TotalChauffeur': true
  }
}
else{
  return {
    'TotalChauffeur': null
  }
}