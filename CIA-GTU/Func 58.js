console.log("Fonction 58", context);

const FIELD_DATE   = "Demande_TransportTransportSimpleDateTransportDepart";
const FIELD_HEURE  = "Demande_TransportTransportSimpleHeureDepartSouhaitee";
const OUT_FIELD    = "TransportSysteme_DateDebut";

// Récurrence
const FIELD_REC_FLAG  = "Demande_TransportInformationTransportAvecReccurence";        // "true"/"false" ou bool
const FIELD_REC_START = "Demande_TransportInformationTransportDateDebutReccurence";   // YYYY-MM-DD

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

// 1) si récurrence active + date de début récurrence => on prend cette date, sinon la date "normale"
const hasRecurrence =
  docData?.[FIELD_REC_FLAG] === true || docData?.[FIELD_REC_FLAG] === "true";

const baseDate =
  (hasRecurrence && docData?.[FIELD_REC_START]) || docData?.[FIELD_DATE];

// 2) L’HEURE : on prend TOUJOURS l’heure "normale"
const heureStr = normalizeTime(docData?.[FIELD_HEURE]);

if (baseDate && heureStr) {
  const iso = `${baseDate}T${heureStr}:00`;
  console.log("[DEBUG] Date+Heure (récurrence prioritaire, heure normale) →", iso);
  return { [OUT_FIELD]: iso };
}

return {};
