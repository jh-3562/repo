console.log("Function 143", context);

const STATUS_COMPLETEE = "Complétée";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const TRANSPORT_TEMPLATE_ID = "7242b957-a155-462e-ba68-c80f46751676";

const safeStr = (v) => String(v ?? "").trim();

async function main() {
  const transportId = safeStr(docData.FORMID);
  const demandeId = safeStr(docData.SystemeCache_IDDemandeAssocie);
  const typeTransport = safeStr(docData.SystemeCache_TypeTransport);

  if (!transportId || !demandeId) {
    return showErrorBanner("Transport or associated demande missing.");
  }

  try {
    showPopupLoading("Updating status...");

    // 1) Update transport status to Complétée
    await api({ local: true }).put("document", {
      document: {
        documentID: transportId,
        data: JSON.stringify({}),
        status: STATUS_COMPLETEE,
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
      demandeData.SystemeCache_StatutTransportAller = STATUS_COMPLETEE;
    } else if (typeTransport === "Retour") {
      demandeData.SystemeCache_StatutTransportRetour = STATUS_COMPLETEE;
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

main();

