console.log("Fonction 62", context);

const COLL = "Transporteur_InformationDisponibiliteCollec";
const FIELD = "Jour";

const result = {};
const seen = new Set();

for (const key in docData) {
  if (key.startsWith(COLL) && key.endsWith("|" + FIELD)) {
    const val = docData[key]?.trim();
    if (val) {
      if (seen.has(val)) {
        // doublon → on efface ou on signale
        console.warn("Jour déjà utilisé dans la collection:", val);
        result[key] = null; 
      } else {
        seen.add(val);
      }
    }
  }
}

return result;
