console.log("Function 127", context);

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Transporteur",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Actif",
    type: "TEXT",
  }
];

// ---------- Helpers ----------
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

// ---------- Champ qui a l'autocomplete ----------
const key =
  typeof inputKey === "string" && inputKey
    ? inputKey
    : "Répartition_Transporteur";

// ---------- Title = nom du transporteur ----------
const buildTitle = (d) => pick(d, "NomTransporteur").trim();

// ---------- Suggestion ----------
const toSuggestion = (d) => {
  const title = buildTitle(d);
  return {
    title,
    fields: [
      { key: "Répartition_Transporteur", name: "Transporteur", value: title },
      {
        key: "NomTransporteurSearch",
        name: "Nom du transporteur",
        value: title,
      },
    ],
  };
};

// ---------- User input (ce que l'utilisateur tape) ----------
const userInput = (docData?.[key] ?? "").trim();
const userQuery = norm(userInput);

api({ local: true })
  .post("document/id/filter", { filters: apiFilters })
  .then((res2) => {
    const formIds =
      (Array.isArray(res2?.data?.ids) && res2.data.ids) ||
      (Array.isArray(res2?.data) && res2.data) ||
      [];

    return api({ local: true }).post("document/id", { ids: formIds });
  })
  .then((res3) => {
    const docs =
      (Array.isArray(res3?.data?.documents) && res3.data.documents) ||
      (Array.isArray(res3?.data) && res3.data) ||
      [];

    // 1) parse
    const records = docs
      .map((x) => {
        const parsed = safeParse(x?.data ?? x);
        if (!parsed.status && x?.status) parsed.status = x.status;
        return parsed;
      })
      .filter(Boolean);

    // 2) Actif seulement
    const onlyActive = records.filter(
      (r) => norm(r.status || r.Status) === "actif",
    );

    // 3) nom présent + startsWith
    const filtered = onlyActive.filter((d) => {
      const name = buildTitle(d);
      if (!name) return false;
      if (!userQuery) return true;
      return norm(name).startsWith(userQuery);
    });

    // 4) dédoublonnage des noms
    const seen = new Set();
    const unique = filtered.filter((d) => {
      const k2 = norm(buildTitle(d));
      if (seen.has(k2)) return false;
      seen.add(k2);
      return true;
    });

    const suggestions = unique.map(toSuggestion);

    if (typeof callback === "function") {
      callback({
        suggestions: {
          [key]: suggestions,
        },
      });
    } else {
      console.warn("callback non défini");
    }
  })
  .catch((err) => {
    console.error("Erreur:", err);
    if (typeof callback === "function") {
      callback({ suggestions: { [key]: [] } });
    }
  });
