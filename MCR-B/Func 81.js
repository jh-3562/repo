console.log("Function 81", context);

const isOver18AtDate = (birthDate, planningDate) => {
  // converts in date object
  const birth = new Date(birthDate);
  const planning = new Date(planningDate);

  // calculates the difference in years
  let age = planning.getFullYear() - birth.getFullYear();

  // verifies if anniversary already passed
  const monthDifference = planning.getMonth() - birth.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && planning.getDate() < birth.getDate())
  ) {
    age--; // if anniversary aint passed yet reduce year by 1
  }

  // verifies if person is older or equal to 18
  return age >= 18;
};

const dateNaissance = docData.DateDeNaissance;
const date = docData.Planification_Date;
if (dateNaissance && date) {
  if (isOver18AtDate(dateNaissance, date)) {
    return { CheckboxMineur: false };
  } else {
    return { CheckboxMineur: true };
  }
}
