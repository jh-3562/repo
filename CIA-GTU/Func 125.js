console.log("Fonction 125", context);

const mode = docData?.Demande_ModeDeTransport;
const retourAerien = docData?.DemandeTransportInformationsTransportRetour === "true"; 
const showRetourRoutier =
  docData?.Demande_TransportInformationTransportTransportAllerRetour === "true"
    ? "true"
    : null;


const r = {

  Demande_TransportAerien: null,
  Demande_TransportAerienATTERISSAGE: null,
  Demande_TransportAerienDepart: null,
  Demande_TransportAerienDestination: null,


  Demande_TransportAerienDepartRetour: null,
  Demande_TransportAerienDestinationRetour: null,


  FormDemande_TransportRoutierVersEtablissementDepart: null,
  FormDemande_TransportRoutierVersEtablissementDestination: null,
  FormDemande_TransportRoutierVersEtablissementDepartRetour: null,
  FormDemande_TransportRoutierVersEtablissementDestinationRetour: null,


  Demande_TitreAller: null,
  Demande_TitreRetour: null,


  FormDemande_TransportTransportSimpleSectionDepart: null,
  FormDemande_TransportTransportSimpleSectionDestination: null,


  FormDemande_TransportTransportRetourSectionDepart: null,
  FormDemande_TransportTransportRetourSectionDestination: null,
};

if (mode === "Aérien") {
  
  r.Demande_TransportAerien = true;
  r.Demande_TransportAerienATTERISSAGE=true;

  if (retourAerien) {
    r.Demande_TransportAerienDepartRetour = true;
    r.Demande_TransportAerienDestinationRetour = true;
    r.FormDemande_TransportRoutierVersEtablissementDepartRetour = true;
    r.FormDemande_TransportRoutierVersEtablissementDestinationRetour = true;
    r.Demande_TransportAerienDepart = null;
    r.Demande_TransportAerienDestination = null;
  } else {
    r.Demande_TransportAerienDepart = true;
    r.Demande_TransportAerienDestination = true;
    r.FormDemande_TransportRoutierVersEtablissementDestination= true,
    r.FormDemande_TransportRoutierVersEtablissementDepart= true,

    
    r.Demande_TransportAerienDepartRetour = null;
    r.Demande_TransportAerienDestinationRetour = null;
  }

  
}

else if (mode === "Routier") {
  
  r.Demande_TransportAerien = null;
  r.Demande_TransportAerienATTERISSAGE= null;
  r.Demande_TransportAerienDepart = null;
  r.Demande_TransportAerienDestination = null;
  r.Demande_TransportAerienDepartRetour = null;
  r.Demande_TransportAerienDestinationRetour = null;


  r.Demande_TitreAller = true;
  r.FormDemande_TransportTransportSimpleSectionDepart = true;
  r.FormDemande_TransportTransportSimpleSectionDestination = true;

  
  r.FormDemande_TransportTransportRetourSectionDepart = showRetourRoutier;
  r.FormDemande_TransportTransportRetourSectionDestination = showRetourRoutier;
  r.Demande_TitreRetour = showRetourRoutier;

  
} else {
  
}

return r;
