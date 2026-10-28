const user = store.moduleStore?.user?.roles[0];

if (docData['user'] != 'Driver') {

    if (docData['CalculateDuration'] === 'true') {

        return{'Depart_HeurePEC':false,'EtablissementDest_HeureRDV':false,'DétailTransport_HeureRetour':false}

    }

    else return{'Depart_HeurePEC':true,'EtablissementDest_HeureRDV':true,'DétailTransport_HeureRetour':true}

}

else return{'Depart_HeurePEC':true,'EtablissementDest_HeureRDV':true,'DétailTransport_HeureRetour':true}