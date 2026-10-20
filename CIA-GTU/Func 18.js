console.log("Fonction 18 fillfieldTransportSysteme_DateFin", context);

const checkboxSimple = docData.Demande_TransportInformationTransportTransportSimple;
const checkboxRetour = docData.Demande_TransportInformationTransportTransportAllerRetour;
const dateArriveeSimple = docData.Demande_ListeRappelTransportSimpleDateTransportArrivee;
const heureArriveeSimple = docData.Demande_TransportTransportSimpleHeureArriveeSouhaite;
const dateArriveeRetour = docData.Demande_ListeRappelTransportRetourDateTransportArrivee;
const heureArriveeRetour = docData.Demande_TransportTransportRetourHeureArriveeSouhaite;
let dateHeureRetour = null;


const dateFormat = (date, heure) => `${date}T${heure}:00`;


if (checkboxRetour !== "true") {
    if (dateArriveeSimple && heureArriveeSimple) {
            dateHeureRetour = {TransportSysteme_DateFin: dateFormat(dateArriveeSimple, heureArriveeSimple)};
    }
    else if (inputKey === "Demande_ListeRappelTransportSimpleDateTransportArrivee" || inputKey === "Demande_TransportTransportSimpleHeureArriveeSouhaite") {
        if (dateArriveeSimple && heureArriveeSimple) {
            dateHeureRetour = {TransportSysteme_DateFin: dateFormat(dateArriveeSimple, heureArriveeSimple)};
        };  
    };   
}


else if(checkboxRetour === "true") {
    if (dateArriveeRetour && heureArriveeRetour) {
            dateHeureRetour = {TransportSysteme_DateFin: dateFormat(dateArriveeRetour, heureArriveeRetour)};
    }
    else if (inputKey === "Demande_ListeRappelTransportRetourDateTransportArrivee" || inputKey === "Demande_TransportTransportRetourHeureArriveeSouhaite") {
        if (dateArriveeRetour && heureArriveeRetour) {
            dateHeureRetour = {TransportSysteme_DateFin: dateFormat(dateArriveeRetour, heureArriveeRetour)};
        };    
    }; 
};




return dateHeureRetour;
