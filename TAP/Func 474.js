console.log("Function 474", context);
//console.log('TAUX', docData.TAUX_KM_Chauffeur);
//console.log('KM', docData.NombreKm);
if (
  docData.CalculPrixTransportGroupe === "Prix au km" &&
  docData.TAUX_KM_Chauffeur &&
  docData.NombreKm
) {
  const taux = parseFloat(docData.TAUX_KM_Chauffeur);
  const nbKm = parseFloat(docData.NombreKm);
  let totalPrix = taux * nbKm;
  
  const minimumPriceRenumeration = parseFloat(docData?.MinimumPriceRenumeration);
  if (!isNaN(minimumPriceRenumeration)) {
    totalPrix = Math.max(
      totalPrix,
      minimumPriceRenumeration
    )
  }

  const totalPrixFixed = totalPrix.toFixed(2);

  callback({
    data: {
      PrixDuTransport: totalPrixFixed,
    },
  });
}
