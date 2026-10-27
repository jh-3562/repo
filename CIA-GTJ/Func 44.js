console.log("Fonction 44", context);

if (docData.Demande_AdresseRetourAller == 'true') {
  return {
     DemandeRetourD_NomDuLieu: docData.DemandeAllerA_NomDuLieu,
     DemandeRetourD_Adresse: docData.DemandeAllerA_Adresse,
     DemandeRetourD_Ville: docData.DemandeAllerA_Ville,
     Transport_LatitudeRetourD: docData.Transport_LatitudeAllerA,
     Transport_LongitudeRetourD: docData.Transport_LongitudeAllerA,
     DemandeRetourD_Telephone: docData.DemandeAllerA_Telephone,
     DemandeRetourD_Poste: docData.DemandeAllerA_Poste,
  };
}

return {
  DemandeRetourD_NomDuLieu: "",
  DemandeRetourD_Adresse: "",
  DemandeRetourD_Ville: "",
  DemandeRetourD_Unite: "",
  DemandeRetourD_NoUnite: false,
  DemandeRetourD_Telephone: "",
  DemandeRetourD_Poste: "",
};
