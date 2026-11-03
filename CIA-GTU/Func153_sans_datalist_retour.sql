-- CIA-GTU : retour en arrière de Func153_sans_datalist.sql
BEGIN;

UPDATE "Function" SET "Data" = $code$console.log("Function 153", context);

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
      case "search":
        function debounce(fn, delay = 300) {
          let timer;
          return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
          };
        }

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

        let suggestions = (options && options.suggestions) || [];

        suggestions.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item;
          dataList.appendChild(opt);
        });

        const dropdown = document.createElement("div");
        dropdown.className = "popup-search-dropdown";

        wrapper.classList.add("popup-search-wrapper");

        const updateDropdown = (value) => {
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

        const debouncedUpdate = debounce(async (value) => {
          if (options?.fetchSuggestions) {
            try {
              suggestions = await options.fetchSuggestions(value);
            } catch (e) {
              console.error("Erreur fetchSuggestions:", e);
              suggestions = [];
            }
          }

          updateDropdown(value);
        }, options?.debounce || 300);

        inputEl.addEventListener("input", (e) => {
          debouncedUpdate(e.target.value);
        });

        inputEl.addEventListener("focus", () => {
          updateDropdown(inputEl.value);
        });

        document.addEventListener("click", (e) => {
          if (!wrapper.contains(e.target)) {
            dropdown.classList.remove("visible");
          }
        });

        wrapper.append(fieldTitle, inputEl, dataList, dropdown);
        break;
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
      // type "button" : sinon le clic soumet le formulaire et recharge la page pendant l'attente
      btn.type = "button";
      btn.onclick = async () => {
        const form = document.getElementById("customPopup");
        if (button.preset != "cancel" && !form.reportValidity()) {
          const fields2 = form.querySelectorAll(
            ".popup-input input, .popup-input select",
          );
          fields2.forEach((el) => {
            if (el.hasAttribute("required"))
              el.parentElement.classList.add("invalid");
          });
          return;
        }
        const keepOpen = (await button.onClick(getValues())) === false;
        if (keepOpen) {
          Object.values(fieldElements)
            .filter((el) => el.required)
            .forEach((el) => el.parentElement.classList.add("invalid"));
          return;
        }
        document.body.removeChild(overlay);
      };
      buttonRow.appendChild(btn);
    }
  }
  popup.appendChild(buttonRow);
  popup.addEventListener("submit", (e) => e.preventDefault());
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};

const getTransporteurSuggestions = async (searchValue) => {
  if (!searchValue || searchValue.trim().length < 2) return [];

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Transporteur",
      type: "TEXT",
    },
    {
      key: "NomTransporteur",
      operator: "CONTAINS",
      value: searchValue.trim(),
      type: "TEXT",
    },
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
        return nomTransporteur ? [nomTransporteur] : [];
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

const STATUS_A_PLANIFIER = "Planifiée";
const DEMANDE_TEMPLATE_ID = "dadaf75a-cd49-4cba-8060-2ac15155478f";

const safeStr = (v) => String(v ?? "").trim();

// Tarifs du transporteur ajoutés à la facturation de la demande lors de la planification (même logique que les fonctions 137 et 190)
const TARIF_COLLECTION_FIELD = "Facturation_TarifCollec";
const TARIF_NAME_FIELD = "Facturation_TarifCollec|1|Nom";
const TARIF_TYPE_FIELD = "Facturation_TarifCollec|2|Type";
const TARIF_UNIT_PRICE_FIELD = "Facturation_TarifCollec|3|PrixUnitaire";
const TARIF_QUANTITY_FIELD = "Facturation_TarifCollec|4|Quantite";
const TARIF_LINE_TOTAL_FIELD = "Facturation_TarifCollec|5|PrixTotal";
const TARIF_LINE_FIELDS = [
  TARIF_NAME_FIELD,
  TARIF_TYPE_FIELD,
  TARIF_UNIT_PRICE_FIELD,
  TARIF_QUANTITY_FIELD,
  TARIF_LINE_TOTAL_FIELD,
];
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

const getDemandeData = async (demandeId) => {
  const response = await api({ local: true }).get(`document/${demandeId}`);
  const demandeDoc = response?.data?.document || response?.data;

  return typeof demandeDoc?.data === "string"
    ? JSON.parse(demandeDoc.data)
    : demandeDoc?.data || {};
};

// La demande lue par l'API garde sa collection à plat : « Facturation_TarifCollec » = nombre de lignes, « …|1|Nom|1 » = valeurs
const readExistingTarifLines = (demandeData) => {
  const collection = demandeData?.[TARIF_COLLECTION_FIELD];
  if (Array.isArray(collection)) return collection;

  const lineCount = parseInt(collection, 10) || 0;

  return Array.from({ length: lineCount }, (_, index) =>
    TARIF_LINE_FIELDS.reduce((line, field) => {
      line[field] = demandeData[`${field}|${index + 1}`] ?? "";
      return line;
    }, {}),
  );
};

const flattenTarifLines = (tarifLines) => {
  const flattened = { [TARIF_COLLECTION_FIELD]: String(tarifLines.length) };

  tarifLines.forEach((line, index) => {
    TARIF_LINE_FIELDS.forEach((field) => {
      flattened[`${field}|${index + 1}`] = line[field] ?? "";
    });
  });

  return flattened;
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

const buildDemandeBillingData = async (demandeId, transporteur) => {
  if (!transporteur) return {};

  const [demandeData, tarifs] = await Promise.all([
    getDemandeData(demandeId),
    getTransporteurTarifs(transporteur),
  ]);

  const tarifLines = [
    ...readExistingTarifLines(demandeData),
    ...tarifs.map(toTarifLine),
  ];

  return {
    Facturation_Transporteur: transporteur,
    ...flattenTarifLines(tarifLines),
    ...calculateBillingTotals(tarifLines),
  };
};

const getClickedDemandeId = () =>
  safeStr(
    store?.pageContentStore?.active?.[0] ??
      store?.pageContentStore?.processData?.[0]?.result?.ids?.[0],
  );

// Renvoie le nom exact d'un transporteur actif, ou null si le nom saisi n'existe pas
const findTransporteurName = async (value) => {
  const searched = safeStr(value).toLowerCase();
  if (!searched) return null;

  const names = await getTransporteurSuggestions(value);
  return names.find((name) => name.toLowerCase() === searched) || null;
};

const planifierDemande = async (demandeId, transporteur) => {
  const billingData = await buildDemandeBillingData(demandeId, transporteur);

  await api({ local: true }).put("document", {
    document: {
      documentID: demandeId,
      status: STATUS_A_PLANIFIER,
      active: true,
      template: { templateId: DEMANDE_TEMPLATE_ID },
      data: JSON.stringify({
        Répartition_Transporteur: transporteur,
        NomTransporteurSearch: transporteur,
        ...billingData,
      }),
    },
  });
};

// Renvoie false pour garder le popup ouvert
const onSelectTransporteur = async (demandeId, values) => {
  try {
    showPopupLoading("Planification en cours");

    const transporteur = await findTransporteurName(values.NomTransporteurSearch);
    if (!transporteur) {
      showErrorBanner("Veuillez sélectionner une option valide dans la liste.");
      return false;
    }

    await planifierDemande(demandeId, transporteur);
    showSuccessBanner("Demande mise à jour avec succès.");
    return true;
  } catch (e) {
    console.error("Erreur lors de la planification :", e);
    showErrorBanner("Erreur lors de la mise à jour de la demande.");
    return false;
  } finally {
    hidePopupLoading();
  }
};

const main = () => {
  const demandeId = getClickedDemandeId();
  if (!demandeId) {
    showErrorBanner("Demande introuvable.");
    return;
  }

  showCustomPopup({
    title: "Sélectionner un transporteur",
    fields: [
      {
        key: "NomTransporteurSearch",
        name: "Nom du transporteur",
        type: "search",
        required: true,
        options: {
          debounce: 300,
          fetchSuggestions: getTransporteurSuggestions,
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
        name: "Sélectionner",
        key: "select",
        preset: "action",
        onClick: (values) => onSelectTransporteur(demandeId, values),
      },
    ],
  });
};

main();
$code$
WHERE "FunctionID" = 153;

-- Vérification : md5 = 6da875697a2f4804702831490e2e0041
SELECT md5("Data") FROM "Function" WHERE "FunctionID" = 153;

-- Si tout est bon : COMMIT;  sinon : ROLLBACK;