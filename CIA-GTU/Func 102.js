console.log("Fonction 102", context);

const Acc = docData.Demande_TransportAccompagnementTypeAccompagnateurRequis === "Autre";

return {
  
  Demande_Accompagnateur: Acc ? true : null,

  

};
