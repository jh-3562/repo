console.log("Fonction 5", context);

const isRecurrence = docData.Transport_AvecRecurrence === "true";

return {
  Demande_Transport_FréquenceRécurrence: isRecurrence ? true : false,

  DemandeAllerD_Date: !isRecurrence,
  DemandeAllerA_Date: !isRecurrence,
  DemandeRetourD_Date: !isRecurrence,
  DemandeRetourA_Date: !isRecurrence,
};
