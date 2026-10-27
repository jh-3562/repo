console.log("Fonction 101", context);

if (docData?.Transport_AvecRecurrence === "false") {
  return {
    Demande_Transport_FréquenceRécurrence: "",
    Demande_JourneesApplicables: "",
    Demande_DateDebutRecurrences: "",
    Demande_DateFinRecurrences: "",
    Demande_DatesRecurrences: ""
  };
}

return {};
