console.log("Function 65", context);

const showCustomPopup = ({ title, commentHTML, fields, buttons }) => {
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
        if (defaultValue) input.value = defaultValue;
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
        wrapper.append(label, input);
        break;
    }

    return wrapper;
  }

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
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
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
        }
        to {
        opacity: 1;
        transform: scale(1);
        }
    }

    .popup-box h2 {
        margin: 0 0 20px;
        font-size: 1.25rem;
        color: #202127;
    }

    .popup-comment {
        margin-bottom: 20px;
        color: #202127;
        font-size: 1rem;
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
        color: #202127;
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
        padding: 6px 30px;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.875rem;
    }
    `;

  popup.appendChild(style);

  if (title) {
    const titleElem = document.createElement("h2");
    titleElem.textContent = title;
    popup.appendChild(titleElem);
  }

  if (commentHTML) {
    const comment = document.createElement("div");
    comment.className = "popup-comment";
    comment.innerHTML = commentHTML;
    popup.appendChild(comment);
  }

  if (fields) {
    for (const field of fields) {
      popup.appendChild(getInput(field));
    }
  }

  const buttonRow = document.createElement("div");
  buttonRow.className = "popup-buttons";

  if (buttons) {
    for (const { name, onClick, backgroundColor, color, preset } of buttons) {
      const btn = document.createElement("button");
      btn.textContent = name;

      if (preset === "action") {
        btn.style.backgroundColor = "#1C5420";
        btn.style.color = "white";
      } else if (preset === "cancel") {
        btn.style.backgroundColor = "#f1f1f1";
        btn.style.color = "#2c2d32";
      }

      if (backgroundColor) btn.style.backgroundColor = backgroundColor;
      if (color) btn.style.color = color;

      btn.onclick = () => {
        const values = {};
        const inputs = popup.querySelectorAll("input, select");
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

const showConfirmationPopup = () => {
  return new Promise((resolve) => {
    showCustomPopup({
      title: "Voulez-vous vraiment désassigner le transporteur?",
      fields: [],
      buttons: [
        {
          name: "Retour",
          preset: "cancel",
          onClick: () => resolve(false),
        },
        {
          name: "Désassigner",
          preset: "action",
          onClick: () => resolve(true),
        },
      ],
    });
  });
};

const updatedDocData = {
  ...docData,
  Operation_NomDuTransporteur: "",
  Transporteur_NomPrenom: "",
};

const documentToUpdate = {
  data: JSON.stringify(updatedDocData),
  status: "Soumis",
  active: true,
  template: { templateId: "017d9a14-b828-4cc5-8a9a-8906c1fcab59" }, //FORM LAYOUT ID
  documentID: store.pageContentStore.active[0], // PageContentStore active document ID
};

const updateDocument = async (documentToUpdate) => {
  try {
    // Fetch fresh document to ensure we have all required fields
    const documentID = documentToUpdate.documentID;
    const freshDoc = await api({ local: true }).get(`document/${documentID}`);

    if (freshDoc?.data?.document) {
      const fullData = JSON.parse(freshDoc.data.document.data || "{}");
      documentToUpdate.data = JSON.stringify({
        ...fullData,
        Operation_NomDuTransporteur: "",
        Transporteur_NomPrenom: "",
      });
      if (!documentToUpdate.status) {
        documentToUpdate.status = freshDoc.data.document.status;
      }
    }

    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
    });

    if (response?.status === 204 || response?.status === 200) {
      showSuccessBanner("Document modifié avec succès.");
    }

    return response?.data?.document || null;
  } catch (error) {
    console.error("Failed to update document:", error);
    showErrorBanner("Erreur lors de la mise à jour du document.");
    return null;
  }
};

const main = async () => {
  const isConfirmed = await showConfirmationPopup();

  if (!isConfirmed) {
    showErrorBanner("Désassignation annulée.");
    return;
  }

  const res = await updateDocument(documentToUpdate);

  console.log("Document update result:", res);
};

main();
