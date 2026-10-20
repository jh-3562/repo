console.log("FONCTION 41", context);

const USE_STATUS_FILTER = true;
const MAX_SUGGESTIONS = 15;
const MIN_MATCH_SCORE = 200;
const MIN_MATCH_SCORE_SPECIAL = 10;
const MIN_RESULTS_FOR_GOOGLE_FALLBACK = 2;

// ---------- helpers ----------
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
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (s) => norm(s).split(" ").filter(Boolean);

const buildTitle = (d) => {
  const parts = [
    [pick(d, "AdressesFrequentes_NoCivique"), pick(d, "AdressesFrequentes_Rue")]
      .filter(Boolean)
      .join(" "),
    pick(d, "AdressesFrequentes_Ville"),
    pick(d, "AdressesFrequentes_Province"),
    pick(d, "AdressesFrequentes_CodePostal"),
    pick(d, "AdressesFrequentes_AdresseNom"),
  ].filter(Boolean);

  return parts.join(", ");
};

const buildFullSearchText = (d) => {
  return norm(
    [
      buildTitle(d),
      pick(d, "AdressesFrequentes_NoCivique"),
      pick(d, "AdressesFrequentes_Rue"),
      pick(d, "AdressesFrequentes_Ville"),
      pick(d, "AdressesFrequentes_Province"),
      pick(d, "AdressesFrequentes_CodePostal"),
      pick(d, "AdressesFrequentes_AdresseNom"),
      pick(d, "AdressesFrequentes_Appartement"),
      pick(d, "AdressesFrequentes_AdresseType"),
    ]
      .filter(Boolean)
      .join(" "),
  );
};

const scoreMatch = (query, candidates) => {
  const q = norm(query);
  if (!q) return 0;

  const qTokens = tokenize(q);
  if (!qTokens.length) return 0;

  let bestScore = 0;

  for (const candidateRaw of candidates) {
    const candidate = norm(candidateRaw);
    if (!candidate) continue;

    const candidateWords = candidate.split(" ").filter(Boolean);
    let score = 0;

    // match exact
    if (candidate === q) score += 1000;

    // contient toute la requête EN TANT QUE PHRASE (frontière de mot respectée)
    const wordBoundaryRegex = new RegExp(
      `(^|\\s)${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`,
    );
    if (wordBoundaryRegex.test(candidate)) score += 400;

    // tokens présents EN TANT QUE MOTS ENTIERS (pas substring)
    const matchedTokens = qTokens.filter((t) => candidateWords.includes(t));
    score += matchedTokens.length * 80;

    if (matchedTokens.length === qTokens.length) {
      score += 250;
    }

    if (candidate.startsWith(q)) score += 150;
    if (qTokens[0] && candidateWords[0] === qTokens[0]) score += 40;

    for (const token of qTokens) {
      if (candidateWords.includes(token)) score += 25;
    }

    // tolérance partielle seulement pour les mots (pas les chiffres, pour éviter 34/234)
    for (const token of qTokens) {
      if (token.length >= 3 && !/^\d+$/.test(token)) {
        const partial = candidateWords.some((w) =>
          w.startsWith(token.slice(0, 3)),
        );
        if (partial) score += 10;
      }
    }

    if (score > bestScore) bestScore = score;
  }

  return bestScore;
};

// ---------- routes ----------
const ROUTES_BY_INPUT = {
  Demande_TransportTransportSimpleAdresseCompleteDepart: {
    toSuggestion: (d) => ({
      title: buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportSimpleAdresseCompleteDepart",
          value: buildTitle(d),
          name: "Adresse complète (départ)",
        },
        {
          key: "Demande_TransportTransportSimpleNomLieuDepart",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroAdresseDepart",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (départ)",
        },
        {
          key: "TransportSysteme_LatitudeDepart",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (départ)",
        },
        {
          key: "TransportSysteme_LongitudeDepart",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude (départ)",
        },
        {
          key: "Demande_TypeAdresseDepart",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportSimpleNomVilleDepart",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (depart)",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone1Depart",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone2Depart",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportTransportSimpleAdresseCompleteDestination: {
    toSuggestion: (d) => ({
      title: buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportSimpleAdresseCompleteDestination",
          value: buildTitle(d),
          name: "Adresse complète (destination)",
        },
        {
          key: "Demande_TransportTransportSimpleNomLieuDestination",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroAdresseArrivee",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (destination)",
        },
        {
          key: "TransportSysteme_LatitudeDestination",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (destination)",
        },
        {
          key: "TransportSysteme_LongitudeDestination",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude (destination)",
        },
        {
          key: "Demande_TypeAdresseDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportSimpleNomVilleDestination",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (depart)",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone1Arrivee",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone2Arrivee",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportAerienReceveur: {
    toSuggestion: (d) => ({
      title: buildTitle(d),
      fields: [
        {
          key: "Demande_TransportAerienReceveur",
          value: buildTitle(d),
          name: "Adresse complète (destination)",
        },
        {
          key: "Demande_TransportAerienLieuReceveur",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroAdresseArrivee",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (destination)",
        },
        {
          key: "Demande_TypeAdresseDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "TransportSysteme_LatitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (destination)",
        },
        {
          key: "TransportSysteme_LongitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude retour (destination)",
        },
        {
          key: "Demande_TransportRoutierTelephone",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportRoutierPoste",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportTransportRetourAdresseCompleteDepart: {
    toSuggestion: (d) => ({
      title: buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportRetourAdresseCompleteDepart",
          value: buildTitle(d),
          name: "Adresse complète retour (départ)",
        },
        {
          key: "Demande_TransportTransportRetourNomLieuDepart",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (retour départ)",
        },
        {
          key: "Demande_TypeAdresseRetourDepart",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportRetourNumeroAdresseDepart",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (retour départ)",
        },
        {
          key: "TransportSysteme_LatitudeDepartRetour",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude retour (départ)",
        },
        {
          key: "TransportSysteme_LongitudeDepartRetour",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude retour (départ)",
        },
        {
          key: "Demande_TransportTransportRetourNomVilleDepart",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (depart)",
        },
        {
          key: "Demande_TransportTransportRetourNumeroTelephone1Depart",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportTransportRetourNumeroTelephone2Depart",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportTransportRetourAdresseCompleteDestination: {
    toSuggestion: (d) => ({
      title: buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportRetourAdresseCompleteDestination",
          value: buildTitle(d),
          name: "Adresse complète retour (destination)",
        },
        {
          key: "Demande_TransportTransportRetourNomLieuDestination",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (retour destination)",
        },
        {
          key: "Demande_TypeAdresseRetourDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportRetourNumeroAdresseArrivee",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (retour destination)",
        },
        {
          key: "TransportSysteme_LatitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude retour (destination)",
        },
        {
          key: "TransportSysteme_LongitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude retour (destination)",
        },
        {
          key: "Demande_TransportTransportRetourNomVilleDestination",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (destination)",
        },
        {
          key: "Demande_TransportTransportRetourNumeroTelephone1Arrivee",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportTransportRetourNumeroTelephone2Arrivee",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportTransportSimpleNomLieuDepart: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportSimpleNomLieuDepart",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (départ)",
        },
        {
          key: "Demande_TransportTransportSimpleAdresseCompleteDepart",
          value: buildTitle(d),
          name: "Adresse complète (départ)",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroAdresseDepart",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (départ)",
        },
        {
          key: "TransportSysteme_LatitudeDepart",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (départ)",
        },
        {
          key: "TransportSysteme_LongitudeDepart",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude (départ)",
        },
        {
          key: "Demande_TransportTransportSimpleNomVilleDepart",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (depart)",
        },
        {
          key: "Demande_TypeAdresseDepart",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone1Depart",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone2Depart",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportTransportSimpleNomLieuDestination: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportSimpleNomLieuDestination",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (destination)",
        },
        {
          key: "Demande_TransportTransportSimpleAdresseCompleteDestination",
          value: buildTitle(d),
          name: "Adresse complète (destination)",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroAdresseArrivee",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (destination)",
        },
        {
          key: "TransportSysteme_LatitudeDestination",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (destination)",
        },
        {
          key: "TransportSysteme_LongitudeDestination",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude (destination)",
        },
        {
          key: "Demande_TransportTransportSimpleNomVilleDestination",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (destination)",
        },
        {
          key: "Demande_TypeAdresseDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone1Arrivee",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroTelephone2Arrivee",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportAerienLieuReceveur: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportAerienLieuReceveur",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (destination)",
        },
        {
          key: "Demande_TransportAerienReceveur",
          value: buildTitle(d),
          name: "Adresse complète (destination)",
        },
        {
          key: "Demande_TransportTransportSimpleNumeroAdresseArrivee",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (destination)",
        },
        {
          key: "Demande_TransportRoutierVilleDeDestination",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville (destination)",
        },
        {
          key: "Demande_TypeAdresseDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "TransportSysteme_LatitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (destination)",
        },
        {
          key: "TransportSysteme_LongitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude retour (destination)",
        },
        {
          key: "Demande_TransportRoutierTelephone",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportRoutierPoste",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportTransportRetourNomLieuDepart: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportRetourNomLieuDepart",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (retour départ)",
        },
        {
          key: "Demande_TypeAdresseRetourDepart",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportRetourAdresseCompleteDepart",
          value: buildTitle(d),
          name: "Adresse complète retour (départ)",
        },
        {
          key: "Demande_TransportTransportRetourNumeroAdresseDepart",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (retour départ)",
        },
        {
          key: "TransportSysteme_LatitudeDepartRetour",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude retour (départ)",
        },
        {
          key: "TransportSysteme_LongitudeDepartRetour",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude (départ)",
        },
      ],
    }),
  },

  Demande_TransportTransportRetourNomLieuDestination: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportTransportRetourNomLieuDestination",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu (retour destination)",
        },
        {
          key: "Demande_TypeAdresseRetourDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportTransportRetourAdresseCompleteDestination",
          value: buildTitle(d),
          name: "Adresse complète retour (destination)",
        },
        {
          key: "Demande_TransportTransportRetourNumeroAdresseArrivee",
          value: pick(d, "AdressesFrequentes_Appartement"),
          name: "Appartement (retour destination)",
        },
        {
          key: "TransportSysteme_LatitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude (destination)",
        },
        {
          key: "TransportSysteme_LongitudeDestinationRetour",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude retour (destination)",
        },
      ],
    }),
  },

  TransportAerien_Lieuatterrissage: {
    toSuggestion: (d) => {
      const isRetour =
        docData?.DemandeTransportInformationsTransportRetour === true ||
        String(docData?.DemandeTransportInformationsTransportRetour || "")
          .trim()
          .toLowerCase() === "true";

      const title = pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d);

      const baseFields = [
        {
          key: "TransportAerien_Lieuatterrissage",
          value: title,
          name: "Lieu d'atterrissage",
        },
      ];

      if (isRetour) {
        return {
          title,
          fields: baseFields.concat([
            {
              key: "Demande_TransportTransportSimpleNomLieuDepart",
              value: title,
              name: "Nom du lieu (départ)",
            },
            {
              key: "Demande_TransportAerienRetourAddresseComplete",
              value: buildTitle(d),
              name: "Adresse complète (départ)",
            },
            // {
            //   key: "Demande_TransportTransportSimpleNumeroAdresseDepart",
            //   value: pick(d, "AdressesFrequentes_Appartement"),
            //   name: "Appartement (départ)",
            // },
            {
              key: "TransportSysteme_LatitudeDepartRetour",
              value: pick(d, "AdressesFrequentes_Latitude"),
              name: "Latitude (départ)",
            },
            {
              key: "TransportSysteme_LongitudeDepartRetour",
              value: pick(d, "AdressesFrequentes_Longitude"),
              name: "Longitude (départ)",
            },
            // {
            //   key: "Demande_TransportTransportSimpleNomVilleDepart",
            //   value: pick(d, "AdressesFrequentes_Ville"),
            //   name: "Ville (départ)",
            // },
            // {
            //   key: "Demande_TransportTransportSimpleNumeroTelephone1Depart",
            //   value: pick(d, "AdressesFrequentes_Cellulaire"),
            //   name: "Telephone #1",
            // },
            // {
            //   key: "Demande_TransportTransportSimpleNumeroTelephone2Depart",
            //   value: pick(d, "AdressesFrequentes_Poste1"),
            //   name: "Poste #1",
            // },
          ]),
        };
      }

      return {
        title,
        fields: baseFields.concat([
          {
            key: "Demande_TransportTransportSimpleNomLieuDestination",
            value: title,
            name: "Nom du lieu (destination)",
          },
          {
            key: "TransportSysteme_LatitudeDestination",
            value: pick(d, "AdressesFrequentes_Latitude"),
            name: "Latitude (destination)",
          },
          {
            key: "TransportSysteme_LongitudeDestination",
            value: pick(d, "AdressesFrequentes_Longitude"),
            name: "Longitude (destination)",
          },
          {
            key: "Demande_TransportTransportSimpleAdresseCompleteDestination",
            value: buildTitle(d),
            name: "Adresse complète (destination)",
          },
          {
            key: "Demande_TransportTransportSimpleNumeroAdresseArrivee",
            value: pick(d, "AdressesFrequentes_Appartement"),
            name: "Appartement (destination)",
          },
          {
            key: "Demande_TransportTransportSimpleNomVilleDestination",
            value: pick(d, "AdressesFrequentes_Ville"),
            name: "Ville (destination)",
          },
          {
            key: "Demande_TransportTransportSimpleNumeroTelephone1Arrivee",
            value: pick(d, "AdressesFrequentes_Cellulaire"),
            name: "Telephone #1",
          },
          {
            key: "Demande_TransportTransportSimpleNumeroTelephone2Arrivee",
            value: pick(d, "AdressesFrequentes_Poste1"),
            name: "Poste #1",
          },
        ]),
      };
    },
  },

  Demande_TransportRoutierLieuDepart: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportRoutierLieuDepart",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportRotierAdresseComplete",
          value: buildTitle(d),
          name: "Adresse complète",
        },
        {
          key: "Demande_TransportRoutierVilleDepart",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville",
        },
        {
          key: "Demande_TypeAdresseRoutierVersAeroport",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TransportAerienDepartRetourNumeroTelephone",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportAerienDepartRetourPoste",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportRoutierLieuDestination: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportRoutierLieuDestination",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportRoutierAdresseDeDestination",
          value: buildTitle(d),
          name: "Adresse complète",
        },
        {
          key: "Demande_TransportRoutierVilleDeDestination",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville",
        },
        {
          key: "Demande_TypeAdresseRoutierVersAeroportD",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "Demande_TypeAdresseRetourDestination",
          value: pick(d, "AdressesFrequentes_AdresseType"),
          name: "Type d'adresse",
        },
        {
          key: "TransportSysteme_LatitudeEtablissementReceveur",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude etablissement receveur",
        },
        {
          key: "TransportSysteme_LongitudeEtablissementReceveur",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude etablissement receveur",
        },
        {
          key: "Demande_TransportRoutierTelephone",
          value: pick(d, "AdressesFrequentes_Cellulaire"),
          name: "Telephone #1",
        },
        {
          key: "Demande_TransportRoutierPoste",
          value: pick(d, "AdressesFrequentes_Poste1"),
          name: "Poste #1",
        },
      ],
    }),
  },

  Demande_TransportRoutierAdresseDeDestination: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportRoutierLieuDestination",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportRoutierAdresseDeDestination",
          value: buildTitle(d),
          name: "Adresse complète",
        },
        {
          key: "Demande_TransportRoutierVilleDeDestination",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville",
        },
        {
          key: "TransportSysteme_LatitudeEtablissementReceveur",
          value: pick(d, "AdressesFrequentes_Latitude"),
          name: "Latitude etablissement receveur",
        },
        {
          key: "TransportSysteme_LongitudeEtablissementReceveur",
          value: pick(d, "AdressesFrequentes_Longitude"),
          name: "Longitude etablissement receveur",
        },
      ],
    }),
  },

  Demande_TransportRoutierAdresseComplete: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "Demande_TransportRoutierLieuDepart",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "Demande_TransportRoutierAdresseComplete",
          value: buildTitle(d),
          name: "Adresse complète",
        },
        {
          key: "Demande_TransportRoutierVilleDepart",
          value: pick(d, "AdressesFrequentes_Ville"),
          name: "Ville",
        },
      ],
    }),
  },

  TransportAerien_LieuAtterrissage2: {
    toSuggestion: (d) => {
      const isRetour =
        docData?.DemandeTransportInformationsTransportRetour === true ||
        String(docData?.DemandeTransportInformationsTransportRetour || "")
          .trim()
          .toLowerCase() === "true";

      const title = pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d);

      const baseFields = [
        {
          key: "TransportAerien_LieuAtterrissage2",
          value: title,
          name: "Lieu d'atterrissage",
        },
      ];
      if (isRetour) {
        return {
          title,
          fields: baseFields.concat([
            {
              key: "TransportAerien_LieuAtterrissage2",
              value: pick(d, "AdressesFrequentes_AdresseNom"),
              name: "Nom du lieu",
            },
            {
              key: "TransportAerien_AdresseAtterissage",
              value: buildTitle(d),
              name: "Adresse complète",
            },
            {
              key: "TransportSysteme_LatitudeAtterissage",
              value: pick(d, "AdressesFrequentes_Latitude"),
              name: "Latitude atterrissage",
            },
            {
              key: "TransportSysteme_LongitudeAtterissage",
              value: pick(d, "AdressesFrequentes_Longitude"),
              name: "Longitude atterrissage",
            },
            {
              key: "Demande_TransportAerienRetourAtterrissageTelephone",
              value: pick(d, "AdressesFrequentes_Cellulaire"),
              name: "Telephone #1",
            },
            {
              key: "Demande_TransportAerienRetourAtterrissagePoste",
              value: pick(d, "AdressesFrequentes_Poste1"),
              name: "Poste #1",
            },
          ]),
        };
      }
      return {
        title,
        fields: baseFields.concat([
          {
            key: "TransportAerien_LieuAtterrissage2",
            value: pick(d, "AdressesFrequentes_AdresseNom"),
            name: "Nom du lieu",
          },
          {
            key: "TransportAerien_AdresseAtterissage",
            value: buildTitle(d),
            name: "Adresse complète",
          },
          {
            key: "TransportSysteme_LatitudeAtterissage",
            value: pick(d, "AdressesFrequentes_Latitude"),
            name: "Latitude atterrissage",
          },
          {
            key: "TransportSysteme_LongitudeAtterissage",
            value: pick(d, "AdressesFrequentes_Longitude"),
            name: "Longitude atterrissage",
          },
          {
            key: "Demande_TransportAerienRetourAtterrissageTelephone",
            value: pick(d, "AdressesFrequentes_Cellulaire"),
            name: "Telephone #1",
          },
          {
            key: "Demande_TransportAerienRetourAtterrissagePoste",
            value: pick(d, "AdressesFrequentes_Poste1"),
            name: "Poste #1",
          },
        ]),
      };
    },
  },

  TransportAerien_AdresseAtterissage: {
    toSuggestion: (d) => ({
      title: pick(d, "AdressesFrequentes_AdresseNom") || buildTitle(d),
      fields: [
        {
          key: "TransportAerien_LieuAtterrissage2",
          value: pick(d, "AdressesFrequentes_AdresseNom"),
          name: "Nom du lieu",
        },
        {
          key: "TransportAerien_AdresseAtterissage",
          value: buildTitle(d),
          name: "Adresse complète",
        },
      ],
    }),
  },
};

// ---------- api filters ----------
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Adresses Fréquentes",
    type: "TEXT",
  },
];

// ---------- input key ----------
const IK =
  (typeof inputKey !== "undefined" && inputKey) ||
  (typeof INPUT_KEY !== "undefined" && INPUT_KEY) ||
  context?.inputKey ||
  context?.fieldKey ||
  context?.currentField ||
  null;

if (!IK || !ROUTES_BY_INPUT[IK]) {
  callback?.({ suggestions: { [IK || ""]: [] } });
  return;
}

const route = ROUTES_BY_INPUT[IK];
const userInput = String(docData?.[IK] ?? "").trim();

if (!norm(userInput)) {
  callback?.({ suggestions: { [IK]: [] } });
  return;
}

const SPECIAL_KEYS = new Set([
  "Demande_TransportTransportSimpleNomLieuDepart",
  "Demande_TransportTransportSimpleNomLieuDestination",
  "Demande_TransportTransportRetourNomLieuDepart",
  "Demande_TransportTransportRetourNomLieuDestination",
  "Demande_TransportTransportSimpleNumeroTelephone1Depart",
  "Demande_TransportTransportSimpleNumeroTelephone2Depart",
  "Demande_TypeAdresseRetourDepart",
  "TransportAerien_Lieuatterrissage",
  "Demande_TransportRoutierLieuDepart",
  "Demande_TransportRoutierLieuDestination",
  "Demande_TransportRoutierAdresseComplete",
  "Demande_TransportRoutierAdresseDeDestination",
  "Demande_TransportAerienLieuReceveur",
  "Demande_TransportAerienReceveur",
  "TransportAerien_LieuAtterrissage2",
  "TransportAerien_AdresseAtterissage",
]);

// ---------- candidates selection ----------
const buildCandidates = (d, inputKey) => {
  const base = [
    buildTitle(d),
    pick(d, "AdressesFrequentes_AdresseNom"),
    pick(d, "AdressesFrequentes_Rue"),
    pick(d, "AdressesFrequentes_Ville"),
    pick(d, "AdressesFrequentes_Province"),
    pick(d, "AdressesFrequentes_CodePostal"),
    pick(d, "AdressesFrequentes_Cellulaire"),
    [pick(d, "AdressesFrequentes_NoCivique"), pick(d, "AdressesFrequentes_Rue")]
      .filter(Boolean)
      .join(" "),
    buildFullSearchText(d),
  ].filter(Boolean);

  if (SPECIAL_KEYS.has(inputKey)) {
    return [
      pick(d, "AdressesFrequentes_AdresseNom"),
      buildTitle(d),
      buildFullSearchText(d),
    ].filter(Boolean);
  }

  return base;
};

const autocompleteService = new google.maps.places.AutocompleteService();

const geocoder = new google.maps.Geocoder();

const geocodeGoogleSuggestion = async (placeId, description) =>
  new Promise((resolve) => {
    const request = placeId ? { placeId } : { address: description };
    geocoder.geocode(request, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        resolve(results[0]);
      } else {
        resolve(null);
      }
    });
  });

const GOOGLE_ADDRESS_KEYS = new Set([
  "Demande_TransportTransportSimpleAdresseCompleteDepart",
  "Demande_TransportTransportSimpleAdresseCompleteDestination",
  "Demande_TransportTransportRetourAdresseCompleteDepart",
  "Demande_TransportTransportRetourAdresseCompleteDestination",
]);

const VILLE_FIELD_BY_INPUT = {
  Demande_TransportTransportSimpleAdresseCompleteDepart:
    "Demande_TransportTransportSimpleNomVilleDepart",
  Demande_TransportTransportSimpleAdresseCompleteDestination:
    "Demande_TransportTransportSimpleNomVilleDestination",
  Demande_TransportTransportRetourAdresseCompleteDepart:
    "Demande_TransportTransportRetourNomVilleDepart",
  Demande_TransportTransportRetourAdresseCompleteDestination:
    "Demande_TransportTransportRetourNomVilleDestination",
};

const getGoogleSuggestions = async (input, route) => {
  return new Promise((resolve) => {
    autocompleteService.getPlacePredictions(
      { input, componentRestrictions: { country: "ca" } },
      async (predictions, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK &&
          status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          resolve([]);
          return;
        }

        const suggestions = await Promise.all(
          (predictions || []).slice(0, 5).map(async (p) => {
            const geo = await geocodeGoogleSuggestion(
              p.place_id,
              p.description,
            );

            let ville = "";
            let codePostal = "";
            let latitude = "";
            let longitude = "";

            const latFn = geo?.geometry?.location?.lat;
            const lngFn = geo?.geometry?.location?.lng;
            if (typeof latFn === "function") {
              latitude = String(latFn());
            }
            if (typeof lngFn === "function") {
              longitude = String(lngFn());
            }

            if (geo?.address_components) {
              const locality = geo.address_components.find((part) =>
                part.types.includes("locality"),
              );
              if (locality) ville = locality.long_name;

              const postal = geo.address_components.find((part) =>
                part.types.includes("postal_code"),
              );
              if (postal) codePostal = postal.long_name;
            }

            // Titre enrichi avec le code postal, si trouvé
            const title = codePostal
              ? `${p.description}, ${codePostal}`
              : p.description;

            let fields = route.toSuggestion({}).fields.map((f) => {
              if (f.key === IK) return { ...f, value: p.description };
              if (f.key?.toLowerCase().includes("latitude")) {
                return { ...f, value: latitude };
              }
              if (f.key?.toLowerCase().includes("longitude")) {
                return { ...f, value: longitude };
              }
              if (f.name?.toLowerCase().includes("ville")) {
                return { ...f, value: ville };
              }
              return { ...f, value: "" };
            });

            const villeKey = VILLE_FIELD_BY_INPUT[IK];
            if (villeKey && !fields.some((f) => f.key === villeKey)) {
              fields.push({
                key: villeKey,
                name: "Ville",
                value: ville,
              });
            }

            return { title, fields };
          }),
        );

        resolve(suggestions);
      },
    );
  });
};

const main = async () => {
  try {
    const res2 = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    const formIds =
      (Array.isArray(res2?.data?.ids) && res2.data.ids) ||
      (Array.isArray(res2?.data) && res2.data) ||
      [];
    console.log("FormIds trouvés:", formIds.length); // a voir
    if (!formIds.length) {
      let suggestions = [];
      if (GOOGLE_ADDRESS_KEYS.has(IK)) {
        suggestions = await getGoogleSuggestions(userInput, route);
      }
      callback?.({ suggestions: { [IK]: suggestions } });
      return;
    }

    const res3 = await api({ local: true }).post("document/id", {
      ids: formIds,
    });

    const docs =
      (Array.isArray(res3?.data?.documents) && res3.data.documents) ||
      (Array.isArray(res3?.data) && res3.data) ||
      [];

    let records = docs
      .map((x) => {
        const parsed = safeParse(x?.data ?? x);
        if (!parsed.status && x?.status) parsed.status = x.status;
        return parsed;
      })
      .filter(Boolean);

    if (USE_STATUS_FILTER) {
      records = records.filter(
        (r) => String(r.status || r.Status || "").toLowerCase() === "actif",
      );
    }

    const minScoreToUse = SPECIAL_KEYS.has(IK)
      ? MIN_MATCH_SCORE_SPECIAL
      : MIN_MATCH_SCORE;

    const ranked = records
      .map((d) => {
        const candidates = buildCandidates(d, IK);
        const score = scoreMatch(userInput, candidates);
        return { d, score };
      })
      .filter((x) => x.score >= minScoreToUse) // au lieu de x.score > 0
      .sort((a, b) => b.score - a.score);

    let suggestions = ranked
      .slice(0, MAX_SUGGESTIONS)
      .map((x) => route.toSuggestion(x.d));

    if (
      suggestions.length < MIN_RESULTS_FOR_GOOGLE_FALLBACK &&
      GOOGLE_ADDRESS_KEYS.has(IK)
    ) {
      const googleSuggestions = await getGoogleSuggestions(userInput, route);
      suggestions = [...suggestions, ...googleSuggestions];
    }

    callback?.({ suggestions: { [IK]: suggestions } });
  } catch (err) {
    console.error("Erreur suggestions adresses :", err);
    callback?.({ suggestions: { [IK]: [] } });
  }
};

main();
