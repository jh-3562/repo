console.log("Function 130", context);

// -------------------- SETUP --------------------
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
};

const noDeleteStatus = ["Draft", "Supprimé(e)"];

const { STATUS } = docData;
const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

// -------------------- ROLES --------------------
const roles = store.moduleStore.user.roles;

const isDev = roles.includes("1. DEVELOPPEUR");

const isPrivileged =
  isDev ||
  roles.includes("1. RESPONSABLE D'ACTIVITÉ") ||
  roles.includes("1. COORDINATEUR") ||
  roles.includes("1. ADMIN") ||
  roles.includes("1. CHARGÉ DE LA FACTURATION") ||
  roles.includes("1. DISPATCHEUR");

// -------------------- BASE RESULT --------------------
const baseResult = {
  BatchSauvegarder: null,
  BatchMissionOccurence: null,
  Section_Mission_enCoursFactu: null,
  BatchMission: null,
  RaisonAnnulationOuRefus: null,
  BatchAccepterMission: null,
  BatchMissionRecurrence: null,
  MarkdownRécurrenceDispo: null,
};

// -------------------- HELPERS --------------------
const isAcceptedOrRefused = STATUS === "Acceptée" || STATUS === "Refusée";

const isRecurrent =
  docData.Planification_Récurrence === "Par semaine" ||
  docData.Planification_Récurrence === "Par jour spécifique";

const isSourceRecurrence =
  docData?.isOccurence !== "true" &&
  docData?.Planification_Récurrence !== "Une seule fois";

const reccurence = docData.Planification_Récurrence;
const hasRecurrence =
  docData.IdentifiantFormulaireRécurrence ||
  (reccurence && reccurence !== "Une seule fois");

console.log("isSourceRecurrence", isSourceRecurrence);

// -------------------- SWITCH --------------------
switch (FORMLAYOUTNAME) {
  case "Mission": {
    if (!mcrDictionary[AREA]) break;

    let result = { ...baseResult };

    // -------------------- STATUS --------------------
    if (STATUS === "Annulée") {
      result.BatchAccepterMission = true;
      result.RaisonAnnulationOuRefus = true;
    } else if (["À facturer", "Facturée"].includes(STATUS)) {
      result.BatchMissionOccurence = isSourceRecurrence ? null : true;
      result.BatchMissionRecurrence = isSourceRecurrence ? true : null;
    } else if (STATUS === "Facturation en cours") {
      result.BatchMissionOccurence = isSourceRecurrence ? null : true;
      result.BatchMissionRecurrence = isSourceRecurrence ? true : null;
    } else if (STATUS === "Acceptée") {
      result.BatchMissionRecurrence = isSourceRecurrence ? true : null;
    } else if (STATUS === "Draft") {
      result.BatchSauvegarder = true;
    } else if (STATUS === "Refusée") {
      return {
        ...result,
        RaisonAnnulationOuRefus: true,
      };
    }

    // -------------------- PRIVILEGED --------------------
    if (isPrivileged && isAcceptedOrRefused && !isSourceRecurrence) {
      result.BatchMission = isRecurrent ? true : null;
      result.BatchMissionOccurence = isRecurrent ? null : true;
    }

    // -------------------- RÉCURRENCE --------------------
    if (hasRecurrence) {
      result.MarkdownRécurrenceDispo = true;
    }

    // -------------------- NON PRIVILEGED --------------------
    if (!isPrivileged) {
      return baseResult;
    }

    return result;
  }

  case "Véhicule":
    if (mcrDictionary[AREA]) {
      return {
        BatchVolontaire: null,
        Vehicule_Information_Dev: isDev ? true : null,
      };
    }
    break;

  case "Volontaire":
    if (mcrDictionary[AREA] && noDeleteStatus.includes(STATUS)) {
      return {
        BatchVolontaire: null,
      };
    }
    break;

  case "Disponibilité": {
    const isDraftInMcr = mcrDictionary[AREA] && STATUS === "Draft";
    // La section BatchDisponibilité (Enregistrer + Supprimer d'une disponibilité existante)
    // est réservée aux rôles privilégiés : un chauffeur peut seulement créer des disponibilités.
    const canEditExistingDisponibilite = isPrivileged && !isDraftInMcr;

    return {
      BatchDisponibilité: canEditExistingDisponibilite ? true : null,
      Enregistrer_Disponibilite: isDraftInMcr ? true : null,
    };
  }

  default:
    break;
}
