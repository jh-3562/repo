console.log("Fonction 40 onsearchListeRappelAdresseDepart", context)

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Adresses Fréquentes",
    type: "TEXT",
  },
];

let keyAppart = null;


const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return {}; }
};
const pick = (o, k) => (o && o[k] != null ? String(o[k]) : "");
const norm = (s) => String(s || "")
  .normalize("NFD").replace(/\p{Diacritic}/gu, "")
  .toLowerCase().trim();

const buildTitle = (d) => {
  const parts = [
    [pick(d,"AdressesFrequentes_NoCivique"), pick(d,"AdressesFrequentes_Rue")].filter(Boolean).join(" "),
    pick(d,"AdressesFrequentes_Ville"),
    pick(d,"AdressesFrequentes_Province"),
    pick(d,"AdressesFrequentes_CodePostal"),
  ].filter(Boolean);
  return parts.join(", ");
};



if(inputKey === "Demande_ListeRappelTransportSimpleAdresseCompleteDepart") {
    keyAppart = "Demande_ListeRappelTransportSimpleNumeroAdresseDepart"
}
else if(inputKey === "Demande_ListeRappelTransportSimpleAdresseCompleteDestination" ) {
    keyAppart = "Demande_ListeRappelTransportSimpleNumeroAdresseArrivee"

}
else if (inputKey === "Demande_ListeRappelTransportRetourAdresseCompleteDepart") {
    keyAppart = "Demande_ListeRappelTransportRetourNumeroAdresseDepart"
}
else if (inputKey === "Demande_ListeRappelTransportRetourAdresseCompleteDestination") {
    keyAppart = "Demande_ListeRappelTransportRetourNumeroAdresseArrivee"
}

const toSuggestion = (d) => ({
  title: buildTitle(d),
  fields: [
    
    
    { key: keyAppart, name: "Appartement",  value: pick(d,"AdressesFrequentes_Appartement") },
    
    { name: " Latitude",  value: pick(d,"AdressesFrequentes_Latitude") },
    { name: " Longitude", value: pick(d,"AdressesFrequentes_Longitude") },
  ],
});


const userInput = (docData?.[inputKey] ?? "").trim();   
const userQuery = norm(userInput); 

api({ local: true })
  .post("document/id/filter", { filters: apiFilters })
  .then((res2) => {
    console.log("res2 complet:", res2);

    const formIds =
      (Array.isArray(res2?.data?.ids) && res2.data.ids) ||
      (Array.isArray(res2?.data) && res2.data) ||
      [];

    console.log("IDs récupérés:", formIds);

    // api document/id
    return api({ local: true }).post(`document/id`, { ids: formIds });
  })
  .then((res3) => {
    console.log("res3 complet:", res3);

    const docs =
      (Array.isArray(res3?.data?.documents) && res3.data.documents) ||
      (Array.isArray(res3?.data) && res3.data) ||
      [];

    console.log("Documents extraits de res3 (bruts):", docs);

    // 1) parse JSON data -> record objet
    const records = docs.map((x) => {
      const parsed = safeParse(x?.data ?? x);
     
      if (!parsed.status && x?.status) parsed.status = x.status;
      return parsed;
    }).filter(Boolean);

    console.log("Records parsés:", records);

    // 2) filtre status = "Actif"
    const onlyActive = records.filter((r) => String(r.status || r.Status || "").toLowerCase() === "actif");

    // 3) filtre préfixe (startsWith) sur plusieurs champs concaténés
    const filtered = onlyActive.filter((d) => {
      if (!userQuery) return true;
      const candidates = [
        buildTitle(d),
        pick(d,"AdressesFrequentes_Rue"),
        pick(d,"AdressesFrequentes_Ville"),
        [pick(d,"AdressesFrequentes_NoCivique"), pick(d,"AdressesFrequentes_Rue")].filter(Boolean).join(" "),
      ];
      return candidates.some((s) => norm(s).startsWith(userQuery));
    });

    // 4) suggestions prêtes
    const suggestions = filtered.map(toSuggestion);
    console.log("Suggestions générées:", suggestions);

    
    if (typeof callback === "function") {
      callback({ suggestions: { [inputKey]: suggestions } });
    }
  })
  .catch((err) => {
    console.error("Erreur:", err);
    if (typeof callback === "function") {
      callback({ suggestions: { [inputKey]: [] } });
    }
  }); 
