console.log("Fonction 151", context);

const ramq = String(docData.Identite_RAMQ || "").replace(/\s/g, "");

let dateNaissance = null;
let age = null;
let sexe = null;

if (ramq.length >= 10) {
  const year = ramq.substring(4, 6);
  let monthNum = parseInt(ramq.substring(6, 8), 10);
  const day = ramq.substring(8, 10);

  const isFemale = monthNum > 50;

  if (isFemale) {
    monthNum -= 50;
    sexe = "Féminin";
  } else {
    sexe = "Masculin";
  }

  const month = String(monthNum).padStart(2, "0");

  const currentYear = new Date().getFullYear() % 100;
  const fullYear = (parseInt(year, 10) > currentYear ? "19" : "20") + year;

  dateNaissance = `${fullYear}-${month}-${day}`;

  const birthDate = new Date(Number(fullYear), monthNum - 1, Number(day));
  const today = new Date();
  const isValidBirthDate =
    !isNaN(birthDate.getTime()) &&
    birthDate.getFullYear() === Number(fullYear) &&
    birthDate.getMonth() === monthNum - 1 &&
    birthDate.getDate() === Number(day);

  if (isValidBirthDate) {
    age = today.getFullYear() - birthDate.getFullYear();

    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  } else {
    dateNaissance = null;
    age = null;
    sexe = null;
  }
}

return {
  Identite_DateNaissance: dateNaissance,
  Identite_Age: age,
  Identite_Sexe: sexe,
  Demande_IdentificationIdentificationUsagerSexe: sexe, // (si tu veux garder les deux)
};
