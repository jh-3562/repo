let resultat = [];

for (let i = 0; i < docData.Recuperation.length; i++) {
  let ligne = docData.RecupSansNo[i];
  let noInv = "DON";
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

return { RecuperationFinale: resultat };
