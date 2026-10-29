console.log("Function119", context);

const showPopupMessage = (message, color = "#2ecc71", duration = 3000) => {
  showCustomPopup({
    title: "Message",
    commentHTML: `
      <div style="
        white-space: pre-line;
        color: #202127;
        font-size: 1rem;
        line-height: 1.4;
      ">
        ${message}
      </div>
    `,
    fields: [],
    buttons: [
      {
        key: "ok",
        name: "OK",
        preset: "action",
        backgroundColor: color,
        color: "#ffffff",
        onClick: () => {},
      },
    ],
  });
};

// ======================================================
// REQUIRED FIELDS
// ======================================================

const BASE_REQUIRED_FIELDS = [
  "Identite_Prenom",
  "Identite_Nom",
  "Identite_Adresse",
  "Identite_DateNaissance",
  "Identite_Age",
  "Identite_Rue",
  "Identite_Civique",
  "Identite_Ville",
  "Identite_Province",
  "Identite_CodePostal",
  "Identite_Sexe",
];

const FIELD_LABELS = {
  Identite_Prenom: "Prénom",
  Identite_Nom: "Nom",
  Identite_Adresse: "Adresse (ligne complète)",
  Identite_DateNaissance: "Date de naissance",
  Identite_Age: "Âge",
  Identite_Rue: "Rue",
  Identite_Civique: "Civique",
  Identite_Ville: "Ville",
  Identite_Province: "Province",
  Identite_CodePostal: "Code postal",
  Identite_Sexe: "Sexe",
  Identite_RAMQ: "RAMQ",
  Identite_TypeIdentification: "Type d'identification",
  Identite_Provenance: "Province de provenance",
  Identite_NumeroAssuranceMaladie: "Numéro d'assurance maladie",
};

const isPresent = (v) => !(v == null || String(v).trim() === "");

const isRAMQIdentification = (data) =>
  String(data?.Identite_TypeIdentification || "").trim() === "RAMQ";

const isOtherProvinceHealthCard = (data) =>
  String(data?.Identite_TypeIdentification || "").trim() ===
  "Carte santé d'une autre province";

const getRequiredFields = (data) => {
  const requiredFields = [...BASE_REQUIRED_FIELDS];

  if (isRAMQIdentification(data)) {
    requiredFields.push("Identite_RAMQ");
  }

  if (isOtherProvinceHealthCard(data)) {
    requiredFields.push(
      "Identite_Provenance",
      "Identite_NumeroAssuranceMaladie",
    );
  }

  return requiredFields;
};

const validateRequiredFields = (data) =>
  getRequiredFields(data).filter((k) => !isPresent(data[k]));

// ======================================================
// VALIDATION
// ======================================================

const validateRAMQ = (value) => {
  if (!value) return false;
  return /^[A-Z]{4} [0-9]{4} [0-9]{4}$/.test(String(value).trim());
};

const PROVINCE_HEALTH_CARD_VALIDATION = {
  AB: {
    regex: /^\d{5}-\d{4}$/,
    format: "NNNNN-NNNN",
    example: "12345-6789",
  },

  BC: {
    regex: /^\d{4} \d{3} \d{3}$/,
    format: "NNNN NNN NNN",
    example: "9234 567 897",
  },

  MB: {
    regex: /^\d{3} \d{3} \d{3}$/,
    format: "NNN NNN NNN",
    example: "123 456 789",
  },

  ON: {
    regex: /^\d{4}-\d{3}-\d{3}-[A-Za-z]{2}$/,
    format: "NNNN-NNN-NNN-AA",
    example: "1234-567-897-AB",
  },

  SK: {
    regex: /^\d{3} \d{3} \d{3}$/,
    format: "NNN NNN NNN",
    example: "123 456 789",
  },

  NB: {
    regex: /^\d{3}-\d{3}-\d{3}$/,
    format: "NNN-NNN-NNN",
    example: "123-456-782",
  },

  NS: {
    regex: /^\d{4} \d{3} \d{3}$/,
    format: "NNNN NNN NNN",
    example: "1234 567 897",
  },

  PE: {
    regex: /^\d{8}$/,
    format: "NNNNNNNN",
    example: "12345674",
  },

  NL: {
    regex: /^\d{3} \d{3} \d{3} \d{3}$/,
    format: "NNN NNN NNN NNN",
    example: "123 456 789 015",
  },

  NT: {
    regex: /^[A-Za-z]\d{7}$/,
    format: "LNNNNNNN",
    example: "D1234566",
  },

  NU: {
    regex: /^\d{9}$/,
    format: "NNNNNNNNN",
    example: "123456768",
  },

  YT: {
    regex: /^\d{3}-\d{3}-\d{3}$/,
    format: "NNN-NNN-NNN",
    example: "123-456-782",
  },
};

const getProvinceCode = (value) => {
  const raw = String(value || "")
    .trim()
    .toUpperCase();

  if (/^[A-Z]{2}$/.test(raw)) {
    return raw;
  }

  const match = raw.match(/\b[A-Z]{2}\b/);
  return match ? match[0] : "";
};

const validateOtherProvinceHealthCard = (provinceValue, cardValue) => {
  const provinceCode = getProvinceCode(provinceValue);
  const provinceValidation = PROVINCE_HEALTH_CARD_VALIDATION[provinceCode];

  if (!provinceCode) {
    return {
      valid: false,
      message:
        "Province de provenance invalide ou introuvable.\n\nFormat attendu : code province à 2 lettres, ex: ON, BC, NB.",
    };
  }

  if (!provinceValidation) {
    return {
      valid: false,
      message: `Aucune validation n'est configurée pour la province ${provinceCode}.`,
    };
  }

  const cleanedCardValue = String(cardValue || "").trim();

  if (!provinceValidation.regex.test(cleanedCardValue)) {
    return {
      valid: false,
      message:
        `Numéro d'assurance maladie invalide pour la province ${provinceCode}.\n\n` +
        `Format attendu : ${provinceValidation.format}\n` +
        `Exemple : ${provinceValidation.example}`,
    };
  }

  return { valid: true };
};

// ======================================================
// UI HELPERS
// ======================================================

const highlightFields = (keys) => {
  (keys || []).forEach((k) => {
    const el = document.getElementById(k);

    if (el) {
      el.style.outline = "2px solid #e74c3c";
      el.style.borderColor = "#e74c3c";

      el.addEventListener(
        "input",
        () => {
          el.style.outline = "";
          el.style.borderColor = "";
        },
        { once: true },
      );
    }
  });
};

// ======================================================
// API FORMAT HELPERS
// ======================================================

const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;

  (array || []).forEach((obj, index) => {
    Object.keys(obj || {}).forEach((k) => {
      result[`${k}|${index + 1}`] = obj[k];
    });
  });

  result[key] = String(itemCount);
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, k) => {
    if (!keys.includes(k)) result[k] = obj[k];
    return result;
  }, {});

const formatDataAPI = (data) => {
  let formatted = { ...(data || {}) };

  Object.keys(formatted).forEach((k) => {
    if (Array.isArray(formatted[k])) {
      formatted = { ...formatted, ...DataCollection(k, formatted[k]) };
    }
  });

  return JSON.stringify(excludeKeys(formatted, ["FORMID", "NUMBER"]));
};

// ======================================================
// MAIN
// ======================================================

console.log("docData :", docData);

const formID = String(docData.FORMID || "").trim();

if (!formID) {
  showPopupMessage(
    "FORMID introuvable : impossible de faire un update.",
    "#e74c3c",
    5000,
  );
  return;
}

const missing = validateRequiredFields(docData);

if (missing.length) {
  const lines = missing.map((k) => `• ${FIELD_LABELS[k] || k}`).join("\n");

  showPopupMessage(
    `Champs manquants ou Incorrects:\n${lines}\n\nComplète-les ou corrige les avant de continuer.`,
    "#e74c3c",
    6000,
  );

  highlightFields(missing);
  return;
}

// RAMQ seulement si Identite_TypeIdentification === "RAMQ"
if (isRAMQIdentification(docData)) {
  const ramqValue = String(docData.Identite_RAMQ || "").trim();

  if (!validateRAMQ(ramqValue)) {
    showPopupMessage(
      "RAMQ invalide (format attendu : AAAA 1234 5678).",
      "#e74c3c",
      5000,
    );

    highlightFields(["Identite_RAMQ"]);
    return;
  }
}

// Carte santé autre province seulement si Identite_TypeIdentification === "Carte santé d'une autre province"
if (isOtherProvinceHealthCard(docData)) {
  const provinceValue = docData.Identite_Provenance;
  const cardValue = docData.Identite_NumeroAssuranceMaladie;

  const validation = validateOtherProvinceHealthCard(provinceValue, cardValue);

  if (!validation.valid) {
    showPopupMessage(validation.message, "#e74c3c", 6000);

    highlightFields([
      "Identite_Provenance",
      "Identite_NumeroAssuranceMaladie",
    ]);

    return;
  }
}

const doc = {
  data: formatDataAPI(docData),
  status: "Actif",
  active: true,
  template: { templateId: "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e" },
  documentID: formID,
};

api({ local: true })
  .put("document", { document: doc, preventNotify: "FULL" })
  .then(() => {
    showPopupMessage("Client mis à jour et mis en statut Actif");

    setTimeout(() => {
      window.location.reload();
    }, 800);
  })
  .catch((error) => {
    console.error("Erreur lors de la mise à jour :", error);
    showPopupMessage("Erreur lors de la mise à jour", "#e74c3c");
  });
