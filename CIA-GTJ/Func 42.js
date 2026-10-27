console.log("Fonction 42", context);

const FORMLAYOUT_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";

if (docData.FORMLAYOUTID !== FORMLAYOUT_ID) return;

const getValue = (v) => (String(v).toLowerCase() === "true" ? "Aucun" : "");

return {

  DemandeAllerD_Unite: getValue(docData.DemandeAllerD_NoUnite),

  DemandeAllerA_Unite: getValue(docData.DemandeAllerA_NoUnite),

  DemandeRetourD_Unite: getValue(docData.DemandeRetourD_NoUnite),

  DemandeRetourA_Unite: getValue(docData.DemandeRetourA_NoUnite)

};
