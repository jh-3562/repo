console.log("Fonction 16 onchangeDateDepartAllerHeureDeDepartSouhaitee", context)

const dateDepart = docData.Demande_ListeRappelTransportSimpleDateTransportDepart;
const heureDepart = docData.Demande_TransportTransportSimpleHeureDepartSouhaitee;
let dateHeureDepart = null

if (dateDepart && heureDepart) {
    const dateFormat = dateDepart + "T" + heureDepart + ":00";
    dateHeureDepart = {TransportSysteme_DateDebut: dateFormat};
};

return dateHeureDepart
