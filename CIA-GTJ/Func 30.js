console.log("onloadMasterReadOnly", context);

// ----- Contantes -----
const ROLES = store.moduleStore.user.roles;

const Demande = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
const Transport = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";
const AdressesFrequentes = "83b870bf-197a-4d47-96b0-a9df225b43b8";

// ----- Fonction principale -----
switch (docData.FORMLAYOUTID) {
  case AdressesFrequentes:
  case Transport:
  case Demande:
    return {
      DemandeRetourD_NomDuLieu: true,
      DemandeRetourD_Adresse: true,
      DemandeRetourD_Ville: true,
      DemandeRetourA_NomDuLieu: true,
      DemandeRetourA_Adresse: true,
      DemandeRetourA_Ville: true,
      Demande_IdentificationIdentficationUsagerPrénom: true,
      Demande_IdentificationIdentficationUsagerNom: true,
      Demande_IdentificationIdentficationUsagerSexe: true,
      Demande_IdentificationIdentficationUsagerDateNaissance: true,
      Demande_IdentificationIdentficationUsagerÂge: true,
      Transport_RaisonHorsDelai: true,
      Demande_DateHeureApprobation: true,
      Demande_UtilisateurApprobateur: true,
    };
}
