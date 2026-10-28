console.log("Function 475 - validerExport", context);

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
  // FormId sélectionné (clique droit)
  const formId = store?.pageContentStore?.active[0];
  
  const formLayoutIdTransport = store?.moduleStore?.tableDatas?.["Grille Complétés Validés"]?.rows?.[0]?.formLayoutId;
  const formLayoutIdTournee = store?.moduleStore?.tableDatas?.GridTourneesBenevoles?.rows?.[0]?.formLayoutId;
  const formLayoutId = formLayoutIdTransport ?? formLayoutIdTournee;

  try {
    await updateManyDocuments([
      createUpdateDocument(
        {},
        formLayoutId,
        formId,
        "EXPORTÉ(E)"
      ),
    ]);
  } catch (error) {
    console.error(error);
  }
};

main();
