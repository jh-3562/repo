console.log("Fonction 478 - annulerTransports", context);

// ----- Constantes -----
const isVueMissionsToutes = window.location.href.includes("VueMissions_Toutes");
// Récupération des/de l'id(s) sélectionné (EDIT, CHECKBOX ou DOCDATA)
const CHECKBOX_UUIDS = isVueMissionsToutes
  ? ["a3048727-cb00-4414-be8b-28d088885c1d"] // VC Grille missions toutes
  : [
      "a76e0fa5-7268-4c9f-a1fd-7f198ef17169", // VC "Grilles mission auj"
      "1a618b3a-b9ed-4edf-889b-25dfaa9a5c8f", // VC "TableTransportsAValider"
    ];
let FORMIDS = new Set();

// 2. Ajoute tous les IDs dans `checked` pour chaque UUID
const checkedFormIds = CHECKBOX_UUIDS.flatMap(
  (uuid) => store?.pageContentStores?.[uuid]?.checked || []
);
checkedFormIds.forEach((id) => FORMIDS.add(id));

// 1. Ajoute l'ID dans `active` s'il existe et qu'il n'y a aucun checked
if (
  store?.pageContentStore?.active?.[0] !== undefined &&
  !checkedFormIds.length
) {
  FORMIDS.add(store.pageContentStore.active[0]);
}

// 3. Ajoute l'ID dans `docData.FORMID` s'il existe
if (docData?.FORMID !== undefined) {
  FORMIDS.add(docData.FORMID);
}

// 4. Convertit le Set en tableau si nécessaire
const uniqueFORMIDS = Array.from(FORMIDS);

console.log("FORMIDS uniques :", uniqueFORMIDS);

// 4. Si aucun ID trouvé, FORMIDS sera vide
console.log("Tous les FORMIDS :", FORMIDS);

const PONTIAC_FORMLAYOUTID_TRANSPORT = "6d75ae79-ced2-4a83-a41e-da016f27e530";

// ----- Fonctions génériques -----
// Mise à jour de plusieurs documents
const updateManyDocuments = async (documents) => {
  try {
    return await api({ local: true }).put("document/Many", {
      documents: documents,
    });
  } catch (error) {
    console.log("Erreur lors de la modification des documents.");
  }
};

// Création du corp de la mise à jour d'un document
const createUpdateDocument = (data, templateId, documentID, status) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId: templateId },
    documentID: documentID,
  };
};

// ----- Fonction principale -----
const main = async () => {
  if (!FORMIDS || FORMIDS.size === 0) {
    showErrorBanner("Veuillez sélectionner au moins un transport");
    return;
  }

  try {
    showPopupLoading("Opération en cours");

    const updateDocuments = [];

    for (const FORMID of FORMIDS) {
      updateDocuments.push(
        createUpdateDocument(
          {},
          PONTIAC_FORMLAYOUTID_TRANSPORT,
          FORMID,
          "ANNULÉ"
        )
      );
    }

    await updateManyDocuments(updateDocuments);
  } catch (error) {
    showErrorBanner("Une erreur est survenue lors du processus de mise à jour");
    console.error(error);
  } finally {
    hidePopupLoading();
  }
};

main();
