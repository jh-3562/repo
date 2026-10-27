console.log("Fonction 31", context);

const FORMLAYOUT_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";

if (docData.FORMLAYOUTID !== FORMLAYOUT_ID) return;

const valeur = Boolean(
  (docData.Demande_AdresseRetourArrive === "true") ^
  (docData?.Transport_TypeTransport === "Retour"),
);

return {
  DemandeRetourA_NomDuLieu: valeur,
  DemandeRetourA_Adresse: valeur,
  DemandeRetourA_Ville: valeur,
  DemandeRetourA_Unite: valeur,
  DemandeRetourA_NoUnite: valeur,
  DemandeRetourA_Telephone: valeur,
  DemandeRetourA_Poste: valeur,
};
