let resultat = [];

// --- Recuperation normale ---
for (let i = 0; i < (docData.Recuperation?.length || 0); i++) {
  let ligne = docData.Recuperation[i];
  let noInv = ligne["Recuperation|1|NoInventaire"] || "";
  let desc = ligne["Recuperation|2|Description"] || "";
  let statut = ligne["Recuperation|3|Statut"] || "";

  if (noInv || desc || statut) {
    resultat.push({
      "RecuperationFinale|1|NoInventaire": noInv,
      "RecuperationFinale|2|Description": desc,
      "RecuperationFinale|3|Statut": statut
    });
  }
}

// --- Recuperation sans numéro ---
for (let i = 0; i < (docData.RecupSansNo?.length || 0); i++) {
  let ligne = docData.RecupSansNo[i];
  let noInv = "Aucun";
  let desc = ligne["RecupSansNo|1|Description"] || "";
  let statut = ligne["RecupSansNo|2|Statut"] || "";

  if (noInv || desc || statut) {
    resultat.push({
      "RecuperationFinale|1|NoInventaire": noInv,
      "RecuperationFinale|2|Description": desc,
      "RecuperationFinale|3|Statut": statut
    });
  }
}

// --- Dons ---
for (let i = 0; i < (docData.Dons?.length || 0); i++) {
  let ligne = docData.Dons[i];
  let noInv = "Don";
  let desc = ligne["Dons|1|Description"] || "";
  let statut = ligne["Dons|2|Remarque"] || "";

  if (noInv || desc || statut) {
    resultat.push({
      "RecuperationFinale|1|NoInventaire": noInv,
      "RecuperationFinale|2|Description": desc,
      "RecuperationFinale|3|Statut": statut
    });
  }
}

return { RecuperationFinale: resultat };