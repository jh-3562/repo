console.log("Fonction 47 - Synchroniser Liste de Rappel → Transport", context);

const get = (o, k) => o?.[k];
const result = {};

const map = [
  ["Demande_ListeRappelAccompagnementPrenomAccompagnateur", "Demande_TransportAccompagnementPrenomAccompagnateurConfirme"],
  ["Demande_ListeRappelAccompagnementNomAccompagnateur",    "Demande_TransportAccompagnementNomAccompagnateurConfirme"],
  ["Demande_ListeRappelAccompagnementTitreEmploi",          "Demande_TransportAccompagnementTitreEmploiConfirme"],
  ["Demande_ListeRappelAccompagnementAutresInformations",   "Demande_TransportAccompagnementAutresInformationsConfirme"],
];


for (const [source, target] of map) {
  const val = get(docData, source);
  if (val !== undefined && val !== null && val !== "") {
    result[target] = val;
  }
}

return result;
