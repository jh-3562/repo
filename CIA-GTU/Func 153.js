console.log("Function 153", context);

const STATUS_A_PLANIFIER = "Planifiée";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const safeStr = (v) => String(v ?? "").trim();

// Tarifs du transporteur ajoutés à la facturation de la demande lors de la planification (même logique que les fonctions 137 et 190)
const TARIF_COLLECTION_FIELD = "Facturation_TarifCollec";
const TARIF_NAME_FIELD = "Facturation_TarifCollec|1|Nom";
const TARIF_TYPE_FIELD = "Facturation_TarifCollec|2|Type";
const TARIF_UNIT_PRICE_FIELD = "Facturation_TarifCollec|3|PrixUnitaire";
const TARIF_QUANTITY_FIELD = "Facturation_TarifCollec|4|Quantite";
const TARIF_LINE_TOTAL_FIELD = "Facturation_TarifCollec|5|PrixTotal";
const TARIF_LINE_FIELDS = [
  TARIF_NAME_FIELD,
  TARIF_TYPE_FIELD,
  TARIF_UNIT_PRICE_FIELD,
  TARIF_QUANTITY_FIELD,
  TARIF_LINE_TOTAL_FIELD,
];
const TARIF_TRANSPORTEUR_FIELD = "Tarif_Transporteur";
const TARIF_START_DATE_FIELD = "Tarif_DateDebut";
const TARIF_END_DATE_FIELD = "Tarif_DateFin";
const DEFAULT_TARIF_QUANTITY = 1;

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

const toNumber = (value) => parseFloat(value) || 0;

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getTransporteurTarifs = async (transporteur) => {
  // Les champs de date de la demande ne sont pas encore définis : on valide le tarif à la date de planification
  const today = getTodayDate();

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "TARIFS",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Actif",
      type: "TEXT",
    },
    {
      key: TARIF_TRANSPORTEUR_FIELD,
      operator: "EQUALS",
      value: transporteur,
      type: "TEXT",
    },
    {
      key: TARIF_START_DATE_FIELD,
      operator: "BETWEEN",
      value: `1900-01-01|${today}`,
      type: "DATE",
    },
    {
      key: TARIF_END_DATE_FIELD,
      operator: "BETWEEN",
      value: `${today}|2100-01-01`,
      type: "DATE",
    },
  ];

  const idsResponse = await api({ local: true }).post("document/id/filter", {
    filters,
  });
  const ids = Object.values(idsResponse?.data?.ids || []);
  if (ids.length === 0) return [];

  const documentsResponse = await api({ local: true }).post("document/id", {
    ids,
  });
  const documents = Object.values(documentsResponse?.data?.documents || {});

  return documents.flatMap((document) => {
    try {
      return [JSON.parse(document.data || "{}")];
    } catch (error) {
      console.error("Erreur lors de la lecture d'un tarif :", error);
      return [];
    }
  });
};

const toTarifLine = (tarifData) => {
  const unitPrice = toNumber(tarifData.Tarif_Montant);
  // Sans les champs de la demande (distance, jours), on applique la quantité par défaut de la fonction 1201
  const quantity = DEFAULT_TARIF_QUANTITY;

  return {
    [TARIF_NAME_FIELD]: tarifData.Tarif_Nom || "",
    [TARIF_TYPE_FIELD]: tarifData.Tarif_TypeTarif || "",
    [TARIF_UNIT_PRICE_FIELD]: unitPrice.toFixed(2),
    [TARIF_QUANTITY_FIELD]: quantity.toFixed(2),
    [TARIF_LINE_TOTAL_FIELD]: (unitPrice * quantity).toFixed(2),
  };
};

const getDemandeData = async (demandeId) => {
  const response = await api({ local: true }).get(`document/${demandeId}`);
  const demandeDoc = response?.data?.document || response?.data;

  return typeof demandeDoc?.data === "string"
    ? JSON.parse(demandeDoc.data)
    : demandeDoc?.data || {};
};

// La demande lue par l'API garde sa collection à plat : « Facturation_TarifCollec » = nombre de lignes, « …|1|Nom|1 » = valeurs
const readExistingTarifLines = (demandeData) => {
  const collection = demandeData?.[TARIF_COLLECTION_FIELD];
  if (Array.isArray(collection)) return collection;

  const lineCount = parseInt(collection, 10) || 0;

  return Array.from({ length: lineCount }, (_, index) =>
    TARIF_LINE_FIELDS.reduce((line, field) => {
      line[field] = demandeData[`${field}|${index + 1}`] ?? "";
      return line;
    }, {}),
  );
};

const flattenTarifLines = (tarifLines) => {
  const flattened = { [TARIF_COLLECTION_FIELD]: String(tarifLines.length) };

  tarifLines.forEach((line, index) => {
    TARIF_LINE_FIELDS.forEach((field) => {
      flattened[`${field}|${index + 1}`] = line[field] ?? "";
    });
  });

  return flattened;
};

const calculateBillingTotals = (tarifLines) => {
  const subtotal = tarifLines.reduce(
    (sum, line) => sum + toNumber(line?.[TARIF_LINE_TOTAL_FIELD]),
    0,
  );
  const tps = subtotal * TPS_RATE;
  const tvq = subtotal * TVQ_RATE;

  return {
    Facturation_PrixAvantTaxe: subtotal.toFixed(2),
    Facturation_TPS: tps.toFixed(2),
    Facturation_TVQ: tvq.toFixed(2),
    Facturation_PrixTotal: (subtotal + tps + tvq).toFixed(2),
  };
};

const buildDemandeBillingData = async (demandeId, transporteur) => {
  if (!transporteur) return {};

  const [demandeData, tarifs] = await Promise.all([
    getDemandeData(demandeId),
    getTransporteurTarifs(transporteur),
  ]);

  const tarifLines = [
    ...readExistingTarifLines(demandeData),
    ...tarifs.map(toTarifLine),
  ];

  return {
    Facturation_Transporteur: transporteur,
    ...flattenTarifLines(tarifLines),
    ...calculateBillingTotals(tarifLines),
  };
};

async function updateDemandeOnly() {
  try {
    showPopupLoading("Planification en cours");

    const demandeId = safeStr(
      store?.pageContentStore?.processData?.[0]?.result?.ids?.[0]
    );

    if (!demandeId) {
      hidePopupLoading();
      showErrorBanner("Demande introuvable dans le store.");
      return;
    }

    const repartitionTransporteur = safeStr(store?.pageContentStore?.processData?.[0]?.edits?.Répartition_Transporteur ?? "");

    const billingData = await buildDemandeBillingData(
      demandeId,
      repartitionTransporteur,
    );

    await api({ local: true }).put("document", {
      document: {
        documentID: demandeId,
        status: STATUS_A_PLANIFIER,
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID },
        data: JSON.stringify({
          NomTransporteurSearch: repartitionTransporteur,
          ...billingData,
        }),
      }
    });

    hidePopupLoading();
    showSuccessBanner("Demande mise à jour avec succès.");

  } catch (e) {
    hidePopupLoading();
    console.error("Erreur updateDemandeOnly:", e);
    showErrorBanner("Erreur lors de la mise à jour de la demande.");
  }
}

updateDemandeOnly();
