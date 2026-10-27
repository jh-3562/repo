console.log("Fonction 20", context);

const INDISPONIBILITES_FORMLAYOUTID = "7d19c79c-8a4a-418c-8d1a-89d0139ecb00";

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

const parseMultiDates = (v) => {
  if (isEmpty(v)) return [];
  return String(v)
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.slice(0, 10)); // YYYY-MM-DD
};

const pickErrMsg = (err) => {
  const d = err?.response?.data;
  if (d?.message) return String(d.message);
  if (d?.error) return String(d.error);
  if (d?.errors)
    return typeof d.errors === "string" ? d.errors : JSON.stringify(d.errors);
  if (err?.message) return String(err.message);
  return "Échec";
};

const isOk = (res) => res && (res.status === 200 || res.status === 201);

const postMany = (documents) =>
  api({ local: true }).post("document/Many", { documents });
const postOne = (document) =>
  api({ local: true }).post("document", { document });

const filterDocIds = (filters) =>
  api({ local: true }).post("document/id/filter", { filters });
const getDocumentById = (id) => api({ local: true }).get(`document/${id}`);

const normalizeHHMM = (t) => {
  if (isEmpty(t)) return null;
  const s = String(t).trim();
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  return null;
};

const buildIsoDateTime = (yyyy_mm_dd, hhmm) => {
  if (isEmpty(yyyy_mm_dd) || isEmpty(hhmm)) return null;
  const time = normalizeHHMM(hhmm);
  if (!time) return null;
  return `${String(yyyy_mm_dd).slice(0, 10)}T${time}:00`; // YYYY-MM-DDTHH:mm:00
};

const getDocumentsFromIds = async (ids) => {
  try {
    const res = await api({ local: true }).post(`document/id`, { ids: ids });
    const documents = res?.data?.documents;

    if (!documents) {
      throw new Error(`Erreur lors de la récupération du document`);
    }

    return documents.map((doc) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du document :`, error);
    throw error;
  }
};

async function main() {
  if (docData.NUMBER === 0) {
    showErrorBanner(
      "Le transporteur doit être créé avant de pouvoir créer des indisponibilités",
    );
    return;
  }
  const jours = parseMultiDates(docData.Transporteur_Indisponibilites_Jours);
  const heureDebut = docData.Transporteur_Indisponibilites_HeureDebut;
  const heureFin = docData.Transporteur_Indisponibilites_HeureFin;
  const raison = docData.Transporteur_Indisponibilites_Raison;

  const fail = (msg) => {
    if (typeof hidePopupLoading === "function") hidePopupLoading();
    if (typeof showErrorBanner === "function") showErrorBanner(msg);
  };

  const ok = (msg) => {
    if (typeof hidePopupLoading === "function") hidePopupLoading();
    if (typeof showSuccessBanner === "function") showSuccessBanner(msg);
  };

  if (typeof showPopupLoading === "function")
    showPopupLoading("Création des indisponibilités...");

  if (jours.length === 0) return fail("Échec: Aucune date");
  if (isEmpty(heureDebut) || isEmpty(heureFin))
    return fail("Échec: Heure début/fin manquante");
  if (isEmpty(raison))
    return fail("Échec: Raison de l'indisponibilité manquante");

  const documents = [];
  for (const dateStr of jours) {
    const dtDebut = buildIsoDateTime(dateStr, heureDebut);
    const dtFin = buildIsoDateTime(dateStr, heureFin);

    if (!dtDebut || !dtFin || dtDebut > dtFin) {
      return fail(
        `Échec: Format heure invalide (début=${heureDebut}, fin=${heureFin})`,
      );
    }

    documents.push({
      template: { templateId: INDISPONIBILITES_FORMLAYOUTID },
      status: "Actif",
      active: true,
      data: JSON.stringify({
        Transporteur_Indisponibilites_Date: dateStr,
        Transporteur_Indisponibilites_HeureDebut: heureDebut,
        Transporteur_Indisponibilites_HeureFin: heureFin,
        Transporteur_Indisponibilites_TransporteurID: docData?.FORMID,
        Transporteur_NomPrenom: docData.Transporteur_NomPrenom,
        Transporteur_Indisponibilites_Raison:
          docData.Transporteur_Indisponibilites_Raison,

        // champs timeline
        Demande_DateHeureDebut: dtDebut,
        Demande_DateHeureFin: dtFin,
      }),
    });
  }
  console.log("documents", documents);

  try {
    const res = await postMany(documents);
    if (!isOk(res)) throw new Error("Batch HTTP KO");
    console.log("FUNC20RES", res);
    return ok(`${documents.length} indisponibilités créées`);
  } catch (batchErr) {
    let created = 0;

    for (const d of documents) {
      try {
        const r = await postOne(d);
        if (isOk(r)) created++;
      } catch {}
    }

    if (created > 0) return ok(`${created} indisponibilités créées`);

    return fail(`Échec: ${pickErrMsg(batchErr)}`);
  }
}

main();
