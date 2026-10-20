console.log("Function 153", context);

const STATUS_A_PLANIFIER = "Planifiée";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const safeStr = (v) => String(v ?? "").trim();

async function updateDemandeOnly() {
  try {
    showPopupLoading("Planification en cours");

    const demandeId = safeStr(
      store?.pageContentStore?.processData?.[0]?.result?.ids?.[0]
    );

    if (!demandeId) {
      hidePopupLoading();
      showErrorBanner("Demande introuvable dans le store.");
      return;
    }

    const repartitionTransporteur = safeStr(store?.pageContentStore?.processData?.[0]?.edits?.Répartition_Transporteur ?? "");

    await api({ local: true }).put("document", {
      document: {
        documentID: demandeId,
        status: STATUS_A_PLANIFIER,
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID },
        data: JSON.stringify({
          NomTransporteurSearch: repartitionTransporteur,
        }),
      }
    });

    hidePopupLoading();
    showSuccessBanner("Demande mise à jour avec succès.");

  } catch (e) {
    hidePopupLoading();
    console.error("Erreur updateDemandeOnly:", e);
    showErrorBanner("Erreur lors de la mise à jour de la demande.");
  }
}

updateDemandeOnly();
