console.log('Function491', context);

if(docData.CalculPrixTransportGroupe === 'Prix au km'){
  return {
    'Prix_totalite': true
  }
}
else{
  return {
    'Prix_totalite': null
  }
}