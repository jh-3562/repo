console.log("Function 47", context);

const AREA = window.location.pathname.split("/")[1];
const MAISON = mcrDictionary[AREA];

let options = [];

switch (MAISON) {
  case "MCR Arlon":
    options = [
      {
        title: "2, rue Godefroid Kurth 6700 Arlon",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,684744796222645",
          PriseEnCharge_LongitudeDépartChauffeur: "5,819286978896314",
        },
      },
    ];
    break;
  case "MCR Aubange-Messancy":
    options = [
      {
        title: "26, rue des Chasseurs Ardennais Messancy",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,59399911723281",
          PriseEnCharge_LongitudeDépartChauffeur: "5,816462102353719",
        },
      },
    ];
    break;
  case "MCR Sud Gaume":
    options = [
      {
        title: "8, rue des Combattants - 6760 Virton",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,56911324850798",
          PriseEnCharge_LongitudeDépartChauffeur: "5,53176133311886",
        },
      },
    ];
    break;
  case "MCR Rulles-Semois":
    options = [
      {
        title: "5, rue de France, 6730 Tintigny",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,67813400792049",
          PriseEnCharge_LongitudeDépartChauffeur: "5,512534497541839",
        },
      },
    ];
    break;
  case "MCR Docteur Lagneau":
    options = [
      {
        title: "Rue du Moulin 35, 6830 Bouillon",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,79239361962376",
          PriseEnCharge_LongitudeDépartChauffeur: "5,065566638537235",
        },
      },
      {
        title: "Rue des Quatre Moineaux,Curfoz 23, 6832 Senseruth",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,811781254783476",
          PriseEnCharge_LongitudeDépartChauffeur: "5,080379111550287",
        },
      },
      {
        title: "Rue de l'Our 2, 6852 Opont",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,93557706671891",
          PriseEnCharge_LongitudeDépartChauffeur: "5,118844425052875",
        },
      },
    ];
    break;
  case "MCR Marche":
    options = [
      {
        title: "Rue du Parc Industriel 12, 6900 Marche-en-Famenne",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,22166828201364",
          PriseEnCharge_LongitudeDépartChauffeur: "5,330280238878422",
        },
      },
    ];
    break;

  case "MCR Gembloux":
    options = [
      {
        title: "Rue des Fabriques 1, 5030 Gembloux",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,570797982909184",
          PriseEnCharge_LongitudeDépartChauffeur: "4,696273779072868",
        },
      },
    ];
    break;

  case "MCR Namur":
    options = [
      {
        title: "Rue de l'Industrie 124, 5002 Saint-Servais",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,476084705676924",
          PriseEnCharge_LongitudeDépartChauffeur: "4,847375325679213",
        },
      },
    ];
    break;

  case "MCR Florenville":
    options = [
      {
        title: "Rue de la Station 23, 6820 Florenville",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,700049178921795",
          PriseEnCharge_LongitudeDépartChauffeur: "5,315088456321628",
        },
      },
    ];
    break;

  case "MCR Rochefort":
    options = [
      {
        title: "Rue Louis Banneux 8 Rochefort",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,162903520201134",
          PriseEnCharge_LongitudeDépartChauffeur: "5,22389961216868",
        },
      },
    ];
    break;
  // Ajouter d'autres cas pour chaque MAISON
  default:
    options = [
      {
        title: "DefaultOption",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "xx",
          PriseEnCharge_LongitudeDépartChauffeur: "xx",
        },
      },
    ];
    break;
}

const mappedOptions = options.map((item) => ({
  key: item.title,
  value: item.title,
  text: item.title,
  items: null,
}));

callback({
  options: {
    PriseEnCharge_LieuDépartChauffeur: mappedOptions,
  },
});

// Vérifier s'il n'y a qu'une seule option et envoyer un second callback avec les données
if (options.length === 1) {
  const selectedOption = options[0];
  callback({
    data: {
      PriseEnCharge_LatitudeDépartChauffeur:
        selectedOption.fields?.PriseEnCharge_LatitudeDépartChauffeur || "",
      PriseEnCharge_LongitudeDépartChauffeur:
        selectedOption.fields?.PriseEnCharge_LongitudeDépartChauffeur || "",
      PriseEnCharge_LieuDépartChauffeur: selectedOption.title || "",
    },
  });
}
