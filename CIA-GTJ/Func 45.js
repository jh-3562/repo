console.log('Fonction 45', context);

if (docData.Demande_AdresseRetourArrive == 'true') {
  return {
    DemandeRetourA_NomDuLieu: docData?.DemandeAllerD_NomDuLieu,
    DemandeRetourA_Adresse: docData?.DemandeAllerD_Adresse,
    DemandeRetourA_Ville: docData?.DemandeAllerD_Ville,
    Transport_LatitudeRetourA: docData?.Transport_Latitude,
    Transport_LongitudeRetourA: docData?.Transport_Longitude,
    DemandeRetourA_Telephone: docData?.DemandeAllerD_Telephone,
    DemandeRetourA_Poste: docData?.DemandeAllerD_Poste,
  };
}

return {
  DemandeRetourA_NomDuLieu: '',
  DemandeRetourA_Adresse: '',
  DemandeRetourA_Ville: '',
  DemandeRetourA_Unite: '',
  DemandeRetourA_NoUnite: false,
  DemandeRetourA_Telephone: '',
  DemandeRetourA_Poste: '',
};
