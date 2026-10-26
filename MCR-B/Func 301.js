const defaultButtons = {
  BatchVehiculeReactiver: null,
  Batch_Véhicule_Archivé: null,
  Batch_Véhicule_Enregistré: null,
};

const statusButtons = {
  Draft: { Batch_Véhicule_Enregistré: true },
  Enregistré: {
    Batch_Véhicule_Archivé: true,
    Batch_Véhicule_Enregistré: true,
  },
  Archivé: { BatchVehiculeReactiver: true },
};

return {
  ...defaultButtons,
  ...(statusButtons[docData.STATUS] ?? {}),
};
