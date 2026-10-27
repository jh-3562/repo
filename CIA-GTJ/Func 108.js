console.log("Fonction 108", context);

(async () => {
  try {
    const DEMANDE_TEMPLATE_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
    const TRANSPORT_TEMPLATE_ID = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";

    const STATUS_DEMANDE = "En traitement";
    const STATUS_TRANSPORT = "Soumise";

    const safeParse = (raw) => {
      if (!raw) return {};
      if (typeof raw === "object") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    };

    const getDocumentFull = async (documentId) => {
      const res = await api({ local: true }).get(`document/${documentId}`);
      const raw = res?.data?.data ?? res?.data?.document?.data ?? "{}";
      const parsed = safeParse(raw);

      const status =
        res?.data?.status ||
        res?.data?.document?.status ||
        res?.data?.metaData?.STATUS ||
        "";

      console.log("GET DOCUMENT:", {
        documentId,
        status,
        data: parsed
      });

      return {
        data: parsed,
        status
      };
    };

    const updateDocumentMany = async (documentId, templateId, statusKey, dataObj) => {
      const payload = {
        documents: [
          {
            data: JSON.stringify(dataObj),
            status: statusKey,
            active: true,
            template: { templateId },
            documentID: documentId
          }
        ]
      };

      console.log("PUT PAYLOAD:", payload);

      const res = await api({ local: true }).put("document/Many", payload);

      console.log("PUT RESPONSE:", res);

      return res;
    };

    const demandeId =
      docData?.FORMID ||
      docData?.id ||
      context?.formId ||
      context?.documentId ||
      "";

    if (!demandeId) {
      throw new Error("ID demande introuvable.");
    }

    const fullDemande = await getDocumentFull(demandeId);
    const demandeData = fullDemande.data;

    const transportAllerId = String(
      demandeData?.Demande_IDTransportAller ||
      docData?.Demande_IDTransportAller ||
      ""
    ).trim();

    const transportRetourId = String(
      demandeData?.Demande_IDTransportRetour ||
      docData?.Demande_IDTransportRetour ||
      ""
    ).trim();

    const getTransportIfEligible = async (transportId, label) => {
      if (!transportId) {
        return {
          exists: false,
          eligible: false,
          id: "",
          label,
          status: "",
          data: null
        };
      }

      const fullTransport = await getDocumentFull(transportId);
      const status = String(fullTransport.status || "").trim();

      const eligible =
        status === "Annulé" ||
        status === "Refusé";

      return {
        exists: true,
        eligible,
        id: transportId,
        label,
        status,
        data: fullTransport.data
      };
    };

    const aller = await getTransportIfEligible(transportAllerId, "Aller");
    const retour = await getTransportIfEligible(transportRetourId, "Retour");

    console.log("Transport Aller:", aller);
    console.log("Transport Retour:", retour);

    const eligibleTransports = [aller, retour].filter((t) => t.eligible);

    if (eligibleTransports.length === 0) {
      throw new Error("Aucun transport associé au statut Annulé ou Refusé.");
    }

    const values = await new Promise((resolve, reject) => {
      const fields = [];

      if (eligibleTransports.length === 2) {
        fields.push({
          key: "transportChoice",
          name: "Réactiver le ou les transports",
          type: "select",
          defaultValue: "Aller et retour",
          options: [
            { value: "Aller seulement", label: "Aller seulement" },
            { value: "Retour seulement", label: "Retour seulement" },
            { value: "Aller et retour", label: "Aller et retour" }
          ],
          required: "true"
        });
      }

      showCustomPopup({
        title: "Réactiver la demande",
        commentHTML:
          "Êtes-vous sûr de vouloir réactiver la demande de transport?",
        fields,
        buttons: [
          {
            name: "Non",
            backgroundColor: "#f1f1f1",
            color: "#000000",
            onClick: () => reject(new Error("Action annulée."))
          },
          {
            name: "Oui",
            backgroundColor: "#1C5420",
            color: "#ffffff",
            onClick: (vals) => resolve(vals)
          }
        ]
      });
    });

    showPopupLoading("Réactivation en cours...");

    let choix = values?.transportChoice || "";

    if (eligibleTransports.length === 1) {
      choix = eligibleTransports[0].label === "Aller"
        ? "Aller seulement"
        : "Retour seulement";
    }

    console.log("Choix réactivation:", choix);

    const reactiverTransport = async (transport) => {
      if (!transport?.eligible || !transport?.id) return false;

      const newTransportData = {
        ...transport.data
      };

      await updateDocumentMany(
        transport.id,
        TRANSPORT_TEMPLATE_ID,
        STATUS_TRANSPORT,
        newTransportData
      );

      return true;
    };

    let reactiverAller = false;
    let reactiverRetour = false;

    if (choix === "Aller seulement") {
      reactiverAller = await reactiverTransport(aller);
    }

    if (choix === "Retour seulement") {
      reactiverRetour = await reactiverTransport(retour);
    }

    if (choix === "Aller et retour") {
      if (aller.eligible) {
        reactiverAller = await reactiverTransport(aller);
      }
      if (retour.eligible) {
        reactiverRetour = await reactiverTransport(retour);
      }
    }

    console.log("reactiverAller:", reactiverAller);
    console.log("reactiverRetour:", reactiverRetour);

    const newDemandeData = {
      ...demandeData,
      ...docData,
      Demande_StatutTransportAller:
        reactiverAller
          ? STATUS_TRANSPORT
          : (demandeData?.Demande_StatutTransportAller || docData?.Demande_StatutTransportAller || ""),
      Demande_StatutTransportRetour:
        reactiverRetour
          ? STATUS_TRANSPORT
          : (demandeData?.Demande_StatutTransportRetour || docData?.Demande_StatutTransportRetour || "")
    };

    console.log("Demande data finale:", newDemandeData);

    await updateDocumentMany(
      demandeId,
      DEMANDE_TEMPLATE_ID,
      STATUS_DEMANDE,
      newDemandeData
    );

    hidePopupLoading();
    showSuccessBanner("Demande réactivée avec succès.");
  } catch (error) {
    hidePopupLoading();
    console.error("ERREUR:", error);

    if (error?.message !== "Action annulée.") {
      showErrorBanner(error?.message || "Erreur lors de la réactivation.");
    }
  }
})();

return {};
