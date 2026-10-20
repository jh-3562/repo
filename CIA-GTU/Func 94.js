console.log("Fonction 94", context);

const DATE_NAISS = "Demande_IdentificationIdentificationUsagerDateNaissance";
const AGE_FIELD = "Demande_IdentificationIdentificationUsagerAge";

const dobStr = docData?.[DATE_NAISS];
const result = {};

if (dobStr) {
  try {
    const dob = new Date(dobStr);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    result[AGE_FIELD] = String(age); 
  } catch (e) {
    console.error("Erreur de calcul d'âge:", e);
  }
}

return result;
