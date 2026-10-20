console.log("Fonction 96 ", context);

const Retour = docData?.DemandeTransportInformationsTransportRetour;


if (Retour === "true") {
  return {
    Demande_TransportAerienDepartRetour: true,
    Demande_TransportAerienDestinationRetour: true,
    FormDemande_TransportRoutierVersEtablissementDepartRetour: true,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: true,
    Demande_TransportAerienRetourAtterissage: true,
    Demande_TransportAerienDecollageRetour: true,
    Demande_TransportAerienDepart: null,
    Demande_TransportAerienDestination: null,
    FormDemande_TransportRoutierVersEtablissementDestination: null,
    FormDemande_TransportRoutierVersEtablissementDepart: null,
    Demande_TransportAerienATTERISSAGE: null,
    Demande_TransportAerien: null,    
  };
}


return {
    Demande_TransportAerienDepartRetour: null,
    Demande_TransportAerienDestinationRetour: null,
    FormDemande_TransportRoutierVersEtablissementDepartRetour: null,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: null,
    Demande_TransportAerienRetourAtterissage: null,
    Demande_TransportAerienDecollageRetour: null,
    Demande_TransportAerienDepart: true,
    Demande_TransportAerienDestination: true,
    FormDemande_TransportRoutierVersEtablissementDestination: true,
    FormDemande_TransportRoutierVersEtablissementDepart: true,
    Demande_TransportAerienATTERISSAGE: true,
    Demande_TransportAerien: true,
};
