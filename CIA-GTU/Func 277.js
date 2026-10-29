const { Demande_TypeAdresseDepart, Demande_TypeAdresseDestination, Demande_MemeAdresseUsager, Demande_MemeAdresseUsagerRetour } = docData;

const isCliniqueDepart = Demande_TypeAdresseDepart === "Clinique externe";

const isCliniqueDestination = Demande_TypeAdresseDestination === "Clinique externe";

const res = {
  Demande_AccessibilitePointDeDepart:
    Demande_MemeAdresseUsager === "true" || isCliniqueDepart ? true : null,

  Demande_AccessibilitePointDeDestination:
    Demande_MemeAdresseUsagerRetour === "true" || isCliniqueDestination ? true : null,
};

return res;
