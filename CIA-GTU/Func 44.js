console.log("Fonction 44", context);

const get = (o, k) => o?.[k];

const Oxygenodependant = get(
  docData,
  "Demande_IdentificationIdentificationUsagerOxygenodependant",
);
const debit = get(docData, "Demande_IdentificationIdentificationUsagerDebit");

const result = {};

if (Oxygenodependant) {
  result.Demande_TransportAutreEquipementsDebit = debit;
}

return result;
