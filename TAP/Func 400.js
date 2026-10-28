console.log('Function 400', context);

// Récupération des valeurs
let distance = parseFloat(docData["Total distance"]) || 0;
let tauxKm = parseFloat(docData["TAUX_KM_Chauffeur"]) || 0;
let totalPartUsager = parseFloat(docData["TotalPartUsager"]) || 0;
let minimumPriceRenumeration = parseFloat(docData["MinimumPriceRenumeration"]);

// Fonction pour arrondir à 2 décimales
const round2 = (num) => Math.round(num * 100) / 100;

// 1. Calcul rémunération chauffeur
let remunerationChauffeur = round2(distance * tauxKm);

// 2. Calcul montant à verser
let montantVerser = round2(remunerationChauffeur - totalPartUsager);

// 3. Application du minimum UNIQUEMENT s'il existe
if (
  docData?.CalculPrixTransportGroupe === 'Prix au km' &&
  !isNaN(minimumPriceRenumeration)
) {
  montantVerser = Math.max(
    montantVerser,
    minimumPriceRenumeration
  );
}

console.log("Distance:", distance);
console.log("Taux KM:", tauxKm);
console.log("Total parts usager:", totalPartUsager);
console.log("Rémunération chauffeur:", remunerationChauffeur);
console.log("Montant à verser:", montantVerser);

if (!Array.isArray(docData.TotalVoyageBlanc)) {
  console.log("Collection voyage blanc non chargée, on ne la modifie pas.");

  return {
    TotalChauffeur: remunerationChauffeur,
    MontantVerserChauffeur: montantVerser
  };
}

// Cloner la collection
const voyageBlancs = Array.isArray(docData.TotalVoyageBlanc)
  ? JSON.parse(JSON.stringify(docData.TotalVoyageBlanc))
  : [];

console.log("Nombre de voyages blancs :", voyageBlancs.length);
let totalRenumerationVoyageBlanc = 0;

// Ajouter la rémunération dans chaque ligne
voyageBlancs.forEach((row, index) => {
  const distanceVoyageBlanc =
    parseFloat(row["TotalVoyageBlanc|2|distance"]) || 0;

  let remunerationVoyageBlanc =
    round2(distanceVoyageBlanc * tauxKm);

  // Application du minimum pour le voyage blanc
  if (
    docData?.CalculPrixTransportGroupe === 'Prix au km' &&
    !isNaN(minimumPriceRenumeration)
  ) {
    remunerationVoyageBlanc = Math.max(
      remunerationVoyageBlanc,
      minimumPriceRenumeration
    );
  }

  row["TotalVoyageBlanc|3|renumeration"] =
    remunerationVoyageBlanc.toString();

  totalRenumerationVoyageBlanc += remunerationVoyageBlanc;

  console.log(
    `Voyage blanc ${index + 1}`,
    "Distance:",
    distanceVoyageBlanc,
    "Rémunération:",
    remunerationVoyageBlanc
  );
});

const result = {
  TotalChauffeur: remunerationChauffeur,
  MontantVerserChauffeur: montantVerser,
  TotalRenumerationVoyageBlanc: round2(totalRenumerationVoyageBlanc),
  TotalVoyageBlanc: voyageBlancs
};

console.log("Result:", result);

return result;