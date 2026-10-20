console.log("Fonction 98", context);

const FIELD_OUT = "Demande_TransportIdentificationDemandeurCentreUniteAImputer";

const PPH               = String(docData.Demande_PPH || "").trim();
const SAME_ADDRESS      = String(docData.Demande_MemeAdresseUsager || "").trim().toLowerCase();
const TYPE_CLIENTELE    = String(docData.Demande_TypeClientele || "").trim();
const VILLE_DEST        = String(docData.Demande_TransportTransportSimpleNomVilleDestination || "").trim();
const TYPE_TRANSPORT2   = String(docData.Demande_TypeDeTransport2 || "").trim();
const VILLE_DEPART      = String(docData.Demande_TransportTransportSimpleNomVilleDepart || "").trim();
const AGE               = Number(docData.Demande_IdentificationIdentificationUsagerAge);
const TRANSP_PRIMAIRE   = String(docData.ChoixTransport || "").trim();
const MODE_TRANSPORT    = String(docData.Demande_ModeDeTransport || "").trim();
const RETOUR_AERIEN     = String(docData.DemandeTransportInformationsTransportRetour || "").trim().toLowerCase();
const TYPE_ADRESSE_DEPART_RAW = String(docData.Demande_TypeAdresseDepart || "").trim();
const TYPE_ADRESSE_DEST_RAW   = String(docData.Demande_TypeAdresseDestination || "").trim();

const normStr = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const PPH_CODES = {
  "Senneterre": { hemo:"7395091", tsa:"7392091", defInt:"7392091", defPhys:"7391091" },
  "Ville-Marie": { hemo:"7395005", tsa:"7392305", defInt:"7392005", defPhys:"7391005" },
  "Val d'or": { hemo:"7395291", tsa:"7392291", defInt:"7392291", defPhys:"7391291" },
  "Val-d'Or": { hemo:"7395291", tsa:"7392291", defInt:"7392291", defPhys:"7391291" },
  "Amos": { hemo:"7395003", tsa:"7392013", defInt:"7392003", defPhys:"7391013" },
  "Rouyn-Noranda": { hemo:"7395012", tsa:"7392012", defInt:"7392012", defPhys:"7391012" },
  "Témiscaming": { hemo:"7395005", tsa:"7392995", defInt:"7392995", defPhys:"7391995" },
  "Malartic": { hemo:"7395591", tsa:"7392571", defInt:"7392591", defPhys:"7391591" },
  "La Sarre": { hemo:"7395014", tsa:"7392014", defInt:"7392014", defPhys:"7391014" },
};

const CH_CODES = {
  "Senneterre":"7401071",
  "Ville-Marie":"7401005",
  "Val d'or":"7401271",
  "Val-d'or":"7401271",
  "Amos":"7401003",
  "Rouyn-Noranda":"7401012",
  "Témiscaming":"7401995",
  "Malartic":"7401571",
  "La Sarre":"7401014"
};

const CH_65_DEST_CODES = {
  "Senneterre": "7402071",
  "Ville-Marie": "7402005",
  "Val-d’Or": "7402271",
  "Val-d'Or": "7402271",
  "Val d'or": "7402271",
  "Amos": "7402003",
  "Rouyn-Noranda": "7402012",
  "Témiscaming": "7402995",
  "Malartic": "7402571",
  "La Sarre": "7402014"
};

const CHSLD_CODES = {
  "Ville-Marie":"7401505",
  "Val d'or":"7401481",
  "Val-d'or":"7401481",
  "Amos":"7401013",
  "Palmarolle":"7401034",
  "Macamic":"7401044",
  "La Sarre":"7401024",
  "Rouyn-Noranda PEXII":"7401022",
  "Malartic":"7401681"
};

const MDA_CODES = { "Rouyn-Noranda":"7401112", "Val d'or":"7401111", "Val-d'or":"7401111" };
const MA_CODES  = { "Rouyn-Noranda":"7401102", "Val d'or":"7401101", "Val-d'or":"7401101" };
const CRDI_CODES = { "Amos":"7401008" };
const URFI_CODES = { "La Sarre":"7401054" };

const AERIEN_CODES = {
  "Ville-Marie":"7403005",
  "Val d'or":"7403271",
  "Val-d'or":"7403271",
  "Amos":"7403003",
  "Rouyn-Noranda":"7403012",
  "Témiscaming":"7403995",
  "La Sarre":"7403014"
};

const PALLIATIF_CODES = {
  "Senneterre":"7402071",
  "Ville-Marie":"7402005",
  "Val d'or":"7402271",
  "Val-d'or":"7402271",
  "Amos":"7402003",
  "Rouyn-Noranda":"7402012",
  "Témiscaming":"7402995",
  "Malartic":"7402571",
  "La Sarre":"7402014"
};

const REGIONS_NORDIQUES = [
  "Whapmagoostui","Chisasibi","Wemindji","Eastmain","Waskaganish","Nemiscau",
  "Waswanipi","Oujé-Bougoumou","Mistissini","Kawawachikamach","Ivujivik",
  "Salluit","Akulivik","Kangiqsujuaq","Ouataq","Puvirnituq","Kangirsuk",
  "Killiniq","Inukjuak","Aupaluk","Tasiujaq","Kuujjuaq",
  "Kangirsualujjuaq","Umiujaq","Kuujjuarapik"
];

function normalizeTypeClientele(str) {
  const t = normStr(str);
  if (t.includes("hemodialyse")) return "hemo";
  if (t.includes("trouble du spectre") || t.includes("tsa")) return "tsa";
  if (t.includes("deficience physique")) return "defPhys";
  if (t.includes("deficience intellectuelle")) return "defInt";
  return null;
}

function resolveCode(map, ville) {
  if (!ville) return null;
  if (map[ville]) return map[ville];

  const vNorm = normStr(ville);
  const key = Object.keys(map).find(k => normStr(k) === vNorm);

  return key ? map[key] : null;
}

function isRegionNordique(ville) {
  const vNorm = normStr(ville);
  return REGIONS_NORDIQUES.some(name => normStr(name) === vNorm);
}

function getTypeAdresseDepartToken(raw) {
  const t = normStr(raw);
  if (!t) return null;

  if (t.startsWith("milieu carceral")) return "CARCERAL";
  if (t.startsWith("chsld")) return "CHSLD";
  if (t === "ch" || t.startsWith("ch ") || t === "clsc") return "CH";
  if (t.startsWith("mda")) return "MDA";
  if (t === "ma" || t.startsWith("ma ")) return "MA";
  if (t.startsWith("crdi")) return "CRDI";
  if (t.startsWith("urfi")) return "URFI";

  return null;
}

let value = null;

// CAS A : Aérien
if (MODE_TRANSPORT === "Aérien") {
  const villeAerien = (RETOUR_AERIEN === "true") ? VILLE_DEST : VILLE_DEPART;
  value = resolveCode(AERIEN_CODES, villeAerien);
}

// CAS A.1 : Nouveau-né + aérien + Rouyn-Noranda
if (
  AGE === 0 &&
  MODE_TRANSPORT === "Aérien" &&
  normStr(VILLE_DEPART) === normStr("Rouyn-Noranda")
) {
  value = "7403022";
}

// CAS B : Région nordique
if (!value && isRegionNordique(VILLE_DEPART)) {
  value = "7405271";
}



// CAS 0 : Type adresse départ
if (!value) {
  const typeToken = getTypeAdresseDepartToken(TYPE_ADRESSE_DEPART_RAW);
  console.log("TYPE_ADRESSE_DEPART_RAW =", TYPE_ADRESSE_DEPART_RAW);
  console.log("typeToken : ", typeToken)

  switch (typeToken) {
    case "CARCERAL":
      value = "4010003";
      break;
    case "CHSLD":
      value = resolveCode(CHSLD_CODES, VILLE_DEPART);
      break;
    case "CLSC":
      value = resolveCode(CH_CODES, VILLE_DEPART);
      break;
    case "CH":
      value = resolveCode(CH_CODES, VILLE_DEPART);
      break;
    case "MDA":
      value = resolveCode(MDA_CODES, VILLE_DEPART);
      break;
    case "MA":
      value = resolveCode(MA_CODES, VILLE_DEPART);
      break;
    case "CRDI":
      value = resolveCode(CRDI_CODES, VILLE_DEPART);
      break;
    case "URFI":
      value = resolveCode(URFI_CODES, VILLE_DEPART);
      break;
  }
}

// CAS 1 : PPH + même adresse
if (!value && PPH === "Oui" && SAME_ADDRESS === "true") {
  const typeKey = normalizeTypeClientele(TYPE_CLIENTELE);
  const cityMap = PPH_CODES[VILLE_DEST];

  if (typeKey && cityMap && cityMap[typeKey]) {
    value = cityMap[typeKey];
  }
}

// CAS 2 : 65+ Ambulance
if (!value && AGE >= 65 && TRANSP_PRIMAIRE === "Ambulance") {
  value = resolveCode(PALLIATIF_CODES, VILLE_DEST);
}

// CAS 3 : Maison soins palliatifs
if (!value && TYPE_TRANSPORT2 === "Transport vers une maison de soins palliatifs") {
  value = resolveCode(PALLIATIF_CODES, VILLE_DEST);
}

// CAS C : Patient 65 ans et plus transporté vers un CH
if (
  !value &&
  AGE >= 65 &&
  normStr(TYPE_ADRESSE_DEST_RAW) === "ch"
) {
  value = resolveCode(CH_65_DEST_CODES, VILLE_DEPART);
}

console.log("CODE : ", value)

return value ? { [FIELD_OUT]: value } : {};
