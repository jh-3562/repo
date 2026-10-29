console.log("Function 142", context);

const STATUS_NON_COMPLETEE = "Non-Complétée";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const TRANSPORT_TEMPLATE_ID = "7242b957-a155-462e-ba68-c80f46751676";

const safeStr = (v) => String(v ?? "").trim();

async function main(values) {
  const raison = safeStr(values["Transport_RaisonNonCompletion"]);

  const transportId = safeStr(docData.FORMID);
  const demandeId = safeStr(docData.SystemeCache_IDDemandeAssocie);
  const typeTransport = safeStr(docData.SystemeCache_TypeTransport);

  if (!raison) return showErrorBanner("Transport_RaisonNonCompletion is required.");
  if (!transportId || !demandeId) return showErrorBanner("Transport or associated demande missing.");

  try {
    showPopupLoading("Updating status...");

    // 1) Update transport: set reason + status Non-Complétée
    await api({ local: true }).put("document", {
      document: {
        documentID: transportId,
        data: JSON.stringify({
          Transport_RaisonNonCompletion: raison
        }),
        status: STATUS_NON_COMPLETEE,
        active: true,
        template: { templateId: TRANSPORT_TEMPLATE_ID }
      },
      preventNotify: "FULL"
    });

    // 2) Get associated demande
    const demandeRes = await api({ local: true }).get(`document/${demandeId}`);
    const demandeDoc = demandeRes?.data?.document || demandeRes?.data;

    const demandeData =
      typeof demandeDoc.data === "string"
        ? JSON.parse(demandeDoc.data)
        : demandeDoc.data || {};

    // 3) Update demande status field based on Aller/Retour
    if (typeTransport === "Aller") {
      demandeData.SystemeCache_StatutTransportAller = STATUS_NON_COMPLETEE;
    } else if (typeTransport === "Retour") {
      demandeData.SystemeCache_StatutTransportRetour = STATUS_NON_COMPLETEE;
    }

    // 4) Save demande with same current status
    await api({ local: true }).put("document", {
      document: {
        documentID: demandeId,
        data: JSON.stringify(demandeData),
        status: demandeDoc.status,
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID }
      },
      preventNotify: "FULL"
    });

    hidePopupLoading();
    showSuccessBanner("Status updated successfully.");
    setTimeout(() => {
     window.location.href = "/repartition";
     }, 1000);

  } catch (e) {
    hidePopupLoading();
    showErrorBanner("Error while updating status.");
  }
}

showCustomPopup({
  title: "Marquer le transport comme Non-Complétée",
  commentHTML: "Enrer la raison de non complétion.",
  fields: [
    {
      key: "Transport_RaisonNonCompletion",
      name: "Raison de non complétion",
      type: "text",
      defaultValue: safeStr(docData["Transport_RaisonNonCompletion"])
    }
  ],
  buttons: [
    { name: "Annuler", preset: "cancel", onClick: () => {} },
    { name: "Confirmer", preset: "action", onClick: (values) => main(values) }
  ]
});

