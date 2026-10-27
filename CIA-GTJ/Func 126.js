console.log('Function 126', context);

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters,
    });
    return response?.data?.ids || [];
  } catch (error) {
    console.error('Failed to fetch document IDs:', error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post('document/id', {
      ids: documentIDs,
    });
    return response?.data?.documents || [];
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }
};

const main = async () => {
  const villeAllerDepart = docData?.DemandeAllerD_Ville;
  const villeAllerArrivee = docData?.DemandeAllerA_Ville;
  const villeRetourDepart = docData?.DemandeRetourD_Ville;
  const villeRetourArrivee = docData?.DemandeRetourA_Ville;
  //console.log("ville:", ville);

  const toutesLesvilles = [
    ...new Set(
      [villeAllerDepart, villeAllerArrivee, villeRetourDepart, villeRetourArrivee].filter(Boolean)
    ),
  ];
  console.log('toutes les villes', toutesLesvilles);
  const apiFilters = [
    {
      key: 'FORMLAYOUTNAME',
      operator: 'EQUALS',
      value: 'Secteur',
      type: 'TEXT',
    },
    // {
    //   key: "VillesSecteur",
    //   operator: "CONTAINS",
    //   value: ville,
    //   type: "TEXT",
    // },
  ];

  const ids = await getDocumentIDsByFilters(apiFilters);
  console.log('ids:', ids);

  const secteurs = await getDocumentsByIDs(ids);
  console.log('secteurs:', secteurs);

  // const secteursAssocies = [... new Set(secteurs
  //   .filter((s) => toutesLesvilles.some((v) => JSON.parse(s.data).VillesSecteur?.includes(v)))
  //   .map((s) => JSON.parse(s.data).Secteur))];

  const secteursAssocies = [
    ...new Set(
      secteurs
        .filter((s) =>
          toutesLesvilles.some((v) =>
            JSON.parse(s.data)
              .VillesSecteur?.split('|')
              .some((villeSecteur) => villeSecteur.trim().toLowerCase() === v.trim().toLowerCase())
          )
        )
        .map((s) => JSON.parse(s.data).Secteur)
    ),
  ];

  console.log('secteursAssocies:', secteursAssocies);
  callback({
    data: {
      Secteurs_Cache: secteursAssocies.join('|'),
    },
  });
};

main();
