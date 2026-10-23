console.log("Fonction 190", context);

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
        // Pas de datalist ni d'autocomplétion du navigateur : seule la liste de la fenêtre doit s'afficher
        inputEl.setAttribute("autocomplete", "off");
        let suggestions = searchOptions.suggestions || [];
        const dropdown = document.createElement("div");
        dropdown.className = "popup-search-dropdown";
        wrapper.classList.add("popup-search-wrapper");
        const updateDropdown = () => {
          dropdown.innerHTML = "";
          suggestions.forEach((item) => {
            const optionEl = document.createElement("div");
            optionEl.className = "popup-search-option";
            // Une suggestion peut être un texte ou un objet { title, fields } comme les recherches natives de l'application
            const itemTitle = typeof item === "object" ? item.title : item;
            const titleEl = document.createElement("div");
            titleEl.className = "popup-search-option-title";
            titleEl.textContent = itemTitle;
            optionEl.appendChild(titleEl);
            (typeof item === "object" ? item.fields || [] : []).forEach(
              (field) => {
                const fieldEl = document.createElement("div");
                fieldEl.className = "popup-search-option-field";
                const fieldName = document.createElement("span");
                fieldName.className = "popup-search-option-field-name";
                fieldName.textContent = `${field.name} - `;
                const fieldValue = document.createElement("span");
                fieldValue.textContent = field.value;
                fieldEl.append(fieldName, fieldValue);
                optionEl.appendChild(fieldEl);
              },
            );
            optionEl.addEventListener("click", () => {
              inputEl.value = itemTitle;
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
        wrapper.append(fieldTitle, inputEl, dropdown);
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
    background: var(--chakra-colors-white, #ffffff);
    border: 1px solid var(--chakra-colors-gray-200, #e0e0e1);
    border-radius: var(--chakra-radii-md, 6px);
    padding: var(--chakra-space-1-5, 6px);
    box-sizing: border-box;
    z-index: 1000;
    max-height: 21rem;
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

  .popup-search-option:not(:last-child) {
    border-bottom: 1px solid #e5e5e5;
  }

  .popup-search-option:hover {
    background: #e6f4e4;
  }

  /* Valeurs relevées sur les suggestions natives (Chakra) du popup « Modifier » de la répartition */
  .popup-search-option-title {
    font-size: 14px;
    font-weight: 700;
    line-height: 16.8px;
    color: #202127;
  }

  .popup-search-option-field,
  .popup-search-option-field span {
    font-size: var(--chakra-fontSizes-sm, 14px);
    font-weight: 400;
    line-height: 1.1rem;
    color: #202127;
  }

  .popup-search-option-field-name {
    opacity: 0.5;
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

// Helpers pour normalizer le data
const dataCollection = (key, array) => {
  const result = {};

  (array || []).forEach((obj, index) => {
    Object.keys(obj || {}).forEach((currentKey) => {
      result[`${currentKey}|${index + 1}`] = obj[currentKey];
    });
  });

  result[key] = String(array?.length || 0);
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }

    return result;
  }, {});

const formatDataAPI = (data) => {
  let normalizedData = { ...(data || {}) };

  Object.keys(normalizedData).forEach((key) => {
    if (Array.isArray(normalizedData[key])) {
      normalizedData = {
        ...normalizedData,
        ...dataCollection(key, normalizedData[key]),
      };
    }
  });

  return JSON.stringify(excludeKeys(normalizedData, ["FORMID", "NUMBER"]));
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
      preventNotify: "DOCUMENT",
    });

    if (response?.status === 204) return true;

    return response?.data?.document || null;
  } catch (error) {
    return null;
  }
};

const getTransporteurSuggestions = async (searchValue) => {
  const trimmedValue = String(searchValue ?? "").trim();

  // Comme la fonction 137 : sans texte saisi, on propose tous les transporteurs actifs
  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Transporteur",
      type: "TEXT",
    },
    ...(trimmedValue
      ? [
          {
            key: "NomTransporteur",
            operator: "CONTAINS",
            value: trimmedValue,
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

  try {
    const idsResponse = await api({ local: true }).post("document/id/filter", {
      filters,
    });
    const ids = idsResponse?.data?.ids || [];
    if (!ids.length) return [];

    const documentsResponse = await api({ local: true }).post("document/id", {
      ids,
    });

    return (documentsResponse?.data?.documents || []).flatMap((document) => {
      try {
        const data = JSON.parse(document.data);
        const nomTransporteur = String(data.NomTransporteur || "").trim();
        if (!nomTransporteur) return [];

        return [
          {
            title: nomTransporteur,
            fields: [
              { name: "Transporteur", value: nomTransporteur },
              { name: "Nom du transporteur", value: nomTransporteur },
            ],
          },
        ];
      } catch (error) {
        console.error("Erreur lors de la lecture d'un transporteur :", error);
        return [];
      }
    });
  } catch (error) {
    console.error("Erreur lors de la recherche des transporteurs :", error);
    return [];
  }
};

// Tarifs du transporteur ajoutés à la facturation lors de la planification
const TARIF_COLLECTION_FIELD = "Facturation_TarifCollec";
const TARIF_NAME_FIELD = "Facturation_TarifCollec|1|Nom";
const TARIF_TYPE_FIELD = "Facturation_TarifCollec|2|Type";
const TARIF_UNIT_PRICE_FIELD = "Facturation_TarifCollec|3|PrixUnitaire";
const TARIF_QUANTITY_FIELD = "Facturation_TarifCollec|4|Quantite";
const TARIF_LINE_TOTAL_FIELD = "Facturation_TarifCollec|5|PrixTotal";
const TARIF_TRANSPORTEUR_FIELD = "Tarif_Transporteur";
const TARIF_START_DATE_FIELD = "Tarif_DateDebut";
const TARIF_END_DATE_FIELD = "Tarif_DateFin";
const DEFAULT_TARIF_QUANTITY = 1;

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

const toNumber = (value) => parseFloat(value) || 0;

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getTransporteurTarifs = async (transporteur) => {
  // Les champs de date de la demande ne sont pas encore définis : on valide le tarif à la date de planification
  const today = getTodayDate();

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "TARIFS",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Actif",
      type: "TEXT",
    },
    {
      key: TARIF_TRANSPORTEUR_FIELD,
      operator: "EQUALS",
      value: transporteur,
      type: "TEXT",
    },
    {
      key: TARIF_START_DATE_FIELD,
      operator: "BETWEEN",
      value: `1900-01-01|${today}`,
      type: "DATE",
    },
    {
      key: TARIF_END_DATE_FIELD,
      operator: "BETWEEN",
      value: `${today}|2100-01-01`,
      type: "DATE",
    },
  ];

  const idsResponse = await api({ local: true }).post("document/id/filter", {
    filters,
  });
  const ids = Object.values(idsResponse?.data?.ids || []);
  if (ids.length === 0) return [];

  const documentsResponse = await api({ local: true }).post("document/id", {
    ids,
  });
  const documents = Object.values(documentsResponse?.data?.documents || {});

  return documents.flatMap((document) => {
    try {
      return [JSON.parse(document.data || "{}")];
    } catch (error) {
      console.error("Erreur lors de la lecture d'un tarif :", error);
      return [];
    }
  });
};

const toTarifLine = (tarifData) => {
  const unitPrice = toNumber(tarifData.Tarif_Montant);
  // Sans les champs de la demande (distance, jours), on applique la quantité par défaut de la fonction 1201
  const quantity = DEFAULT_TARIF_QUANTITY;

  return {
    [TARIF_NAME_FIELD]: tarifData.Tarif_Nom || "",
    [TARIF_TYPE_FIELD]: tarifData.Tarif_TypeTarif || "",
    [TARIF_UNIT_PRICE_FIELD]: unitPrice.toFixed(2),
    [TARIF_QUANTITY_FIELD]: quantity.toFixed(2),
    [TARIF_LINE_TOTAL_FIELD]: (unitPrice * quantity).toFixed(2),
  };
};

const calculateBillingTotals = (tarifLines) => {
  const subtotal = tarifLines.reduce(
    (sum, line) => sum + toNumber(line?.[TARIF_LINE_TOTAL_FIELD]),
    0,
  );
  const tps = subtotal * TPS_RATE;
  const tvq = subtotal * TVQ_RATE;

  return {
    Facturation_PrixAvantTaxe: subtotal.toFixed(2),
    Facturation_TPS: tps.toFixed(2),
    Facturation_TVQ: tvq.toFixed(2),
    Facturation_PrixTotal: (subtotal + tps + tvq).toFixed(2),
  };
};

const buildBillingData = async (transporteur) => {
  if (!transporteur) return {};

  const tarifs = await getTransporteurTarifs(transporteur);
  const tarifLines = [
    ...(docData?.[TARIF_COLLECTION_FIELD] || []),
    ...tarifs.map(toTarifLine),
  ];

  return {
    Facturation_Transporteur: transporteur,
    [TARIF_COLLECTION_FIELD]: tarifLines,
    ...calculateBillingTotals(tarifLines),
  };
};

const submitStatusSoumise = async (transporteurSaisi) => {
  try {
    const selectedTransporteur =
      transporteurSaisi ||
      store?.pageContentStore?.processData?.[0]?.edits
        ?.Répartition_Transporteur;

    const billingData = await buildBillingData(selectedTransporteur);

    const dataToSend = {
      ...docData,
      ...(selectedTransporteur
        ? {
            Répartition_Transporteur: selectedTransporteur,
            NomTransporteurSearch: selectedTransporteur,
          }
        : {}),
      ...billingData,
    };
    const formattedData = formatDataAPI(dataToSend);

    const documentToUpdate = {
      data: formattedData,
      status: "Planifiée",
      active: true,
      template: { templateId: "dadaf75a-cd49-4cba-8060-2ac15155478f" },
      documentID: docData.FORMID,
    };

    const updated = await updateDocument(documentToUpdate);

    if (updated) {
      // Reload current URL to stay on same page
      window.location.reload();
    } else {
      showErrorBanner("Erreur lors de la mise à jour du document");
    }
  } catch (e) {
    showErrorBanner("Erreur lors de la mise à jour du document");
  }
};
const main = async () => {
  showCustomPopup({
    title: "Planifier le transport",
    fields: [
      {
        key: "NomTransporteurSearch",
        name: "Sélectionner le transporteur",
        type: "search",
        required: true,
        defaultValue: docData?.NomTransporteurSearch || "",
        options: {
          debounce: 300,
          fetchSuggestions: await getTransporteurSuggestions,
        },
      },
    ],
    buttons: [
      {
        name: "Annuler",
        key: "cancel",
        preset: "cancel",
        onClick: () => {},
      },
      {
        name: "Confirmer",
        key: "select",
        preset: "action",
        onClick: (values) => submitStatusSoumise(values.NomTransporteurSearch),
      },
    ],
  });
};

main();
