console.log("Function 141 ", context);

const STATUS_EN_ROUTE = "En route";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const safeStr = (v) => String(v ?? "").trim();
const digitsOnly10 = (s) => safeStr(s).replace(/\D/g, "").slice(0, 10);

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
    label.textContent = name || key;
    label.htmlFor = key;

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

      case "tel":
        input = document.createElement("input");
        input.type = "tel";
        input.inputMode = "numeric";
        input.name = key;
        if (style) input.style = style;
        if (defaultValue !== undefined)
          input.value = formatPhoneInput(defaultValue);
        input.id = key;
        input.addEventListener("input", () => {
          input.value = formatPhoneInput(input.value);
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

const formatPhone = (digits10) => {
  const d = digitsOnly10(digits10);
  if (d.length !== 10) return "";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const formatPhoneInput = (value) => {
  const d = digitsOnly10(value);
  if (!d) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
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

const getDoc = async (id) => {
  const r = await api({ local: true }).get(`document/${id}`);
  return r?.data?.document || r?.data;
};

const getTemplateId = (doc) =>
  doc?.template?.templateId ||
  doc?.templateId ||
  doc?.FormLayoutID ||
  doc?.formLayoutId;

async function main(values) {
  console.log("Popup values:", values);

  const chauffeur = safeStr(values["Répartition_NomChauffeur"]);
  const telDigits = digitsOnly10(values["Répartition_NumeroTelephone"]);
  const telFormatted = formatPhone(telDigits);

  const transportId = safeStr(docData?.FORMID);
  const demandeId = safeStr(docData?.SystemeCache_IDDemandeAssocie);
  const typeTransport = safeStr(docData?.SystemeCache_TypeTransport);

  console.log({
    transportId,
    demandeId,
    typeTransport,
    chauffeur,
    telDigits,
    telFormatted,
  });

  if (!chauffeur)
    return showErrorBanner("Répartition_NomChauffeur est obligatoire.");
  if (telDigits.length !== 10)
    return showErrorBanner(
      "Le téléphone doit contenir exactement 10 chiffres.",
    );
  if (!telFormatted) return showErrorBanner("Téléphone invalide.");
  if (!transportId || !demandeId)
    return showErrorBanner("Transport ou demande associée manquante.");

  try {
    showPopupLoading("Mise à jour en cours...");

    // ===== 0) GET TRANSPORT (vrai templateId + status actuel) =====
    const tBefore = await getDoc(transportId);
    if (!tBefore) throw new Error("Impossible de récupérer le transport.");

    const transportTemplateId = getTemplateId(tBefore);
    const statusBefore = safeStr(tBefore?.status);

    console.log("transportTemplateId =", transportTemplateId);
    console.log("transportStatusBefore =", statusBefore);

    if (!transportTemplateId)
      throw new Error("TemplateId du transport introuvable.");

    // ===== 1) PUT TRANSPORT =====
    console.log("PUT transport start");
    await api({ local: true }).put("document", {
      document: {
        documentID: transportId,
        data: JSON.stringify({
          Répartition_NomChauffeur: chauffeur,
          Répartition_NumeroTelephone: telFormatted,
        }),
        status: STATUS_EN_ROUTE,
        active: true,
        template: { templateId: transportTemplateId },
      },
      preventNotify: "FULL",
    });

    // ===== 1b) VERIFY TRANSPORT STATUS =====
    const tAfter = await getDoc(transportId);
    const statusAfter = safeStr(tAfter?.status);

    console.log("transportStatusAfter =", statusAfter);

    if (statusAfter !== safeStr(STATUS_EN_ROUTE)) {
      // 👉 c'est ici que ton bug est confirmé: valeur de status invalide
      throw new Error(
        `Statut REFUSÉ/IGNORÉ. Envoyé="${STATUS_EN_ROUTE}" mais reçu="${statusAfter}". ` +
          `=> "En route" n'est pas la bonne valeur de statut pour ce template.`,
      );
    }

    // ===== 2) GET DEMANDE =====
    console.log("GET demande start");
    const demandeDoc = await getDoc(demandeId);
    if (!demandeDoc) throw new Error("Impossible de récupérer la demande.");

    const demandeData = safeParse(demandeDoc.data);

    // ===== 3) UPDATE DEMANDE FIELD =====
    if (typeTransport === "Aller") {
      demandeData.SystemeCache_StatutTransportAller = STATUS_EN_ROUTE;
    } else if (typeTransport === "Retour") {
      demandeData.SystemeCache_StatutTransportRetour = STATUS_EN_ROUTE;
    } else {
      console.log("typeTransport unexpected:", typeTransport);
    }

    // ===== 4) PUT DEMANDE =====
    console.log("PUT demande start");
    await api({ local: true }).put("document", {
      document: {
        documentID: demandeId,
        data: JSON.stringify(demandeData),
        status: demandeDoc.status,
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID },
      },
      preventNotify: "FULL",
    });

    hidePopupLoading();
    showSuccessBanner("Mise à jour effectuée.");

    setTimeout(() => {
      window.location.replace(
        "/repartition",
      );
    }, 800);
  } catch (e) {
    hidePopupLoading();
    console.log("ERROR:", e);
    console.log("ERROR.response.status:", e?.response?.status);
    console.log("ERROR.response.data:", e?.response?.data);
    showErrorBanner(e?.message || "Erreur lors de la mise à jour.");
  }
}

showCustomPopup({
  title: "Mettre le transport en route",
  commentHTML: "Saisis le chauffeur et le téléphone, puis confirme.",
  fields: [
    {
      key: "Répartition_NomChauffeur",
      name: "Nom du chauffeur",
      type: "text",
      defaultValue: safeStr(docData?.["Répartition_NomChauffeur"]),
    },
    {
      key: "Répartition_NumeroTelephone",
      name: "Numéro de téléphone",
      type: "tel",
      defaultValue: formatPhone(docData?.["Répartition_NumeroTelephone"]),
    },
  ],
  buttons: [
    { name: "Annuler", preset: "cancel", onClick: () => {} },
    {
      name: "Confirmer",
      preset: "action",
      onClick: async (values) => {
        await main(values);
      },
    },
  ],
});

