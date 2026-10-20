console.log("Fonction 146", context);

let result = {};

const priorite = docData?.Demande_Priorite;

// On cache tout par défaut
result.Demande_PrioritéP2 = null;
result.Demande_PrioritéP5 = null;
result.Demande_PrioritéP6 = null;
result.Demande_PrioritéP8 = null;

if (priorite === "P2") {
  result.Demande_PrioritéP2 = true;
}

if (priorite === "P5") {
  result.Demande_PrioritéP5 = true;
}

if (priorite === "P6") {
  result.Demande_PrioritéP6 = true;
}

if (priorite === "P8") {
  result.Demande_PrioritéP8 = true;
}

return result;
