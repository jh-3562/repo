console.log("Fonction 104", context);

const DEMANDE_TEMPLATE_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
const TRANSPORT_TEMPLATE_ID = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";

const DEMANDE_STATUS_REFUSE = "Refusé";
const TRANSPORT_STATUS_REFUSE = "Refusé";

const SEND_EMAIL_WEBHOOK = N8N_SENDEMAIL;

const REFUS_REASONS = [
  "Aucun transporteur disponible",
  "Demande hors délai",
  "Non-respect d'un critère admissibilité",
  "Congé prévisible (pédagogique, férié)",
  "Information erronée dans la demande",
  "Demande/Transport en doublon",
];

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const getDocumentData = async (documentId) => {
  const res = await api({ local: true }).get(`document/${documentId}`);
  const raw = res?.data?.data ?? res?.data?.document?.data ?? "{}";
  return safeParse(raw);
};

const updateDocumentMany = async (
  documentId,
  templateId,
  statusKey,
  dataObj,
) => {
  await api({ local: true }).put("document/Many", {
    documents: [
      {
        data: JSON.stringify(dataObj),
        status: statusKey,
        active: true,
        template: { templateId },
        documentID: documentId,
      },
    ],
  });
};

const buildPopupRefus = () => {
  return new Promise((resolve) => {
    const oldPopup = document.getElementById("popup-refus-transport");
    if (oldPopup) oldPopup.remove();

    const overlay = document.createElement("div");
    overlay.id = "popup-refus-transport";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999999";

    const modal = document.createElement("div");
    modal.style.width = "520px";
    modal.style.maxWidth = "92vw";
    modal.style.background = "#fff";
    modal.style.borderRadius = "12px";
    modal.style.padding = "24px";
    modal.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
    modal.style.fontFamily = "Arial, sans-serif";

    modal.innerHTML = `
      <div style="font-size:22px;font-weight:700;margin-bottom:18px;color:#341504;">
        Confirmer le refus
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-weight:600;margin-bottom:8px;color:#341504;">
          Refuser le ou les transports
        </label>
        <select id="refus-transport-choice" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;">
          <option value="Aller seulement">Aller seulement</option>
          <option value="Retour seulement">Retour seulement</option>
          <option value="Aller et retour">Aller et retour</option>
        </select>
      </div>

      <div style="margin-bottom:20px;">
        <label style="display:block;font-weight:600;margin-bottom:8px;color:#341504;">
          Raison du refus
        </label>
        <select id="refus-reason" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;">
          <option value="">Sélectionner</option>
          ${REFUS_REASONS.map(
            (r) => `<option value="${r.replace(/"/g, "&quot;")}">${r}</option>`,
          ).join("")}
        </select>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="refus-cancel" style="padding:10px 16px;border:none;border-radius:8px;background:#e5e5e5;cursor:pointer;">
          Annuler
        </button>
        <button id="refus-confirm" style="padding:10px 16px;border:none;border-radius:8px;background:#341504;color:#fff;cursor:pointer;">
          Confirmer
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = (result) => {
      overlay.remove();
      resolve(result);
    };

    modal.querySelector("#refus-cancel").onclick = () => close(null);

    modal.querySelector("#refus-confirm").onclick = () => {
      const reason = modal.querySelector("#refus-reason")?.value || "";
      const transportChoice =
        modal.querySelector("#refus-transport-choice")?.value || "";

      if (!reason) {
        showErrorBanner("Veuillez sélectionner une raison du refus.");
        return;
      }

      close({ reason, transportChoice });
    };
  });
};

(async () => {
  try {
    showPopupLoading("Refus en cours...");

    const demandeId = docData?.FORMID || docData?.id || context?.formId || "";
    if (!demandeId) {
      throw new Error("ID de la demande introuvable.");
    }

    const demandeData = await getDocumentData(demandeId);

    const transportAllerId = String(
      demandeData?.Demande_IDTransportAller || "",
    ).trim();
    const transportRetourId = String(
      demandeData?.Demande_IDTransportRetour || "",
    ).trim();

    const hasAller = !!transportAllerId;
    const hasRetour = !!transportRetourId;
    const nbTransports = [hasAller, hasRetour].filter(Boolean).length;

    let reason = "";
    let transportChoice = "";
    let refuseAller = false;
    let refuseRetour = false;

    if (nbTransports <= 1) {
      hidePopupLoading();

      const popup = await new Promise((resolve) => {
        const oldPopup = document.getElementById("popup-refus-simple");
        if (oldPopup) oldPopup.remove();

        const overlay = document.createElement("div");
        overlay.id = "popup-refus-simple";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.45)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "999999";

        const modal = document.createElement("div");
        modal.style.width = "520px";
        modal.style.maxWidth = "92vw";
        modal.style.background = "#fff";
        modal.style.borderRadius = "12px";
        modal.style.padding = "24px";
        modal.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
        modal.style.fontFamily = "Arial, sans-serif";

        modal.innerHTML = `
          <div style="font-size:22px;font-weight:700;margin-bottom:18px;color:#341504;">
            Confirmer le refus
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block;font-weight:600;margin-bottom:8px;color:#341504;">
              Raison du refus
            </label>
            <select id="refus-reason-simple" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;">
              <option value="">Sélectionner</option>
              ${REFUS_REASONS.map(
                (r) =>
                  `<option value="${r.replace(/"/g, "&quot;")}">${r}</option>`,
              ).join("")}
            </select>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button id="refus-cancel-simple" style="padding:10px 16px;border:none;border-radius:8px;background:#e5e5e5;cursor:pointer;">
              Annuler
            </button>
            <button id="refus-confirm-simple" style="padding:10px 16px;border:none;border-radius:8px;background:#341504;color:#fff;cursor:pointer;">
              Confirmer
            </button>
          </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const close = (result) => {
          overlay.remove();
          resolve(result);
        };

        modal.querySelector("#refus-cancel-simple").onclick = () => close(null);

        modal.querySelector("#refus-confirm-simple").onclick = () => {
          const selectedReason =
            modal.querySelector("#refus-reason-simple")?.value || "";

          if (!selectedReason) {
            showErrorBanner("Veuillez sélectionner une raison du refus.");
            return;
          }

          close({ reason: selectedReason });
        };
      });

      if (!popup) {
        return {};
      }

      showPopupLoading("Refus en cours...");

      reason = popup.reason;
      refuseAller = hasAller;
      refuseRetour = hasRetour;
      transportChoice = hasAller
        ? "Aller seulement"
        : hasRetour
          ? "Retour seulement"
          : "";
    } else {
      hidePopupLoading();

      const popup = await buildPopupRefus();
      if (!popup) {
        return {};
      }

      showPopupLoading("Refus en cours...");

      reason = popup.reason;
      transportChoice = popup.transportChoice;

      if (transportChoice === "Aller seulement") {
        refuseAller = true;
        refuseRetour = false;
      } else if (transportChoice === "Retour seulement") {
        refuseAller = false;
        refuseRetour = true;
      } else {
        refuseAller = true;
        refuseRetour = true;
      }
    }

    if (refuseAller && transportAllerId) {
      const transportAllerData = await getDocumentData(transportAllerId);

      await updateDocumentMany(
        transportAllerId,
        TRANSPORT_TEMPLATE_ID,
        TRANSPORT_STATUS_REFUSE,
        {
          ...transportAllerData,
          Transport_RaisonRefus: reason,
          Transport_DateRefus: new Date().toISOString(),
        },
      );
    }

    if (refuseRetour && transportRetourId) {
      const transportRetourData = await getDocumentData(transportRetourId);

      await updateDocumentMany(
        transportRetourId,
        TRANSPORT_TEMPLATE_ID,
        TRANSPORT_STATUS_REFUSE,
        {
          ...transportRetourData,
          Transport_RaisonRefus: reason,
          Transport_DateRefus: new Date().toISOString(),
        },
      );
    }

    await updateDocumentMany(
      demandeId,
      DEMANDE_TEMPLATE_ID,
      DEMANDE_STATUS_REFUSE,
      {
        ...demandeData,
        Transport_RaisonRefus: reason,
        Demande_DateRefus: new Date().toISOString(),
        Demande_StatutTransportAller:
          refuseAller && transportAllerId
            ? TRANSPORT_STATUS_REFUSE
            : demandeData?.Demande_StatutTransportAller || "",
        Demande_StatutTransportRetour:
          refuseRetour && transportRetourId
            ? TRANSPORT_STATUS_REFUSE
            : demandeData?.Demande_StatutTransportRetour || "",
      },
    );

    const prenom =
      demandeData?.Demande_IdentificationIdentificationPrénomIntervenant || "";

    const nom =
      demandeData?.Demande_IdentificationIdentificationNomIntervenant ||
      demandeData?.Demande_IdentificationIdentificationProgrammeIntervenant ||
      "";

    const email =
      demandeData?.Demande_IdentificationIdentificationCourrielIntervenant ||
      "";

    const numero = demandeData?.NUMBER || docData?.NUMBER || "";
    const lien = window.location.href;

    if (email) {
      const html = `
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Votre demande <a href="${lien}">#${numero}</a> a été refusé.</p>
        <p>Merci,</p>
        <p>L'équipe de la Direction de la protection de la jeunesse</p>
      `;

      await fetch(SEND_EMAIL_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          sujet: `Demande #${numero} refusée`,
          html,
          numero,
          prenom,
          nom,
          lien,
          raisonRefus: reason,
        }),
      });
    }

    hidePopupLoading();
    showSuccessBanner("La demande a été refusée avec succès.");
  } catch (error) {
    hidePopupLoading();
    console.error(error);
    showErrorBanner(error?.message || "Erreur lors du refus.");
  }
})();

return {};
