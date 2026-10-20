console.log("Fonction 170", context);

const FIELD_DATE  = "TransportAerien_Dateatterrissage";
const FIELD_HEURE = "TransportAerien_Heureatterrissage";

const OUT_FIELD_1 = "TransportAerien_Dateatterrissage2";
const OUT_FIELD_2 = "Demande_TransportRoutierDateArrivee";

const normalizeTime = (s) => {
  if (!s) return "";

  let t = String(s).trim().toLowerCase()
    .replace(/\s*h\s*/g, ":")
    .replace(/\s+/g, "");

  if (/^\d{3,4}$/.test(t)) {
    t = (t.length === 3 ? "0" + t : t).replace(/(\d{2})(\d{2})/, "$1:$2");
  }

  const m = /^(\d{1,2}):(\d{1,2})$/.exec(t);
  if (!m) return "";

  const hh = String(Math.min(Math.max(+m[1], 0), 23)).padStart(2, "0");
  const mm = String(Math.min(Math.max(+m[2], 0), 59)).padStart(2, "0");

  return `${hh}:${mm}`;
};

const addOneDay = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);

  const daysInMonth = new Date(y, m, 0).getDate();

  if (d < daysInMonth) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`;
  }

  if (m < 12) {
    return `${y}-${String(m + 1).padStart(2, "0")}-01`;
  }

  return `${y + 1}-01-01`;
};

const dateStr  = docData?.[FIELD_DATE];
const heureStr = normalizeTime(docData?.[FIELD_HEURE]);

if (dateStr && heureStr) {

  let [hh, mm] = heureStr.split(":").map(Number);

  // +2 heures
  hh += 2;

  let finalDate = dateStr;

  if (hh >= 24) {
    hh -= 24;
    finalDate = addOneDay(dateStr);
  }

  const finalTime =
    String(hh).padStart(2, "0") + ":" +
    String(mm).padStart(2, "0") + ":00";

  const result = `${finalDate}T${finalTime}`;

  return {
    [OUT_FIELD_1]: result,
    [OUT_FIELD_2]: result
  };
}

return {};
