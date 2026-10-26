console.log("Function 12", context);

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire", // Mettre ici le FORMLAYOUTNAME exact pour vos adresses
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Archivé|Supprimé(e)", // Mettre ici le FORMLAYOUTNAME exact pour vos adresses
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
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

//console.log(context);
// Définir la table de correspondances des fields avec des noms spécifiques
const defaultFieldMapping = {
  DateDeNaissance: { key: "DateDeNaissance", name: "Date de naissance" },
  Maison: { key: "Maison", name: "Maison" },
};

const prenomFieldMapping = {
  Nom: { key: "NomFormMission", name: "Nom" },
};
Object.assign(prenomFieldMapping, defaultFieldMapping);

const nomFieldMapping = {
  Prénom: { key: "PrénomSelected", name: "Prénom" },
};
Object.assign(nomFieldMapping, defaultFieldMapping);

//console.log("prenomFieldMapping", prenomFieldMapping);
//console.log("nomFieldMapping", nomFieldMapping);

api({ local: true })
  .post("document/id/filter", { filters: apiFilters })
  .then((res) => {
    const ids = res?.data?.ids.slice(0, 10);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Aucun ID trouvé pour le filtre 'ADRESSE'.");
    }

    // Étape 2 : Récupération des documents par leurs IDs
    return api({ local: true }).post("document/id", { ids });
  })
  .then((res2) => {
    const documents = res2?.data?.documents;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error("Erreur lors de la récupération des documents.");
    }
    //console.log(documents);

    // Conversion du JSON de chaque document et ajout de IdentifiantMission
    const allDatas = documents
      .map((doc) => {
        if (typeof doc.data !== "string") {
          console.warn(
            "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
            doc,
          );
          return null;
        }
        try {
          const parsedData = JSON.parse(doc.data);
          // Ajout de IdentifiantMission provenant de doc.documentID
          return { ...parsedData, IdentifiantBeneficiaire: doc.documentID };
        } catch (e) {
          console.warn("Impossible de parser un document d'adresse :", doc, e);
          return null;
        }
      })
      .filter((d) => d !== null);

    // Ajoute un écouteur pour filtrer les suggestions dynamiquement
    const handleInputChange = () => {
      const prenomFilteredSuggestions = allDatas.map((data) => {
        // Construction du tableau fields incluant IdentifiantMission
        const fields = [
          ...Object.entries(prenomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            }),
          ),
          {
            key: "IdentifiantDispo",
            value: data.IdentifiantBeneficiaire,
            name: "Identifiant Bénéficiaire",
          },
          {
            key: "CommentaireChauffeur",
            value: data?.CommentaireChauffeur || "",
            name: "Commentaire",
          },
          {
            key: "Nom",
            value: data.Nom,
            name: "Nom",
          },
        ];
        //console.log(fields);

        return {
          title: data.Prénom,
          fields: fields,
        };
      });
      console.log("ALL DATAS ", allDatas);
      const nomFilteredSuggestions = allDatas.map((data) => {
        // Construction du tableau fields incluant IdentifiantMission
        const fields = [
          ...Object.entries(nomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            }),
          ),
          {
            key: "IdentifiantDispo",
            value: data.IdentifiantBeneficiaire,
            name: "Identifiant Bénéficiaire",
          },
          {
            key: "CommentaireChauffeur",
            value: data?.CommentaireChauffeur || "",
            name: "Commentaire",
          },
          {
            key: "Nom",
            value: data.Nom,
            name: "Nom",
          },
        ];
        //console.log(fields);

        return {
          title: data.Nom,
          fields: fields,
        };
      });

      // Renvoi des suggestions via le callback
      callback({
        suggestions: {
          PrénomSelected: prenomFilteredSuggestions,
          NomFormMission: nomFilteredSuggestions,
          Nom: nomFilteredSuggestions,
        },
      });
    };

    // Exécute le filtrage initial avec la valeur déjà présente (si elle existe)
    handleInputChange();
  })
  .catch((err) => {
    console.error(
      "Erreur lors du filtrage ou de la récupération des documents : ",
      err.message || err,
    );
    callback({
      suggestions: {
        PrénomSelected: [],
        NomFormMission: [],
        Nom: [],
      },
    });
  });
