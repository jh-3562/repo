console.log(
  "Fonction 101",
  context
);

const result = {
  Etablissement_DebitM:
    docData.Demande_TransportAutreEquipements == "true"
      ? true
      : null,
};

// if (docData.Demande_TransportAutreEquipements == "true") {
//   result.Etablissement_Debit = null;
//   result.Etablissement_DebitT = null;
// }

return result;
