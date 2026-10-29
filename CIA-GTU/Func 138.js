console.log("function 138", context);

const type = String(docData?.SystemeCache_TypeTransport || "").trim();
// Valeurs possibles :
// "Aller", "Retour", "Aller(Aérien)", "Retour(Aérien)"

// ---------------- ALLER (ROUTIER) ----------------
if (type === "Aller") {
  return {
    FormDemande_TransportTransportSimpleSectionDepart: true,
    Demande_TitreAller: true,
    FormDemande_TransportTransportSimpleSectionDestination: true,

    // Tout aérien caché
    Demande_TransportAerienDepart: null,
    Demande_TransportAerienDestination: null,
    Demande_TransportAerien: null,
    Demande_TransportAerienATTERISSAGE: null,
    Demande_TransportAerienLieuReceveur: null,
    Demande_TransportTransportSimpleNomLieuDestination: null,

    // Routier vers établissement (retour) caché
    FormDemande_TransportRoutierVersEtablissementDepartRetour: null,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: null,

    // Retour routier caché
    Demande_TitreRetour: null,
    FormDemande_TransportTransportRetourSectionDepart: null,
    FormDemande_TransportTransportRetourSectionDestination: null,

    // Aérien retour caché
    Demande_TransportAerienDepartRetour: null,
    Demande_TransportAerienDestinationRetour: null,

    // Champs routier vers établissement (aller) caché
    FormDemande_TransportRoutierVersEtablissementDepart: null,
    FormDemande_TransportRoutierVersEtablissementDestination: null,
  };
}

// ---------------- RETOUR (ROUTIER) ----------------
if (type === "Retour") {
  return {
    Demande_TitreRetour: true,
    FormDemande_TransportTransportRetourSectionDepart: true,
    FormDemande_TransportTransportRetourSectionDestination: true,

    // Aller routier caché
    FormDemande_TransportTransportSimpleSectionDepart: null,
    Demande_TitreAller: null,
    FormDemande_TransportTransportSimpleSectionDestination: null,

    // Tout aérien caché
    Demande_TransportAerienDepart: null,
    Demande_TransportAerienDestination: null,
    Demande_TransportAerien: null,
    Demande_TransportAerienATTERISSAGE: null,
    Demande_TransportAerienLieuReceveur: null,
    Demande_TransportTransportSimpleNomLieuDestination: null,

    // Aérien retour caché
    Demande_TransportAerienDepartRetour: null,
    Demande_TransportAerienDestinationRetour: null,

    // Routier vers établissement (retour) caché (si tu veux l'afficher ici dis-le)
    FormDemande_TransportRoutierVersEtablissementDepartRetour: null,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: null,

    // Champs routier vers établissement (aller) caché
    FormDemande_TransportRoutierVersEtablissementDepart: null,
    FormDemande_TransportRoutierVersEtablissementDestination: null,
  };
}

// ---------------- ALLER (AÉRIEN) ----------------
if (type === "Aller(Aérien)" || type === "Aller(Aerien)") {
  return {
    // Montrer Aérien (selon ce que tu as demandé)
    Demande_TransportAerienDepartRetour: true,
    Demande_TransportAerienDestinationRetour: true,
    Demande_TransportAerien: true,
    Demande_TransportAerienATTERISSAGE: true,
    FormDemande_TransportRoutierVersEtablissementDepartRetour: true,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: true,

    // Cacher Routier simple (aller/retour)
    FormDemande_TransportTransportSimpleSectionDepart: null,
    Demande_TitreAller: null,
    FormDemande_TransportTransportSimpleSectionDestination: null,

    Demande_TitreRetour: null,
    FormDemande_TransportTransportRetourSectionDepart: null,
    FormDemande_TransportTransportRetourSectionDestination: null,

    // Cacher autres champs Aérien non utilisés ici
    Demande_TransportAerienDepart: null,
    Demande_TransportAerienDestination: null,
    Demande_TransportAerienLieuReceveur: null,
    Demande_TransportTransportSimpleNomLieuDestination: null,

    // Champs routier vers établissement (aller) caché
    FormDemande_TransportRoutierVersEtablissementDepart: null,
    FormDemande_TransportRoutierVersEtablissementDestination: null,
  };
}

// ---------------- RETOUR (AÉRIEN) ----------------
if (type === "Retour(Aérien)" || type === "Retour(Aerien)") {
  return {
    // Montrer Aérien retour (ta règle spécifique)
    Demande_TransportAerienDepartRetour: true,
    Demande_TransportAerienDestinationRetour: true,
    Demande_TransportAerien: true,
    Demande_TransportAerienATTERISSAGE: true,
    Demande_TransportAerienLieuReceveur: true,
    Demande_TransportTransportSimpleNomLieuDestination: true,
    FormDemande_TransportRoutierVersEtablissementDestinationRetour: true,

    // Cacher le reste
    FormDemande_TransportRoutierVersEtablissementDepartRetour: null,

    FormDemande_TransportTransportSimpleSectionDepart: null,
    Demande_TitreAller: null,
    FormDemande_TransportTransportSimpleSectionDestination: null,

    Demande_TitreRetour: null,
    FormDemande_TransportTransportRetourSectionDepart: null,
    FormDemande_TransportTransportRetourSectionDestination: null,

    Demande_TransportAerienDepart: null,
    Demande_TransportAerienDestination: null,

    FormDemande_TransportRoutierVersEtablissementDepart: null,
    FormDemande_TransportRoutierVersEtablissementDestination: null,
  };
}

// ---------------- SÉCURITÉ ----------------
return {
  FormDemande_TransportTransportSimpleSectionDepart: null,
  Demande_TitreAller: null,
  FormDemande_TransportTransportSimpleSectionDestination: null,

  Demande_TitreRetour: null,
  FormDemande_TransportTransportRetourSectionDepart: null,
  FormDemande_TransportTransportRetourSectionDestination: null,

  Demande_TransportAerienDepart: null,
  Demande_TransportAerienDestination: null,
  Demande_TransportAerien: null,
  Demande_TransportAerienATTERISSAGE: null,
  Demande_TransportAerienLieuReceveur: null,
  Demande_TransportTransportSimpleNomLieuDestination: null,

  Demande_TransportAerienDepartRetour: null,
  Demande_TransportAerienDestinationRetour: null,

  FormDemande_TransportRoutierVersEtablissementDepart: null,
  FormDemande_TransportRoutierVersEtablissementDestination: null,
  FormDemande_TransportRoutierVersEtablissementDepartRetour: null,
  FormDemande_TransportRoutierVersEtablissementDestinationRetour: null,
};
