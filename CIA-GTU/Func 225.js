console.log("Fonction 225", context);

let showValue = {};
const USER_ROLES = context.store.moduleStore.user.roles;
const IS_CHAUFFEUR_OR_TRANSPORTEUR = USER_ROLES.every((role) =>
  ["CHAUFFEUR", "TRANSPORTEUR"].includes(role),
);

if (IS_CHAUFFEUR_OR_TRANSPORTEUR) {
  showValue = {
    //View: Identification
    //Identification de l'usager
    Identite_TypeIdentification: true,
    Identite_Provenance: true,
    Demande_NumeroAssuranceMaladie: true,
    Demande_IdentificationIdentificationUsagerRAMQ: true,
    Demande_NumeroCarteAssurance: true,
    Identite_Expiration: true,
    Identite_Expiration_Required: true,
    Demande_IdentificationUsagerNonexistant: true,
    Demande_IdentificationIdentificationUsagerPrenom: true,
    Demande_IdentificationIdentificationUsagerNom: true,
    Identite_PrenomSearch: true,
    Identite_NomSearch: true,
    Demande_IdentificationIdentificationUsagerDateNaissance: true,
    Demande_IdentificationIdentificationUsagerAge: true,
    Demande_IdentificationIdentificationUsagerSexe: true,
    Identification_LangueAutre: true,
    Identite_Langues: true,

    //Adresse de l'usager
    Identite_Telephone: true,
    Identite_Courriel: true,
    Identite_Adresse: true,
    Identite_Civique: true,
    Identite_Rue: true,
    Identite_Appartement: true,
    Identite_Ville: true,
    Identite_Province: true,
    Identite_CodePostal: true,

    //Caractéristiques
    Demande_IdentificationIdentificationUsagerOxygenodependant: true,
    Demande_IdentificationIdentificationUsagerDebit: true,
    Identite_AutreInfo: true,
    Demande_IdentificationIdentificationUsagerDiabétique: true,
    Demande_IdentificationStatutDiabetiqueEstInsulinodependant: true,
    Demande_PPH: true,
    Demande_TypeClientele: true,
    Patient_Diagnostic: true,
    Demande_IdentificationPoids: true,
    Identification_MesurePoids: true,

    //View: Transport
    //Identification du demandeur
    Demande_TransportIdentificationDemandeurEstAutreDemandeur: true,
    Demande_TransportIdentificationDemandeurPrenomDemandeur: true,
    Demande_TransportIdentificationDemandeurNomDemandeur: true,
    Demande_TransportIdentificationDemandeurTelephoneDemandeur: true,
    Demande_TransportIdentificationDemandeurPoste: true,
    Demande_TransportIdentificationDemandeurCourrielDemandeur: true,
    Demande_TransportIdentificationDemandeurPrenom: true,
    Demande_TransportIdentificationDemandeurNom: true,
    Demande_TransportIdentificationDemandeurTelephone: true,
    Demande_TransportIdentificationDemandeurPosteDemandeur: true,
    Demande_TransportIdentificationDemandeurCourriel: true,
    Demande_transportMedecin: true,
    DemandeTransportUniteAdmin: true,

    //Mesures de précautions
    Demande_IdentificationRisqueContagionTypePrecaution: true,
    Markdown_Precaution: true,
    Demande_IdentificationRisqueContagionPrecisions: true,

    //Équipements requis
    Demande_TransportMobiliteUsagerBesoinAideMobilite: true,

    //USAGER
    Demande_TransportUVetements: true,
    Demande_TransportUFauteuilStandardU: true,
    Demande_TransportUFauteuilMultiPositionU: true,
    Demande_TransportUFauteuilBariatiqueU: true,
    Demande_TransportUFauteuilMotoriseU: true,
    Demande_TransportUCanne: true,
    Demande_TransportUMachette: true,

    //TRANSPORTEUR
    Demande_TransportEOxygeneT: true,
    Etablissement_DebitT: true,
    Demande_TransportAutreEquipements: true,
    Etablissement_DebitM: true,
    "Moniteur+DéfibrilateurT": true,
    Demande_TransportTMatelasImmobilisateur: true,
    Demande_TransportTFauteuilBariatiqueT: true,
    Demande_TransportTFauteuilMultiPositionT: true,
    Demande_TransportTFauteuilStandardT: true,
    Demande_Cviere: true,

    //ÉTABLISSEMENT
    Demande_TransportEOxygene: true,
    Etablissement_Debit: true,
    Demande_TransportERepas: true,
    "Moniteur+Défibrilateur": true,
    Demande_TransportAutreEquipementsOxygeneTigeSolute: true,
    Demande_ToileLevier: true,
    Demande_TransportEBIPAP: true,
    Isolettte: true,
    Demande_TransportAutreEquipementsPompeVolumetrique: true,
    Demande_TransportEMachette: true,
    Demande_TransportECanne: true,
    Demande_TransportFauteuilStandardE: true,

    //Demandes spécifiques
    Demande_TransportDetail: true,

    //Accompagnement
    Demande_TransportDetailsDemandeUsagerBesoinAccompagnateur: true,
    Demande_TransportAccompagnementQuiFourniAccompagnateur: true,
    Accompagnateur_Emploi3: true,
    Accompagnateur_Emploi: true,
    Demande_TransportDetailsDemandeUsagerPrecisez: true,
    Accompagnateur_Emploi2: true,
    Demande_TransportDetailsDemandeUsagerPrecisez2: true,
    Demande_TransportAccompagnementPrenomAccompagnateur: true,
    Demande_TransportAccompagnementNomAccompagnateur: true,
    Demande_TransportAccompagnementAutresInformations: true,
    Demande_TransportAccompagnementPrenomAccompagnateurConfirme: true,
    Demande_TransportAccompagnementNomAccompagnateurConfirme: true,
    Demande_TransportAccompagnementTitreEmploiConfirme: true,
    Demande_TransportAccompagnementAutresInformationsConfirme: true,
    Demande_AccompagnateurHeure: true,
    Demande_AccompagnateurRester: true,
    Demande_AutreAccompagnementCollec: true,

    //Information sur le transport
    Demande_ModeDeTransport: true,
    Demande_TransportInformationTransportTransportAllerRetour: true,
    DemandeTransportInformationsTransportRetour: true,
    Demande_TransportInformationTransportAvecReccurence: true,
    Demande_TransportInformationTransportFrequence: true,
    Demande_TransportInformationTransportJourneesFixes: true,
    Demande_TransportInformationTransportJourneesApplicables: true,
    Demande_TransportInformationTransportDateDebutReccurence: true,
    Demande_TransportInformationTransportDateFinReccurence: true,
    Demande_TypeDeTransport2: true,
    Demande_MotifPrecision: true,
    Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport: true,
    Demande_SurveillanceClinique: true,
    Demande_TransportMobiliteUsagerPositionTransport: true,
    Demande_PositionDetails: true,

    //Départ
    Demande_MemeAdresseUsager: true,
    Demande_TransportTransportSimpleNomLieuDepart: true,
    Demande_TypeAdresseDepart: true,
    Demande_TransportTransportSimpleAdresseCompleteDepart: true,
    Demande_TransportTransportSimpleNomVilleDepart: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeDepart: true,
    Demande_TransportTransportSimpleNumeroAdresseDepart: true,
    Demande_TransportTransportSimpleNumeroTelephone1Depart: true,
    Demande_TransportTransportSimpleNumeroTelephone2Depart: true,
    Demande_TransportTransportSimpleDateTransportDepart: true,
    Demande_TransportTransportSimpleHeureDepartSouhaitee: true,

    //LIEU DE DÉPART
    Demande_TransportTransportSimpleDateTransportDepart: true,
    Demande_TransportTransportSimpleHeureDepartSouhaitee: true,
    Demande_TransportTransportSimpleNomLieuDepart: true,
    Demande_TypeAdresseDepart: true,
    Demande_TransportTransportSimpleAdresseCompleteDepart: true,
    Demande_TransportTransportSimpleNomVilleDepart: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeDepart: true,
    Demande_TransportTransportSimpleNumeroAdresseDepart: true,
    Demande_TransportTransportSimpleNumeroTelephone1Depart: true,
    Demande_TransportTransportSimpleNumeroTelephone2Depart: true,

    //LIEU DE DÉPART (Retour)
    Demande_TransportTransportSimpleDateTransportDepart: true,
    Demande_MoyenTransportDeLAeroport: true,
    Demande_TransportRoutierLieuDepart: true,
    Demande_TransportRotierAdresseComplete: true,
    Demande_TransportRoutierVilleDepart: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeDepart: true,
    Demande_TransportTransportSimpleNumeroAdresseDepart: true,
    Demande_TransportAerienDepartRetourNumeroTelephone: true,
    Demande_TransportAerienDepartRetourPoste: true,

    //LIEU DE DÉCOLLAGE
    TransportAerien_Dateatterrissage: true,
    TransportAerien_Heureatterrissage: true,
    TransportAerien_Lieuatterrissage: true,
    Demande_TransportTransportSimpleAdresseCompleteDestination: true,
    Transport_PorteEmbarquement: true,
    Demande_TransportTransportSimpleNumeroTelephone1Arrivee: true,
    Demande_TransportTransportSimpleNumeroTelephone2Arrivee: true,
    TransportAerien_Remarque: true,

    //LIEU DE DÉCOLLAGE (Retour)
    Demande_TransportAerienRetourDecollageDate: true,
    TransportAerien_Lieuatterrissage: true,
    Demande_TransportAerienRetourAddresseComplete: true,
    Demande_TransportAerienRetourRemarque: true,

    //Destination
    Demande_MemeAdresseUsagerRetour: true,
    Demande_TransportTransportSimpleNomLieuDestination: true,
    Demande_TypeAdresseDestination: true,
    Demande_TransportTransportSimpleAdresseCompleteDestination: true,
    Demande_TransportTransportSimpleNomVilleDestination: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeArrivee: true,
    Demande_TransportTransportSimpleNumeroAdresseArrivee: true,
    Demande_TransportTransportSimpleNumeroTelephone1Arrivee: true,
    Demande_TransportTransportSimpleNumeroTelephone2Arrivee: true,
    Demande_TransportTransportSimpleDateTransportArrivee: true,
    Demande_TransportTransportSimpleHeureArriveeSouhaite: true,
    Demande_TransportsimpleHeuredErendezVous: true,
    Demande_TransportSimplePossibiliteDeModifierRV: true,
    Demande_TransportSimpleDe: true,
    Demande_TransportSimpleA: true,

    //LIEU D'ATTERRISSAGE (Retour)
    Demande_TransportAerienRetourAtterrissage: true,
    TransportAerien_Heureatterrissage2: true,
    TransportAerien_LieuAtterrissage2: true,
    TransportAerien_AdresseAtterissage: true,
    Demande_TransportAerienRetourAtterrissageTelephone: true,
    Demande_TransportAerienRetourAtterrissagePoste: true,
    Demande_TransportAerienRetourAtterrissageRemarques: true,

    //Départ (Retour)
    Demande_TransportTransportRetourAdresseDepartEstDifferente: true,
    Demande_TransportTransportRetourNomLieuDepart: true,
    Demande_TypeAdresseRetourDepart: true,
    Demande_TransportTransportRetourAdresseCompleteDepart: true,
    Demande_TransportTransportRetourNomVilleDepart: true,
    Demande_TransportTransportRetourUnitePriseEnChargeDepart: true,
    Demande_TransportTransportRetourNumeroAdresseDepart: true,
    Demande_TransportTransportRetourNumeroTelephone1Depart: true,
    Demande_TransportTransportRetourNumeroTelephone2Depart: true,
    Demande_TransportTransportRetourDateTransportDepart: true,
    Demande_TransportTransportRetourHeureDepartSouhaitee: true,

    //Destination (Retour)
    Demande_TransportTransportRetourAdresseDestinationEstDifferente: true,
    Demande_MemeAdresseUsagerRetourDestination: true,
    Demande_TransportTransportRetourNomLieuDestination: true,
    Demande_TypeAdresseRetourDestination: true,
    Demande_TransportTransportRetourAdresseCompleteDestination: true,
    Demande_TransportTransportRetourNomVilleDestination: true,
    Demande_TransportTransportRetourUnitePriseEnChargeArrivee: true,
    Demande_TransportTransportRetourNumeroAdresseArrivee: true,
    Demande_TransportTransportRetourNumeroTelephone1Arrivee: true,
    Demande_TransportTransportRetourNumeroTelephone2Arrivee: true,
    Demande_TransportTransportRetourDateTransportArrivee: true,
    Demande_TransportTransportRetourHeureArriveeSouhaite: true,

    //LIEU DE DESTINATION
    Demande_TransportRotierDate: true,
    Demande_TransportTransportSimpleHeureArriveeSouhaite: true,
    Demande_MemeAdresseUsagerRetour: true,
    Demande_TransportAerienLieuReceveur: true,
    Demande_TypeAdresseDestination: true,
    Demande_TransportAerienReceveur: true,
    Demande_TransportRoutierVilleDeDestination: true,
    Demande_TransportTransportSimpleUnitePriseEnChargeArrivee: true,
    Demande_TransportRoutierChambre: true,
    Demande_TransportRoutierTelephone: true,
    Demande_TransportRoutierPoste: true,

    //Information additionnelle (au besoin)
    RetourAdomicileDen: true,
    RetourAdomicileAsc: true,
    RetourAdomicileMarche: true,
    RetourAdomicileEntree: true,
    RetourAdomicileMarcheExt: true,
    RetourAdomicileEtage: true,
    RetourAdomicileCommentaire: true,

    //Choix de transport
    Demande_TransportDetailsDemandeTypeTransporteurPrimaire: true,
    Demande_TransportDetailsDemandeTypeTransporteurAlternatif1: true,
    Demande_TransportDetailsDemandeTypeTransporteurAlternatif2: true,
    Demande_SuggestionTransRoutierVersAeroportPrimaire: true,
    Demande_SuggestionTransRoutierVersAeroportAlt: true,
    Demande_SuggestionTransRoutierVersAeroportAlt2: true,
    ChoixTransport: true,
    ChoixTransportAerien: true,
    Demande_MoyenTransportVersAeroport: true,
    Demande_Priorite: true,
    Demande_MoyenTransportVersDestination: true,
    Demande_TransportAutresInformations: true,

    //LIEU D'ATTERRISSAGE
    TransportAerien_Dateatterrissage2: true,
    TransportAerien_LieuAtterrissage2: true,
    TransportAerien_AdresseAtterissage: true,
    TransportAerien_AtterrisageRemarque: true,

    //TRANSPORT DE L'AÉROPORT VERS L'ETABLISSEMENT RECEVEUR
    Demande_TransportTransportSimpleDateTransportArrivee: true,
    Demande_MoyenTransportDeLAeroport: true,
    Demande_TransportRoutierLieuDestination: true,
    Demande_TransportRoutierAdresseDeDestination: true,
    Demande_TransportRoutierVilleDeDestination: true,
    Demande_TransportRoutierUniteDest: true,
    Demande_TransportRoutierChambre: true,
    Demande_TransportRoutierTelephone: true,
    Demande_TransportRoutierPoste: true,

    //Agent payeur
    Demande_AgentPayeur: true,
    AgentPayeur_Autre: true,
    Demande_TransportIdentificationDemandeurCentreUniteAImputer: true,
    Demande_AgentPayeurNaturePaiement: true,
  };
}

return showValue;
