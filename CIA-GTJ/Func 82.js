console.log("function 82", context);

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

      case "date":
        input = document.createElement("input");
        input.type = "date";
        input.name = key;
        input.id = key;

        if (style) input.style = style;
        if (defaultValue) input.value = defaultValue; // format: YYYY-MM-DD
        if (required) input.required = true;
        if (min) input.min = min;
        if (max) input.max = max;

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
          if (el.type === "checkbox") {
            values[el.name] = el.checked;
            continue;
          }

          values[el.name] = el.value;
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

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const updateDocuments = async (documentsToUpdate) => {
  try {
    const response = await api({ local: true }).put("document/Many", {
      documents: documentsToUpdate,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to update documents:", error);
    return [];
  }
};

function replaceLastSegment(url, id) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);

  parts[parts.length - 1] = id;

  u.pathname = "/" + parts.join("/");
  return u.toString();
}

const sendEmail = async (
  email,
  subjectLine,
  messageHTML = "",
  messageText = "",
) => {
  try {
    const res = await fetch(N8N_SENDEMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        subjectLine: subjectLine,
        messageHTML: messageHTML,
        messageText: messageText,
      }),
    });
    return res;
  } catch (e) {
    console.log("Error :", e);
  }
};

const main = async () => {
  console.log(store.pageStore.filterData.Demande_DateHeureDebut);
  const popup = await new Promise((resolve) => {
    showCustomPopup({
      title: "Refuser les transports",
      commentHTML: `Sélectionner la date des transports à refuser:`,
      fields: [
        {
          key: "dateSimple",
          name: "Date",
          type: "date",
          required: true,
          defaultValue: (
            store.pageStore.filterData.Demande_DateHeureDebut ||
            store.pageStore.filterData.DemandeAllerD_Date
          )?.split("|")[0],
        },
      ],
      buttons: [
        {
          key: "cancel",
          name: "Annuler",
          preset: "cancel",
          onClick: () => resolve(false),
        },
        {
          key: "ok",
          name: "Refuser les transports",
          preset: "action",
          onClick: (values) => resolve(values),
        },
      ],
    });
  });
  if (!popup) return;

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Demande",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Soumis",
      type: "TEXT",
    },
    {
      key: "Transport_TransportSecuritaire",
      operator: "EQUALS",
      value: "true",
      type: "TEXT",
    },
    {
      key: "Demande_DateHeureDebut",
      operator: "CONTAINS",
      value: popup.dateSimple,
      type: "TEXT",
    },
  ];

  const res = await getDocumentIDsByFilters(apiFilters);
  //console.log("res", res);

  if (res.length === 0) {
    showErrorBanner("Aucun transport à confirmer pour la date choisie.");
    return;
  }

  const docs = await getDocumentsByIDs(res);
  console.log("docs", docs);

  const documentToUpdate = [];

  docs.forEach((doc) => {
    documentToUpdate.push({
      status: "Refusé",
      active: true,
      template: { templateId: doc.template.templateId },
      documentID: doc.documentID,
    });

    doc.data = JSON.parse(doc.data);
  });

  await updateDocuments(documentToUpdate);
  await docs.forEach(async (doc) => {
    const email =
      doc.data.Demande_IdentificationIdentificationCourrielIntervenant;

    const url = replaceLastSegment(window.location.href, doc.documentID);

    const htmlMessage = `
        <p>Bonjour ${doc.data.Demande_IdentificationIdentificationPrénomIntervenant} ${doc.data.Demande_IdentificationIdentificationNomIntervenant},</p>

        <p>
          Votre demande
          <a href="${url}" target="_blank">#${doc.number}</a>
          a été refusée.
        </p>

        <p>Merci,</p>

        <p>L'équipe de transport de l'Abitibi-Témiscamingue</p>
      `;

    const res = await sendEmail(
      email,
      `Mise à jour concernant la demande #${doc.number}`,
      htmlMessage,
    );
    console.log("Webhook response: ", res);
  });

  showSuccessBanner(`Mise à jour de ${res.length} demande(s) de transports.`);
};

main();
