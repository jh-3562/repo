console.log("Function 281", context);

/******************* POPUP BASE  *************/
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

/***************** ERROR POPUP */
const showPopupErreur = (titleInput, message) => {
  new Promise((resolve) => {
    showCustomPopup({
      title: titleInput,
      commentHTML: message,
      buttons: [
        {
          name: "Retour",
          backgroundColor: "#b2f2bb",
          color: "#1e1e1e",
          onClick: () => resolve(false),
        },
      ],
    });
  });
};

const showPopupConfirmation = (titleInput, message) => {
  return new Promise((resolve) => {
    showCustomPopup({
      title: titleInput,
      commentHTML: message,
      buttons: [
        {
          name: "Non",
          backgroundColor: "#ffc9c9",
          color: "#1e1e1e",
          onClick: () => {
            console.log("Action annulée");
            resolve(false);
          },
        },
        {
          name: "Oui",
          backgroundColor: "#b2f2bb",
          color: "#1e1e1e",
          onClick: () => {
            resolve(true);
          },
        },
      ],
    });
  });
};

/******************* */
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// sync functions
const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((key) => {
      let newKey = `${key}|${index + 1}`;
      result[newKey] = obj[key];
    });
  });
  result[key] = itemCount.toString();
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});

const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(excludeKeys(data, ["FORMID", "NUMBER"]));
};

const createNewForm = async (newData) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: formatDataAPI(newData),
        status: "Draft",
        active: true,
        template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" },
      },
    });
    console.log("Réponse de l'API :", response);
    return response;
  } catch (error) {
    console.warn("Erreur lors de la création du formulaire ", error);
  }
};
const main = async () => {
  const confirmed = await showPopupConfirmation(
    "Confirmation",
    "Êtes-vous sûr de vouloir continuer ?",
  );

  // si NON → on stop tout
  if (!confirmed) {
    console.log("Annulé");
    return;
  }

  console.log("OLD DATA ", docData);
  const newData = { ...docData };
  const keysToReset = {
    AnnulationDemandéPar: "",
    IdentifiantFormulaireRécurrence: "",
    IdentifiantFacture: "",
    isOccurence: "false",
    MarkdownRécurrenceDispo: "",
    Planification_Date: "",
    Planification_Répéter: "",
    Planification_DateFin: "",
    Planification_MultiDate: "",
  };
  Object.entries(keysToReset).forEach(([key, value]) => {
    newData[key] = value;
  });
  console.log("NEW DATA 2", newData);
  console.log(formatDataAPI(newData));
  const create = await createNewForm(newData);
  console.log("CREATE ", create);
  const id = create.data.id;

  const activeMCR = location.pathname.split("/")[1];
  // 🚀 redirection
  window.location.href = `/${activeMCR}/transports/${id}`;
};
main();
