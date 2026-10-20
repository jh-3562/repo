console.log("Fonction 60", context);

const FIELD_DATE_SIMPLE   = "Demande_TransportTransportSimpleDateTransportArrivee";
const FIELD_HEURE_SIMPLE  = "Demande_TransportTransportSimpleHeureArriveeSouhaite";

const FIELD_DATE_RETOUR   = "Demande_TransportTransportRetourDateTransportArrivee";
const FIELD_HEURE_RETOUR  = "Demande_TransportTransportRetourHeureArriveeSouhaite";

//const FIELD_DATE_RETOUR   = "Demande_TransportTransportRetourDateTransportArrivee";
//const FIELD_HEURE_RETOUR  = "Demande_TransportTransportRetourHeureArriveeSouhaite";

const OUT_FIELD = "TransportSysteme_DateFin";

// Récurrence
const FIELD_REC_FLAG   = "Demande_TransportInformationTransportAvecReccurence";        // "true"/"false" ou bool
const FIELD_REC_START  = "Demande_TransportInformationTransportDateDebutReccurence";   // YYYY-MM-DD
const FIELD_REC_END    = "Demande_TransportInformationTransportDateFinReccurence";     // YYYY-MM-DD

const normalizeTime = (s) => {
  if (!s) return "";
  let t = String(s).trim().toLowerCase()
    .replace(/\s*h\s*/g, ":")
    .replace(/\s+/g, "");
  if (/^\d{3,4}$/.test(t)) t = (t.length === 3 ? "0"+t : t).replace(/(\d{2})(\d{2})/, "$1:$2");
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(t);
  if (!m) return "";
  const hh = String(Math.min(Math.max(+m[1],0),23)).padStart(2,"0");
  const mm = String(Math.min(Math.max(+m[2],0),59)).padStart(2,"0");
  return `${hh}:${mm}`;
};

// Ajoute N années à une date YYYY-MM-DD (gère les 29/02 proprement)
const addYearsYYYYMMDD = (dateStr, years) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y + years, m - 1, d));
  // toISOString() renvoie en UTC -> on récupère la partie date YYYY-MM-DD
  return dt.toISOString().slice(0,10);
};

// 1) Sélection des champs "arrivée" (retour en priorité, sinon simple)
let dateChoisie  = docData?.[FIELD_DATE_RETOUR]  || docData?.[FIELD_DATE_SIMPLE];
let heureChoisie = normalizeTime(docData?.[FIELD_HEURE_RETOUR] || docData?.[FIELD_HEURE_SIMPLE]);

// 2) Récurrence : si active, on remplace la DATE
const hasRecurrence =
  docData?.[FIELD_REC_FLAG] === true || docData?.[FIELD_REC_FLAG] === "true";

if (hasRecurrence) {
  if (docData?.[FIELD_REC_END]) {
    // Fin de récurrence fournie → on l’utilise
    dateChoisie = docData[FIELD_REC_END];
  } else if (docData?.[FIELD_REC_START]) {
    // Pas de fin → on prend début + 3 ans
    const plus3ans = addYearsYYYYMMDD(docData[FIELD_REC_START], 3);
    if (plus3ans) dateChoisie = plus3ans;
  }
}

// 3) Construction du datetime final (heure toujours celle retour/simple)
if (dateChoisie && heureChoisie) {
  const iso = `${dateChoisie}T${heureChoisie}:00`;
  console.log("[DEBUG] Date+Heure (fin, récurrence prioritaire sur la DATE) →", iso);
  return { [OUT_FIELD]: iso };
}

return {};
