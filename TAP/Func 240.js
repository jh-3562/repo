let total = 'Contraintes :';
    for (let item of (docData["Contrainte"] || [])) {

    if (item["Contrainte|2|NomClient"]) {
      total = total +' '+ String(item["Contrainte|2|NomClient"])+',';
    }
  }
  return docData["Contrainte"]
    ? { 'Chauffeur_Notes': `${total}` }
    : undefined;