console.log('function 24', context);

return {
  DemandeRetourA_NomDuLieu: docData?.DemandeAllerD_NomDuLieu,
  DemandeRetourA_Adresse: docData?.DemandeAllerD_Adresse,
  DemandeRetourA_Ville: docData?.DemandeAllerD_Ville,
  Transport_LatitudeRetourA: docData?.Transport_Latitude,
  Transport_LongitudeRetourA: docData?.Transport_Longitude,
  DemandeRetourA_Telephone: docData?.DemandeAllerD_Telephone,
  DemandeRetourA_Poste: docData?.DemandeAllerD_Poste,
};
