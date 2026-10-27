console.log("Function 142", context);

const TypeTransporteur = docData?.Transporteur_Type;

const horraireSemaine = [
  "Horaire_Lundi",
  "Horaire_Mardi",
  "Horaire_Mercredi",
  "Horaire_Jeudi",
  "Horaire_Vendredi",
  "Horaire_Samedi",
  "Horaire_Dimanche",
];

const defaultHoraire = horraireSemaine.reduce((acc, jour) => {
  acc[jour] = "00:00|23:45";
  return acc;
}, {});

if (!TypeTransporteur) {
    return;
}

return {
  ...defaultHoraire,
};
