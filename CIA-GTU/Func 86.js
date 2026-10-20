console.log("Fonction 86", context);

const mode = docData?.Demande_ModeDeTransport;
const allerRetourValue = docData?.Demande_TransportInformationTransportTransportAllerRetour;
const hasAllerRetour = allerRetourValue === true || allerRetourValue === "true" ;
  


//MODE AÉRIEN
if (mode === "Aérien") {
  return {
    Demande_TransportAerienDepart: true,
    Demande_TransportAerienDestination: true,
    Demande_TransportAerien: true,
    Demande_TransportAerienATTERISSAGE: true,
    
    FormDemande_TransportRoutierVersEtablissementDepart: true,
    FormDemande_TransportRoutierVersEtablissementDestination: true,
    Demande_TitreAller: null,
    Demande_TitreRetour: null,


    FormDemande_TransportTransportSimpleSectionDepart: null,
    FormDemande_TransportTransportSimpleSectionDestination: null,
    FormDemande_TransportTransportRetourSectionDepart: null,
    FormDemande_TransportTransportRetourSectionDestination: null,
    
  };
}

// MODE ROUTIER
if (mode === "Routier") {
  console.log("Ok");
  return {
    Demande_TransportAerienDepart: null, 
    Demande_TransportAerienDestination: null,
    Demande_TransportAerien: null,
    Demande_TransportAerienATTERISSAGE:null,
    Demande_TransportAerienDestinationRetour: null,
    Demande_TransportAerienDestination: null,
    Demande_TransportAerienDepart: null,
    Demande_TransportAerienRetourAtterissage : null,
    FormDemande_TransportRoutierVersEtablissementDepart: null,
    FormDemande_TransportRoutierVersEtablissementDestination: null,
    Demande_TransportAerienDepartRetour: null,
    FormDemande_TransportRoutierVersEtablissementDepartRetour: null,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: null,
    Demande_TitreAller: hasAllerRetour ? true : null,
    Demande_TitreRetour: hasAllerRetour ? true : null,
    FormDemande_TransportTransportSimpleSectionDepart: true,
    FormDemande_TransportTransportSimpleSectionDestination: true,
    FormDemande_TransportTransportRetourSectionDepart: hasAllerRetour ? true : null,
    FormDemande_TransportTransportRetourSectionDestination: hasAllerRetour ? true : null,
     Demande_TransportAerienDecollageRetour: null,
  };
}


return {
  Demande_TransportAerienDepart: null,
  Demande_TransportAerienDestination: null,
  Demande_TransportAerien: null,
  Demande_TransportAerienATTERISSAGE: null,
  Demande_TransportAerienDecollageRetour: null,

  FormDemande_TransportRoutierVersEtablissementDepart: null,
  FormDemande_TransportRoutierVersEtablissementDestination: null,
  Demande_TitreAller: null,
  Demande_TitreRetour: null,

  FormDemande_TransportTransportSimpleSectionDepart: true,
  FormDemande_TransportTransportSimpleSectionDestination: true,
  FormDemande_TransportTransportRetourSectionDepart: null,
  FormDemande_TransportTransportRetourSectionDestination: null,
};
