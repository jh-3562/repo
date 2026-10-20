console.log("Fonction 171", context);

const FIELD_DATE = "Demande_TransportAerienRetourAtterrissage";
const FIELD_HEURE = "TransportAerien_Heureatterrissage2";

const OUT_FIELD_1 = "Demande_TransportRotierDate";
const OUT_FIELD_2 = "Demande_TransportAerienRetourDecollageDate";

const normalizeTime = (s) => {
  if (!s) return "";

  let t = String(s)
    .trim()
    .toLowerCase()
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

const subtractOneDay = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);

  if (d > 1) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d - 1).padStart(2, "0")}`;
  }

  if (m > 1) {
    const prevMonthDays = new Date(y, m - 1, 0).getDate();
    return `${y}-${String(m - 1).padStart(2, "0")}-${prevMonthDays}`;
  }

  return `${y - 1}-12-31`;
};

const dateStr = docData?.[FIELD_DATE];
const heureStr = normalizeTime(docData?.[FIELD_HEURE]);

if (dateStr && heureStr) {
  let [hh, mm] = heureStr.split(":").map(Number);

  // -2 heures
  hh -= 2;

  let finalDate = dateStr;
  console.log(hh);

  if (hh < 0) {
    hh += 24;
    finalDate = subtractOneDay(dateStr);
  }
  console.log(finalDate);

  return {
    // [OUT_FIELD_1]: finalDate,
    [OUT_FIELD_2]: finalDate,
  };
}

return {};
