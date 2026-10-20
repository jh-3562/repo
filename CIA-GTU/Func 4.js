console.log('Function 4 - onloadMasterShowField', context);

// ----- Contantes -----
const ROLES = store.moduleStore.user.roles;

const ABITIBI_FORMLAYOUTID_ADRESSES_FREQUENTES = '57b370ea-db0d-432c-adbc-3bae18ba0f59';
const ABITIBI_FORMLAYOUTID_DEMANDE = 'dadaf75a-cd49-4cba-8060-2ac15155478f';
const ABITIBI_FORMLAYOUTID_LISTE_RAPPEL = 'da97587b-2bcd-4f01-a018-4b841796f6ae';
const ABITIBI_FORMLAYOUTID_PARAMETRES_OPTIMISATION = 'e371bcfb-1eba-4f0e-aeac-a528b22667e5';
const ABITIBI_FORMLAYOUTID_SECTEUR = 'e8a6a064-c6d8-4707-a318-97e4b6e35d11';
const ABITIBI_FORMLAYOUTID_TRANSPORT = '7242b957-a155-462e-ba68-c80f46751676';
const ABITIBI_FORMLAYOUTID_TRANSPORTEUR = '3c0b9af1-fb35-4ee9-bcc7-394aa9a580a1';
const ABITIBI_FORMLAYOUTID_USAGER = '7e0a41c7-b3f3-4c91-aaad-461caf36cb2e';
const ABITIBI_FORMLAYOUTID_UTILISATEUR = 'a9eaa665-43df-418c-91ce-c35d78992807';

const common = {
  ChampInvisible: false,
  Demande_MarkdownInvisible: false,
};
let value = {};

const roles = store.moduleStore.user.roles;

// ----- Fonction principale -----
switch (docData.FORMLAYOUTID) {
  case ABITIBI_FORMLAYOUTID_ADRESSES_FREQUENTES:
    break;
  case ABITIBI_FORMLAYOUTID_DEMANDE:
    const isChauffeurOrTransporteur = roles.some((role) =>
      ['CHAUFFEUR', 'TRANSPORTEUR'].includes(role)
    );
    value = {
      ...(isChauffeurOrTransporteur
        ? {
            Demande_IdentificationIdentificationUsagerRAMQ: null,
            Identite_Expiration_Required: null,
            Identite_Provenance: null,
            Demande_NumeroAssuranceMaladie: null,
            Demande_NumeroCarteAssurance: null,
            Identite_Expiration: null,
            Identite_Adresse: null,
            Identite_Civique: null,
            Identite_Rue: null,
            Identite_Appartement: null,
            Identite_Ville: null,
            Identite_Province: null,
            Identite_CodePostal: null,
            Demande_AccompagnateurHeure: null,
            Demande_TransportAccompagnementQuiFourniAccompagnateur: null,
            Accompagnateur_Emploi: null,
            Demande_AccompagnateurRester: null,
            Accompagnateur_Emploi3: null,
            Accompagnateur_Emploi2: null,
            Demande_TransportAccompagnementPrenomAccompagnateurConfirme: null,
            Demande_TransportAccompagnementNomAccompagnateurConfirme: null,
            Demande_TransportAccompagnementTitreEmploiConfirme: null,
            Demande_TransportAccompagnementAutresInformationsConfirme: null,
          }
        : {}),
    };
    break;
  case ABITIBI_FORMLAYOUTID_LISTE_RAPPEL:
    break;
  case ABITIBI_FORMLAYOUTID_PARAMETRES_OPTIMISATION:
    break;
  case ABITIBI_FORMLAYOUTID_SECTEUR:
    break;
  case ABITIBI_FORMLAYOUTID_TRANSPORT:
    break;
  case ABITIBI_FORMLAYOUTID_TRANSPORTEUR:
    break;
  case ABITIBI_FORMLAYOUTID_USAGER:
    value = {
      Identite_NumeroAssuranceMaladieAB: null,
      Identite_NumeroAssuranceMaladieBC: null,
      Identite_NumeroAssuranceMaladieMB: null,
      Identite_NumeroAssuranceMaladieON: null,
      Identite_NumeroAssuranceMaladieSK: null,
      Identite_NumeroAssuranceMaladieNB: null,
      Identite_NumeroAssuranceMaladieNS: null,
      Identite_NumeroAssuranceMaladiePE: null,
      Identite_NumeroAssuranceMaladieNL: null,
      Identite_NumeroAssuranceMaladieNT: null,
      Identite_NumeroAssuranceMaladieNU: null,
      Identite_NumeroAssuranceMaladieYT: null,
    };
    break;
  case ABITIBI_FORMLAYOUTID_UTILISATEUR:
    break;
}

return {
  ...common,
  ...value,
};
