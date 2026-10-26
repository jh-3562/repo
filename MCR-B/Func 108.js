console.log("Function 108", context);
const { Paiements, MontantDû, MontantPayé, MontantRestantDû } = docData;
const dataKey = "Paiements|3|Montant";
let total = 0;
Paiements.forEach((element) => {
  total += parseFloat(element[dataKey]) ? parseFloat(element[dataKey]) : 0;
});
const montantRestant = parseFloat(MontantDû) - parseFloat(total);
const restantAPayer = montantRestant < 0 ? 0 : montantRestant;

return {
  MontantPayé: total.toFixed(2),
  MontantRestantDû: restantAPayer.toFixed(2),
};
