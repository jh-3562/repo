console.log("FONCTION 48", context);

const MAX_SUGGESTIONS = 15;
const FORM_LAYOUT_ID = "90737127-32da-4bb9-8d95-54b986c978eb";
const FIELD_KEY = "Operation_NomDuTransporteur";
const INDISPONIBILITES_FORMLAYOUTID = "7d19c79c-8a4a-418c-8d1a-89d0139ecb00";

const apiFilters = [
  {
    key: "FORMLAYOUTID",
    operator: "EQUALS",
    value: FORM_LAYOUT_ID,
    type: "TEXT",
  },
];

//const safeParse = (raw) => {
//  if (!raw) return {};
//
//  if (typeof raw === "object") {
//    console.log("OBJECT?? safeparse actually needed ? or check where and why");
//    return raw;
//  }
//
//  try {
//    return JSON.parse(raw);
//  } catch {
//    return {};
//  }
//};

const pick = (o, k) => (o?.[k] != null ? String(o[k]).trim() : "");

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

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
    if (!Array.isArray(documentIDs) || !documentIDs.length) {
      return [];
    }

    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const toDate = (value) => {
  const date = new Date(
    String(value || "")
      .trim()
      .replace(" ", "T"),
  );
  return isNaN(date.getTime()) ? null : date;
};

// Indisponibilités actives aux dates du transport, groupées par transporteur.
const getIndisponibilitesParTransporteur = async (
  debutTransport,
  finTransport,
) => {
  const result = {};
  if (!debutTransport || !finTransport) return result;

  const ids = await getDocumentIDsByFilters([
    {
      key: "FORMLAYOUTID",
      operator: "EQUALS",
      value: INDISPONIBILITES_FORMLAYOUTID,
      type: "TEXT",
    },
    { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    {
      key: "Transporteur_Indisponibilites_Date",
      operator: "BETWEEN",
      value: `${debutTransport.toLocaleDateString("en-CA")}|${finTransport.toLocaleDateString("en-CA")}`,
      type: "DATE",
    },
  ]);
  if (!ids.length) return result;

  const docs = await getDocumentsByIDs(ids);
  for (const document of docs) {
    const data = JSON.parse(document.data);
    const debut = toDate(data.Demande_DateHeureDebut);
    const fin = toDate(data.Demande_DateHeureFin);
    const chevauche =
      debut && fin && debut < finTransport && fin > debutTransport;
    if (!chevauche) continue;

    const transporteurID = data.Transporteur_Indisponibilites_TransporteurID;
    (result[transporteurID] ||= []).push(
      `${data.Transporteur_Indisponibilites_HeureDebut}-${data.Transporteur_Indisponibilites_HeureFin}`,
    );
  }
  return result;
};

const sendSuggestions = (activeFieldKey, suggestions = []) => {
  callback?.({
    suggestions: {
      [activeFieldKey]: suggestions,
    },
  });
};

const main = async () => {
  //const IK =
  //  (typeof inputKey !== "undefined" && inputKey) ||
  //  (typeof INPUT_KEY !== "undefined" && INPUT_KEY) ||
  //  context?.inputKey ||
  //  context?.fieldKey ||
  //  context?.currentField ||
  //  null;

  //See if just THAT works
  const activeFieldKey = context.inputKey;

  //const sourceFieldKey =
  //  (typeof activeFieldKey === "string" &&
  //    docData?.[activeFieldKey] != null &&
  //    activeFieldKey) ||
  //  FIELD_KEY;

  const sourceFieldKey = activeFieldKey;

  const userInput = norm(docData?.[sourceFieldKey]);

  if (!userInput) {
    sendSuggestions(activeFieldKey, []);
    return;
  }

  const documentIDs = await getDocumentIDsByFilters(apiFilters);

  if (!documentIDs.length) {
    sendSuggestions(activeFieldKey, []);
    return;
  }

  const docs = await getDocumentsByIDs(documentIDs);

  console.log("DOCS =", docs);

  const parsedDocs = docs
    .map((document) => {
      //const d = safeParse(x?.data ?? x);
      const data = JSON.parse(document.data);

      const transporteurNomPrenom = pick(data, "Transporteur_NomPrenom");
      const transporteurType = pick(data, "Transporteur_Type");
      const number = pick(document, "number");
      const documentID = pick(document, "documentID");

      return {
        transporteurNomPrenom,
        transporteurType,
        number,
        documentID,
        searchText: norm(
          `${transporteurNomPrenom} ${transporteurType} ${number}`,
        ),
      };
    })
    .filter((x) => x.transporteurNomPrenom && x.searchText.includes(userInput))
    .slice(0, MAX_SUGGESTIONS);

  console.log(
    "MATCHING DOCUMENTS =",
    parsedDocs.map((x) => ({
      transporteurNomPrenom: x.nomPrenom,
      number: x.number,
      documentID: x.documentID,
    })),
  );

  // Un transporteur indisponible pendant le transport ne peut pas être choisi :
  // sa suggestion vide le champ au lieu de l'assigner.
  const indisponibilites = await getIndisponibilitesParTransporteur(
    toDate(docData?.Demande_DateHeureDebut),
    toDate(docData?.Demande_DateHeureFin),
  );

  const suggestions = parsedDocs.map((x) => {
    const plages = indisponibilites[x.documentID];
    if (plages) {
      return {
        title: `⛔ ${x.transporteurNomPrenom} — indisponible ${plages.join(", ")}`,
        fields: [
          { key: activeFieldKey, value: "", name: "Nom du transporteur" },
          {
            key: "Transport_IDTransporteur",
            value: "",
            name: "ID Transporteur",
          },
        ],
      };
    }
    return transporteurDisponible(x);
  });

  sendSuggestions(activeFieldKey, suggestions);
};

const transporteurDisponible = (x) => {
  const activeFieldKey = context.inputKey;
  return {
    title: x.transporteurNomPrenom,

    fields: [
      {
        key: activeFieldKey,
        value: x.transporteurNomPrenom,
        name: "Nom du transporteur",
      },
      {
        key: "dummykey",
        value: x.transporteurType,
        name: "Type de transporteur",
      },
      {
        key: "Transport_IDTransporteur",
        value: x.documentID,
        name: "ID Transporteur",
      },
      {
        key: `${activeFieldKey}_number`,
        value: `#${x.number}`,
        name: "Numéro",
      },
    ],
  };
};

main();
