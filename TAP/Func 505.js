console.log("Function 505", context);

const rows = store.moduleStore.tableDatas?.GridTourneeTransportations?.rows;

const main = async () => {
  if (rows && rows.length > 0) {
    let totalPartsUsager = 0;
    let valeursManquantes = false;

    rows.forEach(row => {
      const data = row.data;
      const donsClient = data.Dons_client;

      if (donsClient === null || donsClient === undefined || donsClient === '' || isNaN(parseFloat(donsClient))) {
        valeursManquantes = true;
      } else {
        totalPartsUsager += parseFloat(donsClient);
      }
    });

    const totalChauffeur = docData['TotalChauffeur'];

    let montantVerserChauffeur = null;
    if (totalChauffeur !== null && totalChauffeur !== undefined && !isNaN(parseFloat(totalChauffeur))) {
      montantVerserChauffeur = parseFloat(totalChauffeur) - totalPartsUsager;
    }

    injectDocData({
      fillData: {
        TotalPartUsager: valeursManquantes ? null : totalPartsUsager,
        MontantVerserChauffeur: montantVerserChauffeur,
      },
    });
  }
};

main();
