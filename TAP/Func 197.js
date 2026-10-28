let dateTransport = '1970-01-01';
let typeTransport = 'ALLER';
let heureRdv = '00:00';
let heurePriseEnCharge = '00:00';
let heureRetour = '00:00';
let dureeEmbarquement = 5;
let dureeDebarquement = 5;
let dureeTransport = 30;
let dureeAttente = 0;
let prioriteRdv = true;
let heureRetourSaisie = false;

if (docData['Dates_DateTransport']) {
    dateTransport = new Date(docData['Dates_DateTransport']);
}

if (docData['TypeTransport']) {
    typeTransport = docData['TypeTransport'];
}

if (docData['EtablissementDest_HeureRDV']) {
    heureRdv = docData['EtablissementDest_HeureRDV'];
    prioriteRdv = true;
}
else if (docData['Depart_HeurePEC']) {
    heurePriseEnCharge = docData['Depart_HeurePEC'];
    prioriteRdv = false;
}

if (docData['DétailTransport_HeureRetour']) {
    heureRetour = docData['DétailTransport_HeureRetour'];
    heureRetourSaisie = true;
}

if (docData['Etablissement_DureePEC']) {
    dureeEmbarquement = parseInt(docData['Etablissement_DureePEC']) || dureeEmbarquement;
}

if (docData['EtablissementDest_DureeDebarq']) {
    dureeDebarquement = parseInt(docData['EtablissementDest_DureeDebarq']) || dureeDebarquement;
}

if (docData['Dispatch_DuréeTransportTheo']) {
    dureeTransport = parseInt(docData['Dispatch_DuréeTransportTheo']) || dureeTransport;
}

if (docData['Attente_Prevue']) {
    let heureAttente = docData['Attente_Prevue'];
    let a = heureAttente.split(':');
    dureeAttente = (+a[0]) * 60 + (+a[1]);
}

let minutesRdv = 0;
let minutesPec = 0;

if (prioriteRdv === true) {
    let a = heureRdv.split(':');
    minutesRdv = (+a[0]) * 60 + (+a[1]);
    minutesPec = minutesRdv - (dureeEmbarquement + dureeTransport + dureeDebarquement);
}
else {
    let a = heurePriseEnCharge.split(':');
    minutesPec = (+a[0]) * 60 + (+a[1]);
    minutesRdv = minutesPec + dureeEmbarquement + dureeTransport + dureeDebarquement;
}

let datetimePec = new Date(dateTransport);
datetimePec.setMinutes(minutesPec);
heurePriseEnCharge = datetimePec.toISOString().substring(11, 16);

let datetimeRdv = new Date(dateTransport);
datetimeRdv.setMinutes(minutesRdv);
heureRdv = datetimeRdv.toISOString().substring(11, 16);

let datetimeRetour = new Date(dateTransport);
let datetimeFin = new Date(dateTransport);
let datetimeDebut = new Date(dateTransport);

if (typeTransport === 'ALLER' || typeTransport === 'RETOUR') {
    let minutesRetour = minutesRdv + dureeAttente;
    datetimeFin.setMinutes(minutesRetour);
    datetimeDebut.setMinutes(minutesRdv);
}
else if (typeTransport === 'ALLER/RETOUR') {
    let minutesRetour = minutesRdv + dureeAttente;
    datetimeDebut.setMinutes(minutesRdv);
    datetimeRetour.setMinutes(minutesRetour);
    datetimeFin.setMinutes(minutesRetour);
    heureRetourSaisie = true;
}

return {
    'DateTime_Start': datetimeDebut.toISOString().substring(0, 19),
    'DateTime_End': datetimeFin.toISOString().substring(0, 19),
    'Depart_HeurePEC': datetimeDebut.toISOString().substring(11, 16),
    'EtablissementDest_HeureRDV': datetimeRdv.toISOString().substring(11, 16),
    'DétailTransport_HeureRetour': heureRetourSaisie === true ? datetimeRetour.toISOString().substring(11, 16) : '',
};