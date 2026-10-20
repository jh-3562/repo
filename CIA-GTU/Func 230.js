console.log("Fonction 230", context);
const courriel = store.moduleStore.user.username;

const isAutreDemandeurChecked =
  docData["Demande_TransportIdentificationDemandeurEstAutreDemandeur"] ===
  "true";

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Utilisateur",
    type: "TEXT",
  },
  {
    key: "Utilisateur_Courriel",
    operator: "CONTAINS",
    value: courriel,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Actif",
    type: "TEXT",
  },
];

const getDocumentIds = async (apiFilters) => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return res?.data?.ids;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des ids :${error}`);
  }
};

const getDocuments = async (ids) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: ids,
    });

    return response?.data?.documents;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des documents :${error}`);
  }
};

const main = async () => {
  const ids = await getDocumentIds(apiFilters);
  //console.log('IDs trouvés:', ids);
  const documents = await getDocuments(ids);
  //console.log('Documents trouvés:', documents);
  const userInfo = JSON.parse(documents[0]?.data || "{}");
  //console.log('userInfo:', userInfo);

  let data = {};
  // [FIX AutreDemandeur 2026-10-14] Case cochee (au clic uniquement) : "Votre prenom/nom" = compte connecte, demandeur vide.
  const _champDeclencheur = (typeof inputKey !== "undefined" && inputKey) || context?.inputKey;
  if (
    isAutreDemandeurChecked &&
    _champDeclencheur === "Demande_TransportIdentificationDemandeurEstAutreDemandeur" &&
    userInfo
  ) {
    callback({
      data: {
        Demande_TransportIdentificationDemandeurPrenom: userInfo["Utilisateur_Prenom"] || "",
        Demande_TransportIdentificationDemandeurNom: userInfo["Utilisateur_Nom"] || "",
        Demande_TransportIdentificationDemandeurPrenomDemandeur: "",
        Demande_TransportIdentificationDemandeurNomDemandeur: "",
      },
    });
    return;
  }
  // [FIX AutreDemandeur decochage] Case decochee (au clic) : retour au compte connecte comme demandeur.
  if (
    !isAutreDemandeurChecked &&
    _champDeclencheur === "Demande_TransportIdentificationDemandeurEstAutreDemandeur" &&
    userInfo
  ) {
    callback({
      data: {
        Demande_TransportIdentificationDemandeurPrenomDemandeur: userInfo["Utilisateur_Prenom"] || "",
        Demande_TransportIdentificationDemandeurNomDemandeur: userInfo["Utilisateur_Nom"] || "",
        Demande_TransportIdentificationDemandeurTelephoneDemandeur: userInfo["Utilisateur_Telephone"] || "",
        Demande_TransportIdentificationDemandeurPoste: userInfo["Utilisateur_Poste"] || "",
        Demande_TransportIdentificationDemandeurCourrielDemandeur:
          userInfo["Demande_TransportIdentificationDemandeurCourrielDemandeur"] || "",
        Demande_TransportIdentificationDemandeurPrenom: "",
        Demande_TransportIdentificationDemandeurNom: "",
      },
    });
    return;
  }
  // [FIN FIX AutreDemandeur]
  if (
    !isAutreDemandeurChecked &&
    userInfo &&
    !docData["Demande_TransportIdentificationDemandeurPrenomDemandeur"] &&
    !docData["Demande_TransportIdentificationDemandeurNomDemandeur"]
  ) {
    data = {
      Demande_TransportIdentificationDemandeurPrenomDemandeur:
        userInfo["Utilisateur_Prenom"] || "",
      Demande_TransportIdentificationDemandeurNomDemandeur:
        userInfo["Utilisateur_Nom"] || "",
      Demande_TransportIdentificationDemandeurTelephoneDemandeur:
        userInfo["Utilisateur_Telephone"] || "",
      Demande_TransportIdentificationDemandeurPoste:
        userInfo["Utilisateur_Poste"] || "",
      Demande_TransportIdentificationDemandeurCourrielDemandeur:
        userInfo["Demande_TransportIdentificationDemandeurCourrielDemandeur"] ||
        "",
      Demande_TransportIdentificationDemandeurPrenom:
        docData["Demande_TransportIdentificationDemandeurPrenom"] || "",
      Demande_TransportIdentificationDemandeurNom:
        docData["Demande_TransportIdentificationDemandeurNom"] || "",
      Demande_TransportIdentificationDemandeurTelephone:
        docData["Demande_TransportIdentificationDemandeurTelephone"] || "",
      Demande_TransportIdentificationDemandeurPosteDemandeur:
        docData["Demande_TransportIdentificationDemandeurPosteDemandeur"] || "",
      Demande_TransportIdentificationDemandeurCourriel:
        docData["Demande_TransportIdentificationDemandeurCourriel"] || "",
    };

    //console.log('Data à callback:', data);
    callback({
      data: data,
    });
  }
};

main();
