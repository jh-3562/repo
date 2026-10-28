const d = new Date(Date.parse('2021-01-01 ' + docData['EtablissementDest_HeureRDV'])); 
let minutes = d.getMinutes();
let hours = d.getHours();
let m = (Math.round(minutes/10) * 10) % 60;
if (m<10 && hours < 10){
return { 'EtablissementDest_HeureRDV' : '0'+hours.toString() + ':0' +  m.toString()}
}
else if (m<10 && hours >=10){
return { 'EtablissementDest_HeureRDV' : hours.toString() + ':0' +  m.toString()}
}
else if (m>=10 && hours <10){
return { 'EtablissementDest_HeureRDV' : '0'+hours.toString() + ':' +  m.toString()}
}
else {
return { 'EtablissementDest_HeureRDV' : hours.toString() + ':' +  m.toString()}
}