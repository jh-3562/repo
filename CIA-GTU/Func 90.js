console.log("90", context);

const FIELD_RV   = "Demande_TransportsimpleHeuredErendezVous";                 // ex: "10:00"
const FIELD_ARR  = "Demande_TransportTransportSimpleHeureArriveeSouhaite";     // veut: "09:45"
const FIELD_DEP  = "Demande_TransportTransportSimpleHeureDepartSouhaitee";     // veut: "09:45 - durée"
const FIELD_DUR  = "TransportSysteme_DureeTrajetAller";                        // minutes (ex: 30)

const pad2 = (n) => String(n).padStart(2, "0");

const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";

const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!m) return NaN;
  const h = Number(m[1]), mn = Number(m[2]);
  if (h < 0 || h > 23 || mn < 0 || mn > 59) return NaN;
  return h * 60 + mn;
};

const toHHMM = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440; // wrap 0..1439
  const h = Math.floor(m / 60), mn = m % 60;
  return `${pad2(h)}:${pad2(mn)}`;
};

const result = {};
const setField = (key, value) => {
  const cur = docData?.[key];
  if (cur !== value) {
    if (docData) docData[key] = value;
    result[key] = value;
  }
};

// ----- INPUTS -----
const rvStr  = docData?.[FIELD_RV];
const durMin = Number.parseInt(docData?.[FIELD_DUR], 10);

if (!has(rvStr)) return {};                
const rvMin = toMinutes(rvStr);
if (!Number.isFinite(rvMin)) return {};    

const durOk = Number.isFinite(durMin) && durMin >= 0;


const arrMin = rvMin - 15;
setField(FIELD_ARR, toHHMM(arrMin));

// Départ souhaité = (RDV - 15) - durée
if (durOk) {
  const depMin = arrMin - durMin;
  setField(FIELD_DEP, toHHMM(depMin));
}

return Object.keys(result).length ? result : {};

