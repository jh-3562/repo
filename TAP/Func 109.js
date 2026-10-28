if (docData['EtablissementDest_HeureRDV'] && docData['Attente_Prevue']) {
var a = (docData['Attente_Prevue']).split(':') 
var minutes = (+a[0]) * 60 + (+a[1]);
return {'DétailTransport_HeureRetour': 
new Date(Date.parse('2021-01-01 ' +docData['EtablissementDest_HeureRDV']) + (parseFloat(minutes)*60000)).toISOString().split('T')[1].toString().substring(0,5)}} else {};