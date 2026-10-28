console.log('Function 519', context);

if(docData['TypeTransport'] === 'ALLER/RETOUR'){
  return {
    'startStopNumberRetour': true,
    'endStopNumberRetour': true
  }
}
else{
  return {
    'startStopNumberRetour': false,
    'endStopNumberRetour': false
  }
}