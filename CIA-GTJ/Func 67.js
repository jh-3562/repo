console.log("Function 67", context);

const prenom =
  `${docData["Demande_IdentificationIdentficationUsagerPrénom"] || ""}`.trim();
const nom =
  `${docData["Demande_IdentificationIdentficationUsagerNom"] || ""}`.trim();
const age =
  `${docData["Demande_IdentificationIdentficationUsagerÂge"] || ""}`.trim();
const numeroDossierPIJ =
  `${docData["Demande_IdentificationIdentficationUsagerNuméroDossierPIJ"] || ""}`.trim();

// Create array with non-empty values
const values = [prenom, nom, age, numeroDossierPIJ].filter((v) => v !== "");

// Concatenate with ' - ' separator
const usagerComplet = values.length > 0 ? values.join(" - ") : "";

// Return the concatenated value or undefined if empty
return usagerComplet ? { Usager_Complet: usagerComplet } : undefined;
