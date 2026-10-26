console.log("Function 48", context);

// function that gets the area
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};

// Function that gets the starting zone
const getStartingZone = () => {
  const zone = docData.PriseEnCharge_LieuDépartChauffeur;
  return zone;
};

// constant to store area and zone
const resultMcr = getArea();
const resultZone = getStartingZone();

// constant to store value of latitude and longitude
const locations = {
  // if area is MCR Arlon
  "MCR Arlon": {
    // if zone is Parking test 1
    "2, rue Godefroid Kurth 6700 Arlon": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,684744796222645",
      PriseEnCharge_LongitudeDépartChauffeur: "5,819286978896314",
    },
    // add other zones...
  },
  "MCR Aubange-Messancy": {
    // if zone is Parking test 1
    "26, rue des Chasseurs Ardennais Messancy": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,59399911723281",
      PriseEnCharge_LongitudeDépartChauffeur: "5,816462102353719",
    },
    // add other zones...
  },
  "MCR Sud Gaume": {
    "8, rue des Combattants - 6760 Virton": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,56911324850798",
      PriseEnCharge_LongitudeDépartChauffeur: "5,53176133311886",
    },
  },
  "MCR Rulles-Semois": {
    "5, rue de France, 6730 Tintigny": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,67813400792049",
      PriseEnCharge_LongitudeDépartChauffeur: "5,512534497541839",
    },
  },
  "MCR Docteur Lagneau": {
    "Rue du Moulin 35, 6830 Bouillon": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,79239361962376",
      PriseEnCharge_LongitudeDépartChauffeur: "5,065566638537235",
    },
    "Rue des Quatre Moineaux,Curfoz 23, 6832 Senseruth": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,811781254783476",
      PriseEnCharge_LongitudeDépartChauffeur: "5,080379111550287",
    },
    "Rue de l'Our 2, 6852 Opont": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,93557706671891",
      PriseEnCharge_LongitudeDépartChauffeur: "5,118844425052875",
    },
  },
  "MCR Marche": {
    "Rue du Parc Industriel 12, 6900 Marche-en-Famenne": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,22166828201364",
      PriseEnCharge_LongitudeDépartChauffeur: "5,330280238878422",
    },
  },
  "MCR Gembloux": {
    "Rue des Fabriques 1, 5030 Gembloux": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,570825239477514",
      PriseEnCharge_LongitudeDépartChauffeur: "4,696338152084627",
    },
  },
  "MCR Namur": {
    "Rue de l'Industrie 124, 5002 Saint-Servais": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,476084705676924",
      PriseEnCharge_LongitudeDépartChauffeur: "4,847375325679213",
    },
  },
  "MCR Florenville": {
    "Rue de la Station 23, 6820 Florenville": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,700049178921795",
      PriseEnCharge_LongitudeDépartChauffeur: "5,315088456321628",
    },
  },

  "MCR Rochefort": {
    "Rue Louis Banneux 8 Rochefort": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,162903520201134",
      PriseEnCharge_LongitudeDépartChauffeur: "5,22389961216868",
    },
  },
  //add other areas...
};

// constant to store the result of lagitude and longitude then return it
const result = locations[resultMcr]?.[resultZone] || null;
return result;
