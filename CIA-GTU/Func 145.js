console.log("Function 145", context);

const STATUS_ANNULEE = "Annulée";
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

 
    await api({ local: true }).put("document", {
      document: {
        documentID: transportId,
        data: JSON.stringify({}),
        status: STATUS_ANNULEE,
        active: true,
        template: { templateId: TRANSPORT_TEMPLATE_ID }
      },
      preventNotify: "FULL"
    });

    const demandeRes = await api({ local: true }).get(`document/${demandeId}`);
    const demandeDoc = demandeRes?.data?.document || demandeRes?.data;

    const demandeData =
      typeof demandeDoc.data === "string"
        ? JSON.parse(demandeDoc.data)
        : demandeDoc.data || {};

    if (typeTransport === "Aller") {
      demandeData.SystemeCache_StatutTransportAller = STATUS_ANNULEE;
    } else if (typeTransport === "Retour") {
      demandeData.SystemeCache_StatutTransportRetour = STATUS_ANNULEE;
    }

   
  
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
    showSuccessBanner("Transport annulé avec succès.");
    setTimeout(() => {
     window.location.href = "https://web.cat-gtm-test.fastercom.io/repartition";
     }, 1000);

  } catch (e) {
    hidePopupLoading();
    showErrorBanner("Error while updating status.");
  }
}

main();
