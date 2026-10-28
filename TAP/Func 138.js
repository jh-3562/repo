const d = new Date(Date.parse('2021-01-01 ' + docData['Depart_HeurePEC'])); 
let minutes = d.getMinutes();
let hours = d.getHours();
let m = (Math.round(minutes/10) * 10) % 60;
if (m<10 && hours < 10){
return { 'Depart_HeurePEC' : '0'+hours.toString() + ':0' +  m.toString()}
}
else if (m<10 && hours >=10){
return { 'Depart_HeurePEC' : hours.toString() + ':0' +  m.toString()}
}
else if (m>=10 && hours <10){
return { 'Depart_HeurePEC' : '0'+hours.toString() + ':' +  m.toString()}
}
else {
return { 'Depart_HeurePEC' : hours.toString() + ':' +  m.toString()}
}