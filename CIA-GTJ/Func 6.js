console.log("Fonction 6", context);

let result = {};

if (docData.Demande_Transport_FréquenceRécurrence === "Hebdomadaire") {
  result = {
    Demande_JourneesApplicables: true,
    Demande_DateDebutRecurrences: true,
    Demande_DateFinRecurrences: true,
    Demande_DatesRecurrences: null,
  };
} else if (docData.Demande_Transport_FréquenceRécurrence === "Variable") {
  result = {
    Demande_JourneesApplicables: null,
    Demande_DateDebutRecurrences: null,
    Demande_DateFinRecurrences: null,
    Demande_DatesRecurrences: true,
  };
} else {
  result = {
    Demande_JourneesApplicables: null,
    Demande_DateDebutRecurrences: null,
    Demande_DateFinRecurrences: null,
    Demande_DatesRecurrences: null,
  };
}

return result;
