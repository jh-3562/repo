console.log("Function 134", context);

/**
 * Check if the fieldValue obtained thanks to data[fieldKey]
 * represent an empty field.
 * @param {string} fieldValue
 * @returns {bool}
 */
const fieldIsEmpty = (fieldValue) => {
  return [undefined, ""].includes(fieldValue);
};

// ONLOADMASTER SHOW FIELD
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

const noDeleteStatus = ["Draft", "Supprimé(e)"];

const { STATUS } = docData;
const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];
const isDev = store.moduleStore.user.roles.includes("1. DEVELOPPEUR");

const result = {};

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (mcrDictionary[AREA] && !isDev) {
      Object.assign(result, {
        "AdressePreférées|500|Rue": null,
        "AdressePreférées|510|Numéro": null,
        "AdressePreférées|520|Code_postal": null,
        "AdressePreférées|530|Ville": null,
        "AdressePreférées|540|Pays": null,
        "AdressePreférées|800|Latitude": null,
        "AdressePreférées|810|Longitude": null,
      });
      switch (docData.STATUS) {
        case "Annulée":
          Object.assign(result, {
            RaisonAnnulation: true,
            RaisonRefus: null,
          });
          break;
        case "Refusée":
          Object.assign(result, {
            RaisonAnnulation: null,
            RaisonRefus: true,
          });
          break;
      }
      // Hide Récurrence Field when the form is an occurrence
      if (
        docData.Planification_Récurrence === "Une seule fois" &&
        !fieldIsEmpty(docData.IdentifiantFormulaireRécurrence)
      ) {
        Object.assign(result, {
          Planification_Récurrence: null,
        });
      } else {
        Object.assign(result, {
          Planification_Récurrence: true,
        });
      }
    }
    break;
  case "Facture":
    break;
  case "Véhicule":
    break;
  case "Volontaire":
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    // Hide Récurrence Field when the form is an occurrence
    if (
      docData.Planification_Récurrence === "Une seule fois" &&
      !fieldIsEmpty(docData.IdentifiantFormulaireRécurrence)
    ) {
      Object.assign(result, {
        Planification_Récurrence: null,
      });
    } else {
      Object.assign(result, {
        Planification_Récurrence: true,
      });
    }
    break;
  case "Bénéficiaire":
    if (mcrDictionary[AREA] && !isDev) {
      Object.assign(result, {
        "AdressePreférées|500|Rue": null,
        "AdressePreférées|510|Numéro": null,
        "AdressePreférées|520|Code_postal": null,
        "AdressePreférées|530|Ville": null,
        "AdressePreférées|540|Pays": null,
        "AdressePreférées|800|Latitude": null,
        "AdressePreférées|810|Longitude": null, // hide
      });
    }
    break;
  case "Profil MCR":
    break;
  default:
    break;
}

return result;
