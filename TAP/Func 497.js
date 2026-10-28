console.log("Fonction 497 - messageAuChauffeurTransportsGroupe", context);

// ----- Constantes -----
const CHECKBOX_UUIDS = [
  "952eeabc-0948-4639-83a5-9771b33a0974", // VC "Grilles mission auj groupe"
  "9efc3f47-caf5-4792-8c85-e94ddf4763c7", // VC "GridTransportGroupeAValider"
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

const PONTIAC_FORMLAYOUTID_TRANSPORT_GROUPE = "de3bc87f-64fd-409b-a7bb-fcd9a505650c";

// ----- Fonctions génériques -----
// Mise à jour de plusieurs documents
const updateManyDocuments = async (documents) => {
  try {
    console.log("DOCUMENTS ", documents);
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
          PONTIAC_FORMLAYOUTID_TRANSPORT_GROUPE,
          FORMID,
          "MESSAGE AU CHAUFFEUR"
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