console.log("Fonction 211", context);

// ======================================================
// CONFIG
// ======================================================

const possibleTriggers = [
  // which fields can trigger this (DO NOT FORGETTO ADD CORRESPONDING TRIGGERS)
  "Demande_NumeroAssuranceMaladie",
];

const fieldMap = {
  //where to put the results accordingly from the triggers
  Demande_NumeroAssuranceMaladie: {
    numero: "Demande_NumeroAssuranceMaladie",
    nom: "Demande_IdentificationIdentificationUsagerNom",
    prenom: "Demande_IdentificationIdentificationUsagerPrenom",
    telephone: "Identite_Telephone",
    courriel: "Identite_Courriel",
    addresse: "Identite_Adresse",
    appartement: "Identite_Appartement",

    identcivique: "Identite_Civique",
    rue: "Identite_Rue",
    ville: "Identite_Ville",
    province: "Identite_Province",
    codepostal: "Identite_CodePostal",
    oxygenodependant:
      "Demande_IdentificationIdentificationUsagerOxygenodependant",
    debit: "Demande_IdentificationIdentificationUsagerDebit",
    diabetique: "Demande_IdentificationIdentificationUsagerDiabétique",
    insudependant: "Demande_IdentificationStatutDiabetiqueEstInsulinodependant",
    autreinfo: "Identite_AutreInfo",
    pph: "Demande_PPH",
    poids: "Demande_IdentificationPoids",
    poidsunit: "Identification_MesurePoids",
    typepph: "Demande_TypeClientele",

    datenaissance: "Demande_IdentificationIdentificationUsagerDateNaissance",
    age: "Demande_IdentificationIdentificationUsagerAge",
    sexe: "Demande_IdentificationIdentificationUsagerSexe",
    expiration: "Identite_Expiration_Required",
    langues: "Identite_Langues",
    languesautres: "Identification_LangueAutre",
  },
};

// ======================================================
// HELPERS
// ======================================================

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Erreur JSON.parse sur le document:", error, raw);
    return {};
  }
};

const getDocumentIDsByFilters = async (filters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    console.error("Erreur lors de la recherche des IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  try {
    const response = await api({ local: true }).post("document/id", {
      ids,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
};

const searchInternalPersons = async ({ needle, searchField, limit = 10 }) => {
  //Modify according to what you're searching

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Usager",
      type: "TEXT",
    },
    {
      key: "Identite_TypeIdentification",
      operator: "EQUALS",
      value: "Carte santé d'une autre province",
      type: "TEXT",
    },
    {
      key: "Identite_Provenance",
      operator: "EQUALS",
      value: docData.Identite_Provenance,
      type: "TEXT",
    },
    {
      //NEVER MODIFY, THIS ELEMENT IS BASICALLY THE ONE THAT MATCHES THE SEARCHFIELD WITH CORRESPONDING ONE IN PLACE YOURE LOOKING
      key: searchField,
      operator: "CONTAINS",
      value: needle,
      type: "TEXT",
    },
  ];
  //console.log("TEMP 211 - APIFILTERS", apiFilters);
  const ids = await getDocumentIDsByFilters(apiFilters);
  const limitedIds = ids.slice(0, limit);

  const documents = await getDocumentsByIDs(limitedIds);

  return documents.map((document) => {
    const data = safeParse(document.data);

    return {
      document,
      data, // I know what we're looking for is in there but hqving both the bulk and explicit is better.

      numero: data.Identite_NumeroAssuranceMaladie || "", //Modify those fields with the fetch stuff ie the other fields that should be returned and filled along according to their values/field in the place where you're looking
      nom: data.Identite_Nom || "",
      prenom: data.Identite_Prenom || "",
      telephone: data.Identite_Telephone || "",
      courriel: data.Identite_Courriel || "",
      addresse: data.Identite_Adresse || "",
      appartement: data.Identite_Appartement || "",

      identcivique: data.Identite_Civique || "",
      rue: data.Identite_Rue || "",
      ville: data.Identite_Ville || "",
      province: data.Identite_Province || "",
      codepostal: data.Identite_CodePostal || "",
      oxygenodependant:
        data.Demande_IdentificationIdentificationUsagerOxygenodependant || "",
      debit: data.Demande_IdentificationIdentificationUsagerDebit || "",
      diabetique:
        data.Demande_IdentificationIdentificationUsagerDiabétique || "",
      insudependant:
        data.Demande_IdentificationStatutDiabetiqueEstInsulinodependant || "",
      autreinfo: data.Identite_AutreInfo || "",
      pph: data.Demande_PPH || "",
      poids: data.Demande_IdentificationPoids || "",
      poidsunit: data.Identification_MesurePoids || "",
      typepph: data.Demande_TypeClientele || "",

      datenaissance: data.Identite_DateNaissance || "",
      age: data.AdressesFrequentes_Latitude || "",
      sexe: data.Identite_Sexe || "",
      expiration: data.Identite_Expiration_Required || "",
      langues: data.Identite_Langues || "",
      languesautres: data.Identification_LangueAutre || "",
    };
  });
};

// ======================================================
// MAIN
// ======================================================

const main = async () => {
  try {
    const updated = Array.isArray(context?.updatedKeys)
      ? context.updatedKeys
      : [];

    const triggerField = updated.find((key) => possibleTriggers.includes(key));

    if (!triggerField) {
      callback({ suggestions: {} });
      return;
    }

    const needle = String(docData?.[triggerField] ?? "").trim();

    if (!needle) {
      callback({ suggestions: { [triggerField]: [] } });
      return;
    }

    const targets = fieldMap[triggerField];

    if (!targets) {
      callback({ suggestions: { [triggerField]: [] } });
      return;
    }

    const searchFieldMap = {
      //depending on the search field, which field is the corresponding one in the "place to search" so to speak
      AssuranceMaladie: "Identite_NumeroAssuranceMaladie",
      // ex if the field ends in NomDuLieu like DemandeRetourD_NomDuLieu for ex, then the corresponding field to look for
      //in the source one is Adresses_NomLocation
    };

    const matchedSearchEntry = Object.entries(searchFieldMap).find(
      ([triggerSuffix]) => triggerField.endsWith(`${triggerSuffix}`),
    );

    if (!matchedSearchEntry) {
      callback({ suggestions: { [triggerField]: [] } });
      return;
    }

    const [triggerSuffix, searchField] = matchedSearchEntry;

    const results = await searchInternalPersons({
      needle,
      searchField,
      limit: 10,
    });

    const titleBySuffix = {
      AssuranceMaladie: "numero",
    };

    const titleKey = titleBySuffix[triggerSuffix] || "numero";

    const suggestions = results.map((result) => {
      return {
        title: result[titleKey] || "",

        fields: [
          //replace as needed
          {
            key: targets.numero,
            name: "Num. Assurance",
            value: result.numero,
          },
          {
            key: targets.nom,
            name: "Nom",
            value: result.nom,
          },
          {
            key: targets.prenom,
            name: "Prenom",
            value: result.prenom,
          },

          {
            key: targets.telephone,
            name: "Telephone",
            value: result.telephone,
          },
          {
            key: targets.courriel,
            name: "Courriel",
            value: result.courriel,
          },
          {
            key: targets.addresse,
            name: "Addresse",
            value: result.addresse,
          },

          {
            key: targets.appartement,
            name: "Appartement",
            value: result.appartement,
          },

          {
            key: targets.identcivique,
            name: "ID. Civique",
            value: result.identcivique,
          },
          {
            key: targets.rue,
            name: "Rue",
            value: result.rue,
          },
          {
            key: targets.ville,
            name: "Ville",
            value: result.ville,
          },
          {
            key: targets.province,
            name: "Province",
            value: result.province,
          },
          {
            key: targets.codepostal,
            name: "Code Postal",
            value: result.codepostal,
          },
          {
            key: targets.oxygenodependant,
            name: "Oxy. Dependant",
            value: result.oxygenodependant ?? "",
          },
          {
            key: targets.debit,
            name: "Debit",
            value: result.debit,
          },
          {
            key: targets.diabetique,
            name: "Diabetique",
            value: result.diabetique ?? "",
          },
          {
            key: targets.insudependant,
            name: "Insu. Dependant",
            value: result.insudependant,
          },
          {
            key: targets.autreinfo,
            name: "Autre Info",
            value: result.autreinfo,
          },
          {
            key: targets.pph,
            name: "PPH?",
            value: result.pph,
          },
          {
            key: targets.poids,
            name: "Poids",
            value: result.poids,
          },
          {
            key: targets.poidsunit,
            name: "Unite de poids",
            value: result.poidsunit,
          },

          {
            key: targets.typepph,
            name: "Type Clientele",
            value: result.typepph,
          },

          {
            key: targets.datenaissance,
            name: "Date de naissance",
            value: result.datenaissance,
          },
          {
            key: targets.age,
            name: "Age",
            value: result.age,
          },
          {
            key: targets.sexe,
            name: "Sexe",
            value: result.sexe,
          },
          {
            key: targets.expiration,
            name: "Expiration",
            value: result.expiration,
          },
          {
            key: targets.langues,
            name: "Langues",
            value: result.langues,
          },
          {
            key: targets.languesautres,
            name: "Autres langues parlées",
            value: result.languesautres,
          },
        ],
      };
    });

    callback({
      suggestions: {
        [triggerField]: suggestions,
      },
    });
  } catch (error) {
    console.error("function 211 error", error);
    callback({ suggestions: {} });
  }
};

main();
