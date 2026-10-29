console.log("fonction63", context);
 
//Transport simple
 
let showValue = {};

console.log(showValue)

if (docData.Demande_TransportInformationTransportAvecReccurence !== 'true') {

    console.log(showValue)

    showValue = {

        Demande_TransportInformationTransportFrequence: null,

        Demande_TransportInformationTransportJourneesApplicables: null,

        Demande_TransportInformationTransportDateDebutReccurence: null,

        Demande_TransportInformationTransportDateFinReccurence: null,

        Demande_TransportInformationTransportJourneesFixes: null,
 
        Demande_TransportTransportSimpleDateTransportDepart: true,

        Demande_TransportTransportSimpleDateTransportArrivee: true,

        Demande_TransportTransportRetourDateTransportDepart: true,

        Demande_TransportTransportRetourDateTransportArrivee: true,
 
    };

}
 
else if (docData.Demande_TransportInformationTransportAvecReccurence === 'true') {

    console.log(showValue)

    showValue = {

        Demande_TransportInformationTransportFrequence: true,

 
        Demande_TransportTransportSimpleDateTransportDepart: null,

        Demande_TransportTransportSimpleDateTransportArrivee: null,

        Demande_TransportTransportRetourDateTransportDepart: null,

        Demande_TransportTransportRetourDateTransportArrivee: null,
 
    };

}
 
else {

    showValue = {

        DemandeTransport_ClientAdapte_Frequence: null,

        DemandeTransport_ClientAdapte_TransportSimple_DateTransport: true,

        DemandeTransport_ClientAdapte_TransportSimple_DateTransport2: true,

        DemandeTransport_ClientAdapte_TransportRetour_DateRetour: true,

        DemandeTransport_ClientAdapte_TransportRetour_DateRetour2: true,

    };

}
 
return showValue;
 
 
