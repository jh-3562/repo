console.log("Function 506", context);

const main = async () => {
  const totalChauffeur = parseFloat(docData?.TotalChauffeur) || 0;
  const totalPartUsager = parseFloat(docData?.TotalPartUsager) || 0;
  const minimumPriceRenumeration = parseFloat(docData?.MinimumPriceRenumeration);

  const round2 = (num) => Math.round(num * 100) / 100;

  let montantVerserChauffeur = round2(totalChauffeur - totalPartUsager);

  if (
    docData?.CalculPrixTransportGroupe === 'Prix au km' &&
    !isNaN(minimumPriceRenumeration)
  ) {
    montantVerserChauffeur = Math.max(
      montantVerserChauffeur,
      minimumPriceRenumeration
    );
  }

  callback({
    data: {
      MontantVerserChauffeur: montantVerserChauffeur,
    },
  });
};

main();