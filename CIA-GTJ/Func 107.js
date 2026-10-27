console.log("Fonction 107", context);

(async () => {
  try {
    const DEMANDE_TEMPLATE_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
    const TRANSPORT_TEMPLATE_ID = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";

    const STATUS_ANNULE = "Annulé";

    const demandeId =
      docData?.FORMID ||
      context?.formId ||
      context?.documentId ||
      "";

    if (!demandeId) {
      throw new Error("ID demande introuvable.");
    }

    const transportAllerId = String(
      docData?.Demande_IDTransportAller || ""
    ).trim();

    const transportRetourId = String(
      docData?.Demande_IDTransportRetour || ""
    ).trim();

    const hasAller = !!transportAllerId;
    const hasRetour = !!transportRetourId;

    const nbTransports =
      (hasAller ? 1 : 0) +
      (hasRetour ? 1 : 0);

    if (nbTransports === 0) {
      throw new Error("Aucun transport associé à cette demande.");
    }

    const updateDocumentMany = async (
      documentId,
      templateId,
      statusKey,
      dataObj
    ) => {
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

      return await api({ local: true }).put(
        "document/Many",
        payload
      );
    };

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

      return {
        data: parsed,
        status
      };
    };

    const getDocumentData = async (documentId) => {
      const full = await getDocumentFull(documentId);
      return full.data;
    };

    const values = await new Promise((resolve, reject) => {
      const fields = [];

      if (nbTransports === 2) {
        fields.push({
          key: "transportChoice",
          name: "Annuler le ou les transports",
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

      fields.push({
        key: "Demande_RaisonAnnulation",
        name: "Raison de l'annulation",
        type: "select",
        defaultValue: "Annulation par l'usager",
        options: [
          { value: "Annulation par l'usager", label: "Annulation par l'usager" },
          { value: "Annulation par l'intervenant", label: "Annulation par l'intervenant" },
          { value: "Annulation par le responsable", label: "Annulation par le responsable" },
          { value: "Annulation par le transporteur (malade, bris véhicule, etc.)", label: "Annulation par le transporteur (malade, bris véhicule, etc.)" },
          { value: "Conflit d'horaire", label: "Conflit d'horaire" },
          { value: "Condition de l'usager (malade, désorganisé)", label: "Condition de l'usager (malade, désorganisé)" },
          { value: "Rendez vous annulé par professionnel (médecin, etc.)", label: "Rendez vous annulé par professionnel (médecin, etc.)" },
          { value: "Transport effectué par requérant", label: "Transport effectué par requérant" },
          { value: "Transport effectué par milieux de vie", label: "Transport effectué par milieux de vie" },
          { value: "Condition météorologique/routière (tempête)", label: "Condition météorologique/routière (tempête)" },
          { value: "Congé prévisible (pédagogique, férié)", label: "Congé prévisible (pédagogique, férié)" }
        ],
        required: "true"
      });

      showCustomPopup({
        title: "Confirmer l'annulation",
        fields,
        buttons: [
          {
            name: "Retour",
            backgroundColor: "#f1f1f1",
            color: "#000000",
            onClick: () => reject(new Error("Action annulée."))
          },
          {
            name: "Confirmer l'annulation",
            backgroundColor: "#F0C5C5",
            color: "#340203",
            onClick: (vals) => resolve(vals)
          }
        ]
      });
    });

    showPopupLoading("Annulation en cours...");

    const raison = String(
      values?.Demande_RaisonAnnulation || ""
    ).trim();

    if (!raison) {
      throw new Error("Raison obligatoire.");
    }

    let choix =
      values?.transportChoice ||
      "Aller et retour";

    if (nbTransports === 1) {
      choix = hasAller
        ? "Aller seulement"
        : "Retour seulement";
    }

    console.log("Choix annulation:", choix);
    console.log("Raison annulation:", raison);

    const annulerTransport = async (id) => {
      if (!id) return;

      const current = await getDocumentData(id);

      await updateDocumentMany(
        id,
        TRANSPORT_TEMPLATE_ID,
        STATUS_ANNULE,
        {
          ...current,
          Demande_RaisonAnnulation: raison
        }
      );
    };

    let annuleAller = false;
    let annuleRetour = false;

    if (choix === "Aller seulement") {
      await annulerTransport(transportAllerId);
      annuleAller = true;
    }

    if (choix === "Retour seulement") {
      await annulerTransport(transportRetourId);
      annuleRetour = true;
    }

    if (choix === "Aller et retour") {
      if (hasAller) {
        await annulerTransport(transportAllerId);
        annuleAller = true;
      }

      if (hasRetour) {
        await annulerTransport(transportRetourId);
        annuleRetour = true;
      }
    }

    const fullDemande = await getDocumentFull(demandeId);
    const currentDemandeData = fullDemande.data;

    const demandeData = {
      ...currentDemandeData,
      ...docData,
      Demande_RaisonAnnulation: raison,
      Demande_StatutTransportAller:
        annuleAller
          ? STATUS_ANNULE
          : currentDemandeData?.Demande_StatutTransportAller ||
            docData?.Demande_StatutTransportAller ||
            "",
      Demande_StatutTransportRetour:
        annuleRetour
          ? STATUS_ANNULE
          : currentDemandeData?.Demande_StatutTransportRetour ||
            docData?.Demande_StatutTransportRetour ||
            ""
    };

    console.log("demandeData final:", demandeData);

    await updateDocumentMany(
      demandeId,
      DEMANDE_TEMPLATE_ID,
      STATUS_ANNULE,
      demandeData
    );

    hidePopupLoading();

    showSuccessBanner("Annulation effectuée avec succès.");
  } catch (error) {
    hidePopupLoading();

    console.error("ERREUR:", error);

    if (error?.message !== "Action annulée.") {
      showErrorBanner(
        error?.message || "Erreur."
      );
    }
  }
})();

return {};
