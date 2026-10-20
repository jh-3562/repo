console.log("Function 164", context);

callback({
  data: {
    Accompagnateur_Emploi: " ",
    Accompagnateur_Emploi2: " ",
    Accompagnateur_Emploi3: " ",
  },
});

const ALLOWED_ACCOMPAGNATEUR = [
  "Liste de rappel",
  "De notre unité",
  "Transporteur",
];

const TypesListeDeRappelEtNotreUnite = [
  "Infirmier(ère)",
  "Infirmier(ère) auxiliaire",
  "PAB",
  "PAU",
  "Autre (Spécifiez)",
].map((type) => ({
  label: type,
  value: type,
  text: type,
}));

const TypesTransporteur = [
  "Infirmier(ère)",
  "Infirmier(ère) auxiliaire",
  "Infirmier(ère) clinicien(ne)",
  "PAB",
].map((type) => ({
  label: type,
  value: type,
  text: type,
}));

const typeAccompagnateur =
  docData.Demande_TransportAccompagnementQuiFourniAccompagnateur;

switch (typeAccompagnateur) {
  case "Liste de rappel":
  case "De notre unité":
    callback({
      options: {
        Accompagnateur_Emploi: TypesListeDeRappelEtNotreUnite,
        Accompagnateur_Emploi2: TypesListeDeRappelEtNotreUnite,
        Accompagnateur_Emploi3: TypesListeDeRappelEtNotreUnite,
      },
    });
    break;
  case "Transporteur":
    callback({
      options: {
        Accompagnateur_Emploi: TypesTransporteur,
      },
    });
    break;
}
