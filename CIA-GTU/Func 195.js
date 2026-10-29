const UTILISATEUR_FORMLAYOUTID = "a9eaa665-43df-418c-91ce-c35d78992807";
const DEMANDE_FORMLAYOUTID = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
const getDocuments = async (ids) => {
  const response = await api({ local: true }).post("document/id", { ids });
  const documents = response?.data?.documents || [];
  if (documents.length !== ids.length) throw new Error("Certaines sélections ne sont plus disponibles. Actualisez la page.");
  return documents;
};

const main = async () => {
  try {
    const selectedIds = [...new Set(Object.values(store?.pageContentStores || {}).flatMap(value => value?.checked || []))];
    const documents = selectedIds.length ? await getDocuments(selectedIds) : [];
    const chauffeurs = documents.filter(doc => doc.metaData?.FORMLAYOUTID === UTILISATEUR_FORMLAYOUTID);
    const demandes = documents.filter(doc => doc.metaData?.FORMLAYOUTID === DEMANDE_FORMLAYOUTID);
    if (!demandes.length) throw new Error("Veuillez sélectionner au moins une demande.");
    if (chauffeurs.length !== 1) throw new Error("Veuillez sélectionner exactement un chauffeur.");

    const chauffeur = JSON.parse(chauffeurs[0].data);
    if (normalize(chauffeur.Utilisateur_Role) !== "chauffeur" || chauffeurs[0].metaData.STATUS !== "Actif") {
      throw new Error("Veuillez sélectionner un chauffeur actif.");
    }
    const username = String(chauffeur.Utilisateur_MethodeConnexion === "EntraID"
      ? chauffeur.Utilisateur_CodeWindows || "" : chauffeur.Utilisateur_Courriel || "").trim();
    if (!username) throw new Error("Ce chauffeur n'a pas de compte associé.");
    const response = await api({ local: true }).get(`appuser/${encodeURIComponent(username)}`);
    const account = response?.data?.appUser;
    if (!account?.id || account.active === false || !(account.roles || []).includes("CHAUFFEUR")) {
      throw new Error("Le compte associé doit être actif et avoir le rôle Chauffeur.");
    }
    const name = String(chauffeur.Usager_NomComplet || `${chauffeur.Utilisateur_Prenom || ""} ${chauffeur.Utilisateur_Nom || ""}`).trim();
    const carrier = normalize(chauffeur.NomTransporteurSearch);
    if (!name || !carrier) throw new Error("Le nom et le transporteur du chauffeur sont requis.");
    const parsed = demandes.map(doc => ({ doc, data: JSON.parse(doc.data) }));
    if (parsed.some(({ data }) => normalize(data.NomTransporteurSearch) !== carrier)) {
      throw new Error("Le chauffeur et toutes les demandes doivent appartenir au même transporteur.");
    }
    if (parsed.some(({ data }) => data.Répartition_NomChauffeur || data.Répartition_ChauffeurId)) {
      const confirmed = await showPopupConfirmation("Chauffeur déjà assigné", "Un chauffeur est déjà assigné à au moins une des demandes sélectionnées. Êtes-vous sûr de vouloir le remplacer ?");
      if (!confirmed) return;
    }
    showPopupLoading("Attribution en cours...");
    await updateManyDocuments_FASTER(context.api, parsed.map(({ doc, data }) => ({
      data: JSON.stringify({ ...data, Répartition_NomChauffeur: name, Répartition_ChauffeurId: account.id }),
      status: doc.metaData.STATUS,
      active: true,
      template: { templateId: DEMANDE_FORMLAYOUTID },
      documentID: doc.metaData.FORMID,
    })));
    showSuccessBanner("Chauffeur attribué avec succès.");
    window.location.reload();
  } catch (error) {
    showErrorBanner(error?.response ? "Impossible de vérifier ou d'enregistrer l'affectation. Veuillez réessayer." : error.message);
  } finally {
    hidePopupLoading();
  }
};
return main();
