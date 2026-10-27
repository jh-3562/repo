console.log("Fonction 29", context);

const FORMLAYOUT_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";

if (docData.FORMLAYOUTID !== FORMLAYOUT_ID) return;

const valeur = Boolean(
  (docData?.Transport_TypeTransport === "Retour") ^
  (docData.Demande_AdresseRetourAller === "true"),
);

return {
  DemandeRetourD_NomDuLieu: valeur,
  DemandeRetourD_Adresse: valeur,
  DemandeRetourD_Ville: valeur,
  DemandeRetourD_Unite: valeur,
  DemandeRetourD_NoUnite: valeur,
  DemandeRetourD_Telephone: valeur,
  DemandeRetourD_Poste: valeur,
};
