console.log("Function 123", context);

console.log(docData?.Transport_IDTransporteur);
console.log(store?.pageContentStore?.active?.[0]);

const safeParse = (raw) => {
  if (!raw) return {};

  if (typeof raw === "object") {
    return raw;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const pick = (o, k) =>
  o?.[k] != null ? String(o[k]).trim() : "";

const run = async () => {
  const transportId = docData?.Transport_IDTransporteur;

  if (!transportId) {
    console.log("No Transport_IDTransporteur found");
    return {};
  }

  const transportRes = await api({ local: true }).post(
    "document/id",
    { ids: [transportId] }
  );

  const transportDoc =
    transportRes?.data?.documents?.[0];

  if (!transportDoc) {
    console.log("Transport document not found");
    return {};
  }

  const transportData = safeParse(transportDoc.data);

  const transportType = pick(
    transportData,
    "Transporteur_Type"
  );

  console.log("Transporteur_Type =", transportType);

  // ======================================================
  // Transporteur
  // ======================================================

  const transportApiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Transporteur",
      type: "TEXT",
    },
  ];

  const transportIdsRes = await api({ local: true }).post(
    "document/id/filter",
    { filters: transportApiFilters }
  );

  const transportIds = transportIdsRes?.data?.ids || [];

  if (transportIds.length) {
    await api({ local: true }).post("document/id", {
      ids: transportIds,
    });
  }

  // ======================================================
  // Taux
  // ======================================================

  const tauxApiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Taux",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Actif",
      type: "TEXT",
    },
  ];

  const tauxIdsRes = await api({ local: true }).post(
    "document/id/filter",
    { filters: tauxApiFilters }
  );

  const tauxIds = tauxIdsRes?.data?.ids || [];

  if (!tauxIds.length) {
    console.log("No Taux forms found");
    return {};
  }

  const tauxDocsRes = await api({ local: true }).post(
    "document/id",
    { ids: tauxIds }
  );

  const tauxDocs =
    tauxDocsRes?.data?.documents || [];

  const parsedTaux = tauxDocs.map((doc) => {
    const data = safeParse(doc.data);

    return {
      ...data,
      FORMID: doc.metaData?.FORMID,
      STATUS: doc.metaData?.STATUS,
    };
  });

  // ======================================================
  // Taux categorie
  // ======================================================

  const match = parsedTaux.find((form) => {
    const category = pick(
      form,
      "Taux_CatégorieDuTransporteur"
    );

    return (
      category &&
      transportType &&
      category === transportType
    );
  });

  if (match) {
    console.log("MATCHING TAUX FORM =", match);
    console.log(
      "MATCHING TAUX MONTANT =",
      match.Taux_Montant
    );
  }

  // ======================================================
  // Gravier Pavé
  // ======================================================

  const gravier = parsedTaux.find(
    (f) =>
      pick(f, "Taux_TypeDeSurface") === "Gravier"
  );

  const pave = parsedTaux.find(
    (f) =>
      pick(f, "Taux_TypeDeSurface") === "Pavé"
  );

  if (gravier) {
    console.log(
      "TAUX GRAVIER MONTANT =",
      gravier.Taux_Montant
    );
  } else {
    console.log("No Gravier Taux found");
  }

  if (pave) {
    console.log(
      "TAUX PAVÉ MONTANT =",
      pave.Taux_Montant
    );
  } else {
    console.log("No Pavé Taux found");
  }


  callback?.({
  data: {
    Operation_Facture_KmTauxPaves: pave
      ? pave.Taux_Montant
      : null,

    Operation_Facture_KmTauxGravier: gravier
      ? gravier.Taux_Montant
      : null,

    Operation_Facture_TauxHoraire: match
      ? match.Taux_Montant
      : null,
  },
  });
};

return run().catch((err) => {
  console.error("Function 123 error:", err);
  return {};
});
