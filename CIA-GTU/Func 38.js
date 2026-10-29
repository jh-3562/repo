console.log("38 (suggestions sans collections)", context);

const INPUT_KEY = "Demande_IdentificationIdentificationUsagerRAMQ";
const SELECTED_RAMQ_KEY = "Identite_RAMQ";

const apiFilters = [
  { key: "FORMLAYOUTNAME", operator: "EQUALS", value: "Usager", type: "TEXT" },
  { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
  { key: "Identite_RAMQ", operator: "EXISTS", type: "TEXT" },
];

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const pick = (o, k) => (o && o[k] != null ? String(o[k]) : "");

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const IDENT_FIELD_KEYS = [
  "Demande_IdentificationIdentificationUsagerPrenom",
  "Demande_IdentificationIdentificationUsagerNom",
  "Demande_IdentificationIdentificationUsagerNoDossier",
  "Demande_IdentificationIdentificationUsagerSexe",
  "Demande_IdentificationIdentificationUsagerDateNaissance",
  "Demande_IdentificationIdentificationUsagerAge",
  "Identite_Telephone",
  "Identite_Poste",
  "Identite_Courriel",
  "Identite_Langues",
  "Identite_Adresse",
  "Identite_Civique",
  "Identite_Rue",
  "Identite_Appartement",
  "Identite_Ville",
  "Identite_CodePostal",
  "Identite_Province",
  "Identite_Expiration_Required",
  "Demande_IdentificationIdentificationUsagerOxygenodependant",
  "Demande_IdentificationIdentificationUsagerDebit",
  "Demande_IdentificationIdentificationUsagerDiabétique",
  "Demande_IdentificationIdentificationUsagerAutochtone",
  "Demande_IdentificationStatutDiabetiqueEstInsulinodependant",
  "Systeme_LatitudeAdresseCleint",
  "Systeme_LongitudeAdresseClient",
  "Identification_LangueAutre",
  "Demande_IdentificationPoids",
  "Identification_MesurePoids",
  "Demande_PPH",
  "Identite_AutreInfo",
  "Demande_TypeClientele",
  "Demande_AideSociale",
  "Demande_MembreTransportAdapte",
];

const buildEmptyData = () => {
  const data = {};
  IDENT_FIELD_KEYS.forEach((k) => {
    data[k] = "";
  });
  data[SELECTED_RAMQ_KEY] = "";
  return data;
};

const toSuggestion = (d) => {
  const ramq = pick(d, "Identite_RAMQ");

  return {
    title: ramq /* ||
      [pick(d, "Identite_Prenom"), pick(d, "Identite_Nom")]
        .filter(Boolean)
        .join(" ")*/,
    fields: [
      { key: INPUT_KEY, value: ramq, name: "RAMQ" },
      { key: SELECTED_RAMQ_KEY, value: ramq, name: "RAMQ interne" },
      {
        key: "Demande_IdentificationIdentificationUsagerPrenom",
        value: pick(d, "Identite_Prenom"),
        name: "Prénom",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerNom",
        value: pick(d, "Identite_Nom"),
        name: "Nom",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerNoDossier",
        value: pick(d, "Identite_IdClient"),
        name: "No dossier",
      },
      {
        key: "Identification_LangueAutre",
        value: pick(d, "Identification_LangueAutre"),
        name: "Préciser langue",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerSexe",
        value: pick(d, "Identite_Sexe"),
        name: "Sexe",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerDateNaissance",
        value: pick(d, "Identite_DateNaissance"),
        name: "Date de naissance",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerAge",
        value: pick(d, "Identite_Age"),
        name: "Âge",
      },
      {
        key: "Identite_Langues",
        value: pick(d, "Identite_Langues"),
        name: "Langues",
      },
      {
        key: "Identite_Adresse",
        value: pick(d, "Identite_Adresse"),
        name: "Adresse",
      },
      {
        key: "Identite_Civique",
        value: pick(d, "Identite_Civique"),
        name: "Civique",
      },
      {
        key: "Identite_Rue",
        value: pick(d, "Identite_Rue"),
        name: "Rue",
      },
      {
        key: "Identite_Appartement",
        value: pick(d, "Identite_Appartement"),
        name: "Appartement",
      },
      {
        key: "Identite_Ville",
        value: pick(d, "Identite_Ville"),
        name: "Ville",
      },
      {
        key: "Identite_CodePostal",
        value: pick(d, "Identite_CodePostal"),
        name: "Code postal",
      },
      {
        key: "Identite_Province",
        value: pick(d, "Identite_Province"),
        name: "Province",
      },
      {
        key: "Identite_Expiration_Required",
        value: pick(d, "Identite_Expiration_Required"),
        name: "Date d'expiration",
      },

      {
        key: "Demande_IdentificationIdentificationUsagerOxygenodependant",
        value:
          d.Demande_IdentificationIdentificationUsagerOxygenodependant ?? "",
        name: "Oxygénodépendant",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerDebit",
        value: d.Demande_IdentificationIdentificationUsagerDebit ?? "",
        name: "Débit",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerDiabétique",
        value: d.Demande_IdentificationIdentificationUsagerDiabétique ?? "",
        name: "Diabétique",
      },
      {
        key: "Demande_IdentificationIdentificationUsagerAutochtone",
        value: d.Demande_IdentificationIdentificationUsagerAutochtone ?? "",
        name: "Autochtone",
      },
      {
        key: "Demande_IdentificationStatutDiabetiqueEstInsulinodependant",
        value:
          d.Demande_IdentificationStatutDiabetiqueEstInsulinodependant ?? "",
        name: "Diabétique insulinodépendant",
      },
      {
        key: "Systeme_LatitudeAdresseCleint",
        value: d.Systeme_LatitudeAdresseCleint ?? "",
        name: "Latitude",
      },
      {
        key: "Systeme_LongitudeAdresseClient",
        value: d.Systeme_LongitudeAdresseClient ?? "",
        name: "Longitude",
      },
      {
        key: "Identite_Telephone",
        value: d.Identite_Telephone ?? "",
        name: "Téléphone",
      },
      {
        key: "Identite_Poste",
        value: d.Identite_Poste ?? "",
        name: "Téléphone",
      },
      {
        key: "Identite_Courriel",
        value: d.Identite_Courriel ?? "",
        name: "Courriel",
      },

      {
        key: "Demande_IdentificationPoids",
        value: d.Demande_IdentificationPoids ?? "",
        name: "Poids",
      },
      {
        key: "Identification_MesurePoids",
        value: d.Identification_MesurePoids ?? "",
        name: "Mesure du poids",
      },
      {
        key: "Demande_PPH",
        value: d.Demande_PPH ?? "",
        name: "Admins au PPH ?",
      },
      {
        key: "Identite_AutreInfo",
        value: d.Identite_AutreInfo ?? "",
        name: "Autre Information",
      },
      {
        key: "Demande_TypeClientele",
        value: d.Demande_TypeClientele ?? "",
        name: "Quel type de clientèle ?",
      },
      {
        key: "Demande_AideSociale",
        value: d.Demande_AideSociale ?? "",
        name: "Aide sociale ?",
      },
      {
        key: "Demande_MembreTransportAdapte",
        value: d.Demande_MembreTransportAdapte ?? "",
        name: "Membre du transport adapté ?",
      },
    ],
  };
};

const userInput = String(docData?.[INPUT_KEY] ?? "");
const userQuery = norm(userInput);
const selectedRamq = String(docData?.[SELECTED_RAMQ_KEY] ?? "").trim();

// si RAMQ vide -> vider tout et enlever suggestions
if (!userQuery) {
  callback?.({
    data: {
      ...buildEmptyData(),
      [INPUT_KEY]: "",
    },
    suggestions: { [INPUT_KEY]: [] },
  });
  return;
}

// si la RAMQ sélectionnée a été modifiée -> vider les champs
// MAIS continuer pour recalculer les suggestions
if (selectedRamq && userInput.trim() !== selectedRamq) {
  callback?.({
    data: {
      ...buildEmptyData(),
      [INPUT_KEY]: userInput,
    },
  });
}

api({ local: true })
  .post("document/id/filter", { filters: apiFilters })
  .then((res2) => {
    const formIds =
      (Array.isArray(res2?.data?.ids) && res2.data.ids) ||
      (Array.isArray(res2?.data) && res2.data) ||
      [];

    if (!formIds.length) return { data: { documents: [] } };

    return api({ local: true }).post("document/id", { ids: formIds });
  })
  .then((res3) => {
    const docs =
      (Array.isArray(res3?.data?.documents) && res3.data.documents) ||
      (Array.isArray(res3?.data) && res3.data) ||
      [];

    const records = docs
      .map((x) => {
        const parsed = safeParse(x?.data ?? x);
        if (!parsed.status && x?.status) parsed.status = x.status;
        return parsed;
      })
      .filter(Boolean);

    const filtered = records.filter((d) => {
      const candidates = [
        pick(d, "Identite_RAMQ"),
        [pick(d, "Identite_Prenom"), pick(d, "Identite_Nom")]
          .filter(Boolean)
          .join(" "),
        pick(d, "Identite_IdClient"),
        pick(d, "Identite_DateNaissance"),
      ];

      return candidates.some((s) => norm(s).startsWith(userQuery));
    });

    const suggestions = filtered.map((rec) => toSuggestion(rec));

    callback?.({
      suggestions: { [INPUT_KEY]: suggestions },
    });
  })
  .catch((err) => {
    console.log("Erreur suggestions RAMQ :", err);
    callback?.({
      suggestions: { [INPUT_KEY]: [] },
    });
  });
