console.log("Fonction 39", context);

const FORMLAYOUT_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";

if (docData.FORMLAYOUTID !== FORMLAYOUT_ID) return;

let valeur = false;


if (
  docData.DemandeAllerA_NoUnite=== "true"
) {
  valeur = true;
}

return {
  DemandeAllerA_Unite: valeur,

};
