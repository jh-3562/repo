const raison = docData['Raison'];
console.log('raison :',raison);

if (raison === 'TC-TA - Médical') {
  console.log('1');
  return {'Raison_transport|Médical': true,'Raison_transport|Service': null,'Raison_transport|Étude': null,'Raison_transport|Loisir': null,'Raison_transport|Travail': null};

}

else if (raison === 'TC-TA - Service') {
  console.log('2');
  return {'Raison_transport|Médical': null,'Raison_transport|Service': true,'Raison_transport|Étude': null,'Raison_transport|Loisir': null,'Raison_transport|Travail': null};

}

else if (raison === 'TC-TA - Étude') {
  console.log('3');
  return {'Raison_transport|Médical': null,'Raison_transport|Service': null,'Raison_transport|Étude': true,'Raison_transport|Loisir': null,'Raison_transport|Travail': null};

}

else if (raison === 'TC-TA - Loisir') {
  console.log('4');
  return {'Raison_transport|Médical': null,'Raison_transport|Service': null,'Raison_transport|Étude': null,'Raison_transport|Loisir': true,'Raison_transport|Travail': null};

}

else if (raison === 'TC-TA - Travail') {
  console.log('5');
  return {'Raison_transport|Médical': null,'Raison_transport|Service': null,'Raison_transport|Étude': null,'Raison_transport|Loisir': null,'Raison_transport|Travail': true};

}

else {
  console.log('6');
  return {'Raison_transport|Médical': true,'Raison_transport|Service': true,'Raison_transport|Étude': true,'Raison_transport|Loisir': true,'Raison_transport|Travail': true};
}