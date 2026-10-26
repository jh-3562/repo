console.log("Function 2", context);
const { CoorFactu_Qualité, PrénomSelected, NomFormMission } = docData;

// filter
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "BÉNÉFICIAIRE",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Supprimé(e)|Archivé",
    type: "TEXT",
  },
];

// add to filter when PrénomSelected is defined
if (docData.PrénomSelected !== undefined) {
  apiFilters.push({
    key: "Prénom",
    operator: "CONTAINS",
    value: docData.PrénomSelected,
    type: "TEXT",
  });
}
// add to filter when NomFormMission is defined
if (docData.NomFormMission !== undefined) {
  apiFilters.push({
    key: "Nom", // Filtrer aussi par nom si l'utilisateur entre un nom
    operator: "CONTAINS",
    value: docData.NomFormMission, // Valeur du nom
    type: "TEXT",
  });
}
// add to filter when DateDeNaissance is defined
if (docData.DateDeNaissance !== undefined && docData.DateDeNaissance !== "") {
  apiFilters.push({
    key: "DateDeNaissance", // Filtrer aussi par date
    operator: "EQUALS",
    value: docData.DateDeNaissance, // Valeur de date
    type: "DATE",
  });
}

// Définir la table de correspondances des fields avec des noms spécifiques
const defaultFieldMapping = {
  DateDeNaissance: { key: "DateDeNaissance", name: "Date de naissance" },
  TPMR: { key: "TPMR", name: "TPMR" },

  DateEnregistrement: {
    key: "DateEnregistrement",
    name: "Date d'enregistrement",
  },
  INFODEV_NomComplet: {
    key: "INFODEV_NomComplet",
    name: "Nom complet",
  },
  InformationsPourLeBureau: {
    key: "InformationsPourLeBureau",
    name: "Informations pour le bureau",
  },
  InformationsPourLeChauffeur: {
    key: "InformationsPourLeChauffeur",
    name: "Informations pour le chauffeur",
  },
  InformationsPourLaFacturation: {
    key: "InformationsPourLaFacturation",
    name: "Informations pour la facturation",
  },
  MobilitéDuBénéficiaire: {
    key: "MobilitéDuBénéficiaire",
    name: "Mobilité du bénéficiaire",
  },
  checkboxBeneKg: {
    key: "checkboxBeneKg",
    name: "Est-ce que le bénéficiaire fait plus de 100 kg?",
  },
  CoorFactu_Réception: {
    key: "CoorFactu_Réception",
    name: "Choix de réception des factures",
  },
  CoorFactu_Courrier: {
    key: "CoorFactu_Courrier",
    name: "Courrier électronique",
  },
  CoorFactu_Qualité: {
    key: "CoorFactu_Qualité",
    name: "Qualité",
  },
  AllocataireSocial: {
    key: "AllocataireSocial",
    name: "Allocataire social?",
  },
  dateValiditeAttestationMututelle: {
    key: "dateValiditeAttestationMututelle",
    name: "Date de validité attestation mutuelle",
  },
  CoorFactu_Type_Entité: {
    key: "CoorFactu_Type_Entité",
    name: "Type d'entité",
  },
  CoorFactu_Rue: { key: "CoorFactu_Rue", name: "Adresse - Rue" },
  "CoorFactu_Code postal": {
    key: "CoorFactu_Code postal",
    name: "Code postal",
  },
  CoorFactu_Nom: { key: "CoorFactu_Nom", name: "Nom de facturation" },
  CoorFactu_Prénom: {
    key: "CoorFactu_Prénom",
    name: "Prénom de facturation",
  },
  CoorFactu_Numéro: {
    key: "CoorFactu_Numéro",
    name: "Numéro de facturation",
  },
  CoorFactu_Ville: { key: "CoorFactu_Ville", name: "Ville" },
  CoorFactu_Pays: { key: "CoorFactu_Pays", name: "Pays" },
  MatérielAPrévoir: { key: "MatérielAPrévoir", name: "Matériel" },
};

const prenomFieldMapping = {
  Nom: { key: "NomFormMission", name: "Nom" },
};
Object.assign(prenomFieldMapping, defaultFieldMapping);

const nomFieldMapping = { Prénom: { key: "PrénomSelected", name: "Prénom" } };
Object.assign(nomFieldMapping, defaultFieldMapping);

console.log("START1");

(async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids.slice(0, 10);
    console.log("Filtered IDs: ", ids);

    // Étape 2 : Récupération des documents par leurs IDsz
    const res2 = await api({ local: true }).post("document/id", { ids });
    console.log("END1");
    const documents = res2?.data?.documents;
    console.log("Retrieved Documents: ", documents);

    // Conversion du JSON de chaque document et ajout de IdentifiantMission
    const allDatas = documents
      .map((doc) => {
        if (typeof doc.data !== "string") {
          console.warn(
            "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
            doc
          );
          return null;
        }
        try {
          const parsedData = JSON.parse(doc.data);
          return { ...parsedData, IdentifiantMission: doc.documentID };
        } catch (e) {
          console.warn("Impossible de parser un document d'adresse :", doc, e);
          return null;
        }
      })
      .filter((d) => d !== null);

    // Ajoute un écouteur pour filtrer les suggestions dynamiquement
    const handleInputChange = () => {
      const prenomFilteredSuggestions = allDatas.map((data) => {
        // Création des fields à partir du mapping, puis ajout de IdentifiantMission
        const fields = [
          ...Object.entries(prenomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            })
          ),
          {
            key: "IdentifiantMission",
            value: data.IdentifiantMission,
            name: "Identifiant Mission",
          },
        ];
        return {
          title: data.Prénom,
          fields: fields,
        };
      });
      const nomFilteredSuggestions = allDatas.map((data) => {
        // Création des fields à partir du mapping, puis ajout de IdentifiantMission
        const fields = [
          ...Object.entries(nomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            })
          ),
          {
            key: "IdentifiantMission",
            value: data.IdentifiantMission,
            name: "Identifiant Mission",
          },
        ];
        return {
          title: data.Nom,
          fields: fields,
        };
      });

      // Vérification de qualité Bénéficiaire pour synchroniser changements
      const callbackData =
        CoorFactu_Qualité === "Bénéficiaire"
          ? {
              CoorFactu_Prénom: PrénomSelected || "",
              CoorFactu_Nom: NomFormMission || "",
            }
          : {};

      // Renvoi des suggestions via le callback
      callback({
        suggestions: {
          PrénomSelected: prenomFilteredSuggestions,
          NomFormMission: nomFilteredSuggestions,
        },
        data: callbackData,
      });
    };

    // Exécute le filtrage initial avec la valeur déjà présente (si elle existe)
    handleInputChange();
  } catch (err) {
    console.error(
      "Erreur lors du filtrage ou de la récupération des documents : ",
      err.message || err
    );
  }
})();

console.log("END");
