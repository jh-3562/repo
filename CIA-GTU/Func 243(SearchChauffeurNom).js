console.log("Fonction 243", context);

const FIELD_KEY = "Répartition_NomChauffeur";
const searchValue = String(docData?.[FIELD_KEY] || "").trim();

const baseFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Utilisateur",
    type: "TEXT",
  },
  {
    key: "Utilisateur_Role",
    operator: "EQUALS",
    value: "Chauffeur",
    type: "TEXT",
  },
  { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
];

const getDocumentIds = async (filters) => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters,
    });
    return res?.data?.ids || [];
  } catch (e) {
    console.error("Erreur IDs:", e);
    return [];
  }
};

const getDocuments = async (ids) => {
  try {
    const res = await api({ local: true }).post("document/id", { ids });
    return res?.data?.documents || [];
  } catch (e) {
    console.error("Erreur documents:", e);
    return [];
  }
};

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const firstNonEmpty = (...vals) => {
  for (const v of vals) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
};

const main = async () => {
  const result = { suggestions: { [FIELD_KEY]: [] } };

  if (!searchValue) return callback(result);

  const [ids1, ids2, ids3] = await Promise.all([
    getDocumentIds([
      ...baseFilters,
      {
        key: "Usager_NomComplet",
        operator: "CONTAINS",
        value: searchValue,
        type: "TEXT",
      },
    ]),
    getDocumentIds([
      ...baseFilters,
      {
        key: "Utilisateur_Prenom",
        operator: "CONTAINS",
        value: searchValue,
        type: "TEXT",
      },
    ]),
    getDocumentIds([
      ...baseFilters,
      {
        key: "Utilisateur_Nom",
        operator: "CONTAINS",
        value: searchValue,
        type: "TEXT",
      },
    ]),
  ]);

  const allIds = [...new Set([...ids1, ...ids2, ...ids3])];
  if (!allIds.length) return callback(result);

  const documents = await getDocuments(allIds);

  result.suggestions[FIELD_KEY] = documents.flatMap((document) => {
    const data = safeParse(document?.data);

    const nomComplet = String(data["Usager_NomComplet"] || "").trim();
    const nomFallback =
      `${data["Utilisateur_Prenom"] || ""} ${data["Utilisateur_Nom"] || ""}`.trim();
    const nomChauffeur = nomComplet || nomFallback;
    if (!nomChauffeur) return [];

    // IMPORTANT: pas document.id (souvent ID doc, pas identity)
    const chauffeurIdentityId = firstNonEmpty(
      data["IdentityId"],
      data["IdentityID"],
      data["Utilisateur_IdentityId"],
      data["Utilisateur_IdentityID"],
      data["Utilisateur_IdentityGUID"],
    );

    const chauffeurLogin = firstNonEmpty(
      data["Utilisateur_NomUtilisateur"],
      data["Utilisateur_Username"],
      data["username"],
      data["Identite_Courriel"],
      data["Utilisateur_Courriel"],
    );

    if (!chauffeurIdentityId && !chauffeurLogin) return [];

    return {
      title: nomChauffeur,
      fields: [
        {
          key: "Répartition_NomChauffeur",
          name: "Nom du chauffeur",
          value: nomChauffeur,
        },
        {
          key: "Répartition_ChauffeurIdentityId",
          name: "IdentityId chauffeur",
          value: chauffeurIdentityId,
        },
        {
          key: "Répartition_ChauffeurLogin",
          name: "Login chauffeur",
          value: chauffeurLogin,
        },
      ],
    };
  });

  callback(result);
};

main();

// Dans Function 85: createListeDeRappel (fix scope status)
const createListeDeRappel = async (demandeId, data) => {
  return await createOrUpdate({
    data: formatDataAPI_FASTER({
      ...data,
      ListeDeRappel_FormIDAssocier: demandeId,
      STATUS: "À assigner",
    }),
    status: "À assigner",
    active: true,
    template: { templateId: CONFIG.FORMLAYOUTID_LISTE_RAPPEL },
  });
};
