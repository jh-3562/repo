console.log("Function 137", context);

const STATUS_PLANIFIEE = "Planifiée";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";
const TRANSPORT_TEMPLATE_ID = "7242b957-a155-462e-ba68-c80f46751676";

const safeStr = (v) => String(v ?? "").trim();

const showCustomPopup = (params) => {
  const { title, commentHTML, fields, buttons } = params;
  const fieldElements = {};
  const setValue = (targetKey, newValue, notify = false) => {
    const el = fieldElements[targetKey];
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = Boolean(newValue);
    } else {
      el.value = String(newValue);
    }
    if (notify) el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  function getValues() {
    const values = {};
    for (const el of Object.values(fieldElements)) {
      values[el.name] = el.type === "checkbox" ? el.checked : el.value;
    }
    return values;
  }
  function getField(params2) {
    const {
      key,
      name,
      type,
      options,
      style: style2,
      defaultValue,
      min,
      max,
      required,
      onChange,
    } = params2;
    const wrapper = document.createElement("div");
    wrapper.className = "popup-input";
    const fieldTitle = document.createElement("label");
    fieldTitle.innerHTML = required
      ? `${name || key} <span style="color: #FF0000">*</span>`
      : name || key;
    fieldTitle.htmlFor = key;
    let inputEl;
    switch (type.toLocaleLowerCase()) {
      case "select":
        inputEl = document.createElement("select");
        inputEl.name = key;
        if (style2) inputEl.style = style2;
        inputEl.id = key;
        (options || []).forEach(({ value, label: label2 }) => {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label2;
          inputEl.appendChild(opt);
        });
        wrapper.append(fieldTitle, inputEl);
        break;
      case "search": {
        const searchOptions = options || {};
        const debounce = (fn, delay = 300) => {
          let timer;
          return (value) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(value), delay);
          };
        };
        inputEl = document.createElement("input");
        inputEl.type = "search";
        inputEl.name = key;
        inputEl.id = key;
        if (style2) inputEl.style = style2;
        if (required) inputEl.required = true;
        if (defaultValue) inputEl.value = defaultValue;
        const listId = `${key}-list`;
        const dataList = document.createElement("datalist");
        dataList.id = listId;
        inputEl.setAttribute("list", listId);
        let suggestions = searchOptions.suggestions || [];
        suggestions.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item;
          dataList.appendChild(opt);
        });
        const dropdown = document.createElement("div");
        dropdown.className = "popup-search-dropdown";
        wrapper.classList.add("popup-search-wrapper");
        const updateDropdown = () => {
          dropdown.innerHTML = "";
          suggestions.forEach((item) => {
            const optionEl = document.createElement("div");
            optionEl.className = "popup-search-option";
            optionEl.textContent = item;
            optionEl.addEventListener("click", () => {
              inputEl.value = item;
              dropdown.classList.remove("visible");
              inputEl.dispatchEvent(new Event("change", { bubbles: true }));
            });
            dropdown.appendChild(optionEl);
          });
          dropdown.classList.add("visible");
        };
        const updateSuggestions = async (value) => {
          if (searchOptions.fetchSuggestions) {
            try {
              suggestions = await searchOptions.fetchSuggestions(value);
            } catch (e) {
              console.error("Erreur fetchSuggestions:", e);
              suggestions = [];
            }
          }
          updateDropdown();
        };
        const debouncedUpdate = debounce(
          updateSuggestions,
          searchOptions.debounce || 300,
        );
        inputEl.addEventListener("input", (event) => {
          debouncedUpdate(event.target.value);
        });
        inputEl.addEventListener("focus", () => {
          updateSuggestions(inputEl.value);
        });
        document.addEventListener("click", (event) => {
          if (!wrapper.contains(event.target)) {
            dropdown.classList.remove("visible");
          }
        });
        wrapper.append(fieldTitle, inputEl, dataList, dropdown);
        break;
      }
      case "checkbox":
        inputEl = document.createElement("input");
        inputEl.type = "checkbox";
        inputEl.name = key;
        if (style2) inputEl.style = style2;
        inputEl.id = key;
        wrapper.classList.add("popup-input-row");
        wrapper.append(inputEl, fieldTitle);
        break;
      case "number":
        inputEl = document.createElement("input");
        inputEl.type = "number";
        inputEl.name = key;
        if (style2) inputEl.style = style2;
        if (defaultValue !== void 0) inputEl.value = defaultValue;
        if (min !== void 0) inputEl.min = min;
        if (max !== void 0) inputEl.max = max;
        if (required) inputEl.required = true;
        inputEl.step = "1";
        inputEl.id = key;
        inputEl.addEventListener("input", () => {
          let cleaned = inputEl.value.replace(/[^\d]/g, "");
          if (cleaned === "") {
            inputEl.value = "";
            return;
          }
          let value = parseInt(cleaned, 10);
          const maxValue = Number(max);
          const minValue = Number(min);
          if (!isNaN(maxValue) && value > maxValue) {
            value = maxValue;
          } else if (!isNaN(minValue) && value < minValue) {
            value = minValue;
          }
          inputEl.value = value.toString();
        });
        wrapper.append(fieldTitle, inputEl);
        break;
      case "label":
        const label = document.createElement("span");
        label.innerHTML = name || "";
        if (style2) label.style = style2;
        wrapper.appendChild(label);
        break;
      case "date":
        inputEl = document.createElement("input");
        inputEl.type = "date";
        inputEl.name = key;
        if (style2) inputEl.style = style2;
        if (defaultValue) inputEl.value = defaultValue;
        if (required) inputEl.required = true;
        inputEl.id = key;
        wrapper.append(fieldTitle, inputEl);
        break;
      case "time":
        inputEl = document.createElement("input");
        inputEl.type = "time";
        inputEl.name = key;
        if (style2) inputEl.style = style2;
        if (defaultValue) inputEl.value = defaultValue;
        if (required) inputEl.required = true;
        inputEl.id = key;
        wrapper.append(fieldTitle, inputEl);
        break;
      default:
        inputEl = document.createElement("input");
        inputEl.type = type.toLowerCase();
        inputEl.name = key;
        if (style2) inputEl.style = style2;
        if (defaultValue) inputEl.value = defaultValue;
        if (required) inputEl.required = true;
        inputEl.id = key;
        wrapper.append(fieldTitle, inputEl);
        break;
    }
    if (!inputEl) return wrapper;
    fieldElements[key] = inputEl;
    if (onChange) {
      inputEl.addEventListener("change", () => {
        const value =
          inputEl.type === "checkbox" ? inputEl.checked : inputEl.value;
        onChange(getValues(), value, setValue);
      });
    }
    return wrapper;
  }
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  const popup = document.createElement("form");
  popup.id = "customPopup";
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

  .popup-input.invalid input,
.popup-input.invalid select {
  border: 1px solid #FF0000;
}

  .popup-search-wrapper {
    position: relative;
  }

  .popup-search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    z-index: 1000;
    max-height: 150px;
    overflow-y: auto;
    display: none;
  }

  .popup-search-dropdown.visible {
    display: block;
  }

  .popup-search-option {
    padding: 8px 10px;
    cursor: pointer;
    font-size: 1rem;
    color: #202127;
  }

  .popup-search-option:hover {
    background: #f5f5f6;
  }

  .popup-input input[type="search"]::-webkit-search-cancel-button {
    cursor: pointer;
  }

  .popup-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .popup-buttons button, .popup-buttons input[type='button'] {
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
  if (title) {
    const titleElem = document.createElement("h2");
    titleElem.textContent = title;
    titleElem.style.fontWeight = "bold";
    popup.appendChild(titleElem);
  }
  if (commentHTML) {
    const comment = document.createElement("div");
    comment.className = "popup-comment";
    comment.innerHTML = commentHTML;
    popup.appendChild(comment);
  }
  if (fields)
    for (const field of fields) {
      popup.appendChild(getField(field));
    }
  const buttonRow = document.createElement("div");
  buttonRow.className = "popup-buttons";
  if (buttons) {
    for (const button of buttons) {
      const btn = document.createElement("button");
      btn.textContent = button.name;
      switch (button.preset) {
        case "action":
          btn.style.backgroundColor = "#3182ce";
          btn.style.color = "#f2f7fb";
          break;
        case "cancel":
          btn.style.backgroundColor = "#f5f5f6";
          btn.style.color = "#2c2d32";
          break;
        default:
          btn.style.backgroundColor = "#3182ce";
          btn.style.color = "#f2f7fb";
          break;
      }
      if (button.backgroundColor)
        btn.style.backgroundColor = button.backgroundColor;
      if (button.color) btn.style.color = button.color;
      btn.onclick = () => {
        const form = document.getElementById("customPopup");
        if (button.key != "cancel" && !form.reportValidity()) {
          const fields2 = form.querySelectorAll(
            ".popup-input input, .popup-input select",
          );
          fields2.forEach((el) => {
            if (el.hasAttribute("required"))
              el.parentElement.classList.add("invalid");
          });
          return;
        }
        button.onClick(getValues());
        document.body.removeChild(overlay);
      };
      buttonRow.appendChild(btn);
    }
  }
  popup.appendChild(buttonRow);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};

async function function137(values) {
  const transporteur = safeStr(values["Répartition_Transporteur"]);
  const transportId = safeStr(docData.FORMID);
  const demandeId = safeStr(docData.SystemeCache_IDDemandeAssocie);
  const typeTransport = safeStr(docData.SystemeCache_TypeTransport);

  if (!transporteur) {
    return showErrorBanner("Répartition_Transporteur is required.");
  }

  try {
    showPopupLoading("Planning transport...");

    // 1. Update transport (set status to Planifiée)
    await api({ local: true }).put("document", {
      document: {
        documentID: transportId,
        data: JSON.stringify({
          Répartition_Transporteur: transporteur,
        }),
        status: STATUS_PLANIFIEE,
        active: true,
        template: { templateId: TRANSPORT_TEMPLATE_ID },
      },
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
      demandeData.SystemeCache_StatutTransportAller = STATUS_PLANIFIEE;
    }

    if (typeTransport === "Retour") {
      demandeData.SystemeCache_StatutTransportRetour = STATUS_PLANIFIEE;
    }

    // 4. Save demande with same status
    await api({ local: true }).put("document", {
      document: {
        documentID: demandeId,
        data: JSON.stringify(demandeData),
        status: demandeDoc.status,
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID },
      },
    });

    hidePopupLoading();
    showSuccessBanner("Transport planifié avec succès .");
    setTimeout(() => {
      window.location.href =
        "/repartition";
    }, 1000);
  } catch (e) {
    hidePopupLoading();
    showErrorBanner("Erreur lors de la planification.");
  }
}

showCustomPopup({
  title: "Planifier le transport",
  fields: [
    {
      key: "Répartition_Transporteur",
      name: "Sélectionner le transporteur",
      type: "search",
      options: {
        debounce: 300,
        fetchSuggestions: async (value) => {
          const searchValue = safeStr(value);

          const filters = [
            {
              key: "FORMLAYOUTNAME",
              operator: "EQUALS",
              value: "Transporteur",
              type: "TEXT",
            },
            ...(searchValue
              ? [
                  {
                    key: "NomTransporteur",
                    operator: "CONTAINS",
                    value: searchValue,
                    type: "TEXT",
                  },
                ]
              : []),
            {
              key: "STATUS",
              operator: "EQUALS",
              value: "Actif",
              type: "TEXT",
            },
          ];

          const idsResponse = await api({ local: true }).post(
            "document/id/filter",
            { filters },
          );
          const ids = idsResponse?.data?.ids || [];
          if (!ids.length) return [];

          const documentsResponse = await api({ local: true }).post(
            "document/id",
            { ids },
          );
          const documents = documentsResponse?.data?.documents || [];
          const names = documents.map((document) => {
            const data =
              typeof document?.data === "string"
                ? JSON.parse(document.data)
                : document?.data || {};
            return safeStr(data.NomTransporteur);
          });

          return [...new Set(names.filter(Boolean))];
        },
      },
      defaultValue: safeStr(docData["Répartition_Transporteur"]),
      required: true,
    },
  ],
  buttons: [
    {
      name: "Annuler",
      preset: "cancel",
      onClick: () => {},
    },
    {
      name: "Confirmer",
      preset: "action",
      onClick: (values) => function137(values),
    },
  ],
});

