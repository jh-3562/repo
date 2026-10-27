console.log("Function 103", context);
console.log("STATUS ACTUEL:", docData.STATUS);
return {
  Demande_SectionCache: (store?.moduleStore?.user?.roles || []).includes("ADMIN") ? true : null,
  Demande_TransportSectionCache: (store?.moduleStore?.user?.roles || []).includes("ADMIN") ? true : null,
  Demande_Buttons: docData.STATUS === "Draft" ? true : null,
  Demande_Bouttons_Approuver: docData.STATUS === "En attente d'approbation" ? true : null,
  Demande_Particularites: docData.STATUS === "En attente d'approbation" ? true : null,
  Demande_Bouttons_Refuser: docData.STATUS === "Refusé" ? true : null,
  Demandes_Refus:docData.STATUS === "Refusé" ? true : null,
  Demande_Bouttons_EnTraitement:docData.STATUS === "En traitement" ? true : null,
  Demandes_Annulation:docData.STATUS === "Annulé" ? true : null,
  Demande_Bouttons_Annuler:docData.STATUS === "Annulé" ? true : null,
  Demande_Boutons_Planifie:docData.STATUS === "Planifié" ? true : null,
  Demande_Boutons_Confirmee:docData.STATUS === "Confirmé" ? true : null,
};
