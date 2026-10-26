console.log("Function 103 - prefill collections", context);
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
};

const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];
let data = {};

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (
      mcrDictionary[AREA] &&
      docData.STATUS === "Draft" &&
      !docData.CC_Destinations.length
    ) {
      data = {
        Téléphones: [{}],
        "E-mails": [{}],
        "Contacts supplémentaires": [{}],
        AdressePreférées: [{}],
        CC_Destinations: [{}],
      };
    }
    break;
  case "Facture":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      data = {
        Relances: [{}],
        Paiements: [{}],
      };
    }
    break;
  case "Véhicule":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
    }
    break;
  case "Volontaire":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      data = {
        Téléphones: [{}],
        "E-mails": [{}],
        "Contacts supplémentaires Chauffeur": [{}],
      };
    }
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
    }
    break;
  case "Bénéficiaire":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      data = {
        Téléphones: [{}],
        "E-mails": [{}],
        AdressePreférées: [{}],
        "Contacts supplémentaires": [{}],
      };
    }
    break;
  default:
    break;
}

callback({
  data: data,
});
