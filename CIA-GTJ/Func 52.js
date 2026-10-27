console.log("FONCTION 52");

// ---------- CONFIG ----------
const MAX_SUGGESTIONS = 15;
const FORM_LAYOUT_ID = "1f384f8f-2c25-49cd-bde8-86e7d19a5a8b";

// ---------- helpers ----------
function safeParse(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

function pick(o, k) {
  return o?.[k] != null ? String(o[k]).trim() : "";
}

function norm(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- INPUT ----------
const IK = context?.inputKey;
const userInput = norm(docData?.[IK] || "");

if (!IK || !userInput) {
  callback?.({ suggestions: { [IK]: [] } });
  return;
}

// ---------- API ----------
api({ local: true })
  .post("document/id/filter", {
    filters: [
      {
        key: "FORMLAYOUTID",
        operator: "EQUALS",
        value: FORM_LAYOUT_ID,
        type: "TEXT",
      },
    ],
  })
  .then((res) => {
    const ids = res?.data?.ids || [];
    if (!ids.length) throw "NO_IDS";

    return api({ local: true }).post("document/id", { ids });
  })
  .then((res) => {
    const docs = res?.data?.documents || [];

    const suggestions = docs
      .map((x) => safeParse(x?.data ?? x))
      .filter((d) =>
        norm(pick(d, "Utilisateur_Type")) === "gestionnaire"
      )
      .map((d) => {
        const nomComplet = pick(d, "Identification_Utilisateur_NomComplet");

        return {
          nomComplet,
          prenom: pick(d, "Utilisateur_Prenom"),
          nom: pick(d, "Utilisateur_Nom"),
          telephone: pick(d, "Utilisateur_Telephone"),
          poste: pick(d, "Utilisateur_Poste"),
          courriel: pick(d, "Utilisateur_Courriel"),
          searchText: norm(nomComplet),
        };
      })
      .filter((x) => x.nomComplet && x.searchText.includes(userInput))
      .slice(0, MAX_SUGGESTIONS)
      .map((x) => ({
        title: x.nomComplet,
        fields: [
          { key: IK, value: x.nomComplet },
          { key: "Utilisateur_PrenomChef", value: x.prenom },
          { key: "Utilisateur_NomChef", value: x.nom },
          { key: "Utilisateur_TelephoneChef", value: x.telephone },
          { key: "Utilisateur_PosteChef", value: x.poste },
          { key: "Utilisateur_CourrielChef", value: x.courriel },
        ],
      }));

    callback?.({
      suggestions: { [IK]: suggestions },
    });
  })
  .catch(() => {
    callback?.({
      suggestions: { [IK]: [] },
    });
  });
