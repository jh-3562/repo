console.log("Function 76", context);
const prix = parseFloat(docData.MontantInitial);
const remise = parseFloat(docData.CalculPrix_Remise);
const prixInitialHorsForfaitTotal = parseFloat(
  docData.Facture_PrixInitialHorsForfait
);
const totalForfaits = parseFloat(docData.Facture_PrixDesForfaits);
if (prix && remise) {
  const montantASoustraire = (prixInitialHorsForfaitTotal * remise) / 100;
  const montantFinalDu =
    prixInitialHorsForfaitTotal - montantASoustraire + totalForfaits;
  const result = montantFinalDu.toFixed(2);
  return { MontantDû: `${result}` };
} else {
  return { MontantDû: prix };
}
