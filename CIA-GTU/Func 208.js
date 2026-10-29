console.log("208 - apply filter slection", context);

if (!docData.DemandeTransportUniteAdmin) {
  showErrorBanner("Veuillez remplir le champ obligatoire avant d'enregistrer.");
  return;
}

const applyUserFilter = async (filters) => {
  try {
    await api({ local: true }).put("userfilter", {
      filters,
    });
  } catch (error) {
    console.error("Erreur dans applyUserFilter :", error);
    throw error;
  }
};

const main = async () => {
  await applyUserFilter([
    {
      dtoName: "Filter",
      key: "DemandeTransportUniteAdmin",
      value: `${docData.DemandeTransportUniteAdmin}|Usager|Utilisateur (Département)|Adresses Fréquentes`,
      operator: "IN",
    },
  ]);
  window.location.href = `/demandes`;
};

main();

