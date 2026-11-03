    api({ local: true })
  .get(`https://ciussscnfwtest.r03.rtss.qc.ca/api/tabledata/InventaireGrid?&fields=StatutInventaire&values=DISPONIBLE&fields=TypeInventaire&values=Pompe&fields=NoUniqueInventaire&values=${docData['NumeroPompeSearch']||''}&orderByDesc=FORMID`)
  .then(res => {
    const rows = res?.data?.tableData?.rows;

    if (!rows) return []; 

    const Liste = rows
      .flatMap(row => row.documentCells) 
      .filter(documentCells => documentCells.key === 'NoUniqueInventaire')
      .map(documentCells => ({
        key: documentCells.value,
        value: documentCells.value,
        text: documentCells.value
      }));
    return Liste;
  })
  .then(list => {
    callback({ options: { 'NumeroPompeSearch': list } });
  })
  .catch(err => {
    console.error("Erreur fonction liste des pompes:", err);
  });