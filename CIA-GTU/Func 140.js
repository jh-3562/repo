console.log("Function 140", context);

const STATUS_CONFIRMEE = "Confirmée";
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

    showPopupLoading("Confirmation in progress...");

    // 1. Update transport status to Confirmée
    await api({ local: true }).put("document", {
      document: {
        documentID: transportId,
        data: JSON.stringify({}),
        status: STATUS_CONFIRMEE,
        active: true,
        template: { templateId: TRANSPORT_TEMPLATE_ID }
      }
    });

    // 2. Get associated demande
    const demandeRes = await api({ local: true }).get(`document/${demandeId}`);
    const demandeDoc = demandeRes?.data?.document || demandeRes?.data;

    const demandeData =
      typeof demandeDoc.data === "string"
        ? JSON.parse(demandeDoc.data)
        : demandeDoc.data || {};

    // 3. Update correct field depending on transport type
    if (typeTransport === "Aller") {
      demandeData.SystemeCache_StatutTransportAller = STATUS_CONFIRMEE;
    }

    if (typeTransport === "Retour") {
      demandeData.SystemeCache_StatutTransportRetour = STATUS_CONFIRMEE;
    }

    // 4. Save demande with same current status
    await api({ local: true }).put("document", {
      document: {
        documentID: demandeId,
        data: JSON.stringify(demandeData),
        status: demandeDoc.status,
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID }
      }
    });

    hidePopupLoading();
    showSuccessBanner("Transport confirmed successfully.");
    setTimeout(() => {
     window.location.href = "/repartition";
     }, 1000);

  } catch (e) {
    hidePopupLoading();
    showErrorBanner("Error during confirmation.");
  }
}

main();

