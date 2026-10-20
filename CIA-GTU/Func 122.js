console.log(
  "Fonction 122",
  context
);

const result = {
  Etablissement_Debit:
    docData.Demande_TransportEOxygene == "true"
      ? true
      : null,
};

if (docData.Demande_TransportEOxygene == "true") {
  //result.Etablissement_DebitM = null;
  result.Etablissement_DebitT = null;
}

return result;
