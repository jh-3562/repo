console.log(
  "Fonction 130",
  context
);

const result = {
  Etablissement_DebitT:
    docData.Demande_TransportEOxygeneT == "true"
      ? true
      : null,
};

if (docData.Demande_TransportEOxygeneT == "true") {
  //result.Etablissement_DebitM = null;
  result.Etablissement_Debit = null;
}

return result;    
