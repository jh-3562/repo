console.log("Function 98", context)

const toNumber = (val) => Number(val ?? 0);

const totalPave =
  toNumber(docData?.Operation_Facture_KmParcourusPaves) *
  toNumber(docData?.Operation_Facture_KmTauxPaves);

const totalGravier =
  toNumber(docData?.Operation_Facture_KmParcourusGravier) *
  toNumber(docData?.Operation_Facture_KmTauxGravier);

const totalAttente =
  toNumber(docData?.Operation_Facture_TempsAttente) *
  toNumber(docData?.Operation_Facture_TauxHoraire);

const totalDivers =
  toNumber(docData?.Operation_Facture_Stationnement) +
  toNumber(docData?.Operation_Facture_Hebergement) +
  toNumber(docData?.Operation_Facture_AutresDepenses) +
  toNumber(docData?.Operation_Facture_RepasTransporteur) +
  toNumber(docData?.Operation_Facture_RepasUsager);

return {
  Operation_Facture_KmCoutTotalPaves: totalPave,

  Operation_Facture_KmCoutTotalGravier: totalGravier,

  Operation_Facture_CoutAttenteTotal: totalAttente,

  Operation_Facture_DiversTotal: totalDivers,

  Operation_Facture_GrandTotal:
    totalPave + totalGravier + totalAttente + totalDivers,
};
