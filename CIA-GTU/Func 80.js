console.log("Fonction 80", context);

const raw = docData.Demande_IdentificationRisqueContagionTypePrecaution ?? "";
const value = String(raw).trim().replace(/\s+/g, " "); 

let text = "";
const bullet = (items) => items.map(i => `- ${i}`).join("\n");

if (value === "Aucun") {
  text = "";
}
else if (value === "Aérienne") {
  text = bullet(["Masque N-95 avec fit-test"]);
}
else if (value === "Aériennes / contact") {
  text = bullet(["Blouse de protection", "Masque N-95 avec fit-test"]);
}
else if (value === "Aériennes / contact-renforcées") { 
  text = bullet(["Blouse de protection", "Masque N-95 avec fit-test", "Protection oculaire"]);
}
else if (value === "Contact") {
  text = bullet(["Blouse de protection"]);
}
else if (value === "Contact renforcées") {
  text = bullet(["Blouse de protection"]);
}
else if (value === "Gouttelettes") {
  text = bullet(["Masque de procédure", "Protection oculaire"]);
}
else if (value === "Gouttelettes / contact") {
  text = bullet(["Blouse de protection", "Masque de procédure", "Protection oculaire"]);
}
else if (value === "Gouttelettes / contact renforcées avec N-95") {
  text = bullet(["Blouse de protection", "Masque N-95", "Protection oculaire"]);
}
else {
  console.log("AUCUN MATCH. Valeur reçue =", JSON.stringify(raw), "=> normalisée =", JSON.stringify(value));
}

const result = {};

if (text) {
  result.Markdown_Precaution = text;
  
} else {
  result.Markdown_Precaution = null;
  
}

return result;
