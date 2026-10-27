console.log("Fonction 105", context);

const DEMANDE_TEMPLATE_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
const TRANSPORT_TEMPLATE_ID = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";

const STATUS_DEMANDE_ATTENTE = "En attente d'approbation";
const STATUS_DEMANDE_TRAITEMENT = "En traitement";

const STATUS_TRANSPORT_SOUMIS = "Soumis";
const STATUS_TRANSPORT_MODIFIEE = "Modifié";

/* HELPERS GÉNÉRAUX */

//SORRY FOR THAT
const showCustomPopup = ({ title, commentHTML, fields, buttons }) => {
  // Crée un input selon le type et applique un mask si nécessaire
  function getInput({
    key,
    name,
    type,
    options,
    mask,
    style,
    defaultValue,
    min,
    max,
    required,
  }) {
    const wrapper = document.createElement("div");
    wrapper.className = "popup-input";

    const label = document.createElement("label");
    label.htmlFor = key;

    const labelText = document.createElement("span");
    labelText.textContent = name || key;

    label.appendChild(labelText);

    if (required) {
      const asterisk = document.createElement("span");
      asterisk.textContent = " *";
      asterisk.className = "required-asterisk";
      label.appendChild(asterisk);
    }

    let input;

    switch (type.toLowerCase()) {
      case "select":
        input = document.createElement("select");
        input.name = key;
        if (style) input.style = style;
        input.id = key;
        (options || []).forEach(({ value, label }) => {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label;
          input.appendChild(opt);
        });
        wrapper.append(label, input);
        break;

      case "checkbox":
        input = document.createElement("input");
        input.type = "checkbox";
        input.name = key;
        if (style) input.style = style;
        input.id = key;
        wrapper.classList.add("popup-input-row");
        wrapper.append(input, label);
        break;

      case "number":
        input = document.createElement("input");
        input.type = "number";
        input.name = key;
        if (style) input.style = style;
        if (defaultValue !== undefined) input.value = defaultValue;
        if (min !== undefined) input.min = min;
        if (max !== undefined) input.max = max;
        if (required) input.required = true;
        input.step = 1;
        input.id = key;
        input.addEventListener("input", () => {
          input.value = input.value.replace(/[^\d]/g, "");
        });
        wrapper.append(label, input);
        break;

      case "label":
        const span = document.createElement("span");
        span.innerHTML = name || "";
        if (style) span.style = style;
        wrapper.appendChild(span);
        break;

      default:
        input = document.createElement("input");
        input.type = type.toLowerCase();
        input.name = key;
        if (style) input.style = style;
        if (defaultValue !== undefined) input.value = defaultValue;
        input.id = key;
        if (mask instanceof RegExp) {
          applyRegexMask(input, mask);
        }
        wrapper.append(label, input);
        break;
    }

    return wrapper;
  }
  // Création POPUP
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup-box";

  const style = document.createElement("style");
  style.textContent = `
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeInOverlay 0.15s ease-out;
  }

  @keyframes fadeInOverlay {
    from {
      background: rgba(0, 0, 0, 0);
    }
    to {
      background: rgba(0, 0, 0, 0.4);
    }
  }

  .popup-box {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background: white;
    border-radius: 0.375rem;
    padding: 15px 25px;
    width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    animation: fadeInScale 0.15s ease-out;
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
      background: rgba(0, 0, 0, 0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .popup-box h1,
  .popup-box h2,
  .popup-box h3,
  .popup-box p,
  .popup-box span {
    color: #202127;
  }

  .popup-box h2 {
    margin: 0 0 20px;
    font-size: 1.25rem;
  }

  .popup-box p,
  .popup-box span {
    font-size: 1rem;
  }

  .popup-comment {
    margin-bottom: 20px;
  }

  .popup-input {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }

  .popup-input-row {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .popup-input label {
    margin-bottom: 5px;
    font-size: 12px;
  }

  .popup-input input,
  .popup-input select {
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    font-size: 1rem;
  }

  .popup-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .popup-buttons button {
    border: none;
    padding: 3px 30px;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
  }
  .popup-input label .required-asterisk {
    color: red;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .popup-input input,
    .popup-input select {
        width: 100%;
    }
  }
`;

  popup.appendChild(style);

  // Titre
  if (title) {
    const titleElem = document.createElement("h2");
    titleElem.textContent = title;
    titleElem.style.fontWeight = "bold";
    popup.appendChild(titleElem);
  }

  // Commentaire HTML
  if (commentHTML) {
    const comment = document.createElement("div");
    comment.className = "popup-comment";
    comment.innerHTML = commentHTML;
    popup.appendChild(comment);
  }

  // Champs
  if (fields)
    for (const field of fields) {
      popup.appendChild(getInput(field));
    }

  // Boutons
  const buttonRow = document.createElement("div");
  buttonRow.className = "popup-buttons";

  if (buttons) {
    for (const { name, onClick, backgroundColor, color, preset } of buttons) {
      const btn = document.createElement("button");
      btn.textContent = name;

      switch (preset) {
        case "action":
          // Action bleu
          btn.style.backgroundColor = "#3182ce";
          btn.style.color = "#f2f7fb";
          break;
        case "cancel":
          // Cancel gris
          btn.style.backgroundColor = "#f5f5f6";
          btn.style.color = "#2c2d32";
          break;
        default:
          // Action bleu
          btn.style.backgroundColor = "#3182ce";
          btn.style.color = "#f2f7fb";
          break;
      }

      if (backgroundColor) btn.style.backgroundColor = backgroundColor;
      if (color) btn.style.color = color;

      btn.onclick = () => {
        const values = {};
        const inputs = popup.querySelectorAll("input, select");
        // Cas spécfifique avec les checkbox (on retourne true ou false)
        for (const el of inputs) {
          values[el.name] = el.type === "checkbox" ? el.checked : el.value;
        }
        onClick(values);
        document.body.removeChild(overlay);
      };

      buttonRow.appendChild(btn);
    }
  }

  popup.appendChild(buttonRow);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
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
  console.log("GET document:", documentId);

  const res = await api({ local: true }).get(`document/${documentId}`);
  console.log("GET RAW RESPONSE:", res);

  const rawData = res?.data?.data ?? res?.data?.document?.data ?? "{}";
  const parsedData = safeParse(rawData);

  const status =
    res?.data?.status ||
    res?.data?.document?.status ||
    res?.data?.metaData?.STATUS ||
    "";

  console.log("GET PARSED DATA:", parsedData);
  console.log("GET DOCUMENT STATUS:", status);

  return {
    raw: res,
    data: parsedData,
    status,
  };
};

const getDocumentData = async (documentId) => {
  const full = await getDocumentFull(documentId);
  return full.data;
};

const updateDocumentMany = async (
  documentId,
  templateId,
  statusKey,
  dataObj,
) => {
  const payload = {
    documents: [
      {
        data: JSON.stringify(dataObj),
        status: statusKey,
        active: true,
        template: { templateId },
        documentID: documentId,
      },
    ],
  };

  console.log("PUT document/Many PAYLOAD:", payload);

  const res = await api({ local: true }).put("document/Many", payload);

  console.log("PUT RESPONSE:", res);

  return res;
};

const createDocument = async (templateId, dataObj, statusOverride) => {
  const payload = {
    document: {
      data: JSON.stringify(dataObj),
      status: statusOverride,
      active: true,
      template: { templateId },
    },
    preventNotify: "FULL",
  };

  console.log("POST document PAYLOAD:", payload);

  const response = await api({ local: true }).post("document", payload);
  console.log("POST RESPONSE:", response);

  const id = response?.data?.id;
  if (!id) {
    throw new Error("Création échouée : id manquant.");
  }

  return {
    id,
    number: response?.data?.number ?? "",
    status:
      response?.data?.status ??
      response?.data?.document?.status ??
      statusOverride,
  };
};

/* HELPERS DATES */

const buildJSDate = (date, heure) => {
  const d = String(date || "").trim();
  const h = String(heure || "").trim();

  if (!d) return null;

  const [year, month, day] = d.split("-").map(Number);
  const [hh = "00", mm = "00"] = h.split(":");

  const result = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    Number(hh),
    Number(mm),
    0,
    0,
  );

  return isNaN(result.getTime()) ? null : result;
};

const buildDateTime = (date, heure) => {
  const d = String(date || "").trim();
  const h = String(heure || "").trim();

  if (!d || !h) return "";

  const [hh = "00", mm = "00"] = h.split(":");
  return `${d}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
};

const isSameDay = (date) => {
  if (!date) return false;

  const [year, month, day] = String(date).split("-").map(Number);
  const d = new Date(year, (month || 1) - 1, day || 1);
  const now = new Date();

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const isWithinNext72Hours = (date, heure) => {
  if (isSameDay(date)) return true;

  const target = buildJSDate(date, heure);
  if (!target) return false;

  const diff = (target.getTime() - Date.now()) / 36e5;
  console.log("isWithinNext72Hours:", { date, heure, diff });

  return diff >= 0 && diff <= 72;
};

/* POPUPS */

const askRaisonHorsDelai = () =>
  new Promise((resolve, reject) => {
    showCustomPopup({
      title: "Demande hors délai",
      commentHTML: `
        La date de départ est dans 72 heures ou moins.
        <br/>Veuillez remplir le champ <b>Raison du hors délai</b>
        <br/>et communiquer avec le service de transport pour continuer.
      `,
      fields: [
        {
          key: "Transport_RaisonHorsDelai",
          name: "Raison du hors délai",
          type: "textarea",
          style: "width: 100%; min-height: 90px;",
          defaultValue: "",
          required: "true",
        },
      ],
      buttons: [
        {
          name: "Annuler",
          backgroundColor: "#f1f1f1",
          color: "#1e1e1e",
          onClick: () => reject(new Error("Action annulée.")),
        },
        {
          name: "Continuer",
          backgroundColor: "#1C5420",
          color: "#f1f1f1",
          onClick: (values) => {
            const reason = String(
              values?.Transport_RaisonHorsDelai || "",
            ).trim();

            if (!reason) {
              return reject(new Error("Transport_RaisonHorsDelai est requis."));
            }

            resolve(reason);
          },
        },
      ],
    });
  });

const showWarningPopup = () =>
  new Promise((resolve) => {
    const oldPopup = document.getElementById("popup-warning-modifications");
    if (oldPopup) oldPopup.remove();

    const overlay = document.createElement("div");
    overlay.id = "popup-warning-modifications";
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
    modal.style.width = "560px";
    modal.style.maxWidth = "92vw";
    modal.style.background = "#fff";
    modal.style.borderRadius = "12px";
    modal.style.padding = "24px";
    modal.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
    modal.style.fontFamily = "Arial, sans-serif";

    modal.innerHTML = `
      <div style="font-size:22px;font-weight:700;margin-bottom:18px;color:#341504;">
        Avis
      </div>
      <div style="font-size:15px;line-height:1.5;color:#341504;margin-bottom:20px;">
        Veuillez communiquer avec un répartiteur pour vous assurer que les modifications de votre demande soient prises en charge.
      </div>
      <div style="display:flex;justify-content:flex-end;">
        <button id="warning-ok" style="padding:10px 16px;border:none;border-radius:8px;background:#341504;color:#fff;cursor:pointer;">
          OK
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector("#warning-ok").onclick = () => {
      overlay.remove();
      resolve(true);
    };
  });

/* HELPERS DONNÉES */

const buildUsagerComplet = (localDocData) => {
  const nom = String(
    localDocData?.Demande_IdentificationIdentficationUsagerNom || "",
  ).trim();

  const prenom = String(
    localDocData?.Demande_IdentificationIdentficationUsagerPrénom || "",
  ).trim();

  const age = String(
    localDocData?.Demande_IdentificationIdentficationUsagerÂge || "",
  ).trim();

  const dossier = String(
    localDocData?.Demande_IdentificationIdentficationUsagerNuméroDossierPIJ ||
      "",
  ).trim();

  if (nom && prenom && age && dossier) {
    return `${nom}, ${prenom} (${age}), #${dossier}`;
  }
  if (nom && prenom && age) {
    return `${nom}, ${prenom} (${age})`;
  }
  if (nom && prenom) {
    return `${nom}, ${prenom}`;
  }
  return nom || prenom || "";
};

const buildDepartAller = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeAllerD_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeAllerD_Adresse || "").trim();
  const ville = String(localDocData?.DemandeAllerD_Ville || "").trim();
  const telephone = String(localDocData?.DemandeAllerD_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const buildDestinationAller = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeAllerA_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeAllerA_Adresse || "").trim();
  const ville = String(localDocData?.DemandeAllerA_Ville || "").trim();
  const telephone = String(localDocData?.DemandeAllerA_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const buildDepartRetour = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeRetourD_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeRetourD_Adresse || "").trim();
  const ville = String(localDocData?.DemandeRetourD_Ville || "").trim();
  const telephone = String(localDocData?.DemandeRetourD_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const buildDestinationRetour = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeRetourA_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeRetourA_Adresse || "").trim();
  const ville = String(localDocData?.DemandeRetourA_Ville || "").trim();
  const telephone = String(localDocData?.DemandeRetourA_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const refreshMainDateFields = (data) => {
  const type = String(data?.Transport_TypeTransport || "").trim();

  if (type === "Aller") {
    return {
      Demande_DateHeureDebut: buildDateTime(
        data?.DemandeAllerD_Date,
        data?.DemandeAllerD_Heure,
      ),
      Demande_DateHeureFin: buildDateTime(
        data?.DemandeAllerA_Date,
        data?.DemandeAllerA_Heure,
      ),
    };
  }

  if (type === "Retour") {
    return {
      Demande_DateHeureDebut: buildDateTime(
        data?.DemandeRetourD_Date,
        data?.DemandeRetourD_Heure,
      ),
      Demande_DateHeureFin: buildDateTime(
        data?.DemandeRetourA_Date,
        data?.DemandeRetourA_Heure,
      ),
    };
  }

  return {
    Demande_DateHeureDebut: buildDateTime(
      data?.DemandeAllerD_Date,
      data?.DemandeAllerD_Heure,
    ),
    Demande_DateHeureFin: buildDateTime(
      data?.DemandeRetourA_Date,
      data?.DemandeRetourA_Heure,
    ),
  };
};

const buildTransportPayload = (localDocData, kind) => {
  const intervenant = [
    localDocData?.Demande_IdentificationIdentificationPrénomIntervenant || "",
    localDocData?.Demande_IdentificationIdentificationNomIntervenant || "",
  ]
    .map((v) => String(v).trim())
    .filter(Boolean)
    .join(" ");

  const usagerComplet = buildUsagerComplet(localDocData);

  const base = {
    ...localDocData,
    Transport_TypeTransport: kind,
    SectionCache_Intervenant: intervenant,
    Usager_Complet: usagerComplet,
  };

  if (kind === "Aller") {
    return {
      ...base,
      SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetAller || "",
      SectionCache_AdresseDepart: localDocData?.DemandeAllerD_Adresse || "",
      SectionCache_AdresseDestination:
        localDocData?.DemandeAllerA_Adresse || "",
      Demande_DateHeureDebut: buildDateTime(
        localDocData?.DemandeAllerD_Date,
        localDocData?.DemandeAllerD_Heure,
      ),
      Demande_DateHeureFin: buildDateTime(
        localDocData?.DemandeAllerA_Date,
        localDocData?.DemandeAllerA_Heure,
      ),
      Transport_DepartLatitude: localDocData?.Transport_Latitude || "",
      Transport_DepartLongitude: localDocData?.Transport_Longitude || "",
      Transport_DestinationLatitude:
        localDocData?.Transport_LatitudeAllerA || "",
      Transport_DestinationLongitude:
        localDocData?.Transport_LongitudeAllerA || "",
      FeuilleRoute_DepartAller: buildDepartAller(localDocData),
      FeuilleRoute_DestinationAller: buildDestinationAller(localDocData),
    };
  }

  return {
    ...base,
    SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetRetour || "",
    SectionCache_AdresseDepart: localDocData?.DemandeRetourD_Adresse || "",
    SectionCache_AdresseDestination: localDocData?.DemandeRetourA_Adresse || "",
    Demande_DateHeureDebut: buildDateTime(
      localDocData?.DemandeRetourD_Date,
      localDocData?.DemandeRetourD_Heure,
    ),
    Demande_DateHeureFin: buildDateTime(
      localDocData?.DemandeRetourA_Date,
      localDocData?.DemandeRetourA_Heure,
    ),
    Transport_DepartLatitude: localDocData?.Transport_LatitudeRetourD || "",
    Transport_DepartLongitude: localDocData?.Transport_LongitudeRetourD || "",
    Transport_DestinationLatitude:
      localDocData?.Transport_LatitudeRetourA || "",
    Transport_DestinationLongitude:
      localDocData?.Transport_LongitudeRetourA || "",
    FeuilleRoute_DepartRetour: buildDepartRetour(localDocData),
    FeuilleRoute_DestinationRetour: buildDestinationRetour(localDocData),
  };
};

const clearTransportData = (transportData) => {
  console.log("clearTransportData: aucun champ réel confirmé à vider");
  return {
    ...transportData,
  };
};

const syncTransportDocument = async (
  transportId,
  realStatus,
  mergedDemandeData,
  kind,
) => {
  if (!transportId) {
    console.log(`Pas de transport ${kind} à synchroniser.`);
    return;
  }

  const currentTransportData = await getDocumentData(transportId);
  const newTransportPayload = buildTransportPayload(mergedDemandeData, kind);

  const transportDataToSave = {
    ...currentTransportData,
    ...newTransportPayload,
    Transport_IDDemande: mergedDemandeData?.FORMID || "",
    Transport_Nombre:
      mergedDemandeData?.NUMBER || currentTransportData?.Transport_Nombre || "",
  };

  console.log(`SYNC transport ${kind}:`, {
    transportId,
    realStatus,
    transportDataToSave,
  });

  await updateDocumentMany(
    transportId,
    TRANSPORT_TEMPLATE_ID,
    realStatus,
    transportDataToSave,
  );

  console.log(`Transport ${kind} synchronisé avec statut réel:`, realStatus);
};

const computeHorsDelai = (data) => {
  const type = String(data?.Transport_TypeTransport || "").trim();

  let isHorsDelai = false;

  if (type === "Aller") {
    isHorsDelai = isWithinNext72Hours(
      data?.DemandeAllerD_Date,
      data?.DemandeAllerD_Heure,
    );
  } else if (type === "Retour") {
    isHorsDelai = isWithinNext72Hours(
      data?.DemandeRetourD_Date,
      data?.DemandeRetourD_Heure,
    );
  } else if (type === "Aller/Retour") {
    isHorsDelai =
      isWithinNext72Hours(
        data?.DemandeAllerD_Date,
        data?.DemandeAllerD_Heure,
      ) ||
      isWithinNext72Hours(
        data?.DemandeRetourD_Date,
        data?.DemandeRetourD_Heure,
      );
  } else {
    throw new Error("Transport_TypeTransport invalide.");
  }

  console.log("computeHorsDelai:", { type, isHorsDelai });

  return isHorsDelai;
};

/* MAIN */

(async () => {
  try {
    showPopupLoading("Enregistrement des modifications...");

    const demandeId = docData?.FORMID || docData?.id || context?.formId || "";
    console.log("demandeId:", demandeId);

    if (!demandeId) {
      throw new Error("ID de la demande introuvable.");
    }

    const fullDemande = await getDocumentFull(demandeId);
    const currentDemandeData = fullDemande.data;

    console.log("currentDemandeData:", currentDemandeData);
    console.log("docData:", docData);

    const mergedDemandeData = {
      ...currentDemandeData,
      ...docData,
      FORMID: demandeId,
      NUMBER: docData?.NUMBER || currentDemandeData?.NUMBER || "",
    };

    Object.assign(mergedDemandeData, refreshMainDateFields(mergedDemandeData));

    console.log("mergedDemandeData:", mergedDemandeData);

    const currentStatus =
      fullDemande.status ||
      context?.document?.status ||
      context?.status ||
      docData?.STATUS ||
      "";

    console.log("currentStatus:", currentStatus);

    if (!currentStatus) {
      throw new Error("Statut actuel introuvable.");
    }

    const transportAllerId = String(
      mergedDemandeData?.Demande_IDTransportAller || "",
    ).trim();
    const transportRetourId = String(
      mergedDemandeData?.Demande_IDTransportRetour || "",
    ).trim();

    const statutTransportAller = String(
      mergedDemandeData?.Demande_StatutTransportAller || "",
    ).trim();

    const statutTransportRetour = String(
      mergedDemandeData?.Demande_StatutTransportRetour || "",
    ).trim();

    console.log("transportAllerId:", transportAllerId);
    console.log("transportRetourId:", transportRetourId);
    console.log("statutTransportAller:", statutTransportAller);
    console.log("statutTransportRetour:", statutTransportRetour);

    const hasAller = !!transportAllerId;
    const hasRetour = !!transportRetourId;

    const hasTransportNotSoumis =
      (hasAller &&
        statutTransportAller &&
        statutTransportAller !== STATUS_TRANSPORT_SOUMIS) ||
      (hasRetour &&
        statutTransportRetour &&
        statutTransportRetour !== STATUS_TRANSPORT_SOUMIS);

    console.log("hasTransportNotSoumis:", hasTransportNotSoumis);

    /* CAS TRANSPORT DÉJÀ TRAITÉ */

    if (hasTransportNotSoumis) {
      console.log("CASE = transport déjà traité");

      hidePopupLoading();
      await showWarningPopup();
      showPopupLoading("Enregistrement des modifications...");

      if (hasAller) {
        const transportAllerData = await getDocumentData(transportAllerId);
        await updateDocumentMany(
          transportAllerId,
          TRANSPORT_TEMPLATE_ID,
          STATUS_TRANSPORT_MODIFIEE,
          clearTransportData(transportAllerData),
        );
      }

      if (hasRetour) {
        const transportRetourData = await getDocumentData(transportRetourId);
        await updateDocumentMany(
          transportRetourId,
          TRANSPORT_TEMPLATE_ID,
          STATUS_TRANSPORT_MODIFIEE,
          clearTransportData(transportRetourData),
        );
      }

      await updateDocumentMany(
        demandeId,
        DEMANDE_TEMPLATE_ID,
        STATUS_DEMANDE_TRAITEMENT,
        {
          ...mergedDemandeData,
          Demande_StatutTransportAller: hasAller
            ? STATUS_TRANSPORT_MODIFIEE
            : mergedDemandeData?.Demande_StatutTransportAller || "",
          Demande_StatutTransportRetour: hasRetour
            ? STATUS_TRANSPORT_MODIFIEE
            : mergedDemandeData?.Demande_StatutTransportRetour || "",
          Demande_DateModification: new Date().toISOString(),
        },
      );

      hidePopupLoading();
      showSuccessBanner("Modifications enregistrées avec succès.");
      return {};
    }

    /* RÈGLE 72H */

    const isHorsDelai = computeHorsDelai(mergedDemandeData);

    let finalDemandeStatus = isHorsDelai //Si hors délai, statut final est attente, sinon traitement?
      ? STATUS_DEMANDE_ATTENTE
      : STATUS_DEMANDE_TRAITEMENT;

    console.log("finalDemandeStatus après règle 72h:", finalDemandeStatus);

    if (
      currentStatus === STATUS_DEMANDE_TRAITEMENT &&
      finalDemandeStatus === STATUS_DEMANDE_ATTENTE
    ) {
      console.log("Transition En traitement -> En attente d'approbation");

      const existingRaisonHorsDelai = String(
        mergedDemandeData?.Transport_RaisonHorsDelai || "",
      ).trim();

      if (existingRaisonHorsDelai) {
        console.log(
          "Transport_RaisonHorsDelai déjà rempli, popup ignoré:",
          existingRaisonHorsDelai,
        );

        mergedDemandeData.Transport_RaisonHorsDelai = existingRaisonHorsDelai;
      } else {
        hidePopupLoading();

        mergedDemandeData.Transport_RaisonHorsDelai =
          await askRaisonHorsDelai();

        showPopupLoading("Enregistrement des modifications...");
      }
    }

    let finalTransportAllerId = transportAllerId;
    let finalTransportRetourId = transportRetourId;

    const typeTransport = String(
      mergedDemandeData?.Transport_TypeTransport || "",
    ).trim();
    console.log("typeTransport:", typeTransport);

    if (finalDemandeStatus === STATUS_DEMANDE_TRAITEMENT) {
      if (!hasAller && typeTransport === "Aller") {
        console.log("Création transport Aller");
        const payloadAller = buildTransportPayload(mergedDemandeData, "Aller");
        const resAller = await createDocument(
          TRANSPORT_TEMPLATE_ID,
          payloadAller,
          STATUS_TRANSPORT_SOUMIS,
        );
        finalTransportAllerId = resAller.id;
      }

      if (!hasRetour && typeTransport === "Retour") {
        console.log("Création transport Retour");
        const payloadRetour = buildTransportPayload(
          mergedDemandeData,
          "Retour",
        );
        const resRetour = await createDocument(
          TRANSPORT_TEMPLATE_ID,
          payloadRetour,
          STATUS_TRANSPORT_SOUMIS,
        );
        finalTransportRetourId = resRetour.id;
      }

      if (!hasAller && !hasRetour && typeTransport === "Aller/Retour") {
        console.log("Création transport Aller/Retour");

        const payloadAller = buildTransportPayload(mergedDemandeData, "Aller");
        const resAller = await createDocument(
          TRANSPORT_TEMPLATE_ID,
          payloadAller,
          STATUS_TRANSPORT_SOUMIS,
        );
        finalTransportAllerId = resAller.id;

        const payloadRetour = buildTransportPayload(
          mergedDemandeData,
          "Retour",
        );
        const resRetour = await createDocument(
          TRANSPORT_TEMPLATE_ID,
          payloadRetour,
          STATUS_TRANSPORT_SOUMIS,
        );
        finalTransportRetourId = resRetour.id;
      }
    }

    const finalRealStatusTransportAller = finalTransportAllerId
      ? finalDemandeStatus === STATUS_DEMANDE_ATTENTE
        ? STATUS_TRANSPORT_SOUMIS
        : statutTransportAller || STATUS_TRANSPORT_SOUMIS
      : "";

    const finalRealStatusTransportRetour = finalTransportRetourId
      ? finalDemandeStatus === STATUS_DEMANDE_ATTENTE
        ? STATUS_TRANSPORT_SOUMIS
        : statutTransportRetour || STATUS_TRANSPORT_SOUMIS
      : "";

    console.log(
      "finalRealStatusTransportAller:",
      finalRealStatusTransportAller,
    );
    console.log(
      "finalRealStatusTransportRetour:",
      finalRealStatusTransportRetour,
    );

    await updateDocumentMany(
      demandeId,
      DEMANDE_TEMPLATE_ID,
      finalDemandeStatus,
      {
        ...mergedDemandeData,
        Demande_IDTransportAller: finalTransportAllerId,
        Demande_IDTransportRetour: finalTransportRetourId,
        Demande_StatutTransportAller: finalTransportAllerId
          ? finalRealStatusTransportAller
          : "",
        Demande_StatutTransportRetour: finalTransportRetourId
          ? finalRealStatusTransportRetour
          : "",
        Demande_DateModification: new Date().toISOString(),
      },
    );

    await syncTransportDocument(
      finalTransportAllerId,
      finalRealStatusTransportAller,
      {
        ...mergedDemandeData,
        FORMID: demandeId,
        NUMBER: mergedDemandeData?.NUMBER || "",
        Demande_IDTransportAller: finalTransportAllerId,
        Demande_IDTransportRetour: finalTransportRetourId,
      },
      "Aller",
    );

    await syncTransportDocument(
      finalTransportRetourId,
      finalRealStatusTransportRetour,
      {
        ...mergedDemandeData,
        FORMID: demandeId,
        NUMBER: mergedDemandeData?.NUMBER || "",
        Demande_IDTransportAller: finalTransportAllerId,
        Demande_IDTransportRetour: finalTransportRetourId,
      },
      "Retour",
    );

    hidePopupLoading();
    showSuccessBanner("Modifications enregistrées avec succès.");
  } catch (error) {
    hidePopupLoading();
    console.error("ERREUR GLOBALE:", error);
    showErrorBanner(error?.message || "Erreur lors de l'enregistrement.");
  }
})();

return {};
