console.log("Fonction 36", context);

const Type = docData?.Utilisateur_Type;

let result = {};

if (Type === "Intervenant") {
  result = {
    Utilisateur_IdentificationIntervenant: true,
    Utilisateur_Identification: null,
    Utilisateur_ChefService: true,
  };
}
else if (Type === "Gestionnaire") {
  result = {
    Utilisateur_IdentificationIntervenant: null,
    Utilisateur_Identification: true,
    Utilisateur_ChefService: null,
  };
}

else {
  result = {
    Utilisateur_IdentificationIntervenant: null,
    Utilisateur_Identification: true,
    Utilisateur_ChefService: null,
  };
}

return result;
