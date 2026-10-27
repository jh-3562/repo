console.log("Function 131 - Search suggestions", context);

// ======================================================
// 1. CONFIGURATION
// ======================================================

const config = {
  MAX_SUGGESTIONS: 10,

  FORM_LAYOUT: {
    KEY: "FORMLAYOUTNAME",
    VALUE: "UTILISATEUR",
  },

  INPUT_KEY: context?.inputKey,

  SOURCE: {
    //where to look
    ROLE: "Utilisateur_Type",
    FIRST_NAME: "Utilisateur_Prenom",
    LAST_NAME: "Utilisateur_Nom",
    FULL_NAME: "Identification_Utilisateur_NomComplet",
    PHONE: "Utilisateur_Telephone",
    EMAIL: "Utilisateur_Courriel",
    POSTE: "Utilisateur_Poste",
  },

  TARGET: {
    FIRST_NAME: "Demande_IdentificationChefServicePrenomChef",
    LAST_NAME: "Demande_IdentificationChefServiceNomChef",
    PHONE: "Demande_IdentificationChefServiceTelephoneChef",
    EMAIL: "Demande_IdentificationChefServiceCourrielChef",
    POSTE: "Demande_IdentificationChefServicePosteChef",
  },

  ROLE_TO_SEARCH: "Gestionnaire",
};

// ======================================================
// 2. DEBUG HELPERS
// ======================================================

const DEBUG_PREFIX = "[FUNCTION 130]";

const log = (...args) => {
  console.log(DEBUG_PREFIX, ...args);
};

const warn = (...args) => {
  console.warn(DEBUG_PREFIX, ...args);
};

const errorLog = (...args) => {
  console.error(DEBUG_PREFIX, ...args);
};

// ======================================================
// 3. HELPERS
// ======================================================

const safeParse = (raw, documentIndex = null) => {
  //   log("safeParse called", {
  //     documentIndex,
  //     rawType: typeof raw,
  //     rawPreview: typeof raw === "string" ? raw.substring(0, 300) : raw,
  //   });

  if (!raw) {
    warn("safeParse received empty raw data", { documentIndex });
    return {};
  }

  if (typeof raw === "object") {
    // log("safeParse received already-parsed object", { documentIndex });
    return raw;
  }

  try {
    const parsed = JSON.parse(raw);

    // log("safeParse success", {
    //   documentIndex,
    //   parsedKeys: Object.keys(parsed || {}),
    // });

    return parsed;
  } catch (err) {
    errorLog("safeParse failed", {
      documentIndex,
      error: err,
      rawPreview: String(raw).substring(0, 500),
    });

    return {};
  }
};

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const getValue = (object, key) => {
  const value = object?.[key] != null ? String(object[key]).trim() : "";

  if (!key) {
    warn("getValue called with empty key", { object });
  }

  return value;
};

// const logFieldKeyCheck = () => {
//   const docDataKeys = docData ? Object.keys(docData) : [];

//   const targetKeys = [
//     config.TARGET.FIRST_NAME,
//     config.TARGET.LAST_NAME,
//     config.TARGET.PHONE,
//     config.TARGET.EMAIL,
//     config.TARGET.POSTE,
//   ];

//   log("Checking if TARGET keys exist in current docData", {
//     targetKeys,
//     existingTargetKeys: targetKeys.filter((key) => docDataKeys.includes(key)),
//     missingTargetKeys: targetKeys.filter((key) => !docDataKeys.includes(key)),
//     usefulDocDataKeys: docDataKeys.filter(
//       (key) =>
//         normalize(key).includes("intervenant") ||
//         normalize(key).includes("telephone") ||
//         normalize(key).includes("courriel") ||
//         normalize(key).includes("poste") ||
//         normalize(key).includes("prenom") ||
//         normalize(key).includes("nom"),
//     ),
//   });
// };

// ======================================================
// 4. INPUT
// ======================================================

const ourInputKey = config.INPUT_KEY;
const inputValue = docData?.[ourInputKey] || "";
const searchedText = normalize(inputValue);

// log("Initial input check", {
//   ourInputKey,
//   inputValue,
//   searchedText,
//   hasDocData: !!docData,
//   docDataKeys: docData ? Object.keys(docData) : [],
// });

// logFieldKeyCheck();

if (!ourInputKey) {
  warn("Stopped: context.inputKey is missing", {
    context,
  });

  callback({
    suggestions: {
      UNKNOWN_INPUT_KEY: [],
    },
  });

  return;
}

if (!searchedText) {
  warn("Stopped: searched text is empty", {
    ourInputKey,
    inputValue,
  });

  callback({
    suggestions: {
      [ourInputKey]: [],
    },
  });

  return;
}

// ======================================================
// 5. API FILTERS
// ======================================================

const apiFilters = [
  {
    key: config.FORM_LAYOUT.KEY,
    operator: "EQUALS",
    value: config.FORM_LAYOUT.VALUE,
    type: "TEXT",
  },
];

//log("API filters prepared", apiFilters);

// ======================================================
// 6. GET IDS
// ======================================================

const getSuggestionIds = async () => {
  //   log("Calling API: document/id/filter", {
  //     filters: apiFilters,
  //   });

  const res = await api({ local: true }).post("document/id/filter", {
    filters: apiFilters,
  });

  //   log("API response from document/id/filter", {
  //     fullResponse: res,
  //     data: res?.data,
  //     ids: res?.data?.ids,
  //     idsCount: res?.data?.ids?.length || 0,
  //   });

  return res?.data?.ids || [];
};

// ======================================================
// 7. GET DOCUMENTS
// ======================================================

const getDocuments = async (ids) => {
  //   log("Calling API: document/id", {
  //     idsCount: ids.length,
  //     ids,
  //   });

  const res = await api({ local: true }).post("document/id", {
    ids,
  });

  //   log("API response from document/id", {
  //     fullResponse: res,
  //     data: res?.data,
  //     documentsCount: res?.data?.documents?.length || 0,
  //     documentsPreview: res?.data?.documents?.slice?.(0, 3),
  //   });

  return res?.data?.documents || [];
};

// ======================================================
// 8. BUILD SUGGESTIONS
// ======================================================

const buildSuggestions = (documents) => {
  //log("Building suggestions started", {
  //  documentsCount: documents.length,
  //  searchedText,
  //  roleToSearch: config.ROLE_TO_SEARCH,
  //  normalizedRoleToSearch: normalize(config.ROLE_TO_SEARCH),
  //});

  const parsedUsers = documents.map((document, index) => {
    const parsed = safeParse(document.data, index);

    //log("Parsed document", {
    //  index,
    //  documentId: document.id,
    //  parsedData: parsed,
    //  parsedKeys: Object.keys(parsed || {}),
    //});

    return parsed;
  });

  //log("All documents parsed", {
  //  parsedUsersCount: parsedUsers.length,
  //});

  const usersWithWantedRole = parsedUsers.filter((user, index) => {
    const rawRole = getValue(user, config.SOURCE.ROLE);
    const userRole = normalize(rawRole);
    const wantedRole = normalize(config.ROLE_TO_SEARCH);
    const keep = userRole === wantedRole;

    //log("Role filter check", {
    //  index,
    //  rawRole,
    //  normalizedRole: userRole,
    //  wantedRole,
    //  keep,
    //  userPreview: {
    //    firstName: getValue(user, config.SOURCE.FIRST_NAME),
    //    lastName: getValue(user, config.SOURCE.LAST_NAME),
    //    fullName: getValue(user, config.SOURCE.FULL_NAME),
    //    phone: getValue(user, config.SOURCE.PHONE),
    //    email: getValue(user, config.SOURCE.EMAIL),
    //    poste: getValue(user, config.SOURCE.POSTE),
    //  },
    //});

    return keep;
  });

  //log("After role filter", {
  //  before: parsedUsers.length,
  //  after: usersWithWantedRole.length,
  //});

  const matchingUsers = usersWithWantedRole.filter((user, index) => {
    const rawFullName = getValue(user, config.SOURCE.FULL_NAME);
    const fullName = normalize(rawFullName);
    const keep = fullName.includes(searchedText);

    //log("Text search filter check", {
    //  index,
    //  rawFullName,
    //  normalizedFullName: fullName,
    //  searchedText,
    //  keep,
    //});

    return keep;
  });

  //log("After text search filter", {
  //  before: usersWithWantedRole.length,
  //  after: matchingUsers.length,
  //});

  const limitedUsers = matchingUsers.slice(0, config.MAX_SUGGESTIONS);

  //log("After max suggestions limit", {
  //  maxSuggestions: config.MAX_SUGGESTIONS,
  //  before: matchingUsers.length,
  //  after: limitedUsers.length,
  //});

  const suggestions = limitedUsers.map((user, index) => {
    const fullName = getValue(user, config.SOURCE.FULL_NAME);
    const firstName = getValue(user, config.SOURCE.FIRST_NAME);
    const lastName = getValue(user, config.SOURCE.LAST_NAME);
    const phone = getValue(user, config.SOURCE.PHONE);
    const email = getValue(user, config.SOURCE.EMAIL);
    const poste = getValue(user, config.SOURCE.POSTE);

    let selectedInputValue = fullName;

    if (ourInputKey === config.TARGET.FIRST_NAME) {
      selectedInputValue = firstName;
    }

    if (ourInputKey === config.TARGET.LAST_NAME) {
      selectedInputValue = lastName;
    }

    const fields = [
      {
        key: config.TARGET.FIRST_NAME,
        value: firstName,
        name: "Prénom intervenant",
      },
      {
        key: config.TARGET.LAST_NAME,
        value: lastName,
        name: "Nom intervenant",
      },
      {
        key: config.TARGET.PHONE,
        value: phone,
        name: "Téléphone intervenant",
      },
      {
        key: config.TARGET.EMAIL,
        value: email,
        name: "Courriel intervenant",
      },
      {
        key: config.TARGET.POSTE,
        value: poste,
        name: "Poste intervenant",
      },
    ];

    // log("Creating suggestion", {
    //   index,
    //   fullName,
    //   selectedInputValue,
    //   firstName,
    //   lastName,
    //   phone,
    //   email,
    //   poste,
    //   targetInputKey: ourInputKey,
    //   fields,
    //   emptyFields: fields.filter((field) => !field.value),
    //   targetKeys: fields.map((field) => field.key),
    // });

    return {
      title: selectedInputValue, // shown in the dropdown
      value: selectedInputValue, // inserted into the field being searched
      fields, // fills the other linked fields
    };
  });

  //   log("Building suggestions finished", {
  //     suggestionsCount: suggestions.length,
  //     suggestions,
  //   });

  return suggestions;
};

// ======================================================
// 9. MAIN
// ======================================================

const main = async () => {
  //   log("Main started");

  try {
    const ids = await getSuggestionIds();

    // log("IDs received", {
    //   idsCount: ids.length,
    //   ids,
    // });

    if (!ids.length) {
      warn("No IDs found from API filter. Returning empty suggestions.", {
        apiFilters,
      });

      callback({
        suggestions: {
          [ourInputKey]: [],
        },
      });

      return;
    }

    const documents = await getDocuments(ids);

    // log("Documents received", {
    //   documentsCount: documents.length,
    //   documents,
    // });

    if (!documents.length) {
      warn(
        "No documents returned from document/id API. Returning empty suggestions.",
        {
          ids,
        },
      );

      callback({
        suggestions: {
          [ourInputKey]: [],
        },
      });

      return;
    }

    const suggestions = buildSuggestions(documents);

    const payload = {
      suggestions: {
        [ourInputKey]: suggestions,
      },
    };

    // log("Final callback payload", {
    //   ourInputKey,
    //   suggestionsCount: suggestions.length,
    //   payload,
    // });

    callback(payload);

    // log("Callback completed successfully");
  } catch (error) {
    errorLog("Search suggestion error caught in main", {
      error,
      message: error?.message,
      stack: error?.stack,
    });

    callback({
      suggestions: {
        [ourInputKey]: [],
      },
    });

    warn("Returned empty suggestions because of error");
  }
};

main();
