const ARCHIVE_DATE_FIELD = "VehiculeArchivage";
const FIELD_ALLER = "PriseEnCharge_VéhiculeUtilisé";
const FIELD_RETOUR = "PriseEnCharge_VéhiculeUtiliséRetour";
const VEHICLE_NAME = docData["Ident_Libellé"];

const getLocalToday = () => new Date().toLocaleDateString("en-CA");

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

          const filtered = suggestions?.filter((s) =>
            s.toLowerCase().includes(value.toLowerCase()),
          );

          if (!filtered.length || !value) {
            dropdown.classList.remove("visible");
            return;
          }

          filtered.forEach((item) => {
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
        if (min !== void 0) inputEl.min = min;
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

const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement(tag);
    element.id = id;
    document.body.appendChild(element);
  }
  element.style = style;
  element.innerHTML = innerHTML;
  return element;
};

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

const showPopupLoading = (loadingMessage) => {
  createOrUpdateElement(
    "loadingPopup",
    "div",
    `
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
            `,
    `
              <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
                <div>${loadingMessage}</div>
                <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
              </div>
            `,
  );
  if (!document.getElementById("spinnerStyle")) {
    let style = document.createElement("style");
    style.id = "spinnerStyle";
    style.innerHTML = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `;
    document.head.appendChild(style);
  }
};

function showErrorBanner(errorMessage) {
  let errorBanner = document.getElementById("errorBanner");

  if (!errorBanner) {
    errorBanner = document.createElement("div");
    errorBanner.id = "errorBanner";
    errorBanner.style = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(errorBanner);
  }

  errorBanner.innerHTML = `
    <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
    <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
  `;
  errorBanner.style.display = "flex";

  const progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
      return;
    }
    width++;
    progressElement.style.width = width + "%";
  }, 55);
}

const askArchiveDate = () =>
  new Promise((resolve) => {
    showCustomPopup({
      title: "Archiver le véhicule",
      fields: [
        {
          key: ARCHIVE_DATE_FIELD,
          name: "Date d'archivage",
          type: "date",
          required: true,
          defaultValue: getLocalToday(),
          min: getLocalToday(),
        },
      ],
      buttons: [
        {
          name: "Confirmer",
          preset: "action",
          onClick: (values) => resolve(values[ARCHIVE_DATE_FIELD]),
        },
        {
          name: "Annuler",
          key: "cancel",
          onClick: () => resolve(null),
        },
      ],
    });
  });

// Seules les missions à partir de la date d'archivage perdent le véhicule
const createMissionFilters = (vehicleFieldKey, archiveDate) => [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "BETWEEN",
    value: `${archiveDate}|9999-12-01`,
    type: "DATE",
  },
  {
    key: vehicleFieldKey,
    operator: "EQUALS",
    value: VEHICLE_NAME,
    type: "TEXT",
  },
];

const getDocumentIDsByFilters = async (filters) => {
  const response = await api({ local: true }).post("document/id/filter", {
    filters,
  });
  const ids = response?.data?.ids;

  if (!ids) {
    throw new Error(
      "Les identifiants des missions n'ont pas pu être récupérés.",
    );
  }

  return ids;
};

const getDocumentsByIDs = async (ids) => {
  if (!ids.length) return [];

  const response = await api({ local: true }).post("document/id", { ids });
  const documents = response?.data?.documents;

  if (!documents) {
    throw new Error("Les missions n'ont pas pu être récupérées.");
  }

  return documents;
};

const createMissionUpdate = (mission, fieldsToClear) => {
  const documentID = mission?.metaData?.FORMID;
  const templateId = mission?.template?.templateId;

  if (!documentID || !templateId) {
    return null;
  }

  return {
    data: JSON.stringify(
      Object.fromEntries(fieldsToClear.map((field) => [field, ""])),
    ),
    status: mission.status,
    active: true,
    template: { templateId },
    documentID,
  };
};

const getMissionUpdatesFrom = async (archiveDate) => {
  const [allerIDs, retourIDs] = await Promise.all([
    getDocumentIDsByFilters(createMissionFilters(FIELD_ALLER, archiveDate)),
    getDocumentIDsByFilters(createMissionFilters(FIELD_RETOUR, archiveDate)),
  ]);
  const allerIDsSet = new Set(allerIDs);
  const retourIDsSet = new Set(retourIDs);
  const missions = await getDocumentsByIDs([
    ...new Set([...allerIDs, ...retourIDs]),
  ]);

  return missions
    .map((mission) => {
      const missionID = mission?.metaData?.FORMID;
      const fieldsToClear = [
        allerIDsSet.has(missionID) && FIELD_ALLER,
        retourIDsSet.has(missionID) && FIELD_RETOUR,
      ].filter(Boolean);

      return createMissionUpdate(mission, fieldsToClear);
    })
    .filter(Boolean);
};

// La timeline (prepareData de TimeLineAttributionRepartition) masque le véhicule
// à partir de VehiculeArchivage : la date doit être enregistrée avec le statut
const createVehicleUpdate = (archiveDate) => ({
  data: JSON.stringify({ ...docData, [ARCHIVE_DATE_FIELD]: archiveDate }),
  status: "Archivé",
  active: true,
  template: { templateId: docData.FORMLAYOUTID },
  documentID: docData.FORMID,
});

const saveDocuments = async (documents) => {
  const response = await api({ local: true }).put("document/Many", {
    documents,
  });

  console.log("Fonction 300 - réponse de document/Many :", response);

  // document/Many peut répondre sans contenu : on vérifie seulement le code HTTP
  if (!response || response.status < 200 || response.status >= 300) {
    throw new Error("L'enregistrement des documents a échoué.");
  }
};

const redirectToVehicles = () => {
  const area = window.location.pathname.split("/").filter(Boolean)[0];
  window.location.href = `/${area}/véhicules`;
};

const main = async () => {
  if (await isValidDocument(t, docData)) return;

  const archiveDate = await askArchiveDate();
  if (!archiveDate) return;

  // Archiver dans le passé retirerait le véhicule des missions déjà effectuées
  if (archiveDate < getLocalToday()) {
    showErrorBanner("On ne peut pas archiver un véhicule dans le passé.");
    return;
  }

  showPopupLoading("Archivage du véhicule en cours...");

  try {
    const missionUpdates = await getMissionUpdatesFrom(archiveDate);
    console.log("Fonction 300 - missions à modifier :", missionUpdates);
    await saveDocuments([createVehicleUpdate(archiveDate), ...missionUpdates]);
    redirectToVehicles();
  } catch (error) {
    console.error("Erreur lors de l'archivage du véhicule :", error);
    showErrorBanner("L'archivage du véhicule n'a pas pu être enregistré.");
  } finally {
    hidePopupLoading();
  }
};

main();
