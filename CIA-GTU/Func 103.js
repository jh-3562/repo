console.log("onloadMasterReadOnly", context);

// ----- Contantes -----
const ROLES = store.moduleStore.user.roles;


const ABITIBI_FORMLAYOUTID_DEMANDE = "dadaf75a-cd49-4cba-8060-2ac15155478f";


// ----- Fonction principale -----
switch (docData.FORMLAYOUTID) {
  case ABITIBI_FORMLAYOUTID_DEMANDE:

    return {
        Demande_IdentificationIdentificationUsagerPrenom: true,
        Demande_IdentificationIdentificationUsagerNom: true,
       Demande_IdentificationIdentificationUsagerSexe: true,
       Demande_IdentificationIdentificationUsagerDateNaissance: true,
       Identite_Expiration_Required: true,
       //Identite_Langues: true,
       //Identite_Adresse: true,
       //Identite_Rue: true,
       //Identite_Ville: true,
       //Identite_Province: true,
       //Identite_CodePostal: true,
       //Identite_Civique: true,
       //Identite_Appartement: true,
       //Identite_Telephone: true
        };
}

