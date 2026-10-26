console.log("Function 26", context);
const user = store.moduleStore.user.roles;
const chauffeur = user.includes("1. CHAUFFEUR");
const responsable = user.includes("1. RESPONSABLE D'ACTIVITÉ");
const coordinateur = user.includes("1. COORDINATEUR");
const admin = user.includes("1. ADMIN");
const dev = user.includes("1. DEVELOPPEUR");
const chargeFac = user.includes("1. CHARGÉ DE LA FACTURATION");
// ONLOADMASTER READONLY
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
  "40307eab-5d1b-4ae2-adae-bcd79c11fcd5": "Profil MCR",
};


const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

const result = {};

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (user.includes("1. ADMIN")) {
      if (docData.STATUS !== "Draft") {
        Object.assign(result, {
          Planification_Récurrence: "true",
        });
      }
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
        IdentifiantFacture: "true",
        DateEnregistrement: "true",
        // Section Planification
        CheckboxMineur: "true",
        PriseEnCharge_LatitudeDépartChauffeur: "true",
        PriseEnCharge_LongitudeDépartChauffeur: "true",
        // Section Devis
        SimulateurPrix_PrixInitialSimulé: "true",
        CalculPrix_CalculKilomètrage: "true",
        CalculPrix_NbKMCouvertForfaitPriseEnCharge: "true",
        CalculPrix_PrixForfaitPriseEnChargeEuro: "true",
        CalculPrix_PrixMiniEuro: "true",
        CalculPrix_PrixParKmEuro: "true",
        CalculPrixBis_PrixInitial: "true",
        SimulateurPrix_Prix: "true",
        CalculPrix_Prix: "true",
      });
    } else {
      if (docData.STATUS !== "Draft") {
        Object.assign(result, {
          Planification_Récurrence: "true",
        });
      }
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
        IdentifiantMission: "true",
        IdentifiantFacture: "true",
        DateEnregistrement: "true",
        // Section Planification
        CheckboxMineur: "true",
        PriseEnCharge_LatitudeDépartChauffeur: "true",
        PriseEnCharge_LongitudeDépartChauffeur: "true",
        // Section Devis
        SimulateurPrix_PrixInitialSimulé: "true",
        CalculPrix_CalculKilomètrage: "true",
        CalculPrix_NbKMCouvertForfaitPriseEnCharge: "true",
        CalculPrix_PrixForfaitPriseEnChargeEuro: "true",
        CalculPrix_PrixMiniEuro: "true",
        CalculPrix_PrixParKmEuro: "true",
        CalculPrixBis_PrixInitial: "true",
        SimulateurPrix_Prix: "true",
        CalculPrix_Prix: "true",
      });
    }
    break;
  case "Véhicule":
    Object.assign(result, { Maison: "true" });
    break;
  case "Volontaire":
    Object.assign(result, { Maison: "true" });
    break;
  case "Disponibilité":
    if (responsable || coordinateur || admin || dev || chargeFac) {
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
      });
    } else if (chauffeur) {
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
        PriseEnCharge_VéhiculeUtilisé: "true",
      });
    } else {
      Object.assign(result, { Maison: "true", IdentifiantDispo: "true" });
    }
    break;
  case "Facture":
    if (!["Brouillon", "Draft"].includes(docData.STATUS)) {
      Object.assign(result, {
        FichierPDFFacture: "true",
        DateEnvoi: "true",
        CoorFactu_Prénom: "true",
        CoorFactu_Nom: "true",
        CoorFactu_Qualité: "true",
        Contact_AdresseRésidence: "true",
        CoorFactu_Rue: "true",
        CoorFactu_Numéro: "true",
        "CoorFactu_Code postal": "true",
        CoorFactu_Ville: "true",
        CoorFactu_Pays: "true",
        AllocataireSocial: "true",
        CalculPrix_Remise: "true",
        PrénomSelected: "true",
        Nom: "true",
        DateDeNaissance: "true",
      });
    }
    Object.assign(result, {
      Maison: "true",
      NuméroFacture: "true",
      FactureStatus: "true",
      MontantPayé: "true",
      IdentifiantMission: "true",
      MontantDû: "true",
      MontantInitial: "true",
      MontantRestantDû: "true",
    });
    break;
  case "Tarif":
    Object.assign(result, { LibelléTarif: "true" });
    break;
  case "Bénéficiaire":
    Object.assign(result, {
      DateEnregistrement: "true",
      IdentifiantMission: "true",
    });
    break;
   case "Profil MCR":
    Object.assign(result, {
      Maison: "true",
    });
    break;
}

return result;
