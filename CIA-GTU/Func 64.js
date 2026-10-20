console.log("Fonction 64 • Activer courant / Inactiver autres", context);

// Constantes de base
const LAYOUT_OPTIM = "e371bcfb-1eba-4f0e-aeac-a528b22667e5"; // ID du layout Optimisation
const FIELD_IN_DATA = "User_Status"; // Champ métier où je stocke le statut
const ACTIVE_VALUE = "Actif"; // Valeur pour actif
const INACTIVE_VALUE = "Inactif"; // Valeur pour inactif

// ID du formulaire courant (celui qui doit rester actif)
const currentId =
  docData?.FORMID || docData?.documentID || docData?.DOCUMENTID || null;

// Filtre pour récupérer uniquement les documents de ce layout
const apiFilters = [
  {
    key: "FORMLAYOUTID",
    operator: "EQUALS",
    value: LAYOUT_OPTIM,
    type: "TEXT",
  },
];

// --- Fonctions utilitaires ---
// Aplatit les collections (listes répétées) pour correspondre au format attendu par l’API
const flattenCollections = (data) => {
  let out = { ...(data || {}) };
  Object.keys(out).forEach((k) => {
    const v = out[k];
    if (Array.isArray(v)) {
      v.forEach((row, i) => {
        Object.keys(row || {}).forEach((sub) => {
          out[`${sub}|${i + 1}`] = row[sub];
        });
      });
      out[k] = String(v.length); // nombre d’éléments dans la collection
    }
  });
  return out;
};
// Formate la data en JSON stringifiée après aplatissement
const formatDataAPI = (obj) => JSON.stringify(flattenCollections(obj || {}));

// --- Code principal ---
(async () => {
  try {
    console.log("→ ID courant:", currentId);

    const updates = [];

    // 1) Je force d’abord le formulaire courant en "Actif"
    if (currentId) {
      const curField =
        String(docData?.[FIELD_IN_DATA] ?? "").trim() || "(vide)";
      console.log(`→ Courant: ${currentId}`);
      console.log(`   - ${FIELD_IN_DATA} (dans data) :`, curField);

      const curData = { ...(docData || {}) };
      if (
        String(curData[FIELD_IN_DATA] || "").toLowerCase() !==
        ACTIVE_VALUE.toLowerCase()
      ) {
        curData[FIELD_IN_DATA] = ACTIVE_VALUE; // mise à jour du champ métier
      }

      // Je reflète immédiatement le changement dans l’UI si possible
      if (typeof injectDocData === "function") {
        injectDocData({
          documentId: currentId,
          data: { [FIELD_IN_DATA]: ACTIVE_VALUE },
        });
        console.log("   • injectDocData courant => Actif");
      }

      // Je prépare la mise à jour côté API
      updates.push({
        documentID: currentId,
        active: true,
        status: ACTIVE_VALUE, // statut API
        template: { templateId: LAYOUT_OPTIM },
        data: formatDataAPI(curData), // data.STATUS = Actif
      });
      console.log("   • Prépare MAJ courant (=> Actif)");
    }

    // 2) Je récupère tous les documents de ce layout
    const resIds = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = resIds?.data?.ids || [];
    console.log("→ IDs trouvés:", ids);

    if (ids.length) {
      const resDocs = await api({ local: true }).post("document/id", { ids });
      const docs = resDocs?.data?.documents || [];
      console.log("→ Docs chargés:", docs.length);

      // 3) Pour chaque autre document, je les mets à "Inactif"
      for (const d of docs) {
        const id = d?.documentID || d?.DOCUMENTID;
        if (!id || id === currentId) continue; // je saute le courant

        // Je parse la data
        let formData = {};
        try {
          formData =
            typeof d?.data === "string" ? JSON.parse(d.data) : d?.data || {};
        } catch {
          formData = {};
        }

        // Je log le statut côté API et côté data
        const apiStatus = d?.status || "(inconnu)";
        const fieldStatus = formData?.[FIELD_IN_DATA] ?? "(vide)";

        console.log(`→ Doc ${id}`);
        console.log("   - Status API :", apiStatus);
        console.log(`   - ${FIELD_IN_DATA} (dans data) :`, fieldStatus);

        const alreadyInactive =
          String(fieldStatus).trim().toLowerCase() ===
          INACTIVE_VALUE.toLowerCase();

        if (
          alreadyInactive &&
          String(apiStatus).toLowerCase() === INACTIVE_VALUE.toLowerCase()
        ) {
          console.log("   • Déjà Inactif → skip");
          continue;
        }

        // Je mets à jour pour l’inactiver
        formData[FIELD_IN_DATA] = INACTIVE_VALUE;

        updates.push({
          documentID: id,
          active: true,
          status: INACTIVE_VALUE, // statut API
          template: { templateId: LAYOUT_OPTIM },
          data: formatDataAPI(formData), // data.STATUS = Inactif
        });
        console.log("   • Prépare MAJ: => Inactif");
      }
    }

    // 4) Enfin, j’envoie toutes les MAJ en une seule requête PUT
    if (!updates.length) {
      console.log("→ Aucune mise à jour à envoyer");
      return;
    }

    console.log("→ Payload PUT /document/Many:", { documents: updates });
    const putRes = await api({ local: true }).put("document/Many", {
      documents: updates,
    });
    console.log("→ PUT /document/Many OK:", putRes?.status || putRes);
  } catch (err) {
    console.error("Erreur:", err);
  }
})();

// Je retourne Actif pour le document courant dans l’UI
return { [FIELD_IN_DATA]: ACTIVE_VALUE };
