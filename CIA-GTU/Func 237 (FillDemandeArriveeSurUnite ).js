console.log("Fonction 237", context);

const FORMLAYOUT_PARAM_OPTIM = "e371bcfb-1eba-4f0e-aeac-a528b22667e5";

const pad2 = (n) => String(n).padStart(2, "0");

const toMinutes = (hhmm) => {
  if (!hhmm) return NaN;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim());
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
};

const toHHMM = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
};

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });
    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const main = async () => {
  try {
    const HEURE_DEPART =
      docData["Demande_TransportTransportSimpleHeureDepartSouhaitee"];
    const DATE_DEPART =
      docData["Demande_TransportTransportSimpleDateTransportDepart"];
    if (!HEURE_DEPART || !DATE_DEPART) {
      return;
    }

    const ids = await getDocumentIDsByFilters([
      {
        key: "FORMLAYOUTID",
        operator: "EQUALS",
        value: FORMLAYOUT_PARAM_OPTIM,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ]);

    if (!ids.length) {
      return;
    }

    const docs = await getDocumentsByIDs(ids);
    const paramOptim = JSON.parse(docs[0]?.data || "{}");
    const PRISE_EN_CHARGE = Number(paramOptim?.Flexibilite_HeureAccomp) || 0;
    const DEPART_MINUTES = toMinutes(HEURE_DEPART);
    if (isNaN(DEPART_MINUTES)) {
      return;
    }

    const heureArrivee = toHHMM(DEPART_MINUTES - PRISE_EN_CHARGE);
    const isoDateHeure = `${DATE_DEPART}T${heureArrivee}:00`;

    callback({ data: { Demande_AccompagnateurHeure: isoDateHeure } });
    callback({ data: { Demande_AccompagnateurHeure: isoDateHeure } });
  } catch (e) {
    console.error("Erreur:", e);
    callback({ data: {} });
    callback({ data: {} });
  }
};

main();
