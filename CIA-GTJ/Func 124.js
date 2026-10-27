console.log("Function 124", context);

const documentId = store?.pageContentStore?.active?.[0];

console.log("Selected Transport document ID:", documentId);

if (!documentId) {
  console.log("No active document ID found");
  return;
}

// ======================================================
// API FILTERS
// ======================================================

const transportApiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Transport",
    type: "TEXT",
  },
];

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

// ======================================================
// FUNCTIONS
// ======================================================

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const pick = (o, k) => (o?.[k] != null ? String(o[k]).trim() : "");

const createUpdateDocument = (data, templateId, status, docID) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId },
    documentID: docID,
  };
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });

    console.log("UPDATE RESPONSE:", response);
    return response?.data?.document || null;
  } catch (error) {
    console.error("Failed to update document:", error);
    return null;
  }
};

// ======================================================
// MAIN
// ======================================================

const run = async () => {
  const filterRes = await api({ local: true }).post("document/id/filter", {
    filters: transportApiFilters,
  });

  console.log("Transport filter result:", filterRes?.data?.ids);

  const transportRes = await api({ local: true }).post("document/id", {
    ids: [documentId],
  });

  const transportDoc = transportRes?.data?.documents?.[0];

  if (!transportDoc) {
    console.log("Transport document not found");
    return;
  }

  const transportData = safeParse(transportDoc.data);

  const transportType = pick(transportData, "Transporteur_Type");

  console.log("Transporteur_Type =", transportType);

  const tauxIdsRes = await api({ local: true }).post("document/id/filter", {
    filters: tauxApiFilters,
  });

  const tauxIds = tauxIdsRes?.data?.ids || [];

  if (!tauxIds.length) {
    console.log("No Taux found");
    return;
  }

  const tauxDocsRes = await api({ local: true }).post("document/id", {
    ids: tauxIds,
  });

  const parsedTaux = (tauxDocsRes?.data?.documents || []).map((doc) => {
    const data = safeParse(doc.data);

    return {
      ...data,
      meta: doc.metaData,
    };
  });

  const norm = (v) => (v || "").trim().toLowerCase();

  const tauxMatch = parsedTaux.find((f) => {
    const category =
      pick(f, "Taux_CatégorieDuTransporteur") ||
      pick(f?.edits, "Taux_CatégorieDuTransporteur");

    return norm(category) === norm(transportType);
  });

  console.log("Matching Taux =", tauxMatch);

  const gravier = parsedTaux.find(
    (f) => pick(f, "Taux_TypeDeSurface") === "Gravier",
  );

  const pave = parsedTaux.find((f) => pick(f, "Taux_TypeDeSurface") === "Pavé");

  const updateData = {
    Transporteur_Type: transportType,

    Operation_Facture_KmTauxGravier: gravier ? gravier.Taux_Montant : null,

    Operation_Facture_KmTauxPaves: pave ? pave.Taux_Montant : null,

    Operation_Facture_TauxHoraire: tauxMatch ? tauxMatch.Taux_Montant : null,
  };

  console.log("FINAL UPDATE DATA =", updateData);

  const documentToUpdate = createUpdateDocument(
    updateData,
    transportDoc.metaData?.FORMLAYOUTID,
    transportDoc.metaData?.STATUS,
    documentId,
  );

  console.log("UPDATE PAYLOAD =", documentToUpdate);

  const result = await updateDocument(documentToUpdate);

  console.log("FINAL RESULT =", result);
};

return run().catch((err) => {
  console.error("Function 124 error:", err);
});
