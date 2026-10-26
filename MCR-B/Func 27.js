console.log("Function 27", context);

// ONLOADMASTER FILL FIELD
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

const { USER } = docData;
const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (mcrDictionary[AREA]) {
      if (docData.STATUS === "Draft") {
        return {
          Maison: mcrDictionary[AREA],
          Téléphones: [{ "Téléphones|2|Téléphone": "" }],
          CalculPrix_Remise: "0",
          CC_Retour: "true",
          CheckboxResterAvecBene: "true",
        };
      }
      return {
        InformationsAdmin_LastKnownDateHeureFin:
          docData.InformationsAdmin_DateHeureFin,
      };
    }
    break;
  case "Facture":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return { Maison: mcrDictionary[AREA] };
    }
    if (docData.Paiements === "0" || !docData.Paiements) {
      return { Maison: mcrDictionary[AREA], Paiements: "1" };
    }
    break;
  case "Véhicule":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return { Maison: mcrDictionary[AREA] };
    }
    break;
  case "Volontaire":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return {
        Maison: mcrDictionary[AREA],
      };
    }
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return { Maison: mcrDictionary[AREA] };
    }
    break;
  case "Bénéficiaire":
    return {
      IdentifiantMission: docData.FORMID,
    };
    break;
  case "Profil MCR":
    return {
      Maison: mcrDictionary[AREA],
    };
    break;
  default:
    break;
}
