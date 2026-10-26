console.log('Function 1')
"console.log("Function 2", context);
const { CoorFactu_Qualité, PrénomSelected, NomFormMission } = docData;

// filter
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "BÉNÉFICIAIRE",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Supprimé(e)|Archivé",
    type: "TEXT",
  },
];

// add to filter when PrénomSelected is defined
if (docData.PrénomSelected !== undefined) {
  apiFilters.push({
    key: "Prénom",
    operator: "CONTAINS",
    value: docData.PrénomSelected,
    type: "TEXT",
  });
}
// add to filter when NomFormMission is defined
if (docData.NomFormMission !== undefined) {
  apiFilters.push({
    key: "Nom", // Filtrer aussi par nom si l'utilisateur entre un nom
    operator: "CONTAINS",
    value: docData.NomFormMission, // Valeur du nom
    type: "TEXT",
  });
}
// add to filter when DateDeNaissance is defined
if (docData.DateDeNaissance !== undefined && docData.DateDeNaissance !== "") {
  apiFilters.push({
    key: "DateDeNaissance", // Filtrer aussi par date
    operator: "EQUALS",
    value: docData.DateDeNaissance, // Valeur de date
    type: "DATE",
  });
}

// Définir la table de correspondances des fields avec des noms spécifiques
const defaultFieldMapping = {
  DateDeNaissance: { key: "DateDeNaissance", name: "Date de naissance" },
  TPMR: { key: "TPMR", name: "TPMR" },

  DateEnregistrement: {
    key: "DateEnregistrement",
    name: "Date d'enregistrement",
  },
  INFODEV_NomComplet: {
    key: "INFODEV_NomComplet",
    name: "Nom complet",
  },
  InformationsPourLeBureau: {
    key: "InformationsPourLeBureau",
    name: "Informations pour le bureau",
  },
  InformationsPourLeChauffeur: {
    key: "InformationsPourLeChauffeur",
    name: "Informations pour le chauffeur",
  },
  InformationsPourLaFacturation: {
    key: "InformationsPourLaFacturation",
    name: "Informations pour la facturation",
  },
  MobilitéDuBénéficiaire: {
    key: "MobilitéDuBénéficiaire",
    name: "Mobilité du bénéficiaire",
  },
  checkboxBeneKg: {
    key: "checkboxBeneKg",
    name: "Est-ce que le bénéficiaire fait plus de 100 kg?",
  },
  CoorFactu_Réception: {
    key: "CoorFactu_Réception",
    name: "Choix de réception des factures",
  },
  CoorFactu_Courrier: {
    key: "CoorFactu_Courrier",
    name: "Courrier électronique",
  },
  CoorFactu_Qualité: {
    key: "CoorFactu_Qualité",
    name: "Qualité",
  },
  AllocataireSocial: {
    key: "AllocataireSocial",
    name: "Allocataire social?",
  },
  dateValiditeAttestationMututelle: {
    key: "dateValiditeAttestationMututelle",
    name: "Date de validité attestation mutuelle",
  },
  CoorFactu_Type_Entité: {
    key: "CoorFactu_Type_Entité",
    name: "Type d'entité",
  },
  CoorFactu_Rue: { key: "CoorFactu_Rue", name: "Adresse - Rue" },
  "CoorFactu_Code postal": {
    key: "CoorFactu_Code postal",
    name: "Code postal",
  },
  CoorFactu_Nom: { key: "CoorFactu_Nom", name: "Nom de facturation" },
  CoorFactu_Prénom: {
    key: "CoorFactu_Prénom",
    name: "Prénom de facturation",
  },
  CoorFactu_Numéro: {
    key: "CoorFactu_Numéro",
    name: "Numéro de facturation",
  },
  CoorFactu_Ville: { key: "CoorFactu_Ville", name: "Ville" },
  CoorFactu_Pays: { key: "CoorFactu_Pays", name: "Pays" },
  MatérielAPrévoir: { key: "MatérielAPrévoir", name: "Matériel" },
};

const prenomFieldMapping = {
  Nom: { key: "NomFormMission", name: "Nom" },
};
Object.assign(prenomFieldMapping, defaultFieldMapping);

const nomFieldMapping = { Prénom: { key: "PrénomSelected", name: "Prénom" } };
Object.assign(nomFieldMapping, defaultFieldMapping);

console.log("START1");

(async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids.slice(0, 10);
    console.log("Filtered IDs: ", ids);

    // Étape 2 : Récupération des documents par leurs IDsz
    const res2 = await api({ local: true }).post("document/id", { ids });
    console.log("END1");
    const documents = res2?.data?.documents;
    console.log("Retrieved Documents: ", documents);

    // Conversion du JSON de chaque document et ajout de IdentifiantMission
    const allDatas = documents
      .map((doc) => {
        if (typeof doc.data !== "string") {
          console.warn(
            "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
            doc
          );
          return null;
        }
        try {
          const parsedData = JSON.parse(doc.data);
          return { ...parsedData, IdentifiantMission: doc.documentID };
        } catch (e) {
          console.warn("Impossible de parser un document d'adresse :", doc, e);
          return null;
        }
      })
      .filter((d) => d !== null);

    // Ajoute un écouteur pour filtrer les suggestions dynamiquement
    const handleInputChange = () => {
      const prenomFilteredSuggestions = allDatas.map((data) => {
        // Création des fields à partir du mapping, puis ajout de IdentifiantMission
        const fields = [
          ...Object.entries(prenomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            })
          ),
          {
            key: "IdentifiantMission",
            value: data.IdentifiantMission,
            name: "Identifiant Mission",
          },
        ];
        return {
          title: data.Prénom,
          fields: fields,
        };
      });
      const nomFilteredSuggestions = allDatas.map((data) => {
        // Création des fields à partir du mapping, puis ajout de IdentifiantMission
        const fields = [
          ...Object.entries(nomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            })
          ),
          {
            key: "IdentifiantMission",
            value: data.IdentifiantMission,
            name: "Identifiant Mission",
          },
        ];
        return {
          title: data.Nom,
          fields: fields,
        };
      });

      // Vérification de qualité Bénéficiaire pour synchroniser changements
      const callbackData =
        CoorFactu_Qualité === "Bénéficiaire"
          ? {
              CoorFactu_Prénom: PrénomSelected || "",
              CoorFactu_Nom: NomFormMission || "",
            }
          : {};

      // Renvoi des suggestions via le callback
      callback({
        suggestions: {
          PrénomSelected: prenomFilteredSuggestions,
          NomFormMission: nomFilteredSuggestions,
        },
        data: callbackData,
      });
    };

    // Exécute le filtrage initial avec la valeur déjà présente (si elle existe)
    handleInputChange();
  } catch (err) {
    console.error(
      "Erreur lors du filtrage ou de la récupération des documents : ",
      err.message || err
    );
  }
})();

console.log("END");
"
"console.log("Function 3", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 * @param {string} dateCible
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

function toggleLoadingPopup(show, success, errorMessage, loadingMessage) {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      // Création du popup de chargement s'il n'existe pas
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
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
            `;
      document.body.appendChild(loadingPopup);

      // Ajout du CSS pour l'animation du spinner
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
    }
    // Mise à jour ou création du contenu du popup de chargement
    loadingPopup.innerHTML = `
          <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
            <div>${loadingMessage}</div>
            <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
          </div>
        `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
  } else {
    if (loadingPopup) loadingPopup.style.display = "none";
    if (success === false && errorMessage) {
      if (!errorBanner) {
        // Création du banner d'erreur s'il n'existe pas
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
      // Mise à jour ou création du contenu du banner d'erreur
      errorBanner.innerHTML = `
            <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
            <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
          `;
      errorBanner.style.display = "flex";
      // Initialisation ou réinitialisation de la barre de progression
      let progressElement = document.getElementById("errorBannerProgress");
      let width = 0;
      let interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          errorBanner.style.display = "none";
        } else {
          width++;
          progressElement.style.width = width + "%";
        }
      }, 55); // La barre progresse sur 5 secondes
    }
  }
}

const getInputValue = () => {
  return docData["CC_AdresseDépart"];
};

// sync functions
// returns the value of a specific address component based on its type
const getComponent = (addressComponents, type) => {
  return (
    addressComponents.find((component) => component.types.includes(type))
      ?.longText ?? ""
  );
};

/**
 * Redirect explicitly to the Transports viewgroup
 * This avoids accidental navigation to other modules
 */
const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;

  // pathname example:
  // /mcr.arlon/transports/mission/new/UUID
  const segments = pathname.split("/").filter(Boolean);

  // The tenant is always the first segment (e.g. "mcr.arlon")
  const tenant = segments[0];

  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found in URL");
    return;
  }

  const targetUrl = `${origin}/${tenant}/transports`;

  window.location.href = targetUrl;
};

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
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

// function to show the popup loading
const showPopupError = () => {
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
                <div>Une erreur est survenue, veuillez réessayer.</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `,
  );
};

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

const goToDate = (dateCible) => {
  const STORAGE_KEY = "TRANSPORTS_TIMELINE_DATE";
  sessionStorage.setItem(STORAGE_KEY, dateCible);

  sessionStorage.removeItem(STORAGE_KEY + "_USED");

  window.location.href = viewGroupUrl();
};

// Constants
const formLayoutId_Bénéficiaire = "3da52cab-039f-4a19-93ce-c904fe1e2ef0";
const formLayoutId_Mission = "0e44171d-1616-4a50-9b36-aff4d998c4a5";

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

// Retire les espaces et caractères invisibles aux extrémités
const cleanText = (value) =>
  typeof value === "string"
    ? value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim()
    : value;

// Comparaison insensible aux espaces en trop, à la casse et aux accents
const normalizeForCompare = (value) =>
  (cleanText(value) || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// async functions
let createNew = true;
const checkIfBeneficiaryExists = async (prenom, nom, dateDeNaissance) => {
  console.log(
    "Vérification de l'existence du bénéficiaire avec les données :",
    {
      prenom,
      nom,
      dateDeNaissance,
    },
  );
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "BÉNÉFICIAIRE",
        type: "TEXT",
      },
      // CONTAINS car des fiches existantes ont une espace finale (ex. "Ian ")
      { key: "Prénom", operator: "CONTAINS", value: prenom, type: "TEXT" },
      { key: "Nom", operator: "CONTAINS", value: nom, type: "TEXT" },
      {
        key: "DateDeNaissance",
        operator: "EQUALS",
        value: dateDeNaissance,
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "Enregistré",
        type: "TEXT",
      },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const candidateIds = res.data.ids;
    const resStatus = res.statusText;
    if (resStatus !== "OK") {
      console.warn(
        "Un erreur est survenue lors de la recherche du bénéficiaire donc on ne crée pas une nouveau",
      );
      createNew = false;
    }
    console.log("Candidats trouvés :", candidateIds);
    if (!candidateIds || candidateIds.length === 0) return null;

    // Garde seulement les fiches dont le prénom et le nom correspondent exactement
    // Un appel par ID : le document retourné n'expose pas forcément son ID
    const responses = await Promise.all(
      candidateIds.map((id) =>
        api({ local: true }).post("document/id", { ids: [id] }),
      ),
    );
    const matchIndex = responses.findIndex((response) => {
      const document = response?.data?.documents?.[0];
      if (!document) return false;
      const data = JSON.parse(document.data);
      return (
        normalizeForCompare(data["Prénom"]) === normalizeForCompare(prenom) &&
        normalizeForCompare(data["Nom"]) === normalizeForCompare(nom)
      );
    });
    const matchId = matchIndex >= 0 ? candidateIds[matchIndex] : null;
    console.log("Résultat de la vérification du bénéficiaire :", matchId);
    return matchId; // Retourne l'ID du formulaire existant ou null
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    return undefined;
  }
};

const createBeneficiaryForm = async (formData, formLayoutId) => {
  console.log("formData", formData);
  try {
    // Filtre les champs nécessaires
    const filteredData = {
      DateDeNaissance: formData.DateDeNaissance || null,
      Commentaires: formData.Commentaires || null,
      Nom: cleanText(formData.NomFormMission) || null,
      TPMR: formData.TPMR || null,
      Prénom: cleanText(formData.PrénomSelected) || null,
      Titre: formData.Titre || null,
      Téléphones: formData.Téléphones || null,
      dateValiditeAttestationMututelle:
        formData.dateValiditeAttestationMututelle || null,
      INFODEV_NomComplet:
        `${cleanText(formData.PrénomSelected)} ${cleanText(formData.NomFormMission)}` ||
        null,
      InformationsPourLeBureau: formData.InformationsPourLeBureau || null,
      InformationsPourLeChauffeur: formData.InformationsPourLeChauffeur || null,
      InformationsPourLaFacturation:
        formData.InformationsPourLaFacturation || null,
      DateEnregistrement: formData.DateEnregistrement || null,
      "E-mails": formData["E-mails"] || null,
      "Contacts supplémentaires": formData["Contacts supplémentaires"] || null,
      AdressePreférées: formData["AdressePreférées"] || null,
      MobilitéDuBénéficiaire: formData.MobilitéDuBénéficiaire || null,
      checkboxBeneKg: formData.checkboxBeneKg || null,
      AllocataireSocial: formData.AllocataireSocial || null,
      CoorFactu_Réception: formData.CoorFactu_Réception || null,
      CoorFactu_Courrier: formData.CoorFactu_Courrier || null,
      CoorFactu_Qualité: formData.CoorFactu_Qualité || null,
      CoorFactu_Type_Entité: formData["CoorFactu_Type_Entité"] || null,
      "CoorFactu_Dénomination sociale":
        formData["CoorFactu_Dénomination sociale"] || null,
      "CoorFactu_Numéro de TVA": formData["CoorFactu_Numéro de TVA"] || null,
      CoorFactu_Rue: formData["CoorFactu_Rue"] || null,
      "CoorFactu_Code postal": formData["CoorFactu_Code postal"] || null,
      CoorFactu_Nom: formData["CoorFactu_Nom"] || null,
      CoorFactu_Prénom: formData["CoorFactu_Prénom"] || null,
      CoorFactu_Numéro: formData["CoorFactu_Numéro"] || null,
      CoorFactu_Ville: formData["CoorFactu_Ville"] || null,
      CoorFactu_Pays: formData["CoorFactu_Pays"] || null,
      MatérielAPrévoir: formData["MatérielAPrévoir"] || null,
    };
    console.log(formatDataAPI(filteredData));
    try {
      const response = await api({ local: true }).post("document", {
        document: {
          data: formatDataAPI(filteredData),
          status: "Enregistré",
          active: true,
          template: { templateId: formLayoutId },
        },
      });
      console.log("Réponse de l'API :", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création du formulaire bénéficiaire :",
      error,
    );
    throw error;
  }
};

const createMissionForm = async (formData, formLayoutId) => {
  try {
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: "Acceptée",
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
    };

    // Envoi des données via une requête POST
    const res = await api({ local: true }).post("document", { document });

    return res;
  } catch (error) {
    console.error("Erreur lors de la création du formulaire mission :", error);
    throw error;
  }
};

const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: "Acceptée",
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId,
    };

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};

const updateBeneficiaryForm = async (formId, formData) => {
  try {
    const document = {
      data: formatDataAPI(formData),
      status: "Enregistré", // statut correct
      active: true,
      template: { templateId: formLayoutId_Bénéficiaire },
      documentID: formId,
    };
    return await api({ local: true }).put("document", { document });
  } catch (err) {
    console.error("Erreur updateBeneficiaryForm :", err);
    throw err;
  }
};

const checkIfBeneficiaryHaveChange = async (formId, formData) => {
  // get mission info
  const res3 = await api({ local: true }).post("document/id", {
    ids: [formId],
  });

  console.log("res3", res3);
  // parse the info
  const beneficiaryDB =
    res3.data?.documents?.map((document) => JSON.parse(document.data)) || [];

  console.log("beneficiaryDB", beneficiaryDB);

  const filteredBeneficiary = {
    DateDeNaissance: formData.DateDeNaissance || null,
    Commentaires: formData.Commentaires || null,
    Nom: cleanText(formData.NomFormMission) || null,
    TPMR: formData.TPMR || null,
    Prénom: cleanText(formData.PrénomSelected) || null,
    Titre: formData.Titre || null,
    Téléphones: formData.Téléphones || null,
    dateValiditeAttestationMututelle:
      formData.dateValiditeAttestationMututelle || null,
    INFODEV_NomComplet:
      `${cleanText(formData.PrénomSelected)} ${cleanText(formData.NomFormMission)}` ||
      null,
    InformationsPourLeBureau: formData.InformationsPourLeBureau || null,
    InformationsPourLeChauffeur: formData.InformationsPourLeChauffeur || null,
    InformationsPourLaFacturation:
      formData.InformationsPourLaFacturation || null,
    DateEnregistrement: formData.DateEnregistrement || null,
    "E-mails": formData["E-mails"] || null,
    "Contacts supplémentaires": formData["Contacts supplémentaires"] || null,
    AdressePreférées: formData["AdressePreférées"] || null,
    MobilitéDuBénéficiaire: formData.MobilitéDuBénéficiaire || null,
    checkboxBeneKg: formData.checkboxBeneKg || null,
    AllocataireSocial: formData.AllocataireSocial || null,
    CoorFactu_Réception: formData.CoorFactu_Réception || null,
    CoorFactu_Courrier: formData.CoorFactu_Courrier || null,
    CoorFactu_Qualité: formData.CoorFactu_Qualité || null,
    CoorFactu_Type_Entité: formData["CoorFactu_Type_Entité"] || null,
    "CoorFactu_Dénomination sociale":
      formData["CoorFactu_Dénomination sociale"] || null,
    "CoorFactu_Numéro de TVA": formData["CoorFactu_Numéro de TVA"] || null,
    CoorFactu_Rue: formData["CoorFactu_Rue"] || null,
    "CoorFactu_Code postal": formData["CoorFactu_Code postal"] || null,
    CoorFactu_Nom: formData["CoorFactu_Nom"] || null,
    CoorFactu_Prénom: formData["CoorFactu_Prénom"] || null,
    CoorFactu_Numéro: formData["CoorFactu_Numéro"] || null,
    CoorFactu_Ville: formData["CoorFactu_Ville"] || null,
    CoorFactu_Pays: formData["CoorFactu_Pays"] || null,
    MatérielAPrévoir: formData["MatérielAPrévoir"] || null,
  };

  const excludedKeys = [];

  const differences =
    beneficiaryDB.length > 0
      ? Object.keys(filteredBeneficiary).reduce((diff, key) => {
          if (
            !excludedKeys.includes(key) &&
            filteredBeneficiary[key] !== beneficiaryDB[0][key] &&
            filteredBeneficiary[key] !== null
          ) {
            diff[key] = filteredBeneficiary[key];
          }
          return diff;
        }, {})
      : {};

  console.log("Différences trouvées :", differences);
  return differences;
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

const showPopupErrorWithClose = () => {
  showPopupError(); // Affiche la popup avec bouton

  // Attendre un petit délai que la popup soit bien injectée dans le DOM
  setTimeout(() => {
    const closePopupButton = document.getElementById("closePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
  }, 100);
};
// main

const main = async (docData) => {
  try {
    const collection = docData?.["CC_Destinations"];
    const heureDebut = docData?.CC_Récupération;
    const heureFin = docData?.CC_Arrivée
      ? docData?.CC_Arrivée
      : collection[collection.length - 1]?.[`CC_Destinations|600|Fin de RDV`];

    // Convertit "HH:MM" en minutes depuis minuit (null si invalide)
    const toMinutes = (hhmm) => {
      if (typeof hhmm !== "string") return null;
      const match = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;
      const h = Number(match[1]);
      const m = Number(match[2]);
      if (h > 23 || m > 59) return null;
      return h * 60 + m;
    };

    const debutMin = toMinutes(heureDebut);
    const finMin = toMinutes(heureFin);
    console.log("DEBUT MIN, FIN MIN", debutMin, finMin);
    if (debutMin !== null && finMin !== null && finMin < debutMin) {
      toggleLoadingPopup(
        false,
        false,
        "Erreur : L'heure de fin est antérieure à l'heure de début.",
      );
      return;
    }
    if (new Date() > new Date(docData.InformationsAdmin_DateHeureDébut)) {
      const popup = await new Promise((resolve) => {
        showCustomPopup({
          title: "La mission est dans le passé",
          commentHTML: "Souhaitez-vous continuer la création de la mission?",
          fields: [],
          buttons: [
            {
              name: "Annuler",
              key: "cancel",
              onClick: () => resolve(false),
            },
            {
              name: "Continuer",
              preset: "action",
              onClick: () => resolve(true),
            },
          ],
        });
      });
      if (!popup) return;
    }
    // show the popup
    showPopupLoading(
      "La mission est en cours de création. Merci de patienter quelques instants.",
    );
    console.log("Données du document :", docData);
    // Étape 1 : Vérifie si le bénéficiaire existe
    const beneficiaryId = await checkIfBeneficiaryExists(
      docData.PrénomSelected
        ? docData.PrénomSelected.trim()
        : docData.PrénomSelected,
      docData.NomFormMission
        ? docData.NomFormMission.trim()
        : docData.NomFormMission,
      docData.DateDeNaissance
        ? docData.DateDeNaissance.trim()
        : docData.DateDeNaissance,
    );
    // if there is problem with api
    if (beneficiaryId === undefined) {
      showPopupErrorWithClose();
      return;
    }
    console.log("Bénéficiaire existant trouvé :", beneficiaryId);
    let cloneDocData = { ...docData };
    if (beneficiaryId) {
      console.log(`Bénéficiaire existant trouvé : ${beneficiaryId}`);
      // Vérifie si le bénéficiaire a changé
      const differences = await checkIfBeneficiaryHaveChange(
        beneficiaryId,
        docData,
      );
      if (Object.keys(differences).length > 0) {
        console.log("Le bénéficiaire a changé :", differences);
        // Met à jour le formulaire bénéficiaire
        await updateBeneficiaryForm(beneficiaryId, differences);
      }
      cloneDocData = { ...docData, IdentifiantMission: beneficiaryId };
    } else {
      if (createNew === true) {
        console.log(
          "Aucun bénéficiaire existant trouvé. Création d'un nouveau bénéficiaire.",
        );

        // Étape 2 : Crée un nouveau formulaire bénéficiaire
        const resBenef = await createBeneficiaryForm(
          docData,
          formLayoutId_Bénéficiaire,
        );
        console.log("Nouveau bénéficiaire créé avec succès.", resBenef);
        cloneDocData = { ...docData, IdentifiantMission: resBenef.data.id };
      } else {
        showPopupErrorWithClose();
        return;
      }
    }

    // Étape 3 : Crée ou met à jour le formulaire mission
    console.log(cloneDocData);
    if (cloneDocData.STATUS === "Draft") {
      console.log("Création d'un nouveau formulaire mission.");
      await createMissionForm(cloneDocData, formLayoutId_Mission);
    } else {
      console.log("Mise à jour du formulaire mission existant.");
      await updateMissionForm(
        cloneDocData.FORMID,
        cloneDocData,
        formLayoutId_Mission,
      );
    }
    // hide the popup
    hidePopupLoading();
    // Step 4 : return to the viewgroup

    const rawDate =
      docData.Planification_Date || docData.InformationsAdmin_DateHeureDébut;

    let timelineDate = null;

    if (rawDate) {
      const d =
        rawDate.length === 10
          ? new Date(`${rawDate}T00:00:00`)
          : new Date(rawDate);

      if (!isNaN(d)) {
        const offsetMin = d.getTimezoneOffset();
        const sign = offsetMin <= 0 ? "+" : "-";
        const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(
          2,
          "0",
        );
        const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");

        timelineDate =
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` +
          `T00:00:00${sign}${hh}:${mm}`;
      }
    }

    // If the timeline has already been loaded, it already has a date and must be changed through the local storage to trigger the update of the timeline
    // If not, the date can be set directly in the session storage
    // This is due to the fact that the timeline date is set in the local storage on the first load of the timeline, and then updated through the local storage on subsequent loads
    // The sessionStorage is used to store the dat
    sessionStorage.removeItem("TRANSPORTS_TIMELINE_DATE");

    if (timelineDate) {
      console.log(timelineDate);

      sessionStorage.setItem("TRANSPORTS_TIMELINE_DATE_REDIRECT", timelineDate);

      const timelineDay = timelineDate.split("T")[0];

      const tables = JSON.parse(localStorage.getItem("tables") || "{}");

      if (!tables.TimeLineChauffeur) {
        tables.TimeLineChauffeur = {};
      }

      if (!tables.TimeLineChauffeur.filters) {
        tables.TimeLineChauffeur.filters = {};
      }

      if (!tables.TimeLineChauffeur.mask) {
        tables.TimeLineChauffeur.mask = {};
      }

      if (!tables.TimeLineChauffeur.mask.TIMELINE) {
        tables.TimeLineChauffeur.mask.TIMELINE = {};
      }

      tables.TimeLineChauffeur.mask.TIMELINE.date = `${timelineDay}|${timelineDay}`;

      tables.TimeLineChauffeur.mask.TIMELINE.type = "DAY";

      localStorage.setItem("tables", JSON.stringify(tables));

      console.log("[TIMELINE] Updated localStorage tables:", tables);
    }

    redirectToViewGroup();
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    throw error;
  }
};

window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
if (!isValidDocument(t, docData)) {
  main(docData);
}
"
"console.log('Function 4', context);

return {
  AnnulationDemandéPar:
    docData['RaisonAnnulation'] == 'Annulation par le bénéficiaire ou tiers'
      ? true
      : null,
  DescriptionDeLannulation: docData['RaisonAnnulation'] == 'Autre' ? true : null
}
"
"console.log('Function 5', context);

return {
  Entretien_DateEntretienAnnuel: docData['CT_TPMR'] == 'true' ? true : null
}
"
"console.log('Function 6', context);
return {
  Entretien_DateVignetteTaxi: docData['CT_Taxi'] == 'true' ? true : null
}
"
"console.log('Function 7', context)

// Constants
const addressInput = 'SimulateurPrix_TarifSimulé'
const addressValue = docData[inputKey]

const apiFilters = [
  {
    key: 'FORMLAYOUTNAME',
    operator: 'EQUALS',
    value: 'TARIF',
    type: 'TEXT'
  },
  {
    key: 'LibelléTarif',
    operator: 'CONTAINS',
    value: addressValue,
    type: 'TEXT'
  },
  {
    key: 'STATUS',
    operator: 'NOTEQUALS',
    value: 'Supprimé(e)',
    type: 'TEXT'
  }
]

// Field mapping
const fieldMapping = {
  CalculPrix_CalculKilomètrage: {
    key: 'SimulateurPrix_CalculKilomètrage',
    name: 'Calcul kilométrage'
  },
  CalculPrix_NbKMCouvertForfaitPriseEnCharge: {
    key: 'SimulateurPrix_NbKMCouvertForfaitPriseEnCharge',
    name: 'Nombre KM couvert forfait prise en charge'
  },
  CalculPrix_PrixForfaitPriseEnChargeEuro: {
    key: 'SimulateurPrix_PrixForfaitPriseEnChargeEuro',
    name: 'Prix forfait prise en charge (€)'
  },
  CalculPrix_PrixMiniEuro: {
    key: 'SimulateurPrix_PrixMiniEuro',
    name: 'Prix minimum (€)'
  },
  CalculPrix_PrixParKmEuro: {
    key: 'SimulateurPrix_PrixParKmEuro',
    name: 'Prix par KM (€)'
  }
}

// Async functions
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters
    })
    const ids = res?.data?.ids

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.warn("Aucun ID trouvé pour le filtre 'ADRESSE'.")
      return []
    }

    return ids
  } catch (error) {
    console.error('Erreur lors de la récupération des documents :', error)
    return []
  }
}

const getAutocompleteSuggestions = async ids => {
  try {
    const res2 = await api({ local: true }).post('document/id', { ids })
    const documents = res2?.data?.documents

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error('Erreur lors de la récupération des documents.')
    }

    const allAddresses = documents
      .map(doc => {
        if (typeof doc.data !== 'string') {
          console.warn(
            "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
            doc
          )
          return null
        }

        try {
          return JSON.parse(doc.data)
        } catch (e) {
          console.warn("Impossible de parser un document d'adresse :", doc, e)
          return null
        }
      })
      .filter(d => d !== null)

    return allAddresses.map(addr => {
      const fields = Object.entries(fieldMapping).map(
        ([key, { key: departKey, name }]) => ({
          key: departKey,
          value: addr[key],
          name: name || departKey
        })
      )

      return {
        title: addr.LibelléTarif,
        fields
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions :', error)
    return []
  }
}

// Main
const main = async () => {
  const ids = (await getSuggestionsIds()).slice(0, 10)

  if (ids.length === 0) {
    callback({
      suggestions: {
        [addressInput]: [{}]
      }
    })
    return
  }

  const filteredSuggestions = await getAutocompleteSuggestions(ids)
  console.log('filteredSuggestions', filteredSuggestions)

  callback({
    suggestions: {
      [addressInput]: filteredSuggestions
    }
  })
}

main()
"
"console.log("Function 8", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const formLayoutId_Mission = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
// reason of refusal and date of refusal
const reasonOfRefusal = store.pageContentStore.processData[0].edits.RaisonRefus;
const dateMission =
  store.pageContentStore.processData[0].edits.Planification_Date;
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

const createMissionForm = async (formData, formLayoutId) => {
  try {
    const document = {
      // converts data in json
      data: formatDataAPI(formData),
      // set the status
      status: "Refusée",
      // set form as active
      active: true,
      // id of form template
      template: { templateId: formLayoutId },
    };

    // send data via API
    const res = await api({ local: true }).post("document", { document });

    return res;
  } catch (error) {
    console.error("Erreur lors de la création du formulaire mission :", error);
    throw error;
  }
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

// main
const main = async () => {
  const newDocData = {
    ...docData,
    RaisonRefus: reasonOfRefusal,
    Planification_Date: dateMission,
  };
  try {
    await createMissionForm(newDocData, formLayoutId_Mission);
    navigateBack();
    //redirectToViewGroup()
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    throw error;
  }
};

main();
"
"console.log("Function 9", context);

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "BÉNÉFICIAIRE",
    type: "TEXT",
  },
  {
    key: "Nom",
    operator: "EQUALS",
    value: docData.NomFormMission,
    type: "TEXT",
  },
  {
    key: "Prénom",
    operator: "EQUALS",
    value: docData.PrénomSelected,
    type: "TEXT",
  },
  {
    key: "Prénom",
    operator: "EQUALS",
    value: docData.PrénomSelected,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

if (docData.DateDeNaissance) {
  apiFilters.push({
    key: "DateDeNaissance",
    operator: "EQUALS",
    value: docData.DateDeNaissance,
    type: "TEXT",
  });
}

// async functions
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.log("Aucun bénéficiaire trouvé");
    }

    return ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw error;
  }
};

const getAutocompleteSuggestions = async (ids) => {
  const res2 = await api({ local: true }).post("document/id", { ids });

  const documents = res2?.data?.documents;
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    throw new Error("Erreur lors de la récupération des documents.");
  }

  // JSON conversion of each document
  const allAddresses = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        console.warn(
          "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
          doc,
        );
        return null;
      }

      try {
        return JSON.parse(doc.data);
      } catch (e) {
        console.warn("Impossible de parser un document d'adresse :", doc, e);
        return null;
      }
    })
    .filter((d) => d !== null);

  return allAddresses;
};

function filterEmailsFields(start, obj) {
  const result = {};
  for (const key in obj) {
    if (key.startsWith(start)) {
      result[key] = obj[key];
    }
  }
  return result;
}

function transformToEmailObjects(obj) {
  const emails = {};

  for (const key in obj) {
    const parts = key.split("|"); // Découpe le format "E-mails|X|Key|Y"
    const emailIndex = parts[3]; // Index de l'email (ex: 1 ou 2)

    if (!emails[emailIndex]) {
      emails[emailIndex] = {}; // Initialise l'objet si absent
    }

    // Ajoute la clé complète et la valeur dans l'objet correspondant
    emails[emailIndex][key.split("|").slice(0, 3).join("|")] = obj[key];
  }

  // Retourne une liste avec un élément vide au début
  const result = Object.values(emails);
  return result;
}

const addCollection = async (allAddresses) => {
  const input = inputKey;
  const collections = [
    "E-mails",
    "Téléphones",
    "Contacts supplémentaires",
    "AdressePreférées",
  ];

  //récupère que le premier élément de allAddresses
  const address = allAddresses[0];

  const data = {};

  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];

    const goodAddress = filterEmailsFields(collection + "|", address);

    const goodFormatAddress = transformToEmailObjects(goodAddress);

    // Ajout au résultat global
    data[collection] = goodFormatAddress;
  }

  const collection = "AdressePreférées|100|Adresse";
  const collectionDeno = "AdressePreférées|200|Dénomination";
  const suggestions = [];
  const suggestions1 = [];
  const adresseSuggestions = [];
  const collectionLength = data.AdressePreférées.length;
  for (let i = 0; i < collectionLength; i++) {
    const adresse = data.AdressePreférées[i][`${collection}`];
    const denomination = data.AdressePreférées[i][`${collectionDeno}`];
    if (adresse) {
      suggestions1.push({
        title: adresse,
        fields: [
          {
            key: "Dénomination",
            value: denomination ?? "",
            name: "Dénomination",
          },
          {
            key: "VilleDépart",
            value: data.AdressePreférées[i]["AdressePreférées|530|Ville"] ?? "",
            name: "Ville",
          },
          {
            key: "CodePostalDépart",
            value:
              data.AdressePreférées[i]["AdressePreférées|520|Code_postal"] ??
              "",
            name: "Code postal",
          },
          {
            key: "CC_Latitude",
            name: "Latitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|800|Latitude"] ?? "",
          },
          {
            key: "CC_Longitude",
            name: "Longitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|810|Longitude"] ?? "",
          },
        ],
      });

      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "CC_Destinations|110|Dénomination",
            value: denomination ?? "",
            name: "Dénomination",
          },
          {
            key: "CC_Destinations|530|Ville",
            value: data.AdressePreférées[i]["AdressePreférées|530|Ville"] ?? "",
            name: "Ville",
          },
          {
            key: "CC_Destinations|520|Code_postal",
            value:
              data.AdressePreférées[i]["AdressePreférées|520|Code_postal"] ??
              "",
            name: "Code postal",
          },
          {
            key: "CC_Destinations|800|Latitude",
            name: "Latitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|800|Latitude"] ?? "",
          },
          {
            key: "CC_Destinations|900|Longitude",
            name: "Longitude",
            value:
              data.AdressePreférées[i]["AdressePreférées|810|Longitude"] ?? "",
          },
        ],
      });

      adresseSuggestions.push({
        title: adresse,
      });
    }
    // cas pour gérer la collection ici
  }

  if (input === "PrénomSelected" || input === "NomFormMission") {
    // Appel du callback une seule fois avec toutes les données
    callback({
      data: data,
      suggestions: {
        CC_AdresseDépart: suggestions1,
        "CC_Destinations|100|Adresse": suggestions,
        Contact_AdresseRésidence: adresseSuggestions,
      },
    });
  } else {
    // Appel du callback une seule fois avec toutes les données
    callback({
      suggestions: {
        CC_AdresseDépart: suggestions1,
        "CC_Destinations|100|Adresse": suggestions,
        Contact_AdresseRésidence: adresseSuggestions,
      },
    });
  }
};

// main
const main = async () => {
  // Vérification préalable : s'assurer qu'un bénéficiaire a été sélectionné
  // L'IdentifiantMission sert de preuve que la sélection est complète et valide
  if (!docData.IdentifiantMission || docData.IdentifiantMission.trim() === "") {
    console.log(
      "Aucun bénéficiaire sélectionné - IdentifiantMission manquant ou vide",
    );
    return;
  }

  // step 1: Retrieving ids according to filters
  console.log("Fetching suggestion IDs with filters:", apiFilters);
  //const ids = (await getSuggestionsIds()).slice(0, 10);
  const ids = [];
  ids.push(docData?.IdentifiantMission);
  console.log("Retrieved IDs:", ids);
  // step 2: Retrieving documents by their IDs
  const filteredSuggestions = await getAutocompleteSuggestions(ids);
  console.log("filteredSuggestions", filteredSuggestions);

  //step3 add collection
  if (filteredSuggestions.length !== 0) {
    await addCollection(filteredSuggestions);
  }
};

main();
"
"if(docData.STATUS == 'Draft'){
	return {
		'IsOccurence' : 'false'
	}
}"
"console.log("Function 12", context);

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire", // Mettre ici le FORMLAYOUTNAME exact pour vos adresses
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Archivé|Supprimé(e)", // Mettre ici le FORMLAYOUTNAME exact pour vos adresses
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
];

// add to filter when PrénomSelected is defined
if (docData.PrénomSelected !== undefined) {
  apiFilters.push({
    key: "Prénom",
    operator: "CONTAINS",
    value: docData.PrénomSelected,
    type: "TEXT",
  });
}
// add to filter when NomFormMission is defined
if (docData.NomFormMission !== undefined) {
  apiFilters.push({
    key: "Nom", // Filtrer aussi par nom si l'utilisateur entre un nom
    operator: "CONTAINS",
    value: docData.NomFormMission, // Valeur du nom
    type: "TEXT",
  });
}
// add to filter when DateDeNaissance is defined
if (docData.DateDeNaissance !== undefined && docData.DateDeNaissance !== "") {
  apiFilters.push({
    key: "DateDeNaissance", // Filtrer aussi par date
    operator: "EQUALS",
    value: docData.DateDeNaissance, // Valeur de date
    type: "DATE",
  });
}

//console.log(context);
// Définir la table de correspondances des fields avec des noms spécifiques
const defaultFieldMapping = {
  DateDeNaissance: { key: "DateDeNaissance", name: "Date de naissance" },
  Maison: { key: "Maison", name: "Maison" },
};

const prenomFieldMapping = {
  Nom: { key: "NomFormMission", name: "Nom" },
};
Object.assign(prenomFieldMapping, defaultFieldMapping);

const nomFieldMapping = {
  Prénom: { key: "PrénomSelected", name: "Prénom" },
};
Object.assign(nomFieldMapping, defaultFieldMapping);

//console.log("prenomFieldMapping", prenomFieldMapping);
//console.log("nomFieldMapping", nomFieldMapping);

api({ local: true })
  .post("document/id/filter", { filters: apiFilters })
  .then((res) => {
    const ids = res?.data?.ids.slice(0, 10);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Aucun ID trouvé pour le filtre 'ADRESSE'.");
    }

    // Étape 2 : Récupération des documents par leurs IDs
    return api({ local: true }).post("document/id", { ids });
  })
  .then((res2) => {
    const documents = res2?.data?.documents;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error("Erreur lors de la récupération des documents.");
    }
    //console.log(documents);

    // Conversion du JSON de chaque document et ajout de IdentifiantMission
    const allDatas = documents
      .map((doc) => {
        if (typeof doc.data !== "string") {
          console.warn(
            "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
            doc,
          );
          return null;
        }
        try {
          const parsedData = JSON.parse(doc.data);
          // Ajout de IdentifiantMission provenant de doc.documentID
          return { ...parsedData, IdentifiantBeneficiaire: doc.documentID };
        } catch (e) {
          console.warn("Impossible de parser un document d'adresse :", doc, e);
          return null;
        }
      })
      .filter((d) => d !== null);

    // Ajoute un écouteur pour filtrer les suggestions dynamiquement
    const handleInputChange = () => {
      const prenomFilteredSuggestions = allDatas.map((data) => {
        // Construction du tableau fields incluant IdentifiantMission
        const fields = [
          ...Object.entries(prenomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            }),
          ),
          {
            key: "IdentifiantDispo",
            value: data.IdentifiantBeneficiaire,
            name: "Identifiant Bénéficiaire",
          },
          {
            key: "CommentaireChauffeur",
            value: data?.CommentaireChauffeur || "",
            name: "Commentaire",
          },
          {
            key: "Nom",
            value: data.Nom,
            name: "Nom",
          },
        ];
        //console.log(fields);

        return {
          title: data.Prénom,
          fields: fields,
        };
      });
      console.log("ALL DATAS ", allDatas);
      const nomFilteredSuggestions = allDatas.map((data) => {
        // Construction du tableau fields incluant IdentifiantMission
        const fields = [
          ...Object.entries(nomFieldMapping).map(
            ([key, { key: departKey, name }]) => ({
              key: departKey,
              value: data[key],
              name: name || departKey,
            }),
          ),
          {
            key: "IdentifiantDispo",
            value: data.IdentifiantBeneficiaire,
            name: "Identifiant Bénéficiaire",
          },
          {
            key: "CommentaireChauffeur",
            value: data?.CommentaireChauffeur || "",
            name: "Commentaire",
          },
          {
            key: "Nom",
            value: data.Nom,
            name: "Nom",
          },
        ];
        //console.log(fields);

        return {
          title: data.Nom,
          fields: fields,
        };
      });

      // Renvoi des suggestions via le callback
      callback({
        suggestions: {
          PrénomSelected: prenomFilteredSuggestions,
          NomFormMission: nomFilteredSuggestions,
          Nom: nomFilteredSuggestions,
        },
      });
    };

    // Exécute le filtrage initial avec la valeur déjà présente (si elle existe)
    handleInputChange();
  })
  .catch((err) => {
    console.error(
      "Erreur lors du filtrage ou de la récupération des documents : ",
      err.message || err,
    );
    callback({
      suggestions: {
        PrénomSelected: [],
        NomFormMission: [],
        Nom: [],
      },
    });
  });
"
"console.log("Function 13", context);

// Constants
const addressInput = "PriseEnCharge_VéhiculeUtilisé";
const addressValue = docData[inputKey];

// Mission planning date (used only for archived vehicles)
const planificationDate = docData.Planification_Date
  ? new Date(docData.Planification_Date)
  : null;

// Filters for registered vehicles
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

// Filters for archived vehicles
const apiFiltersArchived = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Archivé",
    type: "TEXT",
  },
];

// Fetch vehicle IDs
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    const resArchived = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersArchived,
    });

    const ids = res?.data?.ids || [];
    const archivedIds = resArchived?.data?.ids || [];

    return [...ids, ...archivedIds];
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return [];
  }
};

// Build autocomplete suggestions
const getAutocompleteSuggestions = async (ids) => {
  const res = await api({ local: true }).post("document/id", { ids });
  const documents = res?.data?.documents;

  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const vehicles = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(doc.data);
      } catch {
        return null;
      }

      if (doc.status === "Enregistré") {
        return parsed;
      }

      if (
        doc.status === "Archivé" &&
        planificationDate &&
        parsed.VehiculeArchivage
      ) {
        const archivageDate = new Date(parsed.VehiculeArchivage);
        if (!isNaN(archivageDate) && archivageDate > planificationDate) {
          console.log('YES!');
          return parsed;
        }
      }

      return null;
    })
    .filter(Boolean);

  return vehicles.map((vehicle) => ({
    title: vehicle.Ident_Libellé,
  }));
};

// Main
const main = async () => {
  const ids = await getSuggestionsIds();

  if (ids.length === 0) {
    callback({
      options: {
        PriseEnCharge_VéhiculeUtilisé: [{}],
      },
    });
    return;
  }

  const suggestions = await getAutocompleteSuggestions(ids.slice(0, 10));

  suggestions.sort((a, b) =>
    a.title.localeCompare(b.title, "fr", {
      numeric: true,
      sensitivity: "base",
    })
  );

  const options = suggestions.map((item) => ({
    key: item.title,
    value: item.title,
    text: item.title,
    items: null,
  }));

  callback({
    options: {
      PriseEnCharge_VéhiculeUtilisé: options,
    },
  });
};

main();
``"
"console.log("Function 14", context);

if (docData.STATUS === "Draft" && docData.NUMBER === "0") {
  return { Planification_Récurrence: "Une seule fois" };
}
"
"console.log("Function 17", context);

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isValidRDVRange = (debut, fin) => {
  return timeToMinutes(fin) > timeToMinutes(debut);
};

const clone = [...docData.CC_Destinations];

const addTime = (time1, time2) => {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);

  const totalMinutes = h1 * 60 + m1 + (h2 * 60 + m2);
  const hours = Math.floor(totalMinutes / 60) % 24; // Garde dans la plage 0-23
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

if (
  clone[indexItemChange]["CC_Destinations|400|Début de RDV"] &&
  clone[indexItemChange]["CC_Destinations|500|Temps sur place"]
) {
  const debut = clone[indexItemChange]["CC_Destinations|400|Début de RDV"];

  const fin = addTime(
    debut,
    clone[indexItemChange]["CC_Destinations|500|Temps sur place"],
  );

  if (!isValidRDVRange(debut, fin)) {
    console.log("Fin de RDV doit être après Début de RDV");
    return {};
  }

  clone[indexItemChange] = {
    ...clone[indexItemChange],
    "CC_Destinations|600|Fin de RDV": fin,
  };

  const newDocData = { ...docData, CC_Destinations: clone };
  return { ...newDocData, ...getInfos(newDocData) };
}

// function that gets the info to fill the section INFO DEV heures
function getInfos(newDocData) {
  // gets the necessary const
  const date = "2001-01-01";
  const heureDebut = newDocData.CC_Récupération;
  let result = {};

  const heureFin =
    newDocData.CC_Destinations[newDocData.CC_Destinations.length - 1]?.[
      "CC_Destinations|300|Arrivée"
    ]; // take the last entry
  const heureFinRetour = newDocData.CC_Arrivée;
  const heureDebutRetour =
    newDocData.CC_Destinations[newDocData.CC_Destinations.length - 1]?.[
      "CC_Destinations|700|Récupération"
    ]; // take the last entry
  // if all info is there return all
  if (date && heureDebut && heureFin && heureFinRetour && heureDebutRetour) {
    // creates the date and starting/arrival time combined
    const dateStartingTime = date + "T" + heureDebut + ":00";
    const dateFinishTime = date + "T" + heureFin + ":00";
    // start time
    const dateDebut = {
      InformationsAdmin_DateHeureDébutAller: dateStartingTime,
      InformationsAdmin_DateHeureFinAller: dateFinishTime,
    };
    // creates the date and starting/arrival time combined
    const dateStartingTimeRetour = date + "T" + heureDebutRetour + ":00";
    const dateFinishTimeRetour = date + "T" + heureFinRetour + ":00";
    // endtime
    const dateFin = {
      InformationsAdmin_DebutRetour: dateStartingTimeRetour,
      InformationsAdmin_FinRetour: dateFinishTimeRetour,
    };
    result = { ...dateDebut, ...dateFin };
  } else if (date && heureDebut && heureFin) {
    // creates the date and starting/arrival time combined
    const dateStartingTime = date + "T" + heureDebut + ":00";
    const dateFinishTime = date + "T" + heureFin + ":00";
    // starttime
    const dateDebut = {
      InformationsAdmin_DateHeureDébutAller: dateStartingTime,
      InformationsAdmin_DateHeureFinAller: dateFinishTime,
    };
    result = dateDebut;
  } else if (date && heureFinRetour && heureDebutRetour) {
    // creates the date and starting/arrival time combined
    const dateStartingTimeRetour = date + "T" + heureDebutRetour + ":00";
    const dateFinishTimeRetour = date + "T" + heureFinRetour + ":00";
    // endtime
    const dateFin = {
      InformationsAdmin_DebutRetour: dateStartingTimeRetour,
      InformationsAdmin_FinRetour: dateFinishTimeRetour,
    };
    result = dateFin;
  } else {
    result = "";
  }
  return result;
}
"
"console.log('Function 18', context);

return { 'PriseEnCharge_VéhiculeUtiliséRetour': docData['CC_Retour'] == 'true' ? true : null};"
"console.log("Function 20", context);
const newData = {
  ...docData,
};
// here we call the gitlab function
const prices = calculatePrix(newData);
console.log("PRICES ", prices);
// Injection ou retour des résultats en fonction du contexte
if (context?.injectDocData) {
  injectDocData({
    fillData: {
      ...prices,
    },
  });
} else {
  return {
    ...prices,
  };
}
"
"console.log('Function 21', context);


if(docData.CE_CatégorieMission && docData.CE_DébutDeValidité && docData.CE_FinDeValidité) {
    let titre = `${docData.CE_CatégorieMission} (${docData.CE_DébutDeValidité} à ${docData.CE_FinDeValidité})`;
	return { 'LibelléTarif': titre };
}

"
"console.log('Function 24', context);

function formatDate () {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Mois (commence à 0, donc on ajoute 1)
  const day = String(now.getDate()).padStart(2, '0') // Jour
  const hours = String(now.getHours()).padStart(2, '0') // Heure
  const minutes = String(now.getMinutes()).padStart(2, '0') // Minutes
  const seconds = String(now.getSeconds()).padStart(2, '0') // Secondes

  // Retourne la date dans le format demandé
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

if (docData.STATUS === 'Draft') {
  return {
    InformationsAdmin_DateHeureDébut: formatDate(),
    InformationsAdmin_DateHeureFin: formatDate()
  }
}
"
"console.log("Function 25", context);


// Constants
const addressInput = "PriseEnCharge_VéhiculeUtiliséRetour";
const addressValue = docData[inputKey];

// Mission planning date (used only for archived vehicles)
const planificationDate = docData.Planification_Date
  ? new Date(docData.Planification_Date)
  : null;

// Filters for registered vehicles
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

// Filters for archived vehicles
const apiFiltersArchived = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: docData.Maison,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Archivé",
    type: "TEXT",
  },
];

// Fetch vehicle IDs
const getSuggestionsIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    const resArchived = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersArchived,
    });

    const ids = res?.data?.ids || [];
    const archivedIds = resArchived?.data?.ids || [];

    return [...ids, ...archivedIds];
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return [];
  }
};

// Build autocomplete suggestions
const getAutocompleteSuggestions = async (ids) => {
  const res = await api({ local: true }).post("document/id", { ids });
  const documents = res?.data?.documents;

  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const vehicles = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(doc.data);
      } catch {
        return null;
      }

      // Enregistré vehicles are always included
      if (doc.status === "Enregistré") {
        return parsed;
      }

      // Archived vehicles included only if archivage date is after planification date
      if (
        doc.status === "Archivé" &&
        planificationDate &&
        parsed.VehiculeArchivage
      ) {
        const archivageDate = new Date(parsed.VehiculeArchivage);
        if (!isNaN(archivageDate) && archivageDate > planificationDate) {
          return parsed;
        }
      }

      return null;
    })
    .filter(Boolean);

  return vehicles.map((vehicle) => ({
    title: vehicle.Ident_Libellé,
  }));
};

// Main function
const main = async () => {
  const ids = await getSuggestionsIds();

  if (ids.length === 0) {
    callback({
      options: {
        PriseEnCharge_VéhiculeUtiliséRetour: [{}],
      },
    });
    return;
  }

  const filteredSuggestions = await getAutocompleteSuggestions(
    ids.slice(0, 10)
  );

  filteredSuggestions.sort((a, b) =>
    a.title.localeCompare(b.title, "fr", {
      numeric: true,
      sensitivity: "base",
    })
  );

  const options = filteredSuggestions.map((item) => ({
    key: item.title,
    value: item.title,
    text: item.title,
    items: null,
  }));

  callback({
    options: {
      PriseEnCharge_VéhiculeUtiliséRetour: options,
    },
  });
};

main();
``"
"console.log("Function 26", context);
const user = store.moduleStore.user.roles;
const chauffeur = user.includes("1. CHAUFFEUR");
const responsable = user.includes("1. RESPONSABLE D'ACTIVITÉ");
const coordinateur = user.includes("1. COORDINATEUR");
const admin = user.includes("1. ADMIN");
const dev = user.includes("1. DEVELOPPEUR");
const chargeFac = user.includes("1. CHARGÉ DE LA FACTURATION");
// ONLOADMASTER READONLY
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
  "40307eab-5d1b-4ae2-adae-bcd79c11fcd5": "Profil MCR",
};


const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

const result = {};

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (user.includes("1. ADMIN")) {
      if (docData.STATUS !== "Draft") {
        Object.assign(result, {
          Planification_Récurrence: "true",
        });
      }
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
        IdentifiantFacture: "true",
        DateEnregistrement: "true",
        // Section Planification
        CheckboxMineur: "true",
        PriseEnCharge_LatitudeDépartChauffeur: "true",
        PriseEnCharge_LongitudeDépartChauffeur: "true",
        // Section Devis
        SimulateurPrix_PrixInitialSimulé: "true",
        CalculPrix_CalculKilomètrage: "true",
        CalculPrix_NbKMCouvertForfaitPriseEnCharge: "true",
        CalculPrix_PrixForfaitPriseEnChargeEuro: "true",
        CalculPrix_PrixMiniEuro: "true",
        CalculPrix_PrixParKmEuro: "true",
        CalculPrixBis_PrixInitial: "true",
        SimulateurPrix_Prix: "true",
        CalculPrix_Prix: "true",
      });
    } else {
      if (docData.STATUS !== "Draft") {
        Object.assign(result, {
          Planification_Récurrence: "true",
        });
      }
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
        IdentifiantMission: "true",
        IdentifiantFacture: "true",
        DateEnregistrement: "true",
        // Section Planification
        CheckboxMineur: "true",
        PriseEnCharge_LatitudeDépartChauffeur: "true",
        PriseEnCharge_LongitudeDépartChauffeur: "true",
        // Section Devis
        SimulateurPrix_PrixInitialSimulé: "true",
        CalculPrix_CalculKilomètrage: "true",
        CalculPrix_NbKMCouvertForfaitPriseEnCharge: "true",
        CalculPrix_PrixForfaitPriseEnChargeEuro: "true",
        CalculPrix_PrixMiniEuro: "true",
        CalculPrix_PrixParKmEuro: "true",
        CalculPrixBis_PrixInitial: "true",
        SimulateurPrix_Prix: "true",
        CalculPrix_Prix: "true",
      });
    }
    break;
  case "Véhicule":
    Object.assign(result, { Maison: "true" });
    break;
  case "Volontaire":
    Object.assign(result, { Maison: "true" });
    break;
  case "Disponibilité":
    if (responsable || coordinateur || admin || dev || chargeFac) {
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
      });
    } else if (chauffeur) {
      Object.assign(result, {
        Maison: "true",
        IdentifiantDispo: "true",
        PriseEnCharge_VéhiculeUtilisé: "true",
      });
    } else {
      Object.assign(result, { Maison: "true", IdentifiantDispo: "true" });
    }
    break;
  case "Facture":
    if (!["Brouillon", "Draft"].includes(docData.STATUS)) {
      Object.assign(result, {
        FichierPDFFacture: "true",
        DateEnvoi: "true",
        CoorFactu_Prénom: "true",
        CoorFactu_Nom: "true",
        CoorFactu_Qualité: "true",
        Contact_AdresseRésidence: "true",
        CoorFactu_Rue: "true",
        CoorFactu_Numéro: "true",
        "CoorFactu_Code postal": "true",
        CoorFactu_Ville: "true",
        CoorFactu_Pays: "true",
        AllocataireSocial: "true",
        CalculPrix_Remise: "true",
        PrénomSelected: "true",
        Nom: "true",
        DateDeNaissance: "true",
      });
    }
    Object.assign(result, {
      Maison: "true",
      NuméroFacture: "true",
      FactureStatus: "true",
      MontantPayé: "true",
      IdentifiantMission: "true",
      MontantDû: "true",
      MontantInitial: "true",
      MontantRestantDû: "true",
    });
    break;
  case "Tarif":
    Object.assign(result, { LibelléTarif: "true" });
    break;
  case "Bénéficiaire":
    Object.assign(result, {
      DateEnregistrement: "true",
      IdentifiantMission: "true",
    });
    break;
   case "Profil MCR":
    Object.assign(result, {
      Maison: "true",
    });
    break;
}

return result;
"
"console.log("Function 27", context);

// ONLOADMASTER FILL FIELD
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
  "40307eab-5d1b-4ae2-adae-bcd79c11fcd5": "Profil MCR",
};

const { USER } = docData;
const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (mcrDictionary[AREA]) {
      if (docData.STATUS === "Draft") {
        return {
          Maison: mcrDictionary[AREA],
          Téléphones: [{ "Téléphones|2|Téléphone": "" }],
          CalculPrix_Remise: "0",
          CC_Retour: "true",
          CheckboxResterAvecBene: "true",
        };
      }
      return {
        InformationsAdmin_LastKnownDateHeureFin:
          docData.InformationsAdmin_DateHeureFin,
      };
    }
    break;
  case "Facture":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return { Maison: mcrDictionary[AREA] };
    }
    if (docData.Paiements === "0" || !docData.Paiements) {
      return { Maison: mcrDictionary[AREA], Paiements: "1" };
    }
    break;
  case "Véhicule":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return { Maison: mcrDictionary[AREA] };
    }
    break;
  case "Volontaire":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return {
        Maison: mcrDictionary[AREA],
      };
    }
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      return { Maison: mcrDictionary[AREA] };
    }
    break;
  case "Bénéficiaire":
    return {
      IdentifiantMission: docData.FORMID,
    };
    break;
  case "Profil MCR":
    return {
      Maison: mcrDictionary[AREA],
    };
    break;
  default:
    break;
}
"
"console.log("Function 28", context);

// Async functions
const getSuggestionsIds = async (MAISON) => {
  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "VÉHICULE",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: MAISON,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistré",
      type: "TEXT",
    },
  ];
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.warn("Aucun ID trouvé pour le filtre 'ADRESSE'.");
      return [];
    }

    return ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return [];
  }
};

const getAutocompleteSuggestions = async (ids, titleFieldName) => {
  const res2 = await api({ local: true }).post("document/id", { ids });

  const documents = res2?.data?.documents;
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    console.warn("Erreur lors de la récupération des documents.");
    return [];
  }

  // JSON conversion of each document
  const allAddresses = documents
    .map((doc) => {
      if (typeof doc.data !== "string") {
        console.warn(
          "Impossible de parser un document d'adresse, 'doc.data' n'est pas une chaîne :",
          doc
        );
        return null;
      }

      try {
        return JSON.parse(doc.data);
      } catch (e) {
        console.warn("Impossible de parser un document d'adresse :", doc, e);
        return null;
      }
    })
    .filter((d) => d !== null);

  return allAddresses.map((addr) => {
    return {
      title: addr[titleFieldName],
    };
  });
};

// Main function
const addOption = async (fieldName, MAISON, titleFieldName) => {
  // Step 1: Retrieving ids according to filters
  const ids = await getSuggestionsIds(MAISON);

  // If no ids found, return an empty option to reset the field
  if (ids.length === 0) {
    callback({
      options: {
        [fieldName]: [{}],
      },
    });
    return;
  }
  // Step 2: Retrieving documents by their IDs
  const filteredSuggestions = await getAutocompleteSuggestions(
    ids.slice(0, 10),
    titleFieldName
  );

  // Trier les suggestions par ordre alphabétique (lettres et chiffres)
  filteredSuggestions.sort((a, b) => {
    return a.title.localeCompare(b.title, "fr", {
      numeric: true,
      sensitivity: "base",
    });
  });

  console.log("filteredSuggestions", filteredSuggestions);

  // Step 3: Generating options for the field
  const options = filteredSuggestions.map((item) => ({
    key: item.title, // Using 'title' as the unique key
    value: item.title, // Associated value
    text: `${item.title}`, // Displayed text
    items: null, // No sub-options
  }));

  // Step 4: Returning suggestions via callback
  callback({
    options: {
      [fieldName]: options,
    },
  });
};

const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
};

const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

const MAISON = mcrDictionary[AREA];

switch (FORMLAYOUTNAME) {
  case "Mission":
    addOption("PriseEnCharge_VéhiculeUtiliséRetour", MAISON, "Ident_Libellé");
    addOption("PriseEnCharge_VéhiculeUtilisé", MAISON, "Ident_Libellé");
    break;
  case "Facture":
    break;
  case "Véhicule":
    break;
  case "Volontaire":
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    addOption("PriseEnCharge_VéhiculeUtilisé", MAISON, "Ident_Libellé");
    break;
  case "Bénéficiaire":
    break;
  default:
    break;
}
"
"console.log('Function 29', context);

return { 'CC_TempsTrajet': docData['CC_Retour'] == 'true' ? true : null,
 'CC_Arrivée': docData['CC_Retour'] == 'true' ? true : null};"
"console.log("Function 30", context);
// constants
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);
const sessionToken = new google.maps.places.AutocompleteSessionToken();

function toggleLoadingPopup(show, success, errorMessage, loadingMessage) {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      // Création du popup de chargement s'il n'existe pas
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
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
            `;
      document.body.appendChild(loadingPopup);

      // Ajout du CSS pour l'animation du spinner
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
    }
    // Mise à jour ou création du contenu du popup de chargement
    loadingPopup.innerHTML = `
          <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
            <div>${loadingMessage}</div>
            <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
          </div>
        `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
  } else {
    if (loadingPopup) loadingPopup.style.display = "none";
    if (success === false && errorMessage) {
      if (!errorBanner) {
        // Création du banner d'erreur s'il n'existe pas
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
      // Mise à jour ou création du contenu du banner d'erreur
      errorBanner.innerHTML = `
            <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
            <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
          `;
      errorBanner.style.display = "flex";
      // Initialisation ou réinitialisation de la barre de progression
      let progressElement = document.getElementById("errorBannerProgress");
      let width = 0;
      let interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          errorBanner.style.display = "none";
        } else {
          width++;
          progressElement.style.width = width + "%";
        }
      }, 55); // La barre progresse sur 5 secondes
    }
  }
}

const getInputValue = () => {
  return docData["CC_AdresseDépart"];
};

// sync functions
// returns the value of a specific address component based on its type
const getComponent = (addressComponents, type) => {
  return (
    addressComponents.find((component) => component.types.includes(type))
      ?.longText ?? ""
  );
};

// Returns suggestions based on the AdressePreférées collection
const getPreferredAddressSuggestions = () => {
  const suggestions = [];

  for (const item of docData.AdressePreférées) {
    const adresse = item["AdressePreférées|100|Adresse"];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "Dénomination",
            value: item["AdressePreférées|200|Dénomination"] ?? "",
            name: "Dénomination",
          },
          {
            key: "VilleDépart",
            value: item["AdressePreférées|530|Ville"] ?? "",
            name: "Ville",
          },
          {
            key: "CodePostalDépart",
            value: item["AdressePreférées|520|Code_postal"] ?? "",
            name: "Code postal",
          },
          {
            key: "CC_Latitude",
            name: "Latitude",
            value: item["AdressePreférées|800|Latitude"] ?? "",
          },
          {
            key: "CC_Longitude",
            name: "Longitude",
            value: item["AdressePreférées|810|Longitude"] ?? "",
          },
        ],
      });
    }
  }
  return suggestions;
};

// async functions
// Returns a list of suggested places, in order of relevance.
const getGoogleAutocompleteSuggestions = async (address) => {
  const { suggestions } =
    await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
      {
        input: address,
        sessionToken: sessionToken,
        locationRestriction: bounds,
      },
    );
  return suggestions;
};

const getPlacesFromSuggestions = (suggestions) => {
  return suggestions
    .filter((suggestion) => suggestion?.placePrediction)
    .map((suggestion) => suggestion.placePrediction.toPlace());
};

const fetchPlacesFields = async (places) => {
  const promises = places.map((place) =>
    place.fetchFields({
      fields: [
        "formattedAddress",
        "displayName",
        "location",
        "addressComponents",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
      ],
    }),
  );

  await Promise.all(promises);
};

const getPlaceComponents = (place) => {
  const addressComponents = place.addressComponents ?? [];

  return {
    city: getComponent(addressComponents, "locality"),
    postalCode: getComponent(addressComponents, "postal_code"),
  };
};

const buildFormattedSuggestion = (place) => {
  const location = place.location;
  if (!location) return null;

  const formattedAddress = place.formattedAddress ?? "";
  const displayName = place.displayName ?? "";
  const components = getPlaceComponents(place);

  return {
    title: formattedAddress,
    fields: [
      {
        key: "Dénomination",
        name: "Dénomination",
        value:
          displayName && formattedAddress.includes(displayName)
            ? ""
            : displayName,
      },
      {
        key: "CC_Latitude",
        name: "Latitude",
        value: location.lat(),
      },
      {
        key: "CC_Longitude",
        name: "Longitude",
        value: location.lng(),
      },
      {
        key: "VilleDépart",
        name: "Ville",
        value: components.city,
      },
      {
        key: "CodePostalDépart",
        name: "Code postal",
        value: components.postalCode,
      },
      {
        key: "TelephoneNumber",
        name: "Téléphone",
        value:
          place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      },
    ],
  };
};

// Fetches the formatted address and geolocation
// and returns a formatted list containing these fields
const formatSuggestions = async (suggestions) => {
  const places = getPlacesFromSuggestions(suggestions);
  await fetchPlacesFields(places);

  return places
    .map((place) => buildFormattedSuggestion(place))
    .filter((suggestion) => suggestion !== null);
};

// main
const main = async () => {
  const addressValue = getInputValue();
  console.log("30 - addressValue", addressValue);
  let suggestions = [];
  let showErrorBanner = false;
  let errorMessage = "";

  if (addressValue) {
    toggleLoadingPopup(true, true, "", "Recherche en cours...");

    try {
      const googleSuggestions =
        await getGoogleAutocompleteSuggestions(addressValue);

      const formattedSuggestions = await formatSuggestions(googleSuggestions);

      if (formattedSuggestions.length > 0) {
        suggestions = formattedSuggestions;
      } else {
        suggestions = getPreferredAddressSuggestions();
      }
    } catch (error) {
      console.error("30 - google suggestions error", error);
      suggestions = getPreferredAddressSuggestions();
      showErrorBanner = true;
      errorMessage = "Erreur lors de la recherche des adresses.";
    }
  } else {
    suggestions = getPreferredAddressSuggestions();
  }

  console.log("30 - suggestions", suggestions);

  callback({
    suggestions: {
      CC_AdresseDépart: suggestions,
    },
  });

  toggleLoadingPopup(
    false,
    !showErrorBanner,
    showErrorBanner ? errorMessage : "",
    "Recherche en cours...",
  );
};

main();
"
"console.log("Function 32", context);
const safe = (v) => v ?? "";
const isTrue = (value) => value === true || value === "true";
const hasActiveReturn = (mission) =>
  isTrue(mission?.CC_Retour) && !isTrue(mission?.RetourAnnulé);
const getDestinationsCount = (mission) => {
  if (Array.isArray(mission?.CC_Destinations)) {
    return mission.CC_Destinations.length;
  }
  const count = Number(mission?.CC_Destinations);
  return Number.isInteger(count) && count > 0 ? count : 0;
};
const getDestinationField = (mission, index, field) =>
  mission?.[`CC_Destinations|${field}|${index}`] ??
  mission?.CC_Destinations?.[index - 1]?.[`CC_Destinations|${field}`];
// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

/**
 *  Return corresponding day
 * @param {*} dateStr
 * @returns
 */
const getWeekday = (dateStr) => {
  const date = new Date(dateStr);
  const dayIndex = date.getDay();

  // Days of the week in French
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const result = days[dayIndex];
  // console.log("DEBUG - result of getWeekday", days[dayIndex]);

  return result;
};

// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const date = store.pageContentStore.processData[0].edits.DateBatchstep;
const typeTelechargement =
  store.pageContentStore.processData[0].edits.TypeTelechargement;
const resultMcr = getArea();

const rangeDateDebut = "0001-01-01|" + date;
const rangeDateFin = date + "|9999-12-31";

const formatDispobilite = (dispo, date) => {
  const documents = dispo;

  const formatedDocuments = [];
  // console.log("DEBUG - date", date);
  documents.forEach((doc) => {
    const data = doc;

    //console.log('data', data)

    const exceptions = data.Exception_Récurrence
      ? data.Exception_Récurrence.split("|").map(
          (date) => new Date(date).toISOString().split("T")[0],
        )
      : [];

    if (exceptions.includes(date)) {
      return;
    }
    if (
      data.IdentifiantFormulaireRécurrence &&
      data.Planification_Date === date
    ) {
      const newData = {
        ...data,
        Planification_Récurrence: "Une seule fois",
      };
      formatedDocuments.push({
        ...doc,
        data: JSON.stringify(newData),
      });
    } else if (data.Planification_Récurrence === "Une seule fois") {
      formatedDocuments.push({
        ...doc,
      });
    } else if (data.Planification_Récurrence === "Par semaine") {
      const day = getWeekday(date);
      const days = data.Planification_Répéter.split("|");

      if (days.includes(day)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    } else if (data.Planification_Récurrence === "Par jour spécifique") {
      const days = data.Planification_MultiDate.split("|");
      if (days.includes(date)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    }
  });

  return formatedDocuments;
};

// api document/id/filter
const apiFiltersMission = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Supprimé(e)|Refusée|Annulée|Draft",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const apiFiltersDispo = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "Planification_Disponiblité",
    operator: "EQUALS",
    value: "Disponible",
    type: "TEXT",
  },

  {
    key: "InformationsAdmin_DateHeureDébut",
    operator: "BETWEEN",
    value: rangeDateDebut,
    type: "DATETIME",
  },
  {
    key: "InformationsAdmin_DateHeureFin",
    operator: "BETWEEN",
    value: rangeDateFin,
    type: "DATETIME",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const apiFiltersDispo2 = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "Planification_Disponiblité",
    operator: "EQUALS",
    value: "Disponible",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const apiFiltersVehicules = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

// fetch the data of missions
const fetchMissionsData = async (date) => {
  try {
    /* console.log(
      "DEBUG - ---------------------------MISSIONS---------------------------",
    ); */
    // filter by id
    const res2 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMission,
    });
    const idsMission = res2.data.ids;

    // get mission info
    const res3 = await api({ local: true }).post("document/id", {
      ids: idsMission,
    });
    // parse the info
    const missionList = res3.data.documents.map((documentMission) =>
      JSON.parse(documentMission.data),
    );

    const interpretedResult = await recurrence.getDocuments(
      apiFiltersMission,
      [date, date],
      api,
    );
    const result = interpretedResult.data.documents.map((documentMission) => {
      const dataParsed = JSON.parse(documentMission.data);
      return {
        ...dataParsed,
        NUMBER: documentMission.number,
      };
    });
    /* console.log("DEBUG - Missions récupérées", {
      date,
      count: result.length,
      missions: result.map((mission) => ({
        number: mission.NUMBER,
        status: mission.STATUS,
        outboundVehicle: mission.PriseEnCharge_VéhiculeUtilisé,
        returnVehicle: mission.PriseEnCharge_VéhiculeUtiliséRetour,
        returnEnabled: mission.CC_Retour,
        returnCanceled: mission.RetourAnnulé,
      })),
    }); */
    return result;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// get the availability data
const fetchDispoData = async (date) => {
  try {
    /* console.log(
      "DEBUG - ---------------------------AVAILABILITIES---------------------------",
    ); */
    const res = await recurrence.getDocuments(
      apiFiltersDispo2,
      [date, date],
      api,
    );
    // console.log("DEBUG - recurrence.getDocuments", res);

    //parse the info
    const dispoList = res.data.documents.map((documentDispo) =>
      JSON.parse(documentDispo.data),
    );
    return dispoList;
  } catch (error) {
    console.error("Erreur lors des appels API 2", error);
  }
};

// get the available car
const fetchVehiculesData = async () => {
  try {
    // get the ids
    const res6 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersVehicules,
    });
    const idsVehicules = res6.data.ids;

    // get the infos
    const res7 = await api({ local: true }).post("document/id", {
      ids: idsVehicules,
    });
    //parse the infos
    const listeVehic = res7.data.documents.map((documentVehic) =>
      JSON.parse(documentVehic.data),
    );
    return listeVehic;
  } catch (error) {
    console.error("Erreur lors des appels API 3", error);
  }
};

// const for recurrent terms
const surAppel = "SUR APPEL";
const déposer = "Déposer";
const retour = "Retour";
const debutRDV = "Heure de RDV";
const finRDV = "Fin de RDV";
const priseEnCharge = "Prise en charge";
// Initialize some lists
const feuilleDeRoute = [];
const dataDate = [];
const vehiculeMarqueList = [];
const vehiculeTypeList = [];
const vehiculeIdentList = [];
const chauffNomDispo = [];
const missionLieuDepart = [];
const missionLieuArrivee = [];
const missionRecup = [];
const missionArrivee = [];
const titleInfo = [];
// get the right info and creates a pdf (feuille de route)
const createPDF = async (listeTotale) => {
  try {
    // Create table data for the PDF
    const tableDataMissionInfos = [];
    const tableDatasMission = [];
    const tableDataVehicules = [];
    const tableDataMissionVehicule = [];
    // var for when there is no drivers
    let noDriverPrenom = "Aucun";
    let noDriverNom = "Chauffeur";
    // gets the date
    let date =
      listeTotale[0]?.missions[0]?.Planification_Date ||
      listeTotale[0]?.missionsRetour[0]?.Planification_Date;
    // reformat the date
    let dateParts = date.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    let result = [];
    // necessary index
    let i = 0;
    let missionIndex = 0;
    let vehiculeIndex = 0;
    let infoIndex = 0;

    // gets every element of the total list (that contains every related infos)
    listeTotale.forEach((data) => {
      let driverData = data.drivers;
      let missionData = data.missions;
      let missionRetourData = data.missionsRetour;

      // re initialize for next foreach data
      const places = [];
      const nomBenif = [];
      const heures = [];
      const détails = [];
      const vehiculeMarqueList = [];
      const vehiculeTypeList = [];
      const vehiculeImmatList = [];
      const missionLieuDepart = [];
      const materiel = [];
      const nbAccompagnateurs = [];
      const detailsForDriver = [];
      const beneficiaryName = [];
      // verifies if there is data for a driver if yes add to list
      // if no driver available takes default value
      if (driverData.length === 0) {
        chauffNomDispo.push(`${noDriverPrenom} ${noDriverNom}`);
      } else {
        // returns the name of the available driver
        let driversList = driverData.map((driver) => {
          let driverPrenom = driver.PrénomSelected;
          let driverNom = driver.Nom || "";
          let driverStart = driver.InformationsAdmin_DateHeureDébut.split(
            "T",
          )[1].slice(0, 5);
          let driverEnd = driver.InformationsAdmin_DateHeureFin.split(
            "T",
          )[1].slice(0, 5);
          return `${driverPrenom} ${
            driverNom ? driverNom.toUpperCase() : ""
          } | ${driverStart} - ${driverEnd}`;
        });
        // if more than one driver available we concat
        if (driverData.length > 1) {
          chauffNomDispo.push(driversList.join(" & "));
        } else {
          chauffNomDispo.push(driversList);
        }
      }
      /********** PARSE THROUGH MISSION FOR ALLER DATA **************/
      // parse through every mission data
      missionData.forEach((mission) => {
        // constant needed
        const {
          MatérielAPrévoir,
          CC_NbAccompagnateur,
          PrénomSelected,
          NomFormMission,
          InformationsPourLeChauffeur,
          PriseEnCharge_LieuDépartChauffeur,
          CC_Retour,
          CC_Arrivée,
          PriseEnCharge_VéhiculeUtiliséRetour,
          PriseEnCharge_VéhiculeUtilisé,
          checkboxBeneKg,
          MobilitéDuBénéficiaire,
          TPMR,
          Motif,
          CheckboxResterAvecBene,
          NUMBER,
          CC_AdresseDépart,
          Catégorie,
        } = mission;
        const isRDVPec =
          mission?.TypeTransport === "RDV au lieu de prise en charge"
            ? true
            : false;
        const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";
        // console.log("DEBUG - MISSION INFO TEST", mission);
        // gets the value of checkbox bene,
        let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
        let checkboxBeneValue =
          CheckboxResterAvecBene === "true"
            ? "Rester sur place avec le bénéficiaire"
            : "Non";
        let motifValue = Motif ? Motif : "...";
        let detailsToAdd;
        if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
          detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        } else {
          detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        }

        /* here we push the mission information for 3rd table */
        // if we have the info push it else push ...
        beneficiaryName.push(
          `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
        );
        MatérielAPrévoir
          ? materiel.push(MatérielAPrévoir)
          : materiel.push("Aucun");
        CC_NbAccompagnateur
          ? nbAccompagnateurs.push(CC_NbAccompagnateur)
          : nbAccompagnateurs.push("...");
        if (
          hasActiveReturn(mission) &&
          mission.PriseEnCharge_VéhiculeUtilisé ===
            mission.PriseEnCharge_VéhiculeUtiliséRetour
        ) {
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Aller-Retour  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(`Aller-Retour  ${detailsToAdd}`);
        } else if (
          hasActiveReturn(mission) &&
          mission.PriseEnCharge_VéhiculeUtilisé !==
            mission.PriseEnCharge_VéhiculeUtiliséRetour
        ) {
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Aller - Retour effectué par un autre véhicule  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(
                `Aller - Retour effectué par un autre véhicule  ${detailsToAdd}`,
              );
        } else {
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Aller  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(`Aller  ${detailsToAdd}`);
        }

        // starting place of mission
        missionLieuDepart.push(PriseEnCharge_LieuDépartChauffeur);
        // for the size of the collection
        let destinationsCount = getDestinationsCount(mission);
        const phoneDepart = mission.TelephoneNumber
          ? ` (${mission.TelephoneNumber}) `
          : "";
        // push the first arrival infos
        places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
        nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
        heures.push(mission.CC_Récupération);
        isRDVPec
          ? détails.push("RDV Prise en charge")
          : détails.push(priseEnCharge);

        /*** PARSE THROUGH MISSION DESTINATIONS TO FILL THE TABLE  *********/
        for (let j = 1; j <= destinationsCount; j++) {
          // dynamic keys to get the right line
          let destinationAdresse = getDestinationField(
            mission,
            j,
            "100|Adresse",
          );
          let phoneDestination = getDestinationField(
            mission,
            j,
            "920|Telephone",
          );
          let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
          let destinationDebarquement = getDestinationField(
            mission,
            j,
            "300|Arrivée",
          );
          let destinationEmbarquement = getDestinationField(
            mission,
            j,
            "700|Récupération",
          );
          let destinationDenomination = getDestinationField(
            mission,
            j,
            "110|Dénomination",
          );
          const denomination = destinationDenomination
            ? ` - ${destinationDenomination}`
            : "";
          // if we have info for unloading
          if (
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            destinationDebarquement
          ) {
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationDebarquement);
            isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
          }
          // if we have info for loading
          if (
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            destinationEmbarquement
          ) {
            if (
              /*if we are at last item of collection with a return from different car
                               dont take value next car will have it  */
              j == destinationsCount &&
              (!hasActiveReturn(mission) ||
                PriseEnCharge_VéhiculeUtilisé !==
                  PriseEnCharge_VéhiculeUtiliséRetour)
            ) {
              // do nothing in that case
              return;
            } else {
              // take the info normally
              places.push(`${destinationAdresse}${denomination}${phoneDest}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(destinationEmbarquement);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            }
          }

          // if the driver is on call
          if (
            // if on call for final loading and unloading
            j == destinationsCount &&
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            hasActiveReturn(mission) &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            PriseEnCharge_VéhiculeUtilisé ===
              PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationDebarquement &&
            !destinationEmbarquement &&
            !CC_Arrivée
          ) {
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Dépose") : détails.push(retour);
          } else if (
            // if on call for final loading only
            j == destinationsCount &&
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            hasActiveReturn(mission) &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            PriseEnCharge_VéhiculeUtilisé ===
              PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationDebarquement &&
            !destinationEmbarquement &&
            CC_Arrivée
          ) {
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
          } else if (
            // if on call for final unloading only
            j == destinationsCount &&
            destinationAdresse &&
            PrénomSelected &&
            NomFormMission &&
            hasActiveReturn(mission) &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            PriseEnCharge_VéhiculeUtilisé ===
              PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationDebarquement &&
            destinationEmbarquement &&
            !CC_Arrivée
          ) {
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
          }
        }
        // if there is a return with same car do as normal
        if (
          hasActiveReturn(mission) &&
          CC_Arrivée &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtiliséRetour === PriseEnCharge_VéhiculeUtilisé
        ) {
          places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(CC_Arrivée);
          détails.push(retour);
        }
      });

      // verifies if there is a return data
      // if not do nothing
      if (missionRetourData.length === 0) {
      } else {
        /*******************PARSE THROUGH MISSION RETURN ONLY ***********/
        missionRetourData.forEach((missionRetour) => {
          if (!hasActiveReturn(missionRetour)) return;
          // console.log("DEBUG - WE HAVE A RETURN ");
          // constants needed for missionRetour 3rd table informations
          const {
            CC_AdresseDépart,
            CC_Arrivée,
            CC_Destinations,
            PriseEnCharge_VéhiculeUtiliséRetour,
            PriseEnCharge_VéhiculeUtilisé,
            MatérielAPrévoir,
            CC_NbAccompagnateur,
            PrénomSelected,
            NomFormMission,
            InformationsPourLeChauffeur,
            checkboxBeneKg,
            MobilitéDuBénéficiaire,
            TPMR,
            Motif,
            CheckboxResterAvecBene,
            NUMBER,
            Catégorie,
          } = missionRetour;
          const isRDVPec =
            missionRetour?.TypeTransport === "RDV au lieu de prise en charge"
              ? true
              : false;
          const deno = missionRetour.Dénomination
            ? ` - ${missionRetour.Dénomination}`
            : "";
          const phoneDepart = missionRetour.TelephoneNumber
            ? ` (${missionRetour.TelephoneNumber})`
            : "";
          let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
          let motifValue = Motif ? Motif : "...";
          let checkboxBeneValue =
            CheckboxResterAvecBene === "true"
              ? "Rester sur place avec le bénéficiaire"
              : "Non";
          let detailsToAdd;
          if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
            detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
          } else {
            detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
          }
          let destinationsReturnCount = getDestinationsCount(missionRetour);
          /* here we push the mission information for 3rd table */
          if (
            missionRetour.CC_Retour === "true" &&
            missionRetour.PriseEnCharge_VéhiculeUtilisé !==
              missionRetour.PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            // if we have the info push it else push ...
            beneficiaryName.push(
              `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
            );
            MatérielAPrévoir
              ? materiel.push(MatérielAPrévoir)
              : materiel.push("Aucun");
            CC_NbAccompagnateur
              ? nbAccompagnateurs.push(CC_NbAccompagnateur)
              : nbAccompagnateurs.push("...");
            InformationsPourLeChauffeur
              ? detailsForDriver.push(
                  `Retour  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
                )
              : detailsForDriver.push(`Retour  ${detailsToAdd}`);
          }
          // parse through every collection list but only need last line (j == destinationReturnCount)
          for (let j = 1; j <= destinationsReturnCount; j++) {
            // console.log("DEBUG - TESTRETURN");
            let destinationReturnEmbarquement = getDestinationField(
              missionRetour,
              j,
              "700|Récupération",
            );
            let phoneDestination = getDestinationField(
              missionRetour,
              j,
              "920|Telephone",
            );
            let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
            let destinationReturnAdresse = getDestinationField(
              missionRetour,
              j,
              "100|Adresse",
            );
            let destinationDenomination = getDestinationField(
              missionRetour,
              j,
              "110|Dénomination",
            );
            const denomination = destinationDenomination
              ? ` - ${destinationDenomination}`
              : "";
            /* console.log("DEBUG - TEST VAR", {
              j,
              destinationsReturnCount,
              CC_AdresseDépart,
              CC_Arrivée,
              destinationReturnEmbarquement,
              PriseEnCharge_VéhiculeUtilisé,
              PriseEnCharge_VéhiculeUtiliséRetour,
            }); */

            if (
              // if loading and unloading info is there
              CC_AdresseDépart &&
              CC_Arrivée &&
              PriseEnCharge_VéhiculeUtiliséRetour &&
              destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A1");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(destinationReturnEmbarquement);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(CC_Arrivée);
              détails.push(retour);
            } else if (
              // if only loading info is there (SUR APPEL) for unloading
              CC_AdresseDépart &&
              PriseEnCharge_VéhiculeUtiliséRetour &&
              !CC_Arrivée &&
              destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A2");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(destinationReturnEmbarquement);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              détails.push(retour);
            } else if (
              // if only unloading info is there (SUR APPEL) for loading
              PriseEnCharge_VéhiculeUtiliséRetour &&
              CC_AdresseDépart &&
              CC_Arrivée &&
              !destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A3");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(CC_Arrivée);
              détails.push(retour);
            } else if (
              // if no info for both loading and unloading (SUR APPEL) for both
              PriseEnCharge_VéhiculeUtiliséRetour &&
              CC_AdresseDépart &&
              !CC_Arrivée &&
              !destinationReturnEmbarquement &&
              j == destinationsReturnCount &&
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour
            ) {
              // console.log("DEBUG - A4");
              places.push(
                `${destinationReturnAdresse}${denomination}${phoneDest}`,
              );
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
              places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
              nomBenif.push(
                `${PrénomSelected} ${NomFormMission.toUpperCase()}`,
              );
              heures.push(surAppel);
              détails.push(retour);
            }
          }
        });
      }

      // push the vehicule in the list
      let vehiculeMarque = data.vehicule.Ident_Marque;
      let vehiculeModèle = data.vehicule.Ident_Modèle;
      let vehiculeImmat = data.vehicule.Ident_NuméroImmat;
      let vehiculeIdent = data.vehicule.Ident_Libellé;
      vehiculeMarqueList.push(vehiculeMarque);
      vehiculeTypeList.push(vehiculeModèle);
      vehiculeImmatList.push(vehiculeImmat);
      vehiculeIdentList.push(vehiculeIdent);
      // title of feuille de route incremented every feuille de route
      let feuilleRoute = `Feuille de route de ${vehiculeIdentList[i]}`;
      titleInfo.push(feuilleRoute);

      // create a new entry for tableDataMissionInfos
      tableDataMissionInfos.push({
        headers: [
          "Bénéficiaire",
          "Accompagnateurs",
          "Matériel à prévoir",
          "Détails",
        ],
        rows: [],
      });

      // create a new entry for tableDatasMission
      tableDatasMission.push({
        headers: ["Détails", "Bénéficiaire", "Heure", "Emplacement"],
        rows: [],
      });
      // create a new entry for tableDataVehicules
      tableDataVehicules.push({
        headers: ["Marque", "Type", "Immatriculation"],
        rows: [],
      });

      // converts time in minutes except SUR APPEL
      const convertToMinutes = (heure) => {
        if (!heure || typeof heure !== "string") return Infinity;

        if (heure === "SUR APPEL") return Infinity;

        const parts = heure.split(":");
        if (parts.length !== 2) return Infinity;

        const [hours, minutes] = parts.map(Number);

        if (isNaN(hours) || isNaN(minutes)) return Infinity;

        return hours * 60 + minutes;
      };

      const sortedIndices = heures
        .map((heure, index) => ({
          index,
          minutes: convertToMinutes(heure),
        }))
        .sort((a, b) => a.minutes - b.minutes)
        .map((item) => item.index);

      // apply the right order of minutes
      const sortedDétails = sortedIndices.map((index) => détails[index]);
      const sortedNomBenif = sortedIndices.map((index) => nomBenif[index]);
      const sortedHeures = sortedIndices.map((index) => heures[index]);
      const sortedPlaces = sortedIndices.map((index) => places[index]);
      // we loop and add the mission infos to list
      for (let b = 0; b < détails.length; b++) {
        // new entry
        tableDatasMission[missionIndex].rows.push([
          safe(`${b + 1}. ${sortedDétails[b] || "..."}`),
          safe(sortedNomBenif[b] || "Bénéficiaire inconnu"),
          safe(sortedHeures[b] || "Heure inconnue"),
          safe(sortedPlaces[b] || "Lieu non renseigné"),
        ]);
      }
      /* console.log("DEBUG - Étapes assemblées pour le véhicule", {
        vehicle: data.vehicule.Ident_Libellé,
        missionNumbers: missionData.map((mission) => mission.NUMBER),
        returnMissionNumbers: missionRetourData.map(
          (mission) => mission.NUMBER,
        ),
        routeRows: tableDatasMission[missionIndex].rows,
      }); */
      missionIndex++;

      // this part is to give the same order of name to the tableDataMissionInfo
      const normalizeName = (name) => name?.split(" (")[0].trim();
      const orderedNames = [];
      const seen = new Set();

      for (const name of sortedNomBenif) {
        const key = normalizeName(name);

        if (!seen.has(key)) {
          seen.add(key);
          orderedNames.push(key);
        }
      }

      const infoIndexByName = {};

      for (let i = 0; i < beneficiaryName.length; i++) {
        const key = normalizeName(beneficiaryName[i]);

        if (infoIndexByName[key] === undefined) {
          infoIndexByName[key] = i;
        }
      }
      for (const name of orderedNames) {
        const i = infoIndexByName[name];
        if (i === undefined) continue;

        tableDataMissionInfos[infoIndex].rows.push([
          safe(beneficiaryName[i]),
          safe(nbAccompagnateurs[i]),
          safe(materiel[i]),
          safe(detailsForDriver[i]),
        ]);
      }
      /*
      // we loop and add the individual informations of mission to list
      for (let b = 0; b < nbAccompagnateurs.length; b++) {
        // new entry
        tableDataMissionInfos[infoIndex].rows.push([
          beneficiaryName[b],
          nbAccompagnateurs[b],
          materiel[b],
          detailsForDriver[b],
        ]);
      }
        */
      infoIndex++;
      // we loop and add the vehicles infos to list
      for (let b = 0; b < vehiculeMarqueList.length; b++) {
        // new entry
        tableDataVehicules[vehiculeIndex].rows.push([
          safe(vehiculeMarqueList[b]),
          safe(vehiculeTypeList[b]),
          safe(vehiculeImmatList[b]),
        ]);
      }
      vehiculeIndex++;
      i++;
    });

    // fill the result part of ods file with right info
    for (let b = 0; b < listeTotale.length; b++) {
      let feuilleInfo;
      feuilleInfo = `{ "Name": "Chauffeur(s): ${chauffNomDispo[b]}", "Title": "${titleInfo[b]}", "Date": "Date: ${dateFormatee}"}`;
      result.push(feuilleInfo); // return it to result list
    }
    // add to the megalist (missioninfo1, vehicleinfo1),....
    for (let m = 0; m < listeTotale.length; m++) {
      tableDataMissionVehicule.push([
        tableDatasMission[m],
        tableDataVehicules[m],
        tableDataMissionInfos[m],
      ]);
    }
    /* console.log(
      "DEBUG - ALL NEEDED PARAMS : DATA, SHEETNAMES, TABLEDATAS",
      result,
      titleInfo,
      tableDataMissionVehicule,
    ); */
    tableDataMissionVehicule.forEach((feuille, feuilleIndex) => {
      feuille.forEach((table, tableIndex) => {
        table.rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell == null || cell === "") {
              console.warn(`❗ Cellule vide trouvée :
            - Feuille : ${feuilleIndex + 1} (${titleInfo[feuilleIndex]})
            - Table : ${["Mission", "Véhicule", "Infos"][tableIndex]}
            - Ligne : ${rowIndex + 1}
            - Colonne : ${cellIndex + 1}
            - Valeur : ${cell}`);
            }
          });
        });
      });
    });

    // api call
    const res10 = await api({ local: true }).post(
      "document/download/sheets/FeuilleDeRoute/pdf/FeuilleDeRoute",
      {
        sheets: [
          {
            name: "RouteSheet",
            datas: result,
            sheetNames: titleInfo,
            tableDatas: tableDataMissionVehicule,
          },
        ],
      },
    );

    // gets the url name and file name
    const fileUrl = res10.data.fileUrl;
    const fileName = fileUrl.split("/").pop();
    if (fileUrl) {
      // creates a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.error("URL du fichier non trouvée dans la réponse.");
    }
  } catch (error) {
    console.error("Erreur", error);
  }
};

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// function to show the popup loading while waiting for api
const showPopupLoadingWaiting = () => {
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
                  <div>Génération en cours</div>
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

const downloadAllPDFsAsZip = async () => {
  const zip = new JSZip();

  for (const { path, filename } of pdfList) {
    try {
      const response = await fetch(path);
      // console.log("DEBUG - RESPONSE ", response);
      const blob = await response.blob();
      // console.log("DEBUG - BLOB ", blob);
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${filename}`, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `FDR_${date}.zip`);
  });
};

const pdfList = [];
// get the right info and creates a pdf (feuille de route)
const createPDFIndividual = async (mission) => {
  try {
    const vehiculeIdentList = [];
    const chauffNomDispo = [];
    const titleInfo = [];
    // Create table data for the PDF
    const tableDataMissionInfos = [];
    const tableDatasMission = [];
    const tableDataVehicules = [];
    const tableDataMissionVehicule = [];
    // var for when there is no drivers
    let noDriverPrenom = "Aucun";
    let noDriverNom = "Chauffeur";
    // gets the date
    let date =
      mission?.missions[0]?.Planification_Date ||
      mission?.missionsRetour[0]?.Planification_Date;
    // reformat the date
    let dateParts = date.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    let result = [];
    // necessary index
    let i = 0;
    let missionIndex = 0;
    let vehiculeIndex = 0;
    let infoIndex = 0;

    let driverData = mission.drivers;
    let missionData = mission.missions;
    let missionRetourData = mission.missionsRetour;

    // re initialize for next foreach data
    const places = [];
    const nomBenif = [];
    const heures = [];
    const détails = [];
    const vehiculeMarqueList = [];
    const vehiculeTypeList = [];
    const vehiculeImmatList = [];
    const missionLieuDepart = [];
    const materiel = [];
    const nbAccompagnateurs = [];
    const detailsForDriver = [];
    const beneficiaryName = [];
    // verifies if there is data for a driver if yes add to list
    // if no driver available takes default value
    if (driverData.length === 0) {
      chauffNomDispo.push(`${noDriverPrenom} ${noDriverNom}`);
    } else {
      // returns the name of the available driver
      let driversList = driverData.map((driver) => {
        let driverPrenom = driver.PrénomSelected;
        let driverNom = driver.Nom || "";
        let driverStart = driver.InformationsAdmin_DateHeureDébut.split(
          "T",
        )[1].slice(0, 5);
        let driverEnd = driver.InformationsAdmin_DateHeureFin.split(
          "T",
        )[1].slice(0, 5);
        return `${driverPrenom} ${
          driverNom ? driverNom.toUpperCase() : ""
        } | ${driverStart} - ${driverEnd}`;
      });
      // if more than one driver available we concat
      if (driverData.length > 1) {
        chauffNomDispo.push(driversList.join(" & "));
      } else {
        chauffNomDispo.push(driversList);
      }
    }
    /********** PARSE THROUGH MISSION FOR ALLER DATA **************/
    // parse through every mission data
    missionData.forEach((mission) => {
      // constant needed
      const {
        MatérielAPrévoir,
        CC_NbAccompagnateur,
        PrénomSelected,
        NomFormMission,
        InformationsPourLeChauffeur,
        PriseEnCharge_LieuDépartChauffeur,
        CC_Retour,
        CC_Arrivée,
        PriseEnCharge_VéhiculeUtiliséRetour,
        PriseEnCharge_VéhiculeUtilisé,
        checkboxBeneKg,
        MobilitéDuBénéficiaire,
        TPMR,
        Motif,
        CheckboxResterAvecBene,
        NUMBER,
        CC_AdresseDépart,
        Catégorie,
      } = mission;
      const isRDVPec =
        mission?.TypeTransport === "RDV au lieu de prise en charge"
          ? true
          : false;
      const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";
      // console.log("DEBUG - MISSION INFO TEST", mission);
      // gets the value of checkbox bene,
      let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
      let checkboxBeneValue =
        CheckboxResterAvecBene === "true"
          ? "Rester sur place avec le bénéficiaire"
          : "Non";
      let motifValue = Motif ? Motif : "...";
      let detailsToAdd;
      if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
        detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
      } else {
        detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
      }

      /* here we push the mission information for 3rd table */
      // if we have the info push it else push ...
      beneficiaryName.push(
        `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
      );
      MatérielAPrévoir
        ? materiel.push(MatérielAPrévoir)
        : materiel.push("Aucun");
      CC_NbAccompagnateur
        ? nbAccompagnateurs.push(CC_NbAccompagnateur)
        : nbAccompagnateurs.push("...");
      if (
        hasActiveReturn(mission) &&
        mission.PriseEnCharge_VéhiculeUtilisé ===
          mission.PriseEnCharge_VéhiculeUtiliséRetour
      ) {
        InformationsPourLeChauffeur
          ? detailsForDriver.push(
              `Aller-Retour  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
            )
          : detailsForDriver.push(`Aller-Retour  ${detailsToAdd}`);
      } else if (
        hasActiveReturn(mission) &&
        mission.PriseEnCharge_VéhiculeUtilisé !==
          mission.PriseEnCharge_VéhiculeUtiliséRetour
      ) {
        InformationsPourLeChauffeur
          ? detailsForDriver.push(
              `Aller - Retour effectué par un autre véhicule ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
            )
          : detailsForDriver.push(
              `Aller - Retour effectué par un autre véhicule ${detailsToAdd}`,
            );
      } else {
        InformationsPourLeChauffeur
          ? detailsForDriver.push(
              `Aller  ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
            )
          : detailsForDriver.push(`Aller  ${detailsToAdd}`);
      }

      // starting place of mission
      missionLieuDepart.push(PriseEnCharge_LieuDépartChauffeur);
      // for the size of the collection
      let destinationsCount = getDestinationsCount(mission);
      const phoneDepart = mission.TelephoneNumber
        ? ` (${mission.TelephoneNumber}) `
        : "";
      // push the first arrival infos
      places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
      nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
      heures.push(mission.CC_Récupération);
      isRDVPec
        ? détails.push("RDV Prise en charge")
        : détails.push(priseEnCharge);

      /*** PARSE THROUGH MISSION DESTINATIONS TO FILL THE TABLE  *********/
      for (let j = 1; j <= destinationsCount; j++) {
        // dynamic keys to get the right line
        let destinationAdresse = getDestinationField(mission, j, "100|Adresse");
        let destinationDebarquement = getDestinationField(
          mission,
          j,
          "300|Arrivée",
        );
        let phoneDestination = getDestinationField(mission, j, "920|Telephone");
        let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
        let destinationEmbarquement = getDestinationField(
          mission,
          j,
          "700|Récupération",
        );
        let destinationDenomination = getDestinationField(
          mission,
          j,
          "110|Dénomination",
        );
        const denomination = destinationDenomination
          ? ` - ${destinationDenomination}`
          : "";
        // if we have info for unloading
        if (
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          destinationDebarquement
        ) {
          places.push(`${destinationAdresse}${denomination}${phoneDest}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(destinationDebarquement);
          isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
        }
        // if we have info for loading
        if (
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          destinationEmbarquement
        ) {
          if (
            /*if we are at last item of collection with a return from different car
                               dont take value next car will have it  */
            j == destinationsCount &&
            (!hasActiveReturn(mission) ||
              PriseEnCharge_VéhiculeUtilisé !==
                PriseEnCharge_VéhiculeUtiliséRetour)
          ) {
            // do nothing in that case
            return;
          } else {
            // take the info normally
            places.push(`${destinationAdresse}${denomination}${phoneDest}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationEmbarquement);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
          }
        }

        // if the driver is on call
        if (
          // if on call for final loading and unloading
          j == destinationsCount &&
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          hasActiveReturn(mission) &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtilisé ===
            PriseEnCharge_VéhiculeUtiliséRetour &&
          destinationDebarquement &&
          !destinationEmbarquement &&
          !CC_Arrivée
        ) {
          places.push(`${destinationAdresse}${denomination}${phoneDest}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
          places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Dépose") : détails.push(retour);
        } else if (
          // if on call for final loading only
          j == destinationsCount &&
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          hasActiveReturn(mission) &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtilisé ===
            PriseEnCharge_VéhiculeUtiliséRetour &&
          destinationDebarquement &&
          !destinationEmbarquement &&
          CC_Arrivée
        ) {
          places.push(`${destinationAdresse}${denomination}${phoneDest}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
        } else if (
          // if on call for final unloading only
          j == destinationsCount &&
          destinationAdresse &&
          PrénomSelected &&
          NomFormMission &&
          hasActiveReturn(mission) &&
          PriseEnCharge_VéhiculeUtiliséRetour &&
          PriseEnCharge_VéhiculeUtilisé ===
            PriseEnCharge_VéhiculeUtiliséRetour &&
          destinationDebarquement &&
          destinationEmbarquement &&
          !CC_Arrivée
        ) {
          places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
          nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
          heures.push(surAppel);
          isRDVPec ? détails.push("Dépose") : détails.push(debutRDV);
        }
      }
      // if there is a return with same car do as normal
      if (
        hasActiveReturn(mission) &&
        CC_Arrivée &&
        PriseEnCharge_VéhiculeUtiliséRetour &&
        PriseEnCharge_VéhiculeUtiliséRetour === PriseEnCharge_VéhiculeUtilisé
      ) {
        places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
        nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
        heures.push(CC_Arrivée);
        détails.push(retour);
      }
    });
    // verifies if there is a return data
    // if not do nothing
    if (missionRetourData.length === 0) {
    } else {
      /*******************PARSE THROUGH MISSION RETURN ONLY ***********/
      missionRetourData.forEach((missionRetour) => {
        if (!hasActiveReturn(missionRetour)) return;
        // constants needed for missionRetour 3rd table informations
        const {
          CC_AdresseDépart,
          CC_Arrivée,
          CC_Destinations,
          PriseEnCharge_VéhiculeUtiliséRetour,
          PriseEnCharge_VéhiculeUtilisé,
          MatérielAPrévoir,
          CC_NbAccompagnateur,
          PrénomSelected,
          NomFormMission,
          InformationsPourLeChauffeur,
          checkboxBeneKg,
          MobilitéDuBénéficiaire,
          TPMR,
          Motif,
          CheckboxResterAvecBene,
          NUMBER,
          Catégorie,
        } = missionRetour;
        const isRDVPec =
          missionRetour?.TypeTransport === "RDV au lieu de prise en charge"
            ? true
            : false;
        const deno = missionRetour.Dénomination
          ? ` - ${missionRetour.Dénomination}`
          : "";
        const phoneDepart = missionRetour.TelephoneNumber
          ? ` (${missionRetour.TelephoneNumber})`
          : "";
        let checkboxValue = checkboxBeneKg === "true" ? "Oui" : "Non";
        let motifValue = Motif ? Motif : "...";
        let checkboxBeneValue =
          CheckboxResterAvecBene === "true"
            ? "Rester sur place avec le bénéficiaire"
            : "Non";
        let detailsToAdd;
        if (checkboxBeneValue === "Rester sur place avec le bénéficiaire") {
          detailsToAdd = `\n${checkboxBeneValue}\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        } else {
          detailsToAdd = `\nPlus de 100kg?: ${checkboxValue}\nMobilité: ${MobilitéDuBénéficiaire}\nTPMR: ${TPMR}\nMotif: ${motifValue}\nCatégorie: ${Catégorie}`;
        }
        let destinationsReturnCount = getDestinationsCount(missionRetour);
        /* here we push the mission information for 3rd table */
        if (
          missionRetour.CC_Retour === "true" &&
          missionRetour.PriseEnCharge_VéhiculeUtilisé !==
            missionRetour.PriseEnCharge_VéhiculeUtiliséRetour
        ) {
          // if we have the info push it else push ...
          beneficiaryName.push(
            `${PrénomSelected} ${NomFormMission.toUpperCase()} (${NUMBER})`,
          );
          MatérielAPrévoir
            ? materiel.push(MatérielAPrévoir)
            : materiel.push("Aucun");
          CC_NbAccompagnateur
            ? nbAccompagnateurs.push(CC_NbAccompagnateur)
            : nbAccompagnateurs.push("...");
          InformationsPourLeChauffeur
            ? detailsForDriver.push(
                `Retour ${detailsToAdd} \n${InformationsPourLeChauffeur}`,
              )
            : detailsForDriver.push(`Retour  ${detailsToAdd}`);
        }
        // parse through every collection list but only need last line (j == destinationReturnCount)
        for (let j = 1; j <= destinationsReturnCount; j++) {
          let destinationReturnEmbarquement = getDestinationField(
            missionRetour,
            j,
            "700|Récupération",
          );
          let destinationReturnAdresse = getDestinationField(
            missionRetour,
            j,
            "100|Adresse",
          );
          let phoneDestination = getDestinationField(
            missionRetour,
            j,
            "920|Telephone",
          );
          let phoneDest = phoneDestination ? ` (${phoneDestination})` : "";
          let destinationDenomination = getDestinationField(
            missionRetour,
            j,
            "110|Dénomination",
          );
          const denomination = destinationDenomination
            ? ` - ${destinationDenomination}`
            : "";
          if (
            // if loading and unloading info is there
            CC_AdresseDépart &&
            CC_Arrivée &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationReturnEmbarquement);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(CC_Arrivée);
            détails.push(retour);
          } else if (
            // if only loading info is there (SUR APPEL) for unloading
            CC_AdresseDépart &&
            PriseEnCharge_VéhiculeUtiliséRetour &&
            !CC_Arrivée &&
            destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(destinationReturnEmbarquement);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            détails.push(retour);
          } else if (
            // if only unloading info is there (SUR APPEL) for loading
            PriseEnCharge_VéhiculeUtiliséRetour &&
            CC_AdresseDépart &&
            CC_Arrivée &&
            !destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(CC_Arrivée);
            détails.push(retour);
          } else if (
            // if no info for both loading and unloading (SUR APPEL) for both
            PriseEnCharge_VéhiculeUtiliséRetour &&
            CC_AdresseDépart &&
            !CC_Arrivée &&
            !destinationReturnEmbarquement &&
            j == destinationsReturnCount &&
            PriseEnCharge_VéhiculeUtilisé !==
              PriseEnCharge_VéhiculeUtiliséRetour
          ) {
            places.push(
              `${destinationReturnAdresse}${denomination}${phoneDest}`,
            );
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            isRDVPec ? détails.push("Récupération") : détails.push(finRDV);
            places.push(`${CC_AdresseDépart}${deno}${phoneDepart}`);
            nomBenif.push(`${PrénomSelected} ${NomFormMission.toUpperCase()}`);
            heures.push(surAppel);
            détails.push(retour);
          }
        }
      });
    }

    // push the vehicule in the list
    let vehiculeMarque = mission.vehicule.Ident_Marque;
    let vehiculeModèle = mission.vehicule.Ident_Modèle;
    let vehiculeImmat = mission.vehicule.Ident_NuméroImmat;
    let vehiculeIdent = mission.vehicule.Ident_Libellé;
    vehiculeMarqueList.push(vehiculeMarque);
    vehiculeTypeList.push(vehiculeModèle);
    vehiculeImmatList.push(vehiculeImmat);
    vehiculeIdentList.push(vehiculeIdent);
    // title of feuille de route incremented every feuille de route
    let feuilleRoute = `Feuille de route de ${vehiculeIdentList[i]}`;
    titleInfo.push(feuilleRoute);

    // create a new entry for tableDataMissionInfos
    tableDataMissionInfos.push({
      headers: [
        "Bénéficiaire",
        "Accompagnateurs",
        "Matériel à prévoir",
        "Détails",
      ],
      rows: [],
    });

    // create a new entry for tableDatasMission
    tableDatasMission.push({
      headers: ["Détails", "Bénéficiaire", "Heure", "Emplacement"],
      rows: [],
    });
    // create a new entry for tableDataVehicules
    tableDataVehicules.push({
      headers: ["Marque", "Type", "Immatriculation"],
      rows: [],
    });

    // converts time in minutes except SUR APPEL
    const convertToMinutes = (heure) => {
      if (heure === "SUR APPEL") {
        return Infinity; // "SUR APPEL" always placed at the end
      }
      const [hours, minutes] = heure.split(":").map(Number);
      return hours * 60 + minutes; // return total minutes
    };

    // filter the hours to place it in order in table
    const sortedIndices = heures
      .map((heure, index) => {
        const minutes = convertToMinutes(heure);
        return { heure, index, minutes };
      })
      .sort((a, b) => a.minutes - b.minutes)
      .map((item) => item.index); // get the index

    // apply the right order of minutes
    const sortedDétails = sortedIndices.map((index) => détails[index]);
    const sortedNomBenif = sortedIndices.map((index) => nomBenif[index]);
    const sortedHeures = sortedIndices.map((index) => heures[index]);
    const sortedPlaces = sortedIndices.map((index) => places[index]);
    // we loop and add the mission infos to list
    for (let b = 0; b < détails.length; b++) {
      // new entry
      tableDatasMission[missionIndex].rows.push([
        safe(`${b + 1}. ${sortedDétails[b] || "..."}`),
        safe(sortedNomBenif[b] || "Bénéficiaire inconnu"),
        safe(sortedHeures[b] || "Heure inconnue"),
        safe(sortedPlaces[b] || "Lieu non renseigné"),
      ]);
    }
    /* console.log("DEBUG - Étapes assemblées pour le véhicule", {
      vehicle: mission.vehicule.Ident_Libellé,
      missionNumbers: missionData.map((item) => item.NUMBER),
      returnMissionNumbers: missionRetourData.map((item) => item.NUMBER),
      routeRows: tableDatasMission[missionIndex].rows,
    }); */
    missionIndex++;

    // this part is to give the same order of name to the tableDataMissionInfo
    const normalizeName = (name) => name?.split(" (")[0].trim();
    const orderedNames = [];
    const seen = new Set();

    for (const name of sortedNomBenif) {
      const key = normalizeName(name);

      if (!seen.has(key)) {
        seen.add(key);
        orderedNames.push(key);
      }
    }

    const infoIndexByName = {};

    for (let i = 0; i < beneficiaryName.length; i++) {
      const key = normalizeName(beneficiaryName[i]);

      if (infoIndexByName[key] === undefined) {
        infoIndexByName[key] = i;
      }
    }
    for (const name of orderedNames) {
      const i = infoIndexByName[name];
      if (i === undefined) continue;

      tableDataMissionInfos[infoIndex].rows.push([
        safe(beneficiaryName[i]),
        safe(nbAccompagnateurs[i]),
        safe(materiel[i]),
        safe(detailsForDriver[i]),
      ]);
    }
    infoIndex++;
    // we loop and add the vehicles infos to list
    for (let b = 0; b < vehiculeMarqueList.length; b++) {
      // new entry
      tableDataVehicules[vehiculeIndex].rows.push([
        safe(vehiculeMarqueList[b] || "Marque inconnue"),
        safe(vehiculeTypeList[b] || "Type inconnu"),
        safe(vehiculeImmatList[b] || "Non immatriculé"),
      ]);
    }
    vehiculeIndex++;
    i++;

    // fill the result part of ods file with right info

    let feuilleInfo;
    feuilleInfo = `{ "Name": "Chauffeur(s): ${chauffNomDispo[0]}", "Title": "${titleInfo[0]}", "Date": "Date: ${dateFormatee}"}`;
    result.push(feuilleInfo); // return it to result list

    // add to the megalist (missioninfo1, vehicleinfo1),....
    // console.log("DEBUG - TABLEDATAMISSION INFO ", tableDataMissionInfos);
    tableDataMissionVehicule.push([
      tableDatasMission[0],
      tableDataVehicules[0],
      tableDataMissionInfos[0],
    ]);
    // console.log("DEBUG - RESULT!! ", result);
    /* console.log(
      "DEBUG - ALL NEEDED PARAMS : DATA, SHEETNAMES, TABLEDATAS",
      result,
      titleInfo,
      tableDataMissionVehicule,
    ); */
    // api call
    const res10 = await api({ local: true }).post(
      "document/download/sheets/FeuilleDeRoute/pdf/FeuilleDeRoute",
      {
        sheets: [
          {
            name: "RouteSheet",
            datas: result,
            sheetNames: titleInfo,
            tableDatas: tableDataMissionVehicule,
          },
        ],
      },
    );
    // console.log("DEBUG - RES10 RAW =>", res10);
    // gets the url name and file name
    const fileUrl = res10.data.fileUrl;
    if (fileUrl) {
      // Extract the PDF path and filename
      // custom name for file
      const newFilename = `FDR_${date}_${vehiculeIdent}.pdf`;
      // If a valid PDF path exists, create a download link
      pdfList.push({ path: fileUrl, filename: newFilename }); // Use the new filename here
    } else {
      console.error("URL du fichier non trouvée dans la réponse.");
    }
  } catch (error) {
    console.error("Erreur", error);
  }
};

// main function
const main = async () => {
  showPopupLoadingWaiting();
  // store in constants the results
  const [missionList, dispoList, vehiculeList] = await Promise.all([
    fetchMissionsData(date),
    fetchDispoData(date),
    fetchVehiculesData(),
  ]);
  // console.log("DEBUG - dispoList After API:", dispoList);
  const listeTotale = [];
  /***********FILTER ELEMENTS TO GET ONLY MISSION WITH VEHICLE ASSIGNED  */
  vehiculeList.forEach((element) => {
    const driverVehicle = dispoList
      .filter(
        (elementDispo) =>
          element.Ident_Libellé === elementDispo.PriseEnCharge_VéhiculeUtilisé,
      )
      .sort((a, b) => {
        const heureA = a.InformationsAdmin_DateHeureDébut.split("T")[1].slice(
          0,
          5,
        );
        const heureB = b.InformationsAdmin_DateHeureDébut.split("T")[1].slice(
          0,
          5,
        );
        return heureA.localeCompare(heureB);
      });
    const missionVehicle = missionList.filter(
      (elementMission) =>
        element.Ident_Libellé === elementMission.PriseEnCharge_VéhiculeUtilisé,
    );
    const missionVehicleRetour = missionList.filter(
      (elementMission) =>
        hasActiveReturn(elementMission) &&
        element.Ident_Libellé ===
          elementMission.PriseEnCharge_VéhiculeUtiliséRetour,
    );
    /* console.log("DEBUG - Affectation au véhicule", {
      vehicle: element.Ident_Libellé,
      outboundMissionNumbers: missionVehicle.map((mission) => mission.NUMBER),
      returnMissionNumbers: missionVehicleRetour.map(
        (mission) => mission.NUMBER,
      ),
    }); */
    if (missionVehicle.length || missionVehicleRetour.length) {
      listeTotale.push({
        vehicule: element,
        drivers: driverVehicle,
        missions: missionVehicle,
        missionsRetour: missionVehicleRetour,
      });
    }
  });
  // 2️⃣ Ajouter les missions sans véhicule trouvé
  const missionSansVehicule = missionList.filter(
    (m) =>
      !vehiculeList.some(
        (v) =>
          v.Ident_Libellé === m.PriseEnCharge_VéhiculeUtilisé ||
          (hasActiveReturn(m) &&
            v.Ident_Libellé === m.PriseEnCharge_VéhiculeUtiliséRetour),
      ),
  );

  missionSansVehicule.forEach((mission) => {
    const drivers = dispoList.filter(
      (d) =>
        d.PriseEnCharge_VéhiculeUtilisé ===
        mission.PriseEnCharge_VéhiculeUtilisé,
    );
    listeTotale.push({
      vehicule: {
        Ident_Libellé: "Aucun véhicule",
        Ident_Marque: "-",
        Ident_Modèle: "-",
        Ident_NuméroImmat: "-",
      },
      drivers: drivers.length ? drivers : [],
      missions: [mission],
      missionsRetour: [],
    });
  });
  /* console.log(
    "DEBUG - Trajets préparés",
    listeTotale.map((route) => ({
      vehicle: route.vehicule.Ident_Libellé,
      missionNumbers: route.missions.map((mission) => mission.NUMBER),
      returnMissionNumbers: route.missionsRetour.map(
        (mission) => mission.NUMBER,
      ),
    })),
  ); */
  /*** IF AT LEAST 1 MISSION HAS A VEHICLE ASSIGNED */
  if (listeTotale.length) {
    if (typeTelechargement === "Groupé") {
      await createPDF(listeTotale);
    } else {
      for (const mission of listeTotale) {
        // console.log("DEBUG - MISSION INDIV INFO ", mission);
        await createPDFIndividual(mission);
      }
      downloadAllPDFsAsZip();
    }
  } else {
    return;
  }
  hidePopupLoading();
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
"
"console.log('Function 34', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {Disponibilité_InformationAdmin : true }
} else{
	return {Disponibilité_InformationAdmin : null }
};
"
"console.log('Function 35', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {CC_Latitude: true, CC_Longitude: true , 'CC_Destinations|800|Latitude': true, 'CC_Destinations|900|Longitude': true, PriseEnCharge_LatitudeDépartChauffeur:true, PriseEnCharge_LongitudeDépartChauffeur:true};
} else{
	return {CC_Latitude: null, CC_Longitude: null , 'CC_Destinations|800|Latitude': null, 'CC_Destinations|900|Longitude': null, PriseEnCharge_LatitudeDépartChauffeur:null, PriseEnCharge_LongitudeDépartChauffeur:null};
};"
"console.log("Function 36", context);

// Constants
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);
const sessionToken = new google.maps.places.AutocompleteSessionToken();

// Utiliser des constantes réutilisables pour les clés
const FIELD_KEYS = {
  LATITUDE: "CC_Destinations|800|Latitude",
  LONGITUDE: "CC_Destinations|900|Longitude",
  DENOMINATION: "CC_Destinations|110|Dénomination",
  TELEPHONE: "CC_Destinations|920|Telephone",
  VILLE: "VilleDestination",
  CP: "CodePostalDestination",
};

const getInputValue = () => {
  const prefix = inputKey.split("|")[0];
  return docData[prefix]?.[indexItemChange]?.[inputKey];
};

function toggleLoadingPopup(show, success, errorMessage, loadingMessage) {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      // Création du popup de chargement s'il n'existe pas
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
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
            `;
      document.body.appendChild(loadingPopup);

      // Ajout du CSS pour l'animation du spinner
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
    }
    // Mise à jour ou création du contenu du popup de chargement
    loadingPopup.innerHTML = `
          <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
            <div>${loadingMessage}</div>
            <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
          </div>
        `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
  } else {
    if (loadingPopup) loadingPopup.style.display = "none";
    if (success === false && errorMessage) {
      if (!errorBanner) {
        // Création du banner d'erreur s'il n'existe pas
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
      // Mise à jour ou création du contenu du banner d'erreur
      errorBanner.innerHTML = `
            <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
            <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
          `;
      errorBanner.style.display = "flex";
      // Initialisation ou réinitialisation de la barre de progression
      let progressElement = document.getElementById("errorBannerProgress");
      let width = 0;
      let interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          errorBanner.style.display = "none";
        } else {
          width++;
          progressElement.style.width = width + "%";
        }
      }, 55); // La barre progresse sur 5 secondes
    }
  }
}

// Helper pour extraire un composant d'adresse
const getComponent = (addressComponents, type) => {
  return addressComponents.find((c) => c.types.includes(type))?.longText || "";
};

// Returns suggestions based on the AdressePreférées collection
const getPreferredAddressSuggestions = () => {
  const collection = "AdressePreférées|100|Adresse";
  const collectionDeno = "AdressePreférées|200|Dénomination";
  const collectionLat = "AdressePreférées|800|Latitude";
  const collectionLng = "AdressePreférées|810|Longitude";
  const suggestions = [];

  for (const item of docData.AdressePreférées) {
    const adresse = item[collection];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "CC_Destinations|110|Dénomination",
            value: item[collectionDeno] ?? "",
            name: "Dénomination",
          },
          {
            key: FIELD_KEYS.VILLE,
            name: "Ville",
            value: item["AdressePreférées|530|Ville"] ?? "",
          },
          {
            key: FIELD_KEYS.CP,
            name: "Code postal",
            value: item["AdressePreférées|520|Code_postal"] ?? "",
          },
          {
            key: "CC_Destinations|800|Latitude",
            name: "Latitude",
            value: item[collectionLat] ?? "",
          },
          {
            key: "CC_Destinations|900|Longitude",
            name: "Longitude",
            value: item[collectionLng] ?? "",
          },
        ],
      });
    }
  }
  return suggestions;
};

// Récupère les suggestions Google Autocomplete
const getGoogleAutocompleteSuggestions = (address) => {
  return google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
    {
      input: address,
      sessionToken: sessionToken,
      locationRestriction: bounds,
    },
  ).then(({ suggestions }) => suggestions);
};

// Formate les suggestions avec les détails du lieu
const formatSuggestions = async (suggestions) => {
  const places = suggestions.map((s) => s.placePrediction.toPlace());

  await Promise.all(
    places.map((place) =>
      place.fetchFields({
        fields: [
          "formattedAddress",
          "displayName",
          "location",
          "addressComponents",
          "nationalPhoneNumber",
          "internationalPhoneNumber",
        ],
      }),
    ),
  );

  return places.map((place) => ({
    title: place.formattedAddress,
    fields: [
      {
        key: FIELD_KEYS.DENOMINATION,
        name: "Dénomination",
        value: place.formattedAddress.includes(place.displayName)
          ? ""
          : place.displayName,
      },
      {
        key: FIELD_KEYS.LATITUDE,
        name: "Latitude",
        value: place.location.lat(),
      },
      {
        key: FIELD_KEYS.LONGITUDE,
        name: "Longitude",
        value: place.location.lng(),
      },
      {
        key: FIELD_KEYS.VILLE,
        name: "Ville",
        value: getComponent(place.addressComponents, "locality"),
      },
      {
        key: FIELD_KEYS.CP,
        name: "Code postal",
        value: getComponent(place.addressComponents, "postal_code"),
      },
      {
        key: FIELD_KEYS.TELEPHONE,
        name: "Téléphone",
        value:
          place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      },
    ],
  }));
};

// Fonction principale
const main = async () => {
  const addressValue = getInputValue();
  let suggestions = [];
  let showErrorBanner = false;
  let errorMessage = "";

  if (addressValue) {
    toggleLoadingPopup(true, true, "", "Recherche en cours...");

    try {
      const googleSuggestions =
        await getGoogleAutocompleteSuggestions(addressValue);

      const formattedSuggestions = await formatSuggestions(googleSuggestions);

      if (formattedSuggestions.length > 0) {
        suggestions = formattedSuggestions;
      } else {
        suggestions = getPreferredAddressSuggestions();
      }
    } catch (error) {
      console.error("30 - google suggestions error", error);
      suggestions = getPreferredAddressSuggestions();
      showErrorBanner = true;
      errorMessage = "Erreur lors de la recherche des adresses.";
    }
  } else {
    suggestions = getPreferredAddressSuggestions();
  }

  console.log("36 - suggestions", suggestions);

  callback({
    suggestions: {
      [inputKey]: suggestions,
    },
  });
  toggleLoadingPopup(
    false,
    !showErrorBanner,
    showErrorBanner ? errorMessage : "",
    "Recherche en cours...",
  );
};

main();
"
"console.log("Function 39", context);

//recup les infos (Date,heuredebut,heurefin)
function getInfos() {
  //champs
  const date = docData.Planification_Date;
  const heureDebut = docData.Planification_HeureDébut;
  const heureFin = docData.Planification_HeureFin;
  //heure mis ensemble
  let dateavecHeureDebut = date + "T" + heureDebut + ":00";
  let dateavecHeureFin = date + "T" + heureFin + ":00";

  if (
    docData.Planification_Récurrence == "Une seule fois" ||
    docData.IdentifiantFormulaireRécurrence
  ) {
    if (date && heureDebut && heureFin) {
      return {
        InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
        InformationsAdmin_DateHeureFin: dateavecHeureFin,
      };
    }
  } else {
    if (docData.Planification_Récurrence == "Par semaine") {
      if (docData.Planification_DateFin) {
        const dateFin = docData.Planification_DateFin;
        let dateavecHeureFin = dateFin + "T" + heureFin + ":00";
        return {
          InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
          InformationsAdmin_DateHeureFin: dateavecHeureFin,
        };
      } else {
        return {
          InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
          InformationsAdmin_DateHeureFin: "2150-01-01T00:00:00",
        };
      }
    } else {
      if (docData.Planification_Récurrence == "Par jour spécifique") {
        if (docData.Planification_MultiDate) {
          const multiDate = docData.Planification_MultiDate.split("|");
          const latestDate = multiDate.reduce((latest, current) => {
            return new Date(current) > new Date(latest) ? current : latest;
          });
          const earliestDate = multiDate.reduce((earliest, current) => {
            return new Date(current) < new Date(earliest) ? current : earliest;
          });
          let dateavecHeureDebut = earliestDate + "T" + heureDebut + ":00";
          let dateavecHeureFin = latestDate + "T" + heureFin + ":00";
          return {
            InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
            InformationsAdmin_DateHeureFin: dateavecHeureFin,
          };
        }
      }
    }
  }
}
const result = getInfos();

return result;
"
"console.log("Function 43", context);

// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

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
        `
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

const formatDispobilite = (dispo, date) => {
  const documents = dispo.data.documents;

  const formatedDocuments = [];

  documents.forEach((doc) => {
    const data = JSON.parse(doc.data);

    console.log("data", data);

    const exceptions = data.Exception_Récurrence
      ? data.Exception_Récurrence.split("|").map(
          (date) => new Date(date).toISOString().split("T")[0]
        )
      : [];

    if (exceptions.includes(date)) {
      return;
    }
    if (
      data.IdentifiantFormulaireRécurrence &&
      data.Planification_Date === date
    ) {
      const newData = {
        ...data,
        Planification_Récurrence: "Une seule fois",
      };
      formatedDocuments.push({
        ...doc,
        data: JSON.stringify(newData),
      });
    } else if (data.Planification_Récurrence === "Une seule fois") {
      formatedDocuments.push({
        ...doc,
      });
    } else if (data.Planification_Récurrence === "Par semaine") {
      const day = getWeekday(date);
      const days = data.Planification_Répéter.split("|");

      if (days.includes(day)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    } else if (data.Planification_Récurrence === "Par jour spécifique") {
      const days = data.Planification_MultiDate.split("|");
      if (days.includes(date)) {
        const newData = {
          ...data,
          Planification_Récurrence: "Une seule fois",
        };
        formatedDocuments.push({
          ...doc,
          data: JSON.stringify(newData),
        });
      }
    }
  });

  return {
    ...dispo,
    data: {
      ...dispo.data,
      documents: formatedDocuments,
    },
  };
};

// function that gets the date entered
function getDate() {
  const processData =
    store.pageContentStore.processData[0].edits.TrouverChauffeurDate;
  return processData;
}

// function that gets the area
function getArea() {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
}

const getWeekday = (dateStr) => {
  // Split the input and parse integers
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create a Date object (note: month is 0-indexed in JS)
  const date = new Date(year, month - 1, day);

  // Days of the week
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  // Return corresponding day
  return days[date.getDay()];
};

const resultDate = getDate();
const resultMcr = getArea();

const rangeDateDebut = "0001-01-01|" + resultDate;
const rangeDateFin = resultDate + "|9999-12-31";

// filters definition
const driversAPIFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire",
    type: "TEXT",
  },
  { key: "Maison", operator: "EQUALS", value: resultMcr, type: "TEXT" },
  { key: "STATUS", operator: "EQUALS", value: "Enregistré", type: "TEXT" },
];

const availabilitiesAPIFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  { key: "Maison", operator: "EQUALS", value: resultMcr, type: "TEXT" },
  {
    key: "Planification_Disponiblité",
    operator: "IN",
    value: "Disponible|Indisponible",
    type: "TEXT",
  },
  { key: "STATUS", operator: "EQUALS", value: "Enregistrée", type: "TEXT" },
];

// function that gets every availability
async function getAvailability(apiFilters, resultDate) {
  const dispo = await recurrence.getDocuments(
    apiFilters,
    [resultDate, resultDate],
    api
  );
  return dispo;
}

// function that gets
async function getDrivers(apiFilters) {
  const res2 = await api({ local: true }).post("document/id/filter", {
    filters: apiFilters,
  });
  // list of driver IDS
  const listeIds = res2.data.ids;
  // returns every driver info
  return await api({ local: true }).post("document/id", { ids: listeIds });
}

// function to process drivers and compares with avail
function processDrivers(res3, listeDispoID) {
  // list to stock driver with availabilty and no avail
  let driverWithAvail = [];
  let driverNoAvail = [];

  // gets every driver id individually and stocks it in correct list
  res3.data.documents.forEach((document) => {
    const dataFormID = document.documentID;
    console.log("CHAUFFEUR sans dispo ", driverNoAvail);
    if (listeDispoID.includes(dataFormID)) {
      driverWithAvail.push(dataFormID);
    } else {
      driverNoAvail.push(dataFormID);
    }
  });
  console.log("CHAUFFEUR AVEC DISPO ", driverWithAvail);

  return { driverWithAvail, driverNoAvail };
}

// Fonction pour extraire les identifiants des disponibilités
function extractAvailabilityIds(res5) {
  let listeDispoID = [];
  res5.data.documents.forEach((documentDispo) => {
    const dataDispo = JSON.parse(documentDispo.data);
    const dataDisponibilite = dataDispo.IdentifiantDispo;
    listeDispoID.push(dataDisponibilite);
  });
  console.log("LISTE DES DISPO ", listeDispoID);
  return listeDispoID;
}

// Function that generates docs and updates them
function generateDocuments(driverWithAvail, driverNoAvail) {
  const uncheckedChauff = driverWithAvail.map((id) => ({
    documentID: id,
    data: JSON.stringify({ AfficherDansListeAppel: "false" }),
    status: "Enregistré",
    active: true,
    template: { templateId: "7c6d6132-ca2b-411c-86e9-baaaa130faa3" },
  }));

  const checkedChauff = driverNoAvail.map((id) => ({
    documentID: id,
    data: JSON.stringify({ AfficherDansListeAppel: "true" }),
    status: "Enregistré",
    active: true,
    template: { templateId: "7c6d6132-ca2b-411c-86e9-baaaa130faa3" },
  }));

  return [...uncheckedChauff, ...checkedChauff];
}

// main function
async function main() {
  showPopupLoading("Chargement en cours..."); // Affiche la popup de chargement

  try {
    // API calls to get avail and drivers
    const [res5, res3] = await Promise.all([
      getAvailability(availabilitiesAPIFilters, resultDate),
      getDrivers(driversAPIFilters),
    ]);
    console.log("res5", res5);
    console.log("res3", res3);

    // Extract availability IDs
    const listeDispoID = extractAvailabilityIds(res5);
    const { driverWithAvail, driverNoAvail } = processDrivers(
      res3,
      listeDispoID
    );

    // Generate and update documents
    const docUpdate = generateDocuments(driverWithAvail, driverNoAvail);

    // Update the documents
    const res6 = await api({ local: true }).put("document/Many", {
      documents: docUpdate,
    });
    console.log("res6", res6);
  } catch (error) {
    console.error("Error API", error);
  } finally {
    hidePopupLoading(); // Cache la popup de chargement une fois terminé (succès ou erreur)
  }
}

// main function call
main();
"
"console.log('Function 44', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {Chauffeur_Information_Dev : true }
} else{
	return {Chauffeur_Information_Dev : null }
};
"
"console.log("Function 46", context);

const fillAdminFields = () => {
  console.log("Function 117", context);

  function getInfos() {
    const date = docData.Planification_Date;
    const heureDebut = docData.CC_Récupération;

    let heureFin;
    if (docData.CC_Retour == "true") {
      heureFin = docData.CC_Arrivée ? docData.CC_Arrivée : `23:59`;
    } else {
      heureFin =
        docData.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
          "CC_Destinations|400|Début de RDV"
        ] ||
        docData?.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
          "CC_Destinations|300|Arrivée"
        ];
    }

    // Construction des Date objets sécurisés
    let dateavecHeureDebut = new Date(`${date}T${heureDebut || "00:00"}:00`);
    let dateavecHeureFin = new Date(`${date}T${heureFin || "00:00"}:00`);

    // Formater la date et l'heure selon l'heure locale
    function formatDateLocal(dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Mois de 1 à 12
      const day = String(dateObj.getDate()).padStart(2, "0"); // Jour de 1 à 31
      const hours = String(dateObj.getHours()).padStart(2, "0"); // Heures de 00 à 23
      const minutes = String(dateObj.getMinutes()).padStart(2, "0"); // Minutes de 00 à 59

      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    }

    if (
      docData.Planification_Récurrence == "Une seule fois" ||
      docData.IdentifiantFormulaireRécurrence
    ) {
      if (date && heureDebut && heureFin) {
        return {
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureFin),
        };
      }
    } else {
      if (docData.Planification_Récurrence == "Par semaine") {
        if (docData.Planification_DateFin) {
          const dateFin = docData.Planification_DateFin;
          dateavecHeureFin = new Date(`${dateFin}T${heureFin || "00"}:00`);
          console.log("DATE AVC HEURE ", dateavecHeureFin);
          return {
            InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureDebut),
            InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureFin),
          };
        } else {
          return {
            InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureDebut),
            InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
          };
        }
      } else if (docData.Planification_Récurrence == "Par jour spécifique") {
        if (docData.Planification_MultiDate) {
          const date = docData.Planification_MultiDate.split("|")[0];
          const multiDate = docData.Planification_MultiDate.split("|");
          const latestDate = multiDate.reduce((latest, current) =>
            new Date(current) > new Date(latest) ? current : latest,
          );
          const earliestDate = multiDate.reduce((earliest, current) =>
            new Date(current) < new Date(earliest) ? current : earliest,
          );

          dateavecHeureDebut = new Date(
            `${earliestDate}T${heureDebut || "00:00"}:00`,
          );
          dateavecHeureFin = new Date(
            `${latestDate}T${heureFin || "00:00"}:00`,
          );

          return {
            Planification_Date: date,
            InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureDebut),
            InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
              ? `${date}T23:59:00`
              : formatDateLocal(dateavecHeureFin),
          };
        }
      }
    }

    // Fallback final
    return {
      InformationsAdmin_DateHeureDébut: `${date}T00:01:00`,
      InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
    };
  }

  const result = getInfos();
  console.log("result ========", result);
  return result;
};

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
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
// hides an errorPopup
const hidePopupError = () => {
  const errorPopup = document.getElementById("errorPopup");
  if (errorPopup) errorPopup.style.display = "none";
};

// shows an errorPopup
const showPopupError = (errorMessage) => {
  const popup = createOrUpdateElement(
    "errorPopup",
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
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center; position: relative; width: 310px; text-align: center;">
      <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
          <button id="closePopup" style="position: absolute; top: 0px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
          <div style="margin-top: 15px;">${errorMessage}</div>
      </div>
      `,
  );

  document
    .getElementById("closePopup")
    .addEventListener("click", hidePopupError.bind(this));
};

// to convert time in all minutes (for comparaison)
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const isRDVPec =
  docData.TypeTransport === "RDV au lieu de prise en charge" ? true : false;

// constant needed to calculate embarquement and arrivée time
// both checkbox needed
const manuallyEnteredHours = docData.EntrerHeuresManuellement;
const returnPriseEnCharge = docData.CC_Retour;
const loadingTime = docData.TempsEmbarquement;
const unloadingTime = docData.TempsDebarquement;
// debutRDV, finRDV, embarquement, arrivée
let meetingStart, meetingEnd, firstTravelTime, lastTravelTime, lastmeetingStart;
// attribute value only if there is one for meeting end
if (docData.CC_Destinations.length && docData.CC_Destinations.length - 1 >= 0) {
  meetingEnd =
    docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
      "CC_Destinations|600|Fin de RDV"
    ] ||
    docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
      "CC_Destinations|400|Début de RDV"
    ];

  lastmeetingStart = !isRDVPec
    ? docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
        "CC_Destinations|400|Début de RDV"
      ]
    : docData?.CC_Récupération;
  docData.CC_Destinations[docData.CC_Destinations.length - 1]?.[
    "CC_Destinations|300|Arrivée"
  ];
}

// attribute value from debutRDV, embarquement and arrivée
meetingStart = !isRDVPec
  ? docData.CC_Destinations[0]?.["CC_Destinations|400|Début de RDV"]
  : docData?.CC_Récupération;
firstTravelTime =
  docData.CC_Destinations[0]?.["CC_Destinations|200|Temps de trajet"];
lastTravelTime = docData.CC_TempsTrajet;

// function to calculate embarquement time
const calculateEmbarquementTime = (firstItem) => {
  try {
    console.log("A1");
    const missionStart = timeToMinutes(heuresMission[0]);
    console.log("Meeting start ", meetingStart);
    const startRDVTimeMinutes = timeToMinutes(meetingStart);
    console.log("A3");
    const firstTravelTimeMinutes = timeToMinutes(firstItem);
    console.log("A4");
    const loadingTimeMinutes = timeToMinutes(loadingTime);
    console.log("A5");
    const unloadingTimeMinutes = timeToMinutes(unloadingTime);
    console.log("A6");
    const embarquementDifferenceMinutes =
      startRDVTimeMinutes -
      firstTravelTimeMinutes -
      loadingTimeMinutes -
      unloadingTimeMinutes;
    const differenceStartMissionMinutes =
      embarquementDifferenceMinutes - missionStart;
    const missionStartHours = Math.floor(differenceStartMissionMinutes / 60);
    const missionRemainingMinutes = differenceStartMissionMinutes % 60;
    const missionStartFormatted = `${String(missionStartHours).padStart(
      2,
      "0",
    )}:${String(missionRemainingMinutes).padStart(2, "0")}`;
    const embarquementHours = Math.floor(embarquementDifferenceMinutes / 60);
    const embarquementRemainingMinutes = embarquementDifferenceMinutes % 60;
    const embarquementFormatted = `${String(embarquementHours).padStart(
      2,
      "0",
    )}:${String(embarquementRemainingMinutes).padStart(2, "0")}`;

    // return the value in string format
    return { embarquementFormatted, missionStartFormatted };
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// function to calculate last arrival Time when there is a return
const calculateReturnArrivalTime = (lastItem) => {
  try {
    const missionEnd = timeToMinutes(heuresMission[1]);
    const meetingEndTimeMinutes = timeToMinutes(meetingEnd);
    const lastTravelTimeMinutes = timeToMinutes(lastItem);
    const loadingTimeMinutes = timeToMinutes(loadingTime);
    const unloadingTimeMinutes = timeToMinutes(unloadingTime);
    console.log("MEETING END ", meetingEnd);
    console.log("lastTravelTime ", lastItem);
    console.log("UNLOAD ", unloadingTime);
    console.log("LOAD ", loadingTime);
    const finalArrivalDifferenceMinutes =
      meetingEndTimeMinutes +
      lastTravelTimeMinutes +
      unloadingTimeMinutes +
      loadingTimeMinutes;
    const differenceEndMissionMinutes =
      finalArrivalDifferenceMinutes + missionEnd;
    const missionEndHours = Math.floor(differenceEndMissionMinutes / 60);
    const missionEndRemainingMinutes = differenceEndMissionMinutes % 60;
    const missionEndFormatted = `${String(missionEndHours).padStart(
      2,
      "0",
    )}:${String(missionEndRemainingMinutes).padStart(2, "0")}`;
    const finalArrivalHours = Math.floor(finalArrivalDifferenceMinutes / 60);
    const finalArrivalRemainingMinutes = finalArrivalDifferenceMinutes % 60;
    const finalArrivalFormatted = `${String(finalArrivalHours).padStart(
      2,
      "0",
    )}:${String(finalArrivalRemainingMinutes).padStart(2, "0")}`;
    console.log("FINAL ARRIVAL ", finalArrivalFormatted);
    // return the value in string format
    return { finalArrivalFormatted, missionEndFormatted };
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// function that gets the fin heure Approx
const getFinHeureApprox = () => {
  if (meetingEnd) {
    if (docData.CC_Retour === "true") {
      const embarquement = timeToMinutes(docData.TempsEmbarquement);
      const debarquement = timeToMinutes(docData.TempsDebarquement);
      const meetingEndTimeMinutes = timeToMinutes(meetingEnd);
      const missionEnd = timeToMinutes(heuresMission[1]);
      const heureFinDifference =
        meetingEndTimeMinutes + missionEnd + embarquement + debarquement;
      const heureFinHours = Math.floor(heureFinDifference / 60);
      const heureFinRemainingMinutes = heureFinDifference % 60;
      const heureFinFormatted = `${String(heureFinHours).padStart(
        2,
        "0",
      )}:${String(heureFinRemainingMinutes).padStart(2, "0")}`;
      return heureFinFormatted;
    } else {
      const meetingEndTimeMinutes = timeToMinutes(meetingEnd);
      const missionEnd = timeToMinutes(heuresMission[1]);
      const heureFinDifference = meetingEndTimeMinutes + missionEnd;
      const heureFinHours = Math.floor(heureFinDifference / 60);
      const heureFinRemainingMinutes = heureFinDifference % 60;
      const heureFinFormatted = `${String(heureFinHours).padStart(
        2,
        "0",
      )}:${String(heureFinRemainingMinutes).padStart(2, "0")}`;
      return heureFinFormatted;
    }
  } else {
    const lastmeetingStartTimeMinutes = timeToMinutes(lastmeetingStart);
    const missionEnd = timeToMinutes(heuresMission[1]);
    const heureFinDifference = lastmeetingStartTimeMinutes + missionEnd;
    const heureFinHours = Math.floor(heureFinDifference / 60);
    const heureFinRemainingMinutes = heureFinDifference % 60;
    const heureFinFormatted = `${String(heureFinHours).padStart(
      2,
      "0",
    )}:${String(heureFinRemainingMinutes).padStart(2, "0")}`;
    return heureFinFormatted;
  }
};

// constants needed for origin, destination and waypoints
let Depart_GarageLat = docData?.PriseEnCharge_LatitudeDépartChauffeur;
let Depart_GarageLong = docData?.PriseEnCharge_LongitudeDépartChauffeur;
if (!Depart_GarageLat || !Depart_GarageLong) {
  showPopupError("Vous devez sélectionner un lieu de départ pour le chauffeur");
  return;
}
// replace , for .
Depart_GarageLat = Depart_GarageLat.replace(",", ".");
Depart_GarageLong = Depart_GarageLong.replace(",", ".");
// conversion to a number
Depart_GarageLat = parseFloat(Depart_GarageLat);
Depart_GarageLong = parseFloat(Depart_GarageLong);
const coordGarage = {
  lat: Depart_GarageLat,
  lng: Depart_GarageLong,
};
// const for the waypoints
const waypoints = [];
// const for lieu depart lat and long
const lieuDepartLat = Number(docData.CC_Latitude);
const lieuDepartLong = Number(docData.CC_Longitude);
// const for garage starting place lat and long
const coordDestination = { lat: Depart_GarageLat, lng: Depart_GarageLong };
// const for first embarquement lat and long
const firstEmbarLat =
  docData.CC_Destinations[0]?.["CC_Destinations|800|Latitude"];
const firstEmbarLong =
  docData.CC_Destinations[0]?.["CC_Destinations|900|Longitude"];

// push in waypoints every stop
// index to follow iteration of destinations
let index = 0;
let dernierStopLat, dernierStopLong;
waypoints.push({ lat: lieuDepartLat, lng: lieuDepartLong });
docData.CC_Destinations.forEach((destination) => {
  const latitudeKey = `CC_Destinations|800|Latitude`;
  const longitudeKey = `CC_Destinations|900|Longitude`;
  const latitude = destination[latitudeKey];
  const longitude = destination[longitudeKey];
  waypoints.push({ lat: Number(latitude), lng: Number(longitude) });
  // keep the last coord in a var
  if (index === docData.CC_Destinations.length - 1) {
    dernierStopLat = Number(latitude);
    dernierStopLong = Number(longitude);
  }
  index++;
});

const fieldNames = {
  lat_dep: "Adresse de départ",
  long_dep: "Adresse de départ",
  lat_dest: "Adresse de destination",
  long_dest: "Adresse de destination",
};

const fieldValues = {
  lat_dep: docData.CC_Latitude,
  long_dep: docData.CC_Longitude,
  lat_dest: firstEmbarLat,
  long_dest: firstEmbarLong,
};

// gets missing fields names required to compute from form
const getMissingFields = () => {
  const missingFields = [];
  Object.entries(fieldValues).forEach(([key, value]) => {
    if (!value) missingFields.push(fieldNames[key]);
  });
  return [...new Set(missingFields)];
};

let heuresMission = [];
// store the partial duration
const partialDurationList = [];
const defaultHour = "08:00";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const isoTomorrow = `${tomorrow.toISOString().split("T")[0]}T08:00:00`;

const planificationDateTime = new Date(
  `${docData.Planification_Date}T${docData.CC_Récupération || defaultHour}:00`,
);

const now = new Date();

let takeDefault = false;
if (planificationDateTime <= now) {
  console.warn(
    "La date de départ est dans le passé. L'API Google Maps refusera cette requête.",
  );
  takeDefault = true;
}

// async function to get the distance of duration in legs
const getDistanceAndDuration = async (origin, destination, waypoints = []) => {
  const waypointLength = waypoints.length;
  return new Promise((resolve, reject) => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: takeDefault
            ? new Date(isoTomorrow)
            : planificationDateTime,
          trafficModel: google.maps.TrafficModel.OPTIMISTIC,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log("google DirectionsService result :", result);
          let totalDistanceKm = 0;
          let totalDurationMin = 0;
          let partialDistanceKm = 0;
          let partialDurationMin = 0;
          let index = 0;
          const legs = result.routes[0]?.legs;
          console.log("LEGS TOTAL ", legs);
          if (legs) {
            for (const leg of legs) {
              if (!(index === 0 || index === waypointLength)) {
                partialDistanceKm += leg.distance.value / 1000;
                partialDurationMin += leg.duration.value / 60;
                const hours = Math.floor(leg.duration.value / 60 / 60);
                const minutes = Math.floor((leg.duration.value / 60) % 60);
                const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                  minutes < 10 ? "0" : ""
                }${minutes}`;
                console.log("LEGS INFO ", leg);
                partialDurationList.push(formattedDuration);
              }
              if (index === 0 || index === waypointLength) {
                const hours = Math.floor(leg.duration.value / 60 / 60);
                const minutes = Math.floor((leg.duration.value / 60) % 60);
                const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                  minutes < 10 ? "0" : ""
                }${minutes}`;
                heuresMission.push(formattedDuration);
              }
              totalDistanceKm += leg.distance.value / 1000; // km
              totalDurationMin += leg.duration.value / 60; // minute
              index++;
            }
          }

          resolve({
            totalDistanceKm,
            totalDurationMin,
            partialDistanceKm,
            partialDurationMin,
            partialDurationList,
          });
        } else {
          reject(new Error(`Google Maps API error: ${status}`));
        }
      },
    );
  });
};

const getDistanceAndDurationSansRester = async (
  origin,
  destination,
  waypoints = [],
) => {
  try {
    const waypointLength = waypoints.length;
    const destinationsLength = docData.CC_Destinations.length;
    return new Promise((resolve, reject) => {
      new google.maps.DirectionsService().route(
        {
          origin,
          destination,
          waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: takeDefault
              ? new Date(isoTomorrow)
              : planificationDateTime,
            trafficModel: google.maps.TrafficModel.OPTIMISTIC,
          },
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            console.log("google DirectionsService result :", result);
            let totalDistanceKm = 0;
            let totalDurationMin = 0;
            let partialDistanceKm = 0;
            let partialDurationMin = 0;
            let index = 0;
            const legs = result.routes[0]?.legs;
            if (legs) {
              console.log("LEGSS ", legs);
              for (const leg of legs) {
                if (
                  (index > 0 && index <= waypointLength - 4) ||
                  index === waypointLength - 1
                ) {
                  console.log("LE LEG ", leg);
                  partialDistanceKm += leg.distance.value / 1000;
                  partialDurationMin += leg.duration.value / 60;
                  const hours = Math.floor(leg.duration.value / 60 / 60);
                  const minutes = Math.floor((leg.duration.value / 60) % 60);
                  const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                    minutes < 10 ? "0" : ""
                  }${minutes}`;
                  partialDurationList.push(formattedDuration);
                }
                if (index === 0 || index === waypointLength) {
                  const hours = Math.floor(leg.duration.value / 60 / 60);
                  const minutes = Math.floor((leg.duration.value / 60) % 60);
                  const formattedDuration = `${hours < 10 ? "0" : ""}${hours}:${
                    minutes < 10 ? "0" : ""
                  }${minutes}`;
                  heuresMission.push(formattedDuration);
                }
                totalDistanceKm += leg.distance.value / 1000; // km
                totalDurationMin += leg.duration.value / 60; // minute
                index++;
              }
            }

            resolve({
              totalDistanceKm,
              totalDurationMin,
              partialDistanceKm,
              partialDurationMin,
              partialDurationList,
            });
          } else {
            reject(new Error(`Google Maps API error: ${status}`));
          }
        },
      );
    });
  } catch (error) {
    console.warn("Erreur lors du calcul des disatnces :", error);
  }
};

const getArrivalTime = (tempsTrajet) => {
  const pec = docData.CC_Récupération;
  const tempsTrajetMinutes = timeToMinutes(tempsTrajet);
  const pecMinutes = timeToMinutes(pec);
  const arrivalMinutes = tempsTrajetMinutes + pecMinutes;
  const arrival = convertMinutesToHHMM(arrivalMinutes);
  console.log("ARRIVAL ", arrival);
  return arrival;
};

const convertMinutesToHHMM = (minutes) => {
  const totalMinutes = Math.ceil(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const normalizedHours = hours % 24;
  const paddedHours = String(normalizedHours).padStart(2, "0");
  const paddedMinutes = String(mins).padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}`;
};

// when it is RDV to pec
const getDriverStartTime = () => {
  const missionStart = timeToMinutes(heuresMission[0]);
  const startRDVTimeMinutes = timeToMinutes(docData?.CC_Récupération);
  const loadingTimeMinutes = timeToMinutes(loadingTime);
  const unloadingTimeMinutes = timeToMinutes(unloadingTime);
  console.log("START ", convertMinutesToHHMM(startRDVTimeMinutes));
  console.log("MISSION START ? ", convertMinutesToHHMM(missionStart));
  const embarquementDifferenceMinutes =
    startRDVTimeMinutes - loadingTimeMinutes - unloadingTimeMinutes;
  const differenceStartMissionMinutes =
    embarquementDifferenceMinutes - missionStart;
  const driverStart = convertMinutesToHHMM(differenceStartMissionMinutes);
  console.log("DRIVER START TIME ! ", driverStart);
  return driverStart;
};

// Main function
const main = async () => {
  const clone = [...docData.CC_Destinations];
  const destinations = clone.map((item) => item["CC_Destinations|100|Adresse"]);
  const result = {};
  const partialResult = {};
  const isRDVPec =
    docData.TypeTransport === "RDV au lieu de prise en charge" ? true : false;
  if (
    docData.TypeTransport === "RDV au lieu de prise en charge" &&
    !docData.CC_Récupération
  ) {
    const errorMessage = "Vous devez sélectionner une heure de prise en charge";
    showPopupError(errorMessage);
    return;
  }
  //  if everything we need we have
  if (
    docData.CC_Latitude &&
    docData.CC_Longitude &&
    firstEmbarLat &&
    firstEmbarLong
  ) {
    try {
      // Show loading popup
      showPopupLoading("Calcul en cours...");
      // if return is true
      if (docData.CC_Retour == "true") {
        if (docData.CheckboxResterAvecBene == "true") {
          try {
            // we add the last destination (the return)
            waypoints.push({ lat: lieuDepartLat, lng: lieuDepartLong });
            console.log("WAYPOINTS ", waypoints);
            // calling the function
            const distancesAndDurations = await getDistanceAndDuration(
              coordGarage,
              coordDestination,
              waypoints,
            );
            console.log("DISTANCES AND DURATIONS ", distancesAndDurations);
            // get the right distances
            result.DistanceTrajetAller =
              distancesAndDurations.totalDistanceKm.toFixed(2);
            result.partialDurationList;
            result.DureeTrajetAller = Math.round(
              distancesAndDurations.totalDurationMin,
            );
            partialResult.DistanceTrajetAller =
              distancesAndDurations.partialDistanceKm.toFixed(2);
            partialResult.DureeTrajetAller = Math.round(
              distancesAndDurations.partialDurationMin,
            );

            // put the right duration in collection
            for (let i = 0; i < destinations.length; i++) {
              console.log(
                "A TEST ",
                distancesAndDurations.partialDurationList[i],
              );
              if (isRDVPec) {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                  "CC_Destinations|300|Arrivée": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                  "CC_Destinations|400|Début de RDV": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                };
              } else {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                };
              }
            }
            const firstItem = clone[0]["CC_Destinations|200|Temps de trajet"];
            // inject the data
            const lastItem =
              partialDurationList[partialDurationList.length - 1];
            const { embarquementFormatted, missionStartFormatted } =
              calculateEmbarquementTime(firstItem);
            const newDocData = {
              CC_TempsTrajet: lastItem,
              CC_Destinations: clone,
              DistanceDepartDestination: partialResult.DistanceTrajetAller,
              DistanceGarageGarage: result.DistanceTrajetAller,
              heureDebutMission: isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted,
              heureFinMission: getFinHeureApprox(),
            };
            // if we have necessary info for embarquement time , inject it
            if (meetingStart && manuallyEnteredHours !== "true") {
              const { embarquementFormatted, missionStartFormatted } =
                calculateEmbarquementTime(firstItem);
              if (docData.TypeTransport === "RDV à la destination") {
                newDocData.CC_Récupération = embarquementFormatted;
              }
              newDocData.heureDebutMission = isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted;
            }
            // if we have necessary info for final arrival time, inject it
            if (meetingEnd && manuallyEnteredHours !== "true") {
              const { finalArrivalFormatted, missionEndFormatted } =
                calculateReturnArrivalTime(lastItem);
              newDocData.CC_Arrivée = finalArrivalFormatted;
              newDocData.heureFinMission = missionEndFormatted;
            }
            injectDocData({
              fillData: newDocData,
            });
          } catch (error) {
            console.error(
              "Error fetching return trip distance/duration:",
              error,
            );
            hidePopupLoading();
            return;
          }
        }
        // here is for when we dont stay with bene and return
        else {
          try {
            console.log("WE ARE IN THE RIGHT PLACE");
            // push the garage
            waypoints.push({ lat: Depart_GarageLat, lng: Depart_GarageLong });
            // push the final destination again
            waypoints.push({ lat: dernierStopLat, lng: dernierStopLong });
            // we push the départ (the return)
            waypoints.push({ lat: lieuDepartLat, lng: lieuDepartLong });
            console.log("WAYPOINTS ", waypoints);
            const distancesAndDurations =
              await getDistanceAndDurationSansRester(
                coordGarage,
                coordDestination,
                waypoints,
              );
            // get the right distances
            result.DistanceTrajetAller =
              distancesAndDurations.totalDistanceKm.toFixed(2);
            result.partialDurationList;
            result.DureeTrajetAller = Math.round(
              distancesAndDurations.totalDurationMin,
            );
            partialResult.DistanceTrajetAller =
              distancesAndDurations.partialDistanceKm.toFixed(2);
            partialResult.DureeTrajetAller = Math.round(
              distancesAndDurations.partialDurationMin,
            );

            // put the right duration in collection
            for (let i = 0; i < destinations.length; i++) {
              if (isRDVPec) {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                  "CC_Destinations|300|Arrivée": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                  "CC_Destinations|400|Début de RDV": getArrivalTime(
                    distancesAndDurations.partialDurationList[i],
                  ),
                };
              } else {
                clone[i] = {
                  ...clone[i],
                  "CC_Destinations|200|Temps de trajet":
                    distancesAndDurations.partialDurationList[i],
                };
              }
            }
            const firstItem = clone[0]["CC_Destinations|200|Temps de trajet"];
            // inject the data
            const lastItem =
              partialDurationList[partialDurationList.length - 1];
            const { embarquementFormatted, missionStartFormatted } =
              calculateEmbarquementTime(firstItem);
            const newDocData = {
              CC_TempsTrajet: lastItem,
              CC_Destinations: clone,
              DistanceDepartDestination: partialResult.DistanceTrajetAller,
              DistanceGarageGarage: result.DistanceTrajetAller,
              heureDebutMission: isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted,
              heureFinMission: getFinHeureApprox(),
            };
            // if we have necessary info for embarquement time , inject it
            if (meetingStart && manuallyEnteredHours !== "true") {
              const { embarquementFormatted, missionStartFormatted } =
                calculateEmbarquementTime(firstItem);
              if (docData.TypeTransport === "RDV à la destination") {
                newDocData.CC_Récupération = embarquementFormatted;
              }
              newDocData.heureDebutMission = isRDVPec
                ? getDriverStartTime()
                : missionStartFormatted;
            }
            // if we have necessary info for final arrival time, inject it
            if (meetingEnd && manuallyEnteredHours !== "true") {
              const { finalArrivalFormatted, missionEndFormatted } =
                calculateReturnArrivalTime(lastItem);
              newDocData.CC_Arrivée = finalArrivalFormatted;
              newDocData.heureFinMission = missionEndFormatted;
            }
            injectDocData({
              fillData: newDocData,
            });
          } catch (error) {
            console.warn(
              "Error fetching return trip distance/duration : ",
              error,
            );
          }
        }
      } else {
        // else there is no return
        try {
          // calling the function with no return
          const distancesAndDurations = await getDistanceAndDuration(
            coordGarage,
            coordDestination,
            waypoints,
          );
          // get the duration
          result.DistanceTrajetAller =
            distancesAndDurations.totalDistanceKm.toFixed(2);
          result.partialDurationList;
          result.DureeTrajetAller = Math.round(
            distancesAndDurations.totalDurationMin,
          );
          partialResult.DistanceTrajetAller =
            distancesAndDurations.partialDistanceKm.toFixed(2);
          partialResult.DureeTrajetAller = Math.round(
            distancesAndDurations.partialDurationMin,
          );
          // put the right duration in collection
          for (let i = 0; i < destinations.length; i++) {
            if (isRDVPec) {
              console.log(
                "A TEST ",
                distancesAndDurations.partialDurationList[i],
              );
              clone[i] = {
                ...clone[i],
                "CC_Destinations|200|Temps de trajet":
                  distancesAndDurations.partialDurationList[i],
                "CC_Destinations|300|Arrivée": getArrivalTime(
                  distancesAndDurations.partialDurationList[i],
                ),
                "CC_Destinations|400|Début de RDV": getArrivalTime(
                  distancesAndDurations.partialDurationList[i],
                ),
              };
            } else {
              clone[i] = {
                ...clone[i],
                "CC_Destinations|200|Temps de trajet":
                  distancesAndDurations.partialDurationList[i],
              };
            }
          }
          const firstItem = clone[0]["CC_Destinations|200|Temps de trajet"];
          const { embarquementFormatted, missionStartFormatted } =
            calculateEmbarquementTime(firstItem);
          const newDocData = {
            CC_Destinations: clone,
            DistanceDepartDestination: partialResult.DistanceTrajetAller,
            DistanceGarageGarage: result.DistanceTrajetAller,
            heureDebutMission: isRDVPec
              ? getDriverStartTime()
              : missionStartFormatted,
            heureFinMission: getFinHeureApprox(),
          };
          // if we have necessary info for embarquement time , inject it
          if (meetingStart && manuallyEnteredHours !== "true") {
            const { embarquementFormatted, missionStartFormatted } =
              calculateEmbarquementTime(firstItem);
            if (docData.TypeTransport === "RDV à la destination") {
              newDocData.CC_Récupération = embarquementFormatted;
            }
            newDocData.heureDebutMission = isRDVPec
              ? getDriverStartTime()
              : missionStartFormatted;
          }
          injectDocData({
            fillData: newDocData,
          });
        } catch (error) {
          console.error("Error fetching initial distance/duration:", error);
          hidePopupLoading();
          return; // On quitte la fonction sans injecter de données
        }
      }
    } catch (error) {
      console.error("Unexpected error in main execution:", error);
    } finally {
      // On s'assure que la popup de chargement est toujours cachée à la fin
      hidePopupLoading();
    }
  } else {
    // on cache le popup de chargement
    hidePopupLoading();
    // get missing fields name
    let errorMsg = "<p>Certaines adresses sont manquantes :</p>";
    getMissingFields().forEach((field) => {
      errorMsg += `<p>- ${field}</p>`;
    });
    // display error popup with details about missing fields
    showPopupError(errorMsg);
  }
};

// Lancer l'exécution
main();
// part 2 that updates the admin fields
const fill = fillAdminFields();
console.log("FILL", fill);
injectDocData({
  fillData: fill,
});
"
"console.log("Function 47", context);

const AREA = window.location.pathname.split("/")[1];
const MAISON = mcrDictionary[AREA];

let options = [];

switch (MAISON) {
  case "MCR Arlon":
    options = [
      {
        title: "2, rue Godefroid Kurth 6700 Arlon",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,684744796222645",
          PriseEnCharge_LongitudeDépartChauffeur: "5,819286978896314",
        },
      },
    ];
    break;
  case "MCR Aubange-Messancy":
    options = [
      {
        title: "26, rue des Chasseurs Ardennais Messancy",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,59399911723281",
          PriseEnCharge_LongitudeDépartChauffeur: "5,816462102353719",
        },
      },
    ];
    break;
  case "MCR Sud Gaume":
    options = [
      {
        title: "8, rue des Combattants - 6760 Virton",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,56911324850798",
          PriseEnCharge_LongitudeDépartChauffeur: "5,53176133311886",
        },
      },
    ];
    break;
  case "MCR Rulles-Semois":
    options = [
      {
        title: "5, rue de France, 6730 Tintigny",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,67813400792049",
          PriseEnCharge_LongitudeDépartChauffeur: "5,512534497541839",
        },
      },
    ];
    break;
  case "MCR Docteur Lagneau":
    options = [
      {
        title: "Rue du Moulin 35, 6830 Bouillon",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,79239361962376",
          PriseEnCharge_LongitudeDépartChauffeur: "5,065566638537235",
        },
      },
      {
        title: "Rue des Quatre Moineaux,Curfoz 23, 6832 Senseruth",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,811781254783476",
          PriseEnCharge_LongitudeDépartChauffeur: "5,080379111550287",
        },
      },
      {
        title: "Rue de l'Our 2, 6852 Opont",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,93557706671891",
          PriseEnCharge_LongitudeDépartChauffeur: "5,118844425052875",
        },
      },
    ];
    break;
  case "MCR Marche":
    options = [
      {
        title: "Rue du Parc Industriel 12, 6900 Marche-en-Famenne",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,22166828201364",
          PriseEnCharge_LongitudeDépartChauffeur: "5,330280238878422",
        },
      },
    ];
    break;

  case "MCR Gembloux":
    options = [
      {
        title: "Rue des Fabriques 1, 5030 Gembloux",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,570797982909184",
          PriseEnCharge_LongitudeDépartChauffeur: "4,696273779072868",
        },
      },
    ];
    break;

  case "MCR Namur":
    options = [
      {
        title: "Rue de l'Industrie 124, 5002 Saint-Servais",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,476084705676924",
          PriseEnCharge_LongitudeDépartChauffeur: "4,847375325679213",
        },
      },
    ];
    break;

  case "MCR Florenville":
    options = [
      {
        title: "Rue de la Station 23, 6820 Florenville",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "49,700049178921795",
          PriseEnCharge_LongitudeDépartChauffeur: "5,315088456321628",
        },
      },
    ];
    break;

  case "MCR Rochefort":
    options = [
      {
        title: "Rue Louis Banneux 8 Rochefort",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "50,162903520201134",
          PriseEnCharge_LongitudeDépartChauffeur: "5,22389961216868",
        },
      },
    ];
    break;
  // Ajouter d'autres cas pour chaque MAISON
  default:
    options = [
      {
        title: "DefaultOption",
        fields: {
          PriseEnCharge_LatitudeDépartChauffeur: "xx",
          PriseEnCharge_LongitudeDépartChauffeur: "xx",
        },
      },
    ];
    break;
}

const mappedOptions = options.map((item) => ({
  key: item.title,
  value: item.title,
  text: item.title,
  items: null,
}));

callback({
  options: {
    PriseEnCharge_LieuDépartChauffeur: mappedOptions,
  },
});

// Vérifier s'il n'y a qu'une seule option et envoyer un second callback avec les données
if (options.length === 1) {
  const selectedOption = options[0];
  callback({
    data: {
      PriseEnCharge_LatitudeDépartChauffeur:
        selectedOption.fields?.PriseEnCharge_LatitudeDépartChauffeur || "",
      PriseEnCharge_LongitudeDépartChauffeur:
        selectedOption.fields?.PriseEnCharge_LongitudeDépartChauffeur || "",
      PriseEnCharge_LieuDépartChauffeur: selectedOption.title || "",
    },
  });
}
"
"console.log("Function 48", context);

// function that gets the area
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};

// Function that gets the starting zone
const getStartingZone = () => {
  const zone = docData.PriseEnCharge_LieuDépartChauffeur;
  return zone;
};

// constant to store area and zone
const resultMcr = getArea();
const resultZone = getStartingZone();

// constant to store value of latitude and longitude
const locations = {
  // if area is MCR Arlon
  "MCR Arlon": {
    // if zone is Parking test 1
    "2, rue Godefroid Kurth 6700 Arlon": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,684744796222645",
      PriseEnCharge_LongitudeDépartChauffeur: "5,819286978896314",
    },
    // add other zones...
  },
  "MCR Aubange-Messancy": {
    // if zone is Parking test 1
    "26, rue des Chasseurs Ardennais Messancy": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,59399911723281",
      PriseEnCharge_LongitudeDépartChauffeur: "5,816462102353719",
    },
    // add other zones...
  },
  "MCR Sud Gaume": {
    "8, rue des Combattants - 6760 Virton": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,56911324850798",
      PriseEnCharge_LongitudeDépartChauffeur: "5,53176133311886",
    },
  },
  "MCR Rulles-Semois": {
    "5, rue de France, 6730 Tintigny": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,67813400792049",
      PriseEnCharge_LongitudeDépartChauffeur: "5,512534497541839",
    },
  },
  "MCR Docteur Lagneau": {
    "Rue du Moulin 35, 6830 Bouillon": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,79239361962376",
      PriseEnCharge_LongitudeDépartChauffeur: "5,065566638537235",
    },
    "Rue des Quatre Moineaux,Curfoz 23, 6832 Senseruth": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,811781254783476",
      PriseEnCharge_LongitudeDépartChauffeur: "5,080379111550287",
    },
    "Rue de l'Our 2, 6852 Opont": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,93557706671891",
      PriseEnCharge_LongitudeDépartChauffeur: "5,118844425052875",
    },
  },
  "MCR Marche": {
    "Rue du Parc Industriel 12, 6900 Marche-en-Famenne": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,22166828201364",
      PriseEnCharge_LongitudeDépartChauffeur: "5,330280238878422",
    },
  },
  "MCR Gembloux": {
    "Rue des Fabriques 1, 5030 Gembloux": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,570825239477514",
      PriseEnCharge_LongitudeDépartChauffeur: "4,696338152084627",
    },
  },
  "MCR Namur": {
    "Rue de l'Industrie 124, 5002 Saint-Servais": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,476084705676924",
      PriseEnCharge_LongitudeDépartChauffeur: "4,847375325679213",
    },
  },
  "MCR Florenville": {
    "Rue de la Station 23, 6820 Florenville": {
      PriseEnCharge_LatitudeDépartChauffeur: "49,700049178921795",
      PriseEnCharge_LongitudeDépartChauffeur: "5,315088456321628",
    },
  },

  "MCR Rochefort": {
    "Rue Louis Banneux 8 Rochefort": {
      PriseEnCharge_LatitudeDépartChauffeur: "50,162903520201134",
      PriseEnCharge_LongitudeDépartChauffeur: "5,22389961216868",
    },
  },
  //add other areas...
};

// constant to store the result of lagitude and longitude then return it
const result = locations[resultMcr]?.[resultZone] || null;
return result;
"
return docData.FORMID;
"console.log('Function 52', context);

const currentStatus = docData.STATUS;
if (currentStatus === "Draft") {
  return { TempsEmbarquement: "00:15", TempsDebarquement: "00:15" };
} else {
  return;
}
"
"console.log('Function 55', context);

if (docData["Planification_Disponiblité"] === "Disponible") {
  return {
    backgroundColor: "#D9DAF2",
      color: "#141972",
      borderColor: "#6E71AF"
  };
} else {
  return {
    backgroundColor: "#ffbfaa ",
      color: "#ad2d03",
      borderColor: "#ad2d03"
  };
}

"
return docData['FORMID'];
"console.log('Function 57', context);

// get the needed const
const status = docData.STATUS;
let retourAnnul = docData.RetourAnnulé;
const retourChecked = docData.CC_Retour;

// to hide the popup
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// if status is draft we do nothing
if (status === "Draft") {
  // do nothing
  return;
} else {
  // updates the checkbox Retour Annulé
  retourAnnul = retourChecked === "true" ? false : true;
  // if the checkbox is true we show a popup
  if (retourAnnul === true) {
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

    // creates the popup
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
                    <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
                      <div>Le retour a été annulé</div>
                      <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
                    </div>
                  `
    );
    // button to close the popup
    const closePopupButton = document.getElementById("closePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
  }
}
window.addEventListener("popstate", hidePopupLoading); // Pour les changements d'URL avec l'historique
window.addEventListener("hashchange", hidePopupLoading);
if (retourAnnul === false) {
  return { RetourAnnulé: false };
} else {
  return { RetourAnnulé: true };
}
"
"console.log("Function 59", context);
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
const showPopup = () => {
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
                <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
                  <div>Veuillez recalculer les distances suite à cette modification.</div>
                  <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
                </div>
              `,
  );
};
// Necessary constants for fields and collections.
const data = docData && typeof docData === "object" ? docData : {};
const destinations = Array.isArray(data.CC_Destinations)
  ? data.CC_Destinations
  : [];
const currentInputKey = typeof inputKey === "string" ? inputKey : "";
const changedIndex = Number.isInteger(indexItemChange) ? indexItemChange : -1;
const tempsSurPlace = "CC_Destinations|500|Temps sur place";
const debutRDV = "CC_Destinations|400|Début de RDV";
const finRDV = "CC_Destinations|600|Fin de RDV";
const arrivee = "CC_Destinations|300|Arrivée";
const recuperation = "CC_Destinations|700|Récupération";

const isValidTime = (value) => {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value.trim())) {
    return false;
  }
  const [hours, minutes] = value.trim().split(":").map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
};

const timeToMinutes = (time) => {
  if (!isValidTime(time)) return null;
  const [hours, minutes] = time.trim().split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalizedMinutes / 60)).padStart(2, "0")}:${String(
    normalizedMinutes % 60,
  ).padStart(2, "0")}`;
};

const addTime = (time1, time2) => {
  const first = timeToMinutes(time1);
  const second = timeToMinutes(time2);
  return first === null || second === null ? null : formatTime(first + second);
};

const subtractTime = (time1, time2) => {
  const first = timeToMinutes(time1);
  const second = timeToMinutes(time2);
  return first === null || second === null ? null : formatTime(first - second);
};

const cloneDestinations = (source = destinations) =>
  (Array.isArray(source) ? source : []).map((destination) =>
    destination && typeof destination === "object" ? { ...destination } : {},
  );

const getChangedDestination = () =>
  changedIndex >= 0 && changedIndex < destinations.length
    ? destinations[changedIndex] || {}
    : null;

if (destinations.length) {
  const calculatedDestinationsTimesData = () => {
    if (currentInputKey === "CC_Destinations" || changedIndex < 0) return {};

    const destination = getChangedDestination();
    if (!destination) return {};

    const updatedDestinations = cloneDestinations();
    const updatedDestination = updatedDestinations[changedIndex];
    const startTime = destination[debutRDV];
    const stayDuration = destination[tempsSurPlace];
    const endTime = destination[finRDV];

    if (isValidTime(startTime)) {
      updatedDestination[arrivee] = formatTime(timeToMinutes(startTime));
    }
    if (isValidTime(startTime) && isValidTime(stayDuration)) {
      const calculatedEndTime = addTime(stayDuration, startTime);
      updatedDestination[finRDV] = calculatedEndTime;
      updatedDestination[recuperation] = calculatedEndTime;
    } else if (isValidTime(endTime)) {
      updatedDestination[recuperation] = formatTime(timeToMinutes(endTime));
    }

    return { CC_Destinations: updatedDestinations };
  };

  // function that gets the info to fill the section INFO DEV heures
  const TimelineDisplayTimesData = (updatedDocData) => {
    const date = "2001-01-01";
    const safeData =
      updatedDocData && typeof updatedDocData === "object"
        ? updatedDocData
        : {};
    const safeDestinations = Array.isArray(safeData.CC_Destinations)
      ? safeData.CC_Destinations
      : [];
    const lastDestination = safeDestinations[safeDestinations.length - 1] || {};
    const result = {};
    const addDate = (time) =>
      isValidTime(time)
        ? `${date}T${formatTime(timeToMinutes(time))}:00`
        : null;

    const start = addDate(safeData.CC_Récupération);
    const outboundEnd = addDate(lastDestination[arrivee]);
    const returnStart = addDate(lastDestination[recuperation]);
    const returnEnd = addDate(safeData.CC_Arrivée);

    if (start && outboundEnd) {
      result.InformationsAdmin_DateHeureDébutAller = start;
      result.InformationsAdmin_DateHeureFinAller = outboundEnd;
    }
    if (returnStart && returnEnd) {
      result.InformationsAdmin_DebutRetour = returnStart;
      result.InformationsAdmin_FinRetour = returnEnd;
    }
    return result;
  };

  const missionDurationData = (updatedDocData) => {
    const calculateMinutesDifference = (strTime1, strTime2) => {
      const first = timeToMinutes(strTime1);
      const second = timeToMinutes(strTime2);
      return first === null || second === null
        ? null
        : Math.abs(first - second);
    };
    const safeData =
      updatedDocData && typeof updatedDocData === "object"
        ? updatedDocData
        : {};
    const safeDestinations = Array.isArray(safeData.CC_Destinations)
      ? safeData.CC_Destinations
      : [];
    const result = { missionDuration: "" };
    const hasAReturnTrip = safeData.CC_Retour === "true";
    const driverShouldStayWithBeneficiary =
      safeData.CheckboxResterAvecBene === "true";
    const missionStartTime = safeData.CC_Récupération;

    if (safeDestinations.length) {
      const lastIndex = safeDestinations.length - 1;
      if (driverShouldStayWithBeneficiary) {
        const lastDestination = safeDestinations[lastIndex] || {};
        const missionEndTime = hasAReturnTrip
          ? safeData.CC_Arrivée
          : lastDestination[finRDV];
        const duration = calculateMinutesDifference(
          missionStartTime,
          missionEndTime,
        );
        if (duration !== null) result.missionDuration = duration;
      } else {
        const timePairs = [
          [missionStartTime, (safeDestinations[0] || {})[arrivee]],
        ];
        for (
          let destinationIndex = 1;
          destinationIndex <= lastIndex;
          destinationIndex++
        ) {
          timePairs.push([
            (safeDestinations[destinationIndex - 1] || {})[recuperation],
            (safeDestinations[destinationIndex] || {})[arrivee],
          ]);
        }
        if (hasAReturnTrip) {
          timePairs.push([
            (safeDestinations[lastIndex] || {})[recuperation],
            safeData.CC_Arrivée,
          ]);
        }
        const durations = timePairs.map(([start, end]) =>
          calculateMinutesDifference(start, end),
        );
        if (durations.every((duration) => duration !== null)) {
          result.missionDuration = durations.reduce(
            (total, duration) => total + duration,
            0,
          );
        }
      }
    }

    return result;
  };

  const fillTempsSurPlaceData = (updatedDocData) => {
    if (currentInputKey !== finRDV || changedIndex < 0) return {};
    const destination = getChangedDestination();
    const stayDuration = subtractTime(
      destination?.[finRDV],
      destination?.[debutRDV],
    );
    if (stayDuration === null) return {};
    const updatedDestinations = cloneDestinations(
      updatedDocData.CC_Destinations,
    );
    updatedDestinations[changedIndex][tempsSurPlace] = stayDuration;
    return { CC_Destinations: updatedDestinations };
  };

  if (
    (data.DistanceGarageGarage || data.DistanceDepartDestination) &&
    changedIndex < 0
  ) {
    showPopup();
    const closePopupButton = document.getElementById("closePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
  }
  const calculatedDestinations = calculatedDestinationsTimesData();
  const updatedDocData = { ...data, ...calculatedDestinations };
  const calculatedTempsSurPlace = fillTempsSurPlaceData(updatedDocData);
  const finalDocData = { ...updatedDocData, ...calculatedTempsSurPlace };
  result = {
    ...calculatedDestinations,
    ...calculatedTempsSurPlace,
    ...TimelineDisplayTimesData(finalDocData),
    ...missionDurationData(finalDocData),
  };
  return result;
}
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
"
"console.log('Function 60', context);

return {AfficherSurTimelineDisponible: 'true'};"
"console.log('Function 61', context);

const disponibilite = docData.Planification_Disponiblité;
// if disponibilité value is disponible checkbox is true
if(disponibilite === 'Disponible'){
    return {AfficherSurTimelineDisponible: true};
} else{
    return {AfficherSurTimelineDisponible: false};
}"
"if (docData["FORMLAYOUTNAME"] === "Disponibilité") {
  if (docData.Planification_Disponiblité === "Disponible") {
    return {
      backgroundColor: "#D9DAF2",
      color: "#141972",
      borderColor: "#6E71AF"
    };
  } else {
    return {
      backgroundColor: "#E9E9F3",
      color: "#545799",
      borderColor: "#C9CAE1"
    };
  }
}
if (docData["FORMLAYOUTNAME"] === "Véhicule") {
  return {
    backgroundColor: "#D3D3D3",
  };
}
"
"console.log("Function 64", context);
// constants
const addressInput = "Contact_AdresseRésidence";
const addressValue = docData[addressInput];

const sessionToken = new google.maps.places.AutocompleteSessionToken();
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);

const collecKeys = {
  key: "AdressePreférées",
  adresse: "AdressePreférées|100|Adresse",
  denom: "AdressePreférées|200|Dénomination",
  rue: "AdressePreférées|500|Rue",
  numero: "AdressePreférées|510|Numéro",
  code: "AdressePreférées|520|Code_postal",
  ville: "AdressePreférées|530|Ville",
  pays: "AdressePreférées|540|Pays",
};

const geocodingMapping = {
  country: "CoorFactu_Pays",
  postal_code: "CoorFactu_Code postal",
  locality: "CoorFactu_Ville",
  street_number: "CoorFactu_Numéro",
  route: "CoorFactu_Rue",
};

// Key name mapping
const keyNameMapping = {
  "CoorFactu_Code postal": "Code Postal",
  CoorFactu_Rue: "Rue",
  CoorFactu_Numéro: "Numéro",
  CoorFactu_Pays: "Pays",
  CoorFactu_Ville: "Ville",
};

// sync functions
// returns the value of a specific address component based on its type
const getComponent = (addressComponents, type) => {
  for (c in addressComponents) {
    const types = addressComponents[c].types;
    if (types.includes(type)) return addressComponents[c].longText;
  }
  return "";
};

// returns the AdressePreférées collection formatted as a suggestion
const addCollection = () => {
  const suggestions = [];
  const collectionLength = docData.AdressePreférées?.length;
  for (let i = 0; i < collectionLength; i++) {
    const adresse = docData.AdressePreférées[i][`${collecKeys.adresse}`];
    const rue = docData.AdressePreférées[i][`${collecKeys.rue}`];
    const numero = docData.AdressePreférées[i][`${collecKeys.numero}`];
    const code = docData.AdressePreférées[i][`${collecKeys.code}`];
    const ville = docData.AdressePreférées[i][`${collecKeys.ville}`];
    const pays = docData.AdressePreférées[i][`${collecKeys.pays}`];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "CoorFactu_Rue",
            name: "Rue",
            value: rue ?? "",
          },
          {
            key: "CoorFactu_Numéro",
            name: "Numéro",
            value: numero ?? "",
          },
          {
            key: "CoorFactu_Code postal",
            name: "Code postal",
            value: code ?? "",
          },
          {
            key: "CoorFactu_Ville",
            name: "Ville",
            value: ville ?? "",
          },
          {
            key: "CoorFactu_Pays",
            name: "Pays",
            value: pays ?? "",
          },
        ],
      });
    }
  }
  return suggestions;
};

// async functions
// Returns a list of suggested places, in order of relevance.
const getGoogleAutocompleteSuggestions = async (address) => {
  return new Promise((resolve, reject) => {
    google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: address,
      sessionToken: sessionToken,
      locationRestriction: bounds,
    }).then(({ suggestions }) => {
      resolve(suggestions);
    });
  });
};

// Fetches the formatted address and its components
// and returns a formatted list containing these fields
const formatSuggestions = async (suggestions) => {
  formattedSuggestions = [];

  const places = suggestions.map((suggestion) =>
    suggestion.placePrediction.toPlace(),
  );

  promises = places.map((place) =>
    place.fetchFields({
      fields: ["formattedAddress", "addressComponents", "displayName"],
    }),
  );

  await Promise.all(promises);

  for (const place of places) {
    const title = place.formattedAddress.includes(place.displayName)
      ? place.formattedAddress
      : place.displayName + ", " + place.formattedAddress;

    formattedSuggestions.push({
      title: title,
      fields: [
        {
          key: "CoorFactu_Rue",
          name: "Rue",
          value: getComponent(place.addressComponents, "route"),
        },
        {
          key: "CoorFactu_Numéro",
          name: "Numéro",
          value: getComponent(place.addressComponents, "street_number"),
        },
        {
          key: "CoorFactu_Code postal",
          name: "Code postal",
          value: getComponent(place.addressComponents, "postal_code"),
        },
        {
          key: "CoorFactu_Ville",
          name: "Ville",
          value: getComponent(place.addressComponents, "locality"),
        },
        {
          key: "CoorFactu_Pays",
          name: "Pays",
          value: getComponent(place.addressComponents, "country"),
        },
      ],
    });
  }
  return formattedSuggestions;
};

// main
const main = async () => {
  console.log("64 - addressValue", addressValue);
  let suggestions = [];

  if (!addressValue) {
    // Use collection 'Adresses préférées'
    suggestions = addCollection();
  } else {
    // Autocomplete the address entered in the field with Google
    const googleSuggestions =
      await getGoogleAutocompleteSuggestions(addressValue);

    suggestions = await formatSuggestions(googleSuggestions);
  }
  console.log("64 - suggestions", suggestions);

  callback({
    suggestions: {
      [addressInput]: suggestions,
    },
  });
};

main();
"
return docData['FORMID'];
"console.log('Function 66', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {InfoDevsMission : true }
} else{
	return {InfoDevsMission : null }
};"
"console.log("Function 71", context);

// constants
const getInputValue = () => {
  if (indexItemChange >= 0) {
    const prefix = inputKey.split("|")[0];
    return docData[prefix][indexItemChange][inputKey];
  } else {
    return docData[inputKey];
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

const addressValue = getInputValue();
const indexItem = context.indexItemChange;

const isCompleteAddress = (value) => {
  if (typeof value !== "string") return false;

  const normalizedValue = value.trim();
  const hasCivicNumberAndStreet = /^\d+[\w-]*\s+\S+/i.test(normalizedValue);
  const hasPostalCode = /\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/i.test(normalizedValue);
  const hasSeparateCity = normalizedValue.split(",").length >= 2;

  return hasCivicNumberAndStreet && (hasPostalCode || hasSeparateCity);
};

const addressIsComplete = isCompleteAddress(addressValue);

const sessionToken = new google.maps.places.AutocompleteSessionToken();
const sw = new google.maps.LatLng(48.3413, 0.4409);
const ne = new google.maps.LatLng(51.8722, 7.9471);
const bounds = new google.maps.LatLngBounds(sw, ne);

// sync functions
// returns the value of a specific address component based on its type
const getComponent = (addressComponents, type) => {
  for (c in addressComponents) {
    const types = addressComponents[c].types;
    if (types.includes(type)) return addressComponents[c].longText;
  }
  return "";
};

// async
// Returns a list of suggested places, in order of relevance.
const getGoogleAutocompleteSuggestions = async (address) => {
  return new Promise((resolve, reject) => {
    google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: address,
      sessionToken: sessionToken,
      locationRestriction: bounds,
    })
      .then(({ suggestions }) => resolve(suggestions))
      .catch(reject);
  });
};

// Fetches the formatted address and its components, location
// and returns a formatted list containing these fields
const formatSuggestions = async (suggestions) => {
  const formattedSuggestionsAP = [];
  for (let suggestion of suggestions) {
    const placePrediction = suggestion.placePrediction;
    const place = placePrediction.toPlace();

    await place.fetchFields({
      fields: [
        "formattedAddress",
        "displayName",
        "location",
        "addressComponents",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
      ],
    });

    const title = place.formattedAddress;

    const fieldsAP = [
      {
        key: "AdressePreférées|200|Dénomination",
        name: "Dénomination",
        value: place.formattedAddress.includes(place.displayName)
          ? ""
          : place.displayName,
      },
      {
        key: "AdressePreférées|500|Rue",
        name: "Rue",
        value: getComponent(place.addressComponents, "route"),
      },
      {
        key: "AdressePreférées|510|Numéro",
        name: "Numéro",
        value: getComponent(place.addressComponents, "street_number"),
      },
      {
        key: "AdressePreférées|520|Code_postal",
        name: "Code_postal",
        value: getComponent(place.addressComponents, "postal_code"),
      },
      {
        key: "AdressePreférées|530|Ville",
        name: "Ville",
        value: getComponent(place.addressComponents, "locality"),
      },
      {
        key: "AdressePreférées|540|Pays",
        name: "Pays",
        value: getComponent(place.addressComponents, "country"),
      },
      {
        key: "AdressePreférées|800|Latitude",
        name: "Latitude",
        value: place.location.lat(),
      },
      {
        key: "AdressePreférées|810|Longitude",
        name: "Longitude",
        value: place.location.lng(),
      },
      {
        key: "AdressePreférées|900|Telephone",
        name: "Téléphone",
        value:
          place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      },
    ];

    formattedSuggestionsAP.push({
      title: title,
      fields: fieldsAP,
    });
  }
  return formattedSuggestionsAP;
};

// Returns suggestions based on the AdressePreférées collection
const getPreferredAddressSuggestions = () => {
  const collection = "AdressePreférées|100|Adresse";
  const collectionDeno = "AdressePreférées|200|Dénomination";
  const collectionLat = "AdressePreférées|800|Latitude";
  const collectionLng = "AdressePreférées|810|Longitude";
  const suggestions = [];

  for (const item of docData.AdressePreférées) {
    const adresse = item[collection];
    if (adresse) {
      suggestions.push({
        title: adresse,
        fields: [
          {
            key: "Dénomination",
            value: item[collectionDeno] ?? "",
            name: "Dénomination",
          },
          {
            key: "CC_Latitude",
            name: "Latitude",
            value: item[collectionLat] ?? "",
          },
          {
            key: "CC_Longitude",
            name: "Longitude",
            value: item[collectionLng] ?? "",
          },
        ],
      });
    }
  }
  return suggestions;
};

// main
const main = async () => {
  let suggestions;

  if (addressValue && !addressIsComplete) {
    try {
      const googleSuggestions =
        await getGoogleAutocompleteSuggestions(addressValue);

      const formattedSuggestions = await formatSuggestions(googleSuggestions);

      if (formattedSuggestions.length > 0) {
        suggestions = formattedSuggestions;
      }
    } catch (error) {
      console.error("30 - google suggestions error", error);
      showErrorBanner("Erreur lors de la recherche des adresses.");
    }
  }

  console.log("71 - suggestions", suggestions);

  callback({
    suggestions: {
      [inputKey]: addressIsComplete
        ? []
        : suggestions || getPreferredAddressSuggestions(),
    },
  });
};

main();
"
"console.log('Function 73', context)

let result

switch (docData['Planification_Récurrence']) {
  case 'Une seule fois':
    result = {
      Planification_Date: true,
      Planification_Répéter: null,
      Planification_DateFin: null,
      Planification_MultiDate: null
    }
    break
  case 'Par semaine':
    result = {
      Planification_Date: true,
      Planification_Répéter: true,
      Planification_DateFin: true,
      Planification_MultiDate: null
    }
    break
  case 'Par jour spécifique':
    result = {
      Planification_Date: null,
      Planification_Répéter: null,
      Planification_DateFin: null,
      Planification_MultiDate: true
    }
    break
}

return result
"
"console.log('Function 74', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {InformationDEVELOPPEUR : true }
} else{
	return {InformationDEVELOPPEUR : null }
};
"
"console.log('Function 75', context);
const { CoorFactu_Qualité } = docData;

const returnFields = CoorFactu_Qualité === 'Bénéficiaire' ? 
{ 
    INFODEV_NomComplet: `${docData.Prénom} ${docData.Nom}`,
    CoorFactu_Prénom: docData.Prénom,
    CoorFactu_Nom: docData.Nom,
} : 
{ 
    INFODEV_NomComplet: `${docData.Prénom} ${docData.Nom}`,
};

return returnFields;"
"console.log("Function 76", context);
const prix = parseFloat(docData.MontantInitial);
const remise = parseFloat(docData.CalculPrix_Remise);
const prixInitialHorsForfaitTotal = parseFloat(
  docData.Facture_PrixInitialHorsForfait
);
const totalForfaits = parseFloat(docData.Facture_PrixDesForfaits);
if (prix && remise) {
  const montantASoustraire = (prixInitialHorsForfaitTotal * remise) / 100;
  const montantFinalDu =
    prixInitialHorsForfaitTotal - montantASoustraire + totalForfaits;
  const result = montantFinalDu.toFixed(2);
  return { MontantDû: `${result}` };
} else {
  return { MontantDû: prix };
}
"
"console.log("Function 77", context);

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
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
            `
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

const AREA = window.location.pathname.split("/")[1];

const updateForms = async (body) => {
  try {
    // webhook n8n
    fetch("https://n8n.mcrbe-test.fastercom.io/webhook/CalculateFacture", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => {
      hidePopupLoading();
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des formulaires :", error);
    hidePopupLoading();
    throw error;
  }
};

// main
const main = async () => {
  const data = {
    Maison: mcrDictionary[AREA],
  };
  try {
    let message = "Veuillez patienter, s'il vous plaît.";
    showPopupLoading(message);
    await updateForms({ data });
  } catch (error) {
    console.error(error);
  }
};

main();
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
"
"console.log("Function 78", context);

const isTestEnvironment = true;

/* DELETE EVERY _TEST FOR PRODUCTION ENVIRONMENT AND MODIFY REPLACE_TEST FUNCTION**/
/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
const errorRenseignerPrix = "Veuillez renseigner tous les prix.";
const errorMultipleFactureNumbers = `Ce numéro de facture n'est pas unique`;
// function to show the popup loading
const showPopupLoading = (message) => {
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
                <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
                  <div>${message}</div>
                  <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
                </div>
              `,
  );
};

// function to show the popup loading while waiting for api
const showPopupLoadingWaiting = () => {
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
                  <div>Validation en cours</div>
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

const getProfil = async () => {
  try {
    const MCR = docData["Maison"];
    const apiFilters2 = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Profil MCR",
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: MCR,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    console.log("API FILTER", apiFilters2);
    const responseID = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters2,
    });
    const ids = responseID?.data?.ids;

    const responseInfos = await api({ local: true }).post("document/id", {
      ids,
    });

    console.log("------responseInfos", responseInfos);

    const parsedData = responseInfos.data.documents.map((info) => ({
      ...JSON.parse(info.data),
      FORMID: info.metaData["FORMID"],
    }));

    return parsedData?.[0] || [];
  } catch (error) {
    console.log("Erreur", error);
    hidePopupLoading();
  }
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

let factureNumbers = [];
// function that gets every facture numbers for current month + 1
const getNumberFacture = async (mois, annee, Maison) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "FACTURE",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "NOTIN",
        value: "Brouillon|Draft|Supprimé(e)",
        type: "TEXT",
      },
      {
        key: "NuméroFacture",
        operator: "CONTAINS",
        value: `${annee}-${mois.toString().padStart(2, "0")}`,
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: Maison,
        type: "TEXT",
      },
    ];
    // get the ids of the invoices
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const idsFacture = res?.data?.ids;
    // if there is already facture ids
    if (idsFacture.length) {
      // get the facture informations
      const res2 = await api({ local: true }).post("document/id", {
        ids: idsFacture,
      });
      //parse the info
      const factureListNumber = res2.data.documents.map((documentDispo) =>
        JSON.parse(documentDispo.data),
      );
      // push the numéroFacture in the list to compare later
      factureListNumber.forEach((numero) => {
        factureNumbers.push(numero.NuméroFacture);
      });
      console.log("FACTURE LIST", factureNumbers);
      // call the function that returns the new facture number
      return getNewFactureNumber(factureNumbers, mois, annee);
    }
    // else there is no facture for this current month + 1 create new number
    else {
      let factureNo = `${annee}-${mois.toString().padStart(2, "0")}-001`;
      if (isTestEnvironment) {
        factureNo += "_TEST";
      }
      return factureNo;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

// function that compares and gets the biggest number to add +1 to it
const getNewFactureNumber = (factureNumbers, mois, annee) => {
  // parse through the list and get rid of _TEST
  const allNumbers = factureNumbers.map((nombre) => {
    return parseInt(nombre.replace("_TEST", "").split("-")[2]);
  });
  console.log("ALL NUMBERS", allNumbers);
  // Trouver la plus grande valeur dans le tableau

  const maxValue = Math.max(...allNumbers);
  const nextNumber = maxValue + 1;

  let formattedNumber = "";
  if (nextNumber < 100) {
    formattedNumber = nextNumber.toString().padStart(3, "0");
  } else {
    formattedNumber = nextNumber.toString(); // 100 et plus
  }

  let result = `${annee}-${mois
    .toString()
    .padStart(2, "0")}-${formattedNumber}`;
  if (isTestEnvironment) {
    result += "_TEST";
  }
  return result;
};

// constant to update the facture form and missions related form
const updateDocuments = async (formData, formId, missionList) => {
  // for the facture doc
  const documentFacture = {
    data: formatDataAPI(formData),
    status: "Validée",
    active: true,
    template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
    documentID: formId,
  };
  // for the missions doc
  const documentMission = missionList.map((mission) => ({
    documentID: mission.id,
    status: "Facturée",
    active: true,
    template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" },
  }));
  // create a 'mega-list'
  const formsList = [documentFacture, ...documentMission];

  // put/many for multiple updates (on facture and missions)
  const res = await api({ local: true }).put("document/Many", {
    documents: formsList,
  });

  return res;
};

// step that verifies if the number is present
const verifyUniqueNumberFacture = async (numéroFacture) => {
  const apiFiltersVerify = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "FACTURE",
      type: "TEXT",
    },
    {
      key: "NuméroFacture",
      operator: "EQUALS",
      value: numéroFacture,
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];

  const res = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersVerify,
  });
  const ids = res?.data?.ids;
  console.log("Résultat de la vérification du bénéficiaire :", ids);
  return ids; // Retourne le nombre d'éléments
};

// updates the facture unique number
const updateFactureUniqueNumber = async (numéroFacture) => {
  try {
    const datacloned = { ...docData };
    datacloned.NuméroFacture = numéroFacture;
    // for the facture doc
    const document = {
      data: formatDataAPI(datacloned),
      status: "Brouillon",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: docData.FORMID,
    };
    // put/many for multiple updates (on facture and missions)
    const res = await api({ local: true }).put("document", {
      document,
      preventNotify: "FULL",
    });
    return res;
  } catch (error) {
    console.log("Erreur lors de la mise à jour du numéro séquentiel :", error);
  }
};

// function to get the related missions Infos
const getMissionInfo = async () => {
  const apiFiltersMission = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Mission",
      type: "TEXT",
    },
    {
      key: "IdentifiantFacture",
      operator: "EQUALS",
      value: docData.FORMID,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "NOTIN",
      value: "Supprimé(e)|Refusée|Annulée|Draft",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];

  // get the id of the form
  const res1 = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersMission,
  });
  const idsMission = res1.data.ids;

  // get the infos
  const res2 = await api({ local: true }).post("document/id", {
    ids: idsMission,
  });
  //parse the info
  const missionList = res2.data.documents.map((mission) => ({
    ...JSON.parse(mission.data),
    id: mission.documentID,
    number: mission.number,
  }));
  console.log("missionList", missionList);
  return missionList;
};

// constant to injectMissionSupp
const injecterMissionSupplémentaire = (
  description,
  missionLabel = "Mission(s) supplémentaire(s)",
) => {
  const lignes = description.split("\n");
  const indexDepart = lignes.findIndex((line) =>
    line.trim().startsWith("Départ"),
  );
  if (indexDepart !== -1) {
    lignes.splice(indexDepart, 0, missionLabel);
  } else {
    lignes.push(missionLabel); // fallback si "Lieu de départ" non trouvé
  }
  return lignes.join("\n");
};

// function to generate the PDF
const createPDF = async (missionList, numéroFacture, profilInfo) => {
  // necessary constant for mission Info
  const now = new Date();
  const factureTodayDate =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  const tableDataMission = [
    {
      headers: [
        "Date (Numéro de mission)",
        "Description",
        "Quantité",
        "Prix unitaire",
        "Remise",
        "Prix Final",
      ],
      rows: [],
    },
  ];
  const groupedRows = [];
  const result = [];
  // necessary lists for the tableDataMission
  const missionDateStorage = [];
  let missionDate = [];
  let missionDescription = [];
  let missionQuantite = [];
  let missionPrixUni = [];
  let missionRemise = [];
  let missionFinalPrice = [];
  let listeDestination = [];
  let missionPrixUniFinal = [];
  /**
   * INFO ABOUT CLIENT ADDRESS AND NAME
   */
  const {
    CoorFactu_Rue,
    CoorFactu_Numéro,
    CoorFactu_Ville,
    CoorFactu_Pays,
    CoorFactu_Prénom,
    CoorFactu_Nom,
    "CoorFactu_Code postal": CoorFactu_CodePostal,
    Maison,
    MontantInitial,
    CalculPrix_Remise,
    MontantDû,
    PrénomSelected,
    Nom,
    CommentaireFacture,
  } = docData;
  const clientAddress = `${CoorFactu_Rue} ${CoorFactu_Numéro}`;
  const clientAdressPt2 = `${CoorFactu_CodePostal} ${CoorFactu_Ville} ${CoorFactu_Pays}`;
  const clientName = `${CoorFactu_Prénom} ${CoorFactu_Nom.toUpperCase()}`;
  const beneName = `${PrénomSelected} ${Nom}`;
  /* here we treat the mcr informations */
  // necessary info for mcr
  let mcrStreet;
  let mcrName;
  let mcrIban;
  let mcrForm;
  let mcrPhone;
  let mcrTVA;
  let mcrTown;
  let mcrBeneficiaire;
  /*******  INFO FOR HOUSES *******/
  mcrStreet = profilInfo?.AdresseMCR || "";
  mcrPhone = profilInfo?.TelephoneMCR || "";
  mcrTVA = profilInfo?.TVAMCR || "";
  mcrName = profilInfo?.NomMCR || "";
  mcrIban = profilInfo?.IBANMCR || "";
  mcrForm = profilInfo?.BIC || "";
  mcrBeneficiaire = profilInfo?.NomMCR || "";
  // if house is arlon
  if (Maison === "MCR Arlon") {
    mcrTown = "ARLON";
  }
  // if house is Aubange-Messancy
  if (Maison === "MCR Aubange-Messancy") {
    mcrTown = "AUBANGE-MESSANCY";
  }
  if (Maison === "MCR Sud Gaume") {
    mcrTown = "SUD GAUME";
  }
  if (Maison === "MCR Rulles-Semois") {
    mcrTown = "RULLES-ET-SEMOIS";
  }
  if (Maison === "MCR Docteur Lagneau") {
    mcrTown = "DR LAGNEAU";
  }

  if (Maison === "MCR Marche") {
    mcrTown = "MARCHE";
  }

  if (Maison === "MCR Gembloux") {
    mcrTown = "GEMBLOUX";
  }

  if (Maison === "MCR Namur") {
    mcrTown = "NAMUR";
  }

  if (Maison === "MCR Florenville") {
    mcrTown = "FLORENVILLE";
  }

  if (Maison === "MCR Rochefort") {
    mcrTown = "ROCHEFORT";
  }
  // add other maison conditions ...

  // tri to put them in order (old to new)
  missionList.sort((a, b) => {
    const dateA = new Date(a.Planification_Date);
    const dateB = new Date(b.Planification_Date);
    return dateA - dateB; // ordre croissant (plus vieux en premier)
  });
  /* LOOP AND REDECLARE CONSTANTS FOR EACH MISSION */
  missionList.forEach((mission) => {
    const {
      Planification_Date,
      CalculPrix_CalculKilomètrage,
      DistanceGarageGarage,
      DistanceDepartDestination,
      CalculPrixBis_PrixInitial,
      CalculPrix_Remise,
      CalculPrix_Prix,
      CC_AdresseDépart,
      CC_Destinations,
      CalculPrixBis_TarifAppliqué,
      CalculPrix_PrixParKmEuro,
      CalculPrix_PrixForfaitPriseEnChargeEuro,
      CC_Retour,
      number,
      MontantKmSupp,
      NbKMSupp,
      CalculPrix_NbKMCouvertForfaitPriseEnCharge,
    } = mission;
    const montantKMSUPP = Number(MontantKmSupp);
    const nbKMSUPP = Number(NbKMSupp);
    missionPrixUniFinal.push(Number(CalculPrix_Prix));
    // re initialize lists
    missionDate = [];
    missionQuantite = [];
    missionPrixUni = [];
    missionRemise = [];
    missionFinalPrice = [];
    missionDescription = [];
    listeDestination = [];

    // re format the missions dates and add the mission number
    let missionNumber = number;
    let missionParts = Planification_Date.split("-");
    let missionDateFormatted = `${missionParts[2]}/${missionParts[1]}/${missionParts[0]}`;
    // get the date of mission and push it
    missionDate.push(`${missionDateFormatted} (${missionNumber})`);
    // and we store it to use it as verification for emission date
    missionDateStorage.push(Planification_Date);

    const missionDestinationsLength = CC_Destinations || 0;
    for (let i = 1; i <= missionDestinationsLength; i++) {
      const address = mission[`CC_Destinations|100|Adresse|${i}`];
      listeDestination.push(address);
    }
    const destinations = listeDestination.join("\n");
    /* here we get right description details*/
    const forfait = CalculPrixBis_TarifAppliqué;
    const trajetInfo = CC_Retour === "true" ? "Aller-Retour" : "Aller";

    /***************** HERE IS WHERE WE PUSH INFO IN LISTS DEPENDING ON CASES *******************/
    /*** if km is garage to garage *******/
    if (
      CalculPrix_CalculKilomètrage === "Du garage au garage" &&
      CalculPrix_CalculKilomètrage
    ) {
      // if there is a km supplémentaires and forfait
      if (montantKMSUPP && nbKMSUPP) {
        const km = DistanceGarageGarage;
        // push info in the lists (Description, quantitie, Prix unitaire, final price)
        missionDescription.push(
          `${trajetInfo}, ${forfait}\nKM parcourus: \nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait) \nKm supplémentaire au-delà du forfait\nDépart: ${CC_AdresseDépart} \nDestinations : ${destinations}`,
        );
        missionQuantite.push(`\n${km}\n1\n${nbKMSUPP}`);
        missionPrixUni.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${CalculPrix_PrixParKmEuro}`,
        );
        missionFinalPrice.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${montantKMSUPP}`,
        );
      }
      // else proceed as usual
      else {
        const km = DistanceGarageGarage;
        // if there is a forfait
        if (CalculPrix_PrixForfaitPriseEnChargeEuro) {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait)\nDépart: ${CC_AdresseDépart} \nDestinations : ${destinations}`,
          );
          missionQuantite.push(`\n${km}\n1`);
          missionPrixUni.push(`\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`);
          missionFinalPrice.push(
            `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`,
          );
        }
        // else no forfait
        else {
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nDépart: ${CC_AdresseDépart} \nDestinations : ${destinations}`,
          );
          missionQuantite.push(`\n${km}`);
          missionPrixUni.push(`\n${CalculPrix_PrixParKmEuro}`);
          missionFinalPrice.push(`\n${CalculPrixBis_PrixInitial}`);
        }
      }
      /*** else if km is départ to destination*******/
    } else if (
      CalculPrix_CalculKilomètrage ===
        "Du lieu de départ au lieu de destination" &&
      CalculPrix_CalculKilomètrage
    ) {
      // if there is a km supplémentaires and forfait
      if (montantKMSUPP && nbKMSUPP) {
        const km = DistanceDepartDestination;
        // push info in the lists (Description, quantitie, Prix unitaire, final price)
        missionDescription.push(
          `${trajetInfo}, ${forfait}\nKM parcourus: \nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait) \nKm supplémentaire au-delà du forfait\nDépart: ${CC_AdresseDépart} \nDestinations : ${destinations}`,
        );
        missionQuantite.push(`\n${km}\n1\n${nbKMSUPP}`);
        missionPrixUni.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${CalculPrix_PrixParKmEuro}`,
        );
        missionFinalPrice.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${montantKMSUPP}`,
        );
      } else {
        const km = DistanceDepartDestination;
        // if there is a forfait
        if (CalculPrix_PrixForfaitPriseEnChargeEuro) {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait)\nDépart: ${CC_AdresseDépart} \nDestinations : ${destinations}`,
          );
          missionQuantite.push(`\n${km}\n1`);
          missionPrixUni.push(`\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`);
          missionFinalPrice.push(
            `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`,
          );
        } else {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nDépart: ${CC_AdresseDépart} \nDestinations : ${destinations}`,
          );
          missionQuantite.push(`\n${km}`);
          missionPrixUni.push(`\n${CalculPrix_PrixParKmEuro}`);
          missionFinalPrice.push(`\n${CalculPrixBis_PrixInitial}`);
        }
      }
    } // else proceed as usual
    else {
      missionDescription.push(
        `${trajetInfo}\nNombre de KM : ... \nDépart: ${CC_AdresseDépart} \nDestination(s) : \n${destinations}`,
      );
      missionQuantite.push(``);
      missionPrixUni.push(``);
      missionFinalPrice.push(``);
    }

    // push remise in the list
    missionRemise.push(
      CalculPrix_Remise ? `\n\n\n${CalculPrix_Remise} %` : "\n\n\n0 %",
    );

    /* // new entry for tableDataMission
    tableDataMission[0].rows.push([
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ]); */
    const currentRow = [
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ];
    currentRow._missionsCount = 1;
    currentRow._prixSource = parseFloat(CalculPrix_Prix);
    currentRow._originalKey = [...currentRow];

    const currentRowOriginal = [
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ];

    const existingIndex = groupedRows.findIndex((row) => {
      const original = row._originalKey;
      if (!original) return false;
      for (let i = 1; i < 6; i++) {
        if (original[i] !== currentRowOriginal[i]) return false;
      }
      return true;
    });

    if (existingIndex !== -1) {
      const existingRow = groupedRows[existingIndex];

      existingRow._missionsCount = (existingRow._missionsCount || 1) + 1;

      existingRow[0] += `\n${currentRow[0]}`;
      if (existingRow._missionsCount === 2) {
        existingRow[1] = injecterMissionSupplémentaire(
          existingRow[1],
          "Mission(s) supplémentaire(s)",
        );
      }
    } else {
      currentRow._totalFinal =
        parseFloat(currentRow[5].replace(/[^\d.-]/g, "")) || 0;
      groupedRows.push(currentRow);
    }
  });

  groupedRows.forEach((row) => {
    if (row._missionsCount > 1) {
      const count = row._missionsCount - 1; // Nombre de missions supplémentaires
      const prix = row._prixSource; // Prix unitaire de la mission supplémentaire
      const total = (prix * count).toFixed(2); // Total des missions supplémentaires

      // Ajouter "Mission(s) supplémentaire(s)" seulement une fois à la fin du groupe
      row[2] += `\n${count}`; // Nombre de missions supplémentaires
      row[3] += `\n${prix}`; // Prix unitaire
      row[5] += `\n${total}`; // Total price for the additional missions
    }
  });

  // Nettoyer les props temporaires
  tableDataMission[0].rows = groupedRows.map((row) => {
    delete row._missionsCount;
    delete row._totalFinal;
    delete row._originalKey;
    return row;
  });

  // this part is for the mois prestation
  // recuperate the biggest date to use
  let maxDateCalcul = new Date(
    Math.max(...missionDateStorage.map((date) => new Date(date))),
  );
  const maxDateToUse = maxDateCalcul.toISOString().split("T")[0];
  const emissionDateYear = maxDateToUse.split("-")[0];
  const emissionDateMonth = maxDateToUse.split("-")[1];
  const moisPrestation = `${emissionDateYear}-${emissionDateMonth}`;

  /* here we calculate the biggest date and use it as emission date */
  missionDateStorage.push(factureTodayDate);
  // recuperate the biggest date to use
  let maxDate = new Date(
    Math.max(...missionDateStorage.map((date) => new Date(date))),
  );
  let dateEcheance = new Date(maxDate);
  dateEcheance.setDate(dateEcheance.getDate() + 60);
  const emissionDate = maxDate.toISOString().split("T")[0];
  console.log("EMISSION DATE (MAX DATE) ", emissionDate);

  const echeanceDate = dateEcheance.toISOString().split("T")[0];

  // re format the emissionDate and echeance date
  const emissionDateParts = emissionDate.split("-");
  const emissionDateFormatted = `${emissionDateParts[2]}/${emissionDateParts[1]}/${emissionDateParts[0]}`;
  const echeanceDateParts = echeanceDate.split("-");
  const echeanceDateFormatted = `${echeanceDateParts[2]}/${echeanceDateParts[1]}/${echeanceDateParts[0]}`;
  /* push the data informations of ODS file*/
  for (let b = 0; b < missionList.length; b++) {
    const factureInfo = `{ "NoFacture": "${numéroFacture}", 
    "Title": "FACTURE", "Date": "${emissionDateFormatted}", "Échéance": "${echeanceDateFormatted}", "Adresse": "${mcrStreet}",
      "Name": "${mcrTown}", "Telephone": "${mcrPhone}", "TVAMCR": "${mcrTVA}", "BeneName": "${beneName}", "Comment": "${
        CommentaireFacture || ""
      }",
       "ClientName": "${clientName}", "ClientAddress": "${clientAddress}", "ClientAddressPt2": "${clientAdressPt2}",
      "SsTot": "${MontantInitial} €", "TVAM": "0 €", "Rem": "${
        CalculPrix_Remise ? CalculPrix_Remise : 0
      } %", "Tot": "${MontantDû} €", "donneeMontant": "${MontantDû} €",
      "donneeBene": "${mcrBeneficiaire}", "donneeIban": "${mcrIban}", 
      "donneeIdBanque": "${mcrForm}", "donneeCommunication": "${numéroFacture}",}`;
    result.push(factureInfo);
  }
  console.log("RESULT", result);
  console.log("NUMÉRO FACTURE", numéroFacture);
  console.log("TABLEDAAMISSION", tableDataMission);
  const res10 = await api({ local: true }).post(
    `document/download/sheets/Facture/pdf/${numéroFacture}`,
    {
      sheets: [
        {
          name: "InvoiceSheet",
          datas: result,
          sheetNames: [numéroFacture],
          tableDatas: [tableDataMission],
        },
      ],
    },
  );
  console.log("RES10", res10);
  const fileUrl = res10.data.fileUrl;
  return { fileUrl, emissionDate, moisPrestation };
};

// function to convert and update the facture form
const convertAndUpdateFactureForm = async (
  missionList,
  fileUrl,
  numéroFacture,
  emissionDate,
  moisPrestation,
) => {
  if (!fileUrl) {
    console.error("URL du fichier non trouvée dans la réponse.");
    return;
  }
  // Step 1: Get the file and convert in base64
  const fileDataString = await fetch(fileUrl)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1]; // Extraction du Base64
            resolve(
              `{"filename":"${btoa(
                numéroFacture,
              )}.pdf","data":"data:application/vnd.oasis.opendocument.spreadsheet;base64,${base64Data}"}`,
            );
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    )
    .catch((error) => {
      console.error(
        "Erreur lors du téléchargement ou conversion du fichier :",
        error,
      );
      return null;
    });

  if (!fileDataString) return;

  // Step 2: Update the form
  const clonedDocData = { ...docData };
  clonedDocData.NuméroFacture = numéroFacture;
  clonedDocData.DateEnvoi = emissionDate;
  clonedDocData.FichierPDFFacture = fileDataString;
  clonedDocData.MoisDesPrestations = moisPrestation;
  console.log("Mise à jour des données du formulaire :", clonedDocData);
  console.log("ID du formulaire à mettre à jour :", docData.FORMID);

  // last step update the documents for mission and facture
  await updateDocuments(clonedDocData, docData.FORMID, missionList);
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

// main
const main = async (docData) => {
  if (isValidDocument(t, docData) === undefined) {
    // we show the waiting popup
    showPopupLoadingWaiting();
    // get the date, month and year
    const date = new Date();
    const mois = date.getMonth() + 1;
    const annee = date.getFullYear();
    const MCR = docData["Maison"];
    const profilInfo = await getProfil();
    // Get the new facture number
    const numéroFacture = await getNumberFacture(mois, annee, MCR);
    console.log("Numéro de facture", numéroFacture);
    // get the mission Infos
    const missionList = await getMissionInfo();

    // step 1 : update the invoice form with the "Numéro séquentiel unique" that we want to give to the pdf file
    const updateFactureResponse =
      await updateFactureUniqueNumber(numéroFacture);

    // here we update the facture number and verifies if it unique
    try {
      // Step 2 : Verify that there is only one form with this "Numéro séquentiel unique" among  all the invoice forms
      const id = await verifyUniqueNumberFacture(numéroFacture);
      console.log("ID", id);
      // If there is only one form, continue
      if (id.length === 1) {
        console.log("yes only 1!");
        // create the pdf and get the file from url
        const { fileUrl, emissionDate, moisPrestation } = await createPDF(
          missionList,
          numéroFacture,
          profilInfo,
        );
        // convert and update the facture form and give all the necessary infos
        await convertAndUpdateFactureForm(
          missionList,
          fileUrl,
          numéroFacture,
          emissionDate,
          moisPrestation,
        );
        hidePopupLoading();
        navigateBack();
        //redirectToViewGroup();
      }
      // Else, show error message
      else {
        hidePopupLoading();
        showPopupLoading(errorMultipleFactureNumbers);
        console.log(
          "Erreur plusieurs documents possède ce numéro de facture :",
        );
        // button to close the popup
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
      }
    } catch (error) {
      console.log("Erreur lors de la vérification du numéro séquentiel", error);
    }
  }
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main(docData);
"
"console.log("Function 79", context);

const isChecked = docData.EntrerHeuresManuellement;
if (isChecked === "true") {
  return {
    "CC_Destinations|300|Arrivée": true,
    "CC_Destinations|700|Récupération": true,
    "CC_Destinations|400|Début de RDV": true,
    "CC_Destinations|500|Temps sur place": true,
    "CC_Destinations|600|Fin de RDV": true,
  };
} else if (
  (isChecked === "false" || !isChecked) &&
  docData.TypeTransport === "RDV à la destination"
) {
  return {
    "CC_Destinations|300|Arrivée": true,
    "CC_Destinations|700|Récupération": null,
    "CC_Destinations|400|Début de RDV": true,
    "CC_Destinations|500|Temps sur place": true,
    "CC_Destinations|600|Fin de RDV": true,
  };
} else {
  return {
    "CC_Destinations|300|Arrivée": true,
    "CC_Destinations|700|Récupération": null,
    "CC_Destinations|400|Début de RDV": null,
    "CC_Destinations|500|Temps sur place": null,
    "CC_Destinations|600|Fin de RDV": null,
  };
}
"
"console.log("function80", context);
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
// get the are
const resultMcr = getArea();
// store necessary constants
const {
  PrénomSelected,
  Nom,
  DateDeNaissance,
  PriseEnCharge_VéhiculeUtilisé,
  PriseEnCharge_VéhiculeUtiliséRetour,
  FORMLAYOUTID,
  NomFormMission,
  Planification_Date,
  Catégorie,
  TPMR,
} = docData;
let driverMissionCompatible;
// messages constants
const messageFromDispoForm =
  "Certaines missions sont incompatibles avec ce chauffeur";
const messageFromMissionForm =
  "Un ou plusieurs chauffeurs sont incompatibles avec cette mission";
// api filter for drivers data
const apiFiltersChauffeur = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
  {
    key: "Prénom",
    operator: "EQUALS",
    value: PrénomSelected,
    type: "TEXT",
  },
  {
    key: "Nom",
    operator: "EQUALS",
    value: Nom,
    type: "TEXT",
  },
  {
    key: "DateDeNaissance",
    operator: "EQUALS",
    value: DateDeNaissance,
    type: "DATE",
  },
];

// api filter for missions with matching vehicle (Aller)
const apiFiltersMissionVehiculeAller = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTEQUALS",
    value: "Supprimé(e)",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtilisé,
    type: "TEXT",
  },
];

// api filter for missions with matching vehicle (Retour)
const apiFiltersMissionVehiculeRetour = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTEQUALS",
    value: "Supprimé(e)",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtiliséRetour",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtiliséRetour,
    type: "TEXT",
  },
];

// api filter for availabilty matching vehicle aller from form mission
const apiFiltersAvailabilityAller = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtilisé,
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
];
// api filter for availabilty matching vehicle return from form mission
const apiFiltersAvailabilityRetour = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: PriseEnCharge_VéhiculeUtiliséRetour,
    type: "TEXT",
  },
  {
    key: "Planification_Date",
    operator: "EQUALS",
    value: Planification_Date,
    type: "TEXT",
  },
];

// function that gets the driver data with his name etc... from availabilities form
const getDriverData = async () => {
  try {
    // filter by id
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersChauffeur,
    });
    const idsChauffeur = res1.data.ids;

    // get driver info
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsChauffeur,
    });

    // parse the info
    const driverList = res2.data.documents.map((documentDriver) =>
      JSON.parse(documentDriver.data)
    );
    return driverList;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// function that gets the driver data from mission form with formID
const getDriverDataFromMission = async (ids) => {
  try {
    const apiFiltersChauffeur2 = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Volontaire",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "Enregistré",
        type: "TEXT",
      },
      {
        key: "FORMID",
        operator: "IN",
        value: ids,
        type: "TEXT",
      },
    ];
    // filter by id
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersChauffeur2,
    });
    const idsChauffeur = res1.data.ids;

    // get driver info
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsChauffeur,
    });

    // parse the info
    const driverList = res2.data.documents.map((documentDriver) =>
      JSON.parse(documentDriver.data)
    );
    console.log("LISTE DES CHAUFFEURS", driverList);
    return driverList;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// api to get the mission data matching vehicle for both aller and retour
const getMissionData = async () => {
  try {
    // filter by id vehicle aller
    const res3 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMissionVehiculeAller,
    });
    const idsvehicleAller = res3.data.ids;
    // filter by id vehicle retour
    const res4 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMissionVehiculeRetour,
    });
    const idsvehicleRetour = res4.data.ids;

    // get driver info aller
    const res5 = await api({ local: true }).post("document/id", {
      ids: idsvehicleAller,
    });

    // get driver info return
    const res6 = await api({ local: true }).post("document/id", {
      ids: idsvehicleRetour,
    });

    // parse the info aller
    const vehicleListAller = res5.data.documents.map((documentVehicle) =>
      JSON.parse(documentVehicle.data)
    );

    // parse the info return
    const vehicleListRetour = res6.data.documents.map((documentVehicleRetour) =>
      JSON.parse(documentVehicleRetour.data)
    );
    return { vehicleListAller, vehicleListRetour };
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// gets the data of availability matching the car for aller
const getAvailabilityDataAller = async () => {
  try {
    // filter by availability for aller
    const res7 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersAvailabilityAller,
    });
    const idsAvailAller = res7.data.ids;
    // get availability info with the id (aller)
    const res9 = await api({ local: true }).post("document/id", {
      ids: idsAvailAller,
    });
    // parse the info aller
    const availabilityListAller = res9.data.documents.map((availability) =>
      JSON.parse(availability.data)
    );

    console.log("LISTG ALLEr DISPO", availabilityListAller);
    const joinedIds = availabilityListAller
      .map((info) => info.IdentifiantDispo)
      .join("|");
    return joinedIds;
  } catch (error) {
    console.error("Erreur lors des appels API", error);
  }
};

// function that gets the availabilty data from return vehicle input
const getAvailabilityDataRetour = async () => {
  // filter by availability for return
  const res8 = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersAvailabilityRetour,
  });
  const idsAvailRetour = res8.data.ids;
  // get the availability info with the id (retour)
  const res10 = await api({ local: true }).post("document/id", {
    ids: idsAvailRetour,
  });
  // parse the info return
  const availabilityListRetour = res10.data.documents.map(
    (availabilityRetour) => JSON.parse(availabilityRetour.data)
  );
  const joinedIds = availabilityListRetour
    .map((info) => info.IdentifiantDispo)
    .join("|");
  return joinedIds;
};

// to hide the popup
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// popup create
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

// function that shows the error message
const showButton = (message) => {
  // creates the popup
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
              <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
                <div>${message}</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `
  );
  // button to close the popup
  const closePopupButton = document.getElementById("closePopupBtn");
  if (closePopupButton) {
    closePopupButton.addEventListener("click", hidePopupLoading);
  }
};

// boolean to track if we need to verify for returns
let loopBack = true;
// main function
const main = async () => {
  /* THIS PART IS FOR THE VERIFICATION ON DISPO FORM */
  if (
    PrénomSelected &&
    Planification_Date &&
    DateDeNaissance &&
    Nom &&
    PriseEnCharge_VéhiculeUtilisé &&
    FORMLAYOUTID === "cd81267c-4a6b-451b-846f-22999f0be1f5"
  ) {
    // store in constants the results for driver, and missioninfo related to vehicle
    const [driver, vehicle] = await Promise.all([
      getDriverData(),
      getMissionData(),
    ]);
    // store the list individually
    const vehicleListAller = vehicle.vehicleListAller;
    const vehicleListRetour = vehicle.vehicleListRetour;
    let driverMission = driver[0].Aptitudes_MissionsPratiquées;
    // if driver has missionPratiquee
    if (driverMission) {
      // split the values and put in variable
      driverMissionCompatible = driverMission.split("|");
    }
    // else its default transport social
    else {
      driverMissionCompatible = ["Transport Social"];
    }

    /* THIS PART IS FOR ALLER ONLY  */
    // loop through vehicle for aller
    for (let i = 0; i < vehicleListAller.length; i++) {
      let categorieNotSplit = vehicleListAller[i].Catégorie;
      let tpmr = vehicleListAller[i].TPMR;
      // verifies if the categorie is undefined if yes do nothing
      if (categorieNotSplit === undefined) {
      }
      // else process as usal
      else {
        // split the mission categorie
        let categorieSplit = categorieNotSplit.split("/");
        // verifies if one mission value is present in the driver values
        if (
          categorieSplit.some((categorie) =>
            driverMissionCompatible.includes(categorie)
          )
        ) {
          const catValue = tpmr === "Oui" ? "TPMR" : "VSL";
          /** IF CATEGORIE IS TPMR VERIFIES */
          if (categorieSplit.includes("TPMR")) {
            if (driverMissionCompatible.includes(catValue)) {
              continue;
            } else {
              showButton(messageFromDispoForm);
              loopBack = false;
              break;
            }
          } else {
            // if yes process as usual
            continue;
          }
        }
        // else there is incompatibility
        else {
          showButton(messageFromDispoForm);
          loopBack = false;
          break;
        }
      }
    }

    /* THIS PART ONLY HAPPENS IF FOR ALLER EVERYTHING IS COMPATIBLE */
    // if index is still 0 we can process with the return and do same logic
    if (loopBack) {
      // loop through vehicle for return
      for (let i = 0; i < vehicleListRetour.length; i++) {
        // get the categorie
        let categorieNotSplitReturn = vehicleListRetour[i].Catégorie;
        let tpmr = vehicleListRetour[i].TPMR;
        // verifies if the categorie is undefined if yes do nothing
        if (categorieNotSplitReturn === undefined) {
        }
        // else process as usal
        else {
          // split the categorie values
          let categorieSplitReturn = categorieNotSplitReturn.split("/");
          // verifies if one mission value is present in the driver values
          if (
            categorieSplitReturn.some((categorie) =>
              driverMissionCompatible.includes(categorie)
            )
          ) {
            const catValue = tpmr === "Oui" ? "TPMR" : "VSL";
            /** IF CATEGORIE IS TPMR VERIFIES */
            if (categorieSplit.includes("TPMR")) {
              if (driverMissionCompatible.includes(catValue)) {
                continue;
              } else {
                showButton(messageFromDispoForm);
                loopBack = false;
                break;
              }
            } else {
              // if yes process as usual
              continue;
            }
          }
          // else there is incompatibility
          else {
            showButton(messageFromDispoForm);
            break;
          }
        }
      }
    }
  }

  /* 
  THIS PART IS FOR THE VERIFICATION ON MISSION FORMS
  */
  // if form is mission and we press vehicle aller
  else if (
    PrénomSelected &&
    NomFormMission &&
    Planification_Date &&
    PriseEnCharge_VéhiculeUtilisé &&
    FORMLAYOUTID === "0e44171d-1616-4a50-9b36-aff4d998c4a5" &&
    inputKey === "PriseEnCharge_VéhiculeUtilisé" &&
    Catégorie
  ) {
    // if categorie is not transport social
    if (Catégorie !== "Transport Social") {
      const catValue = TPMR === "Oui" ? "TPMR" : "VSL";
      const categorieSplit = Catégorie.split("/");
      const availsIds = await getAvailabilityDataAller();
      // if there are availabilities proceed
      if (availsIds) {
        const driverList = await getDriverDataFromMission(availsIds);
        console.log("DRIVER LIST", driverList);
        driverList.forEach((driver) => {
          // if the driver has mission pratiquees
          if (driver.Aptitudes_MissionsPratiquées) {
            const missionPratiquées =
              driver.Aptitudes_MissionsPratiquées.split("|");
            console.log("CAT SPLIT", categorieSplit);
            console.log("mission PRAT", missionPratiquées);
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              if (categorieSplit.includes("TPMR")) {
                if (missionPratiquées.includes(catValue)) {
                  // do nothing
                } else {
                  showButton(messageFromMissionForm);
                  return;
                }
              } else {
                // do nothing
                console.log("ALL GOOD");
              }
            }
            // else error message
            else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
          // else the driver has no categorie assigned so default is Tranport Social
          else {
            const missionPratiquées = ["Transport Social"];
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              // do nothing
              console.log("ALL GOOD");
            } else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
        });
      } else {
        console.log("Aucune disponibilité de trouvé");
        return;
      }
    }
  }
  // if we press on vehicle return on mission form
  else if (
    PrénomSelected &&
    NomFormMission &&
    Planification_Date &&
    PriseEnCharge_VéhiculeUtiliséRetour &&
    FORMLAYOUTID === "0e44171d-1616-4a50-9b36-aff4d998c4a5" &&
    inputKey === "PriseEnCharge_VéhiculeUtiliséRetour" &&
    Catégorie
  ) {
    // if categorie is not transport social
    if (Catégorie !== "Transport Social") {
      const catValue = TPMR === "Oui" ? "TPMR" : "VSL";
      // get the avail info then driver info
      const categorieSplit = Catégorie.split("/");
      const availsIds = await getAvailabilityDataRetour();
      // if there are availabilities
      if (availsIds) {
        console.log("YES", availsIds);
        const driverList = await getDriverDataFromMission(availsIds);
        // verifies if the driver is compatible
        driverList.forEach((driver) => {
          // if the driver has mission pratiquees
          if (driver.Aptitudes_MissionsPratiquées) {
            const missionPratiquées =
              driver.Aptitudes_MissionsPratiquées.split("|");
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              if (categorieSplit.includes("TPMR")) {
                if (missionPratiquées.includes(catValue)) {
                  // do nothing
                } else {
                  showButton(messageFromMissionForm);
                  return;
                }
              } else {
                // do nothing
                console.log("ALL GOOD");
              }
            } else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
          // else driver has no mission pratiquee assigned so default is Transport Social
          else {
            const missionPratiquées = ["Transport Social"];
            // if the driver practices the type of mission its ok
            if (categorieSplit.some((cat) => missionPratiquées.includes(cat))) {
              // do nothing
              console.log("ALL GOOD");
            } else {
              showButton(messageFromMissionForm);
              console.log("ERREUR UN OU DES CHAUFFEURS ...");
              return;
            }
          }
        });
      } else {
        console.log("Aucune disponibilité de trouvé");
        return;
      }
    }
  } else {
    // else we need more info to do the api searches
    console.log("NEED MORE INFOS");
    return;
  }
};

window.addEventListener("popstate", hidePopupLoading); // Pour les changements d'URL avec l'historique
window.addEventListener("hashchange", hidePopupLoading);

main();
"
"console.log('Function 81', context);

const isOver18AtDate = (birthDate, planningDate) => {
  // converts in date object
  const birth = new Date(birthDate);
  const planning = new Date(planningDate);

  // calculates the difference in years
  let age = planning.getFullYear() - birth.getFullYear();

  // verifies if anniversary already passed
  const monthDifference = planning.getMonth() - birth.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && planning.getDate() < birth.getDate())
  ) {
    age--; // if anniversary aint passed yet reduce year by 1
  }

  // verifies if person is older or equal to 18
  return age >= 18;
};

const dateNaissance = docData.DateDeNaissance;
const date = docData.Planification_Date;
if (dateNaissance && date) {
  if (isOver18AtDate(dateNaissance, date)) {
    return { CheckboxMineur: false };
  } else {
    return { CheckboxMineur: true };
  }
}
"
"console.log("Function 83", context);

// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const resultMcr = getArea();
const date = store.pageContentStore.processData[0].edits.DateBatchstep;
const typeTelechargement =
  store.pageContentStore.processData[0].edits.TypeTelechargement;
const rangeDateDebut = "0001-01-01|" + date;
const rangeDateFin = date + "|9999-12-31";

// api document/id/filter
const apiFiltersMission = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTIN",
    value: "Supprimé(e)|Refusée|Annulée|Draft",
    type: "TEXT",
  },
  {
    key: "InformationsAdmin_DateHeureDébut",
    operator: "BETWEEN",
    value: rangeDateDebut,
    type: "DATETIME",
  },
  {
    key: "InformationsAdmin_DateHeureFin",
    operator: "BETWEEN",
    value: rangeDateFin,
    type: "DATETIME",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

// to get the beneficiary info
const getBeneficiaryData = async (missionList, identifiantBene) => {
  const finalList = [];

  // get mission info
  const res6 = await api({ local: true }).post("document/id", {
    ids: identifiantBene,
  });
  const infoBene = res6.data.documents;
  const beneList = res6.data.documents.map((documentbene) => {
    const parsedData = JSON.parse(documentbene.data); // Parse the JSON data
    return parsedData;
  });

  const listeTotale = missionList.map((mission) => {
    const document = infoBene.find(
      (info) => info.documentID === mission.IdentifiantMission,
    );
    const { CoorFactu_Rue, CoorFactu_Numéro, CoorFactu_Ville, CoorFactu_Pays } =
      JSON.parse(document.data);
    return {
      ...mission,
      CoorFactu_Rue,
      CoorFactu_Numéro,
      CoorFactu_Ville,
      CoorFactu_Pays,
    };
  });
  return listeTotale;
};
// to get the mission data
const getMissionData = async (date) => {
  try {
    // constants to store mission beneficairy prenom, nom and date of birth
    const identifiantBene = [];
    // filter by id
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersMission,
    });
    const idsMission = res1.data.ids;
    // get mission info
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsMission,
    });

    const interpretedResult = await recurrence.getDocuments(
      apiFiltersMission,
      [date, date],
      api,
    );
    const existingResult = await recurrence.createFormsIfNeeded(
      interpretedResult.data.documents,
      api,
    );
    const missionList = existingResult.map((document) => {
      const parsedData = JSON.parse(document.data); // Parse the JSON data
      // add the number to the list
      return {
        ...parsedData,
        number: document.number,
        id: document.documentID,
        status: document.status,
      };
    });

    missionList.forEach((data) => {
      identifiantBene.push(data.IdentifiantMission);
    });
    return { missionList, identifiantBene };
    //return missionList;
  } catch (error) {
    console.log("ERREUR", error);
  }
};

const apiFiltersDispo = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Disponibilité",
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistrée",
    type: "TEXT",
  },
  {
    key: "Planification_Disponiblité",
    operator: "EQUALS",
    value: "Disponible",
    type: "TEXT",
  },

  {
    key: "InformationsAdmin_DateHeureDébut",
    operator: "BETWEEN",
    value: rangeDateDebut,
    type: "DATETIME",
  },
  {
    key: "InformationsAdmin_DateHeureFin",
    operator: "BETWEEN",
    value: rangeDateFin,
    type: "DATETIME",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const apiFiltersVehicules = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "EQUALS",
    value: "Enregistré",
    type: "TEXT",
  },
];

// get the availability data
const fetchDispoData = async (date) => {
  try {
    console.log(
      "---------------------------AVAILABILITIES---------------------------",
    );
    const res = await recurrence.getDocuments(
      apiFiltersDispo,
      [date, date],
      api,
    );
    console.log("recurrence.getDocuments", res);

    //parse the info
    const dispoList = res.data.documents.map((documentDispo) =>
      JSON.parse(documentDispo.data),
    );
    return dispoList;
  } catch (error) {
    console.error("Erreur lors des appels API 2", error);
  }
};

// get the available car
const fetchVehiculesData = async () => {
  try {
    // get the ids
    const res6 = await api({ local: true }).post("document/id/filter", {
      filters: apiFiltersVehicules,
    });
    const idsVehicules = res6.data.ids;

    // get the infos
    const res7 = await api({ local: true }).post("document/id", {
      ids: idsVehicules,
    });
    //parse the infos
    const listeVehic = res7.data.documents.map((documentVehic) =>
      JSON.parse(documentVehic.data),
    );
    return listeVehic;
  } catch (error) {
    console.error("Erreur lors des appels API 3", error);
  }
};

// function that get the driver names
const getDrivers = async () => {};

// function that updates the status of the mission to À facturer
const updateStatusMission = async (missionList) => {
  try {
    // get only the acceptée missions to update
    const acceptedMissions = missionList.filter(
      (mission) => mission.status === "Acceptée",
    );
    const documentsUpdate = acceptedMissions.map((mission) => ({
      data: JSON.stringify({
        ...mission,
      }), // object of the keys from the Field DB and its new value
      status: "À facturer", // key from Status FormLayout
      active: true,
      template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" }, // key from DB FormLayout
      documentID: mission.id, // FormID from DB Form
    }));
    if (acceptedMissions.length) {
      // api document/Many (put) (met a jour plusieurs formulaire)
      const resStatus = await api({ local: true }).put("document/Many", {
        documents: documentsUpdate,
      });
    } else {
      console.log("Aucune mission à mettre à jour.");
    }
  } catch (error) {
    console.warn("Error : ", error);
  }
};

const getProfil = async () => {
  try {
    const apiFilters2 = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Profil MCR",
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: resultMcr,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    console.log("API FILTER", apiFilters2);
    const responseID = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters2,
    });
    const ids = responseID?.data?.ids;

    const responseInfos = await api({ local: true }).post("document/id", {
      ids,
    });

    console.log("------responseInfos", responseInfos);

    const parsedData = responseInfos.data.documents.map((info) => ({
      ...JSON.parse(info.data),
      FORMID: info.metaData["FORMID"],
    }));

    return parsedData?.[0] || [];
  } catch (error) {
    console.log("Erreur", error);
    hidePopupLoading();
  }
};

// to create the pdf
const createPDF = async (listOfMissions, profilInfo) => {
  try {
    // necessary constants
    const result = [];
    const title = [];
    const km = [];
    const missionPrice = [];
    const adressFactu = [];
    const trajetInfo = [];
    const categorie = [];
    const vehicule = [];
    const tpmr = [];
    let phoneNumbers = [];
    let clientIndex = 0;
    let number = [];
    let drivers = [];
    let depart = [];
    let destination = [];
    let comments = [];
    let motifs = [];
    const tableDataServices = [];
    const tableDataHours = [];
    const tableDatasClient = [];
    const tablesJoined = [];
    const currentDate = listOfMissions[0].Planification_Date;
    let clientName = [];
    let nomMaison;
    let statutMaison;
    let formeMaison;
    let adresseMaison;

    // re format the currentDate
    let dateParts = currentDate.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    adresseMaison = `Adresse : ${profilInfo?.AdresseMCR || ""}`;

    // Configuration des maisons
    const mcrConfig = {
      "MCR Arlon": "Nom: Maison Croix-Rouge Arlon",
      "MCR Aubange-Messancy": "Nom: Maison Croix-Rouge Aubange-Messancy",
      "MCR Sud Gaume": "Nom: Maison Croix-Rouge Sud Gaume",
      "MCR Rulles-Semois": "Nom: Maison Croix-Rouge Rulles-Et-Semois",
      "MCR Docteur Lagneau":
        "Nom: Maison Croix-Rouge Dr Lagneau Bouillon Paliseul",
      "MCR Marche": "Nom: Maison Croix-Rouge Marche",
      "MCR Gembloux": "Nom: Maison Croix-Rouge Gembloux",
      "MCR Namur": "Nom: Maison Croix-Rouge Namur",
      "MCR Florenville": "Nom: Maison Croix-Rouge Florenville-Chiny",
      "MCR Rochefort": "Nom: Maison Croix-Rouge Rochefort",
    };

    nomMaison = mcrConfig[resultMcr] || "";
    statutMaison = `inscrite à la banque carrefour des entreprises sous le numéro : ${profilInfo?.["Numéro BCE"] || "0406.729.809"}`;
    formeMaison =
      profilInfo?.["Exploitant BDC"] ||
      "Exploitant un service de transport à finalité spéciale en vertu d'une autorisation portant le n° TC727";
    // list for
    // loop to get every info
    listOfMissions.forEach((mission) => {
      // re initialize necessary lists
      phoneNumbers = [];
      destination = [];
      const vehiculeAller =
        mission?.PriseEnCharge_VéhiculeUtilisé || "Non renseigné";
      const vehiculeRetour =
        mission?.PriseEnCharge_VéhiculeUtiliséRetour || "Non renseigné";
      //push the starting adress, price of mission and amount of km

      const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";
      const phoneDepart = mission.TelephoneNumber
        ? ` (${mission.TelephoneNumber})`
        : "";
      depart.push(`${mission.CC_AdresseDépart}${deno}${phoneDepart}`);
      let collectionLength = mission.CC_Destinations;
      for (let j = 1; j <= collectionLength; j++) {
        let currentDestination = mission[`CC_Destinations|100|Adresse|${j}`];
        const phoneDest = mission[`CC_Destinations|920|Telephone|${j}`]
          ? ` (${mission[`CC_Destinations|920|Telephone|${j}`]})`
          : "";
        const denomination = mission[`CC_Destinations|110|Dénomination|${j}`]
          ? ` - ${mission[`CC_Destinations|110|Dénomination|${j}`]}`
          : "";
        destination.push(
          `Destination : ${currentDestination}${denomination}${phoneDest}`,
        );
      }

      // categorie and tpmr
      mission.TPMR === "Oui" ? tpmr.push("Oui") : tpmr.push("Non");
      categorie.push(`${mission.Catégorie}`);

      /*HERE WE GET / CONCAT AND PUSH THE ADRESS OF FACTURATION */
      const coordStreet = mission.CoorFactu_Rue;
      const coordTown = mission.CoorFactu_Ville;
      const coordNumber = mission.CoorFactu_Numéro;
      const coordCountry = mission.CoorFactu_Pays;
      // we concat it
      const coordAddress = `${coordStreet} ${coordNumber}, ${coordTown}, ${coordCountry}`;
      adressFactu.push(coordAddress);

      // here we get the motif and comment
      const motif = mission.Motif ? mission.Motif.replace(/"/g, '\\"') : "";
      const driverComment = mission.InformationsPourLeChauffeur || "";
      motifs.push(motif);
      comments.push(driverComment);

      /*HERE WE GET AND PUSH ALLER/ALLER-RETOUR */
      const isChecked = mission.CC_Retour;
      const isRDVPec = mission?.TypeTransport;
      if (isRDVPec === "RDV au lieu de prise en charge") {
        trajetInfo.push("Retour");
        vehicule.push(`Véhicule : ${vehiculeRetour}`);
      } else if (isChecked === "true") {
        trajetInfo.push("Aller-Retour");
        if (vehiculeAller !== vehiculeRetour) {
          vehicule.push(
            `Véhicule Aller : ${vehiculeAller} - Véhicule Retour : ${vehiculeRetour}`,
          );
        } else {
          vehicule.push(`Véhicule : ${vehiculeAller}`);
        }
      } else {
        trajetInfo.push("Aller");
        vehicule.push(`Véhicule : ${vehiculeAller}`);
      }
      /*HERE WE GET AND PUSH THE RIGHT KM VALUE and we push mission price*/
      const calculKM = mission.CalculPrix_CalculKilomètrage;
      if (calculKM === "Du garage au garage") {
        km.push(`KM : ${mission.DistanceGarageGarage}`);
        missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
      } else if (calculKM === "Du lieu de départ au lieu de destination") {
        km.push(`KM : ${mission.DistanceDepartDestination}`);
        missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
      } else {
        km.push(`KM : ..............`);
        missionPrice.push(`Prix : ................`);
      }

      /* HERE WE PUSH THE CLIENT INFO and mission price*/
      number.push(`${mission.number}`);
      clientName.push(
        `${mission.PrénomSelected} ${mission.NomFormMission.toUpperCase()}`,
      );
      // push the drivers
      drivers.push(`${mission.chauffeurs}`);
      title.push(`Bon de commande`);
      // Créer une nouvelle entrée pour tableDatasClient
      tableDatasClient.push({
        headers: [""],
        rows: [],
      });

      // create a new entry for tableDataServices
      tableDataServices.push({
        headers: [""],
        rows: [],
      });

      // create a new entry for tablehours
      tableDataHours.push({
        headers: [""],
        rows: [],
      });

      /* PHONE NUMBERS SECTION */
      // for the phone numbers push in list
      let phoneLength = mission.Téléphones;
      for (let j = 1; j <= phoneLength; j++) {
        let phonenumber = mission[`Téléphones|2|Téléphone|${j}`]
          ? mission[`Téléphones|2|Téléphone|${j}`]
          : `....`;
        phoneNumbers.push(phonenumber);
      }
      // if there is a data push it in list
      if (phoneNumbers.length) {
        for (let p = 0; p < phoneNumbers.length; p++) {
          let indexPhone = 1;
          tableDatasClient[clientIndex].rows.push([
            `Contact ${indexPhone} Téléphone: ${phoneNumbers[p]}`,
          ]);
          indexPhone++;
        }
      } else {
        // else empty
        tableDatasClient[clientIndex].rows.push([
          `Contact No: ........................`,
        ]);
      }

      /********* table hours section**********/
      const priseEnCharge = mission.CC_Récupération;
      tableDataHours[clientIndex].rows.push([
        `Hr début de mission : ${
          mission.heureDebutMission || "..."
        } - Hr de prise en charge : ${priseEnCharge}`,
      ]);
      // loop to get every line
      for (let j = 1; j <= mission.CC_Destinations.length; j++) {
        console.log("mission", mission);
        let debutRDV =
          mission[`CC_Destinations|400|Début de RDV|${j}`] || "...";
        let finRDV = mission[`CC_Destinations|600|Fin de RDV|${j}`];
        if (finRDV) {
          tableDataHours[clientIndex].rows.push([
            `Hr rendez-vous : ${debutRDV || ""} - Hr reprise client estimée : ${
              finRDV || "..."
            }`,
          ]);
        } else {
          tableDataHours[clientIndex].rows.push([
            `Hr rendez-vous : ${debutRDV || ""}`,
          ]);
        }
      }
      tableDataHours[clientIndex].rows.push([
        ` Hr fin mission estimée : ${mission.heureFinMission || "..."}`,
      ]);

      /* SERVICES SECTION */
      for (let a = 0; a < destination.length; a++) {
        tableDataServices[clientIndex].rows.push([`${destination[a]}`]);
      }

      clientIndex++;
    });

    // fill the result part of ods file with right info
    for (let b = 0; b < listOfMissions.length; b++) {
      let feuilleInfo;
      let feuilleInfoObj = {
        Number: `No de mission: ${number[b]}`,
        Title: title[b] || "",
        Drivers: drivers[b] || "",
        Motif: motifs[b] || "",
        Comment: comments[b] || "",
        ClientName: clientName[b] || "",
        LieuDepart: `Départ : ${depart[b] || ""}`,
        Categorie: `Catégorie : ${categorie[b] || ""}`,
        TPMR: `TPMR : ${tpmr[b] || ""}`,
        Date: `Date : ${dateFormatee}`,
        NomMaison: nomMaison || "",
        Km: km[b] || "",
        Prix: missionPrice[b] || "",
        Trajet: trajetInfo[b] || "",
        AdresseFacturation: `Adresse de facturation : ${adressFactu[b] || ""}`,
        StatutMaison: statutMaison || "",
        Forme: formeMaison || "",
        AdresseMaison: adresseMaison || "",
        Vehic: vehicule[b] || "",
      };
      // ⬇️ Le stringify ici est sûr
      result.push(JSON.stringify(feuilleInfoObj));
      /*
      feuilleInfo = `{ "Number": "No de mission: ${number[b]}", "Title": "${title[b]}", "Drivers": "${drivers[b]}", "Motif": "${motifs[b]}", "Comment": "${comments[b]}",
          "ClientName": "${clientName[b]}", "LieuDepart": "Départ : ${depart[b]}", "Categorie": "Catégorie : ${categorie[b]}",
          "TPMR": "TPMR : ${tpmr[b]}",  
          "Date": "Date : ${dateFormatee}", "NomMaison": "${nomMaison}", "Km": "${km[b]}", "Prix": "${missionPrice[b]}", "Trajet": "${trajetInfo[b]}", 
          "AdresseFacturation": "Adresse de facturation : ${adressFactu[b]}",
          "StatutMaison": "${statutMaison}", "Forme": "${formeMaison}", "AdresseMaison": "${adresseMaison}",}`;
      result.push(feuilleInfo); // return it to result list
      */
    }

    // push the data in the
    for (let m = 0; m < listOfMissions.length; m++) {
      tablesJoined.push([
        tableDatasClient[m],
        tableDataServices[m],
        tableDataHours[m],
      ]);
    }

    // api call to generate the pdf
    const res10 = await api({ local: true }).post(
      "document/download/sheets/BonDeCommande/pdf/BonDeCommande",
      {
        sheets: [
          {
            name: "BonDeCommande",
            datas: result,
            sheetNames: title,
            tableDatas: tablesJoined,
          },
        ],
      },
    );

    if (res10 !== undefined) {
      // gets the url name and file name
      const fileUrl = res10.data.fileUrl;
      console.log("RES10", res10);
      console.log("fileURL", fileUrl);
      const fileName = fileUrl.split("/").pop();
      if (fileUrl) {
        // creates a download link
        const downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        console.error("URL du fichier non trouvée dans la réponse.");
      }
    }
  } catch (error) {
    console.log("ERREUR", error);
  }
};

const downloadAllPDFsAsZip = async () => {
  const zip = new JSZip();

  for (const { path, filename } of pdfList) {
    try {
      const response = await fetch(path);
      console.log("RESPONSE ", response);
      const blob = await response.blob();
      console.log("BLOB ", blob);
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${filename}`, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `BDC_${date}.zip`);
  });
};

// to store the pdf
const pdfList = [];
// to create the pdf
const createPDFIndividuel = async (mission, profilInfo) => {
  try {
    // necessary constants
    const result = [];
    const title = [];
    const km = [];
    const missionPrice = [];
    const adressFactu = [];
    const trajetInfo = [];
    const vehicule = [];
    const categorie = [];
    const tpmr = [];
    let phoneNumbers = [];
    let clientIndex = 0;
    let number = [];
    let drivers = [];
    let depart = [];
    let destination = [];
    let comments = [];
    let motifs = [];
    const tableDataServices = [];
    const tableDataHours = [];
    const tableDatasClient = [];
    const tablesJoined = [];
    const currentDate = mission.Planification_Date;
    let clientName = [];
    let nomMaison;
    let statutMaison;
    let formeMaison;
    let adresseMaison;

    // re format the currentDate
    let dateParts = currentDate.split("-");
    let dateFormatee = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    adresseMaison = `Adresse : ${profilInfo?.AdresseMCR || ""}`;

    const mcrConfig = {
      "MCR Arlon": "Nom: Maison Croix-Rouge Arlon",
      "MCR Aubange-Messancy": "Nom: Maison Croix-Rouge Aubange-Messancy",
      "MCR Sud Gaume": "Nom: Maison Croix-Rouge Sud Gaume",
      "MCR Rulles-Semois": "Nom: Maison Croix-Rouge Rulles-Et-Semois",
      "MCR Docteur Lagneau":
        "Nom: Maison Croix-Rouge Dr Lagneau Bouillon Paliseul",
      "MCR Marche": "Nom: Maison Croix-Rouge Marche",
      "MCR Gembloux": "Nom: Maison Croix-Rouge Gembloux",
      "MCR Namur": "Nom: Maison Croix-Rouge Namur",
      "MCR Florenville": "Nom: Maison Croix-Rouge Florenville-Chiny",
      "MCR Rochefort": "Nom: Maison Croix-Rouge Rochefort",
    };

    nomMaison = mcrConfig[resultMcr] || "";
    statutMaison = `inscrite à la banque carrefour des entreprises sous le numéro : ${profilInfo?.["Numéro BCE"] || "0406.729.809"}`;
    formeMaison =
      profilInfo?.["Exploitant BDC"] ||
      "Exploitant un service de transport à finalité spéciale en vertu d'une autorisation portant le n° TC727";

    // re initialize necessary lists
    phoneNumbers = [];
    destination = [];
    const vehiculeAller =
      mission?.PriseEnCharge_VéhiculeUtilisé || "Non renseigné";
    const vehiculeRetour =
      mission?.PriseEnCharge_VéhiculeUtiliséRetour || "Non renseigné";
    //push the starting adress, price of mission and amount of km

    const deno = mission.Dénomination ? ` - ${mission.Dénomination}` : "";

    const phoneDepart = mission.TelephoneNumber
      ? ` (${mission.TelephoneNumber})`
      : "";
    depart.push(`${mission.CC_AdresseDépart}${deno}${phoneDepart}`);
    let collectionLength = mission.CC_Destinations;
    for (let j = 1; j <= collectionLength; j++) {
      let currentDestination = mission[`CC_Destinations|100|Adresse|${j}`];
      const phoneDest = mission[`CC_Destinations|920|Telephone|${j}`]
        ? ` (${mission[`CC_Destinations|920|Telephone|${j}`]})`
        : "";
      const denomination = mission[`CC_Destinations|110|Dénomination|${j}`]
        ? ` - ${mission[`CC_Destinations|110|Dénomination|${j}`]}`
        : "";
      destination.push(
        `Destination : ${currentDestination}${denomination}${phoneDest}`,
      );
    }

    // categorie and tpmr
    mission.TPMR === "Oui" ? tpmr.push("Oui") : tpmr.push("Non");
    categorie.push(`${mission.Catégorie}`);

    /*HERE WE GET / CONCAT AND PUSH THE ADRESS OF FACTURATION */
    const coordStreet = mission.CoorFactu_Rue;
    const coordTown = mission.CoorFactu_Ville;
    const coordNumber = mission.CoorFactu_Numéro;
    const coordCountry = mission.CoorFactu_Pays;
    // we concat it
    const coordAddress = `${coordStreet} ${coordNumber}, ${coordTown}, ${coordCountry}`;
    adressFactu.push(coordAddress);

    // here we get the motif and comment
    const motif = mission.Motif ? mission.Motif.replace(/"/g, '\\"') : "";
    const driverComment = mission.InformationsPourLeChauffeur || "";
    motifs.push(motif);
    comments.push(driverComment);

    /*HERE WE GET AND PUSH ALLER/ALLER-RETOUR */
    const isChecked = mission.CC_Retour;
    const isRDVPec = mission?.TypeTransport;
    if (isRDVPec === "RDV au lieu de prise en charge") {
      trajetInfo.push("Retour");
      vehicule.push(`Véhicule : ${vehiculeRetour}`);
    } else if (isChecked === "true") {
      trajetInfo.push("Aller-Retour");
      if (vehiculeAller !== vehiculeRetour) {
        vehicule.push(
          `Véhicule Aller : ${vehiculeAller} - Véhicule Retour : ${vehiculeRetour}`,
        );
      } else {
        vehicule.push(`Véhicule : ${vehiculeAller}`);
      }
    } else {
      trajetInfo.push("Aller");
      vehicule.push(`Véhicule : ${vehiculeAller}`);
    }
    /*HERE WE GET AND PUSH THE RIGHT KM VALUE and we push mission price*/
    const calculKM = mission.CalculPrix_CalculKilomètrage;
    if (calculKM === "Du garage au garage") {
      km.push(`KM : ${mission.DistanceGarageGarage}`);
      missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
    } else if (calculKM === "Du lieu de départ au lieu de destination") {
      km.push(`KM : ${mission.DistanceDepartDestination}`);
      missionPrice.push(`Prix : ${mission.CalculPrix_Prix}`);
    } else {
      km.push(`KM : ..............`);
      missionPrice.push(`Prix : ................`);
    }

    /* HERE WE PUSH THE CLIENT INFO and mission price*/
    number.push(`${mission.number}`);
    clientName.push(
      `${mission.PrénomSelected} ${mission.NomFormMission.toUpperCase()}`,
    );
    // push the drivers
    drivers.push(`${mission.chauffeurs}`);
    title.push(`Bon de commande`);
    // Créer une nouvelle entrée pour tableDatasClient
    tableDatasClient.push({
      headers: [""],
      rows: [],
    });

    // create a new entry for tableDataServices
    tableDataServices.push({
      headers: [""],
      rows: [],
    });

    // create a new entry for tablehours
    tableDataHours.push({
      headers: [""],
      rows: [],
    });

    /* PHONE NUMBERS SECTION */
    // for the phone numbers push in list
    let phoneLength = mission.Téléphones;
    for (let j = 1; j <= phoneLength; j++) {
      let phonenumber = mission[`Téléphones|2|Téléphone|${j}`]
        ? mission[`Téléphones|2|Téléphone|${j}`]
        : `....`;
      phoneNumbers.push(phonenumber);
    }
    // if there is a data push it in list
    if (phoneNumbers.length) {
      for (let p = 0; p < phoneNumbers.length; p++) {
        let indexPhone = 1;
        tableDatasClient[clientIndex].rows.push([
          `Contact ${indexPhone} Téléphone: ${phoneNumbers[p]}`,
        ]);
        indexPhone++;
      }
    } else {
      // else empty
      tableDatasClient[clientIndex].rows.push([
        `Contact No: ........................`,
      ]);
    }
    /********* table hours section**********/
    const priseEnCharge = mission.CC_Récupération;
    tableDataHours[clientIndex].rows.push([
      `Hr début de mission : ${
        mission.heureDebutMission || "..."
      } - Hr de prise en charge : ${priseEnCharge}`,
    ]);
    // loop to get every line
    for (let j = 1; j <= mission.CC_Destinations.length; j++) {
      console.log("mission", mission);
      let debutRDV = mission[`CC_Destinations|400|Début de RDV|${j}`] || "...";
      let finRDV = mission[`CC_Destinations|600|Fin de RDV|${j}`];
      if (finRDV) {
        tableDataHours[clientIndex].rows.push([
          `Hr rendez-vous : ${debutRDV || ""} - Hr reprise client estimée : ${
            finRDV || "..."
          }`,
        ]);
      } else {
        tableDataHours[clientIndex].rows.push([
          `Hr rendez-vous : ${debutRDV || ""}`,
        ]);
      }
    }
    tableDataHours[clientIndex].rows.push([
      `Hr fin mission estimée : ${mission.heureFinMission || "..."}`,
    ]);

    /* SERVICES SECTION */
    for (let a = 0; a < destination.length; a++) {
      tableDataServices[clientIndex].rows.push([`${destination[a]}`]);
    }

    clientIndex++;

    // fill the result part of ods file with right info
    let feuilleInfoObj = {
      Number: `No de mission: ${number[0]}`,
      Title: title[0] || "",
      Drivers: drivers[0] || "",
      Motif: motifs[0] || "",
      Comment: comments[0] || "",
      ClientName: clientName[0] || "",
      LieuDepart: `Départ : ${depart[0] || ""}`,
      Categorie: `Catégorie : ${categorie[0] || ""}`,
      TPMR: `TPMR : ${tpmr[0] || ""}`,
      Date: `Date : ${dateFormatee}`,
      NomMaison: nomMaison || "",
      Km: km[0] || "",
      Prix: missionPrice[0] || "",
      Trajet: trajetInfo[0] || "",
      AdresseFacturation: `Adresse de facturation : ${adressFactu[0] || ""}`,
      StatutMaison: statutMaison || "",
      Forme: formeMaison || "",
      AdresseMaison: adresseMaison || "",
      Vehic: vehicule[0] || "",
    };
    // ⬇️ Le stringify ici est sûr
    result.push(JSON.stringify(feuilleInfoObj));
    /*
    let feuilleInfo;
    feuilleInfo = `{ "Number": "No de mission: ${number[0]}", "Title": "${title[0]}", "Drivers": "${drivers[0]}", "Motif": "${motifs[0]}", "Comment": "${comments[0]}",
          "ClientName": "${clientName[0]}", "LieuDepart": "Départ : ${depart[0]}", "Categorie": "Catégorie : ${categorie[0]}",
          "TPMR": "TPMR : ${tpmr[0]}",  
          "Date": "Date : ${dateFormatee}", "NomMaison": "${nomMaison}", "Km": "${km[0]}", "Prix": "${missionPrice[0]}", "Trajet": "${trajetInfo[0]}", 
          "AdresseFacturation": "Adresse de facturation : ${adressFactu[0]}",
          "StatutMaison": "${statutMaison}", "Forme": "${formeMaison}", "AdresseMaison": "${adresseMaison}",}`;
    result.push(feuilleInfo); // return it to result list
    */

    // push the data in the
    tablesJoined.push([
      tableDatasClient[0],
      tableDataServices[0],
      tableDataHours[0],
    ]);

    // api call to generate the pdf
    const res10 = await api({ local: true }).post(
      "document/download/sheets/BonDeCommande/pdf/BonDeCommande",
      {
        sheets: [
          {
            name: "BonDeCommande",
            datas: result,
            sheetNames: title,
            tableDatas: tablesJoined,
          },
        ],
      },
    );

    if (res10 !== undefined) {
      // gets the url name and file name
      const fileUrl = res10.data.fileUrl;
      if (fileUrl) {
        // Extract the PDF path and filename
        // custom name for file
        const newFilename = `BDC_${date}_${
          mission.number
        }_${mission.NomFormMission.toUpperCase()}_${
          mission.PrénomSelected
        }.pdf`;
        // If a valid PDF path exists, create a download link

        pdfList.push({ path: fileUrl, filename: newFilename }); // Use the new filename here
      } else {
        console.error("URL du fichier non trouvée dans la réponse.");
      }
    }
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// function to show the popup loading while waiting for api
const showPopupLoadingWaiting = () => {
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
                  <div>Génération en cours</div>
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

// the main function
const main = async () => {
  console.log("MAIN");
  showPopupLoadingWaiting();
  const profilInfo = await getProfil();
  console.log("PROFIL INFO ", profilInfo);
  const { missionList, identifiantBene } = await getMissionData(date);
  const [dispoList, vehiculeList] = await Promise.all([
    fetchDispoData(date),
    fetchVehiculesData(),
  ]);
  console.log("DISPOLIST ", dispoList);
  console.log("VEHICULE LIST ", vehiculeList);
  let listOfMissions = await getBeneficiaryData(missionList, identifiantBene);
  /***********FILTER ELEMENTS TO GET ONLY MISSION WITH VEHICLE ASSIGNED  */
  const driverVehicle = vehiculeList.map((element) => {
    return dispoList.filter(
      (elementDispo) =>
        element.Ident_Libellé === elementDispo.PriseEnCharge_VéhiculeUtilisé,
    );
  });

  const allDriverVehicles = driverVehicle.flat();

  listOfMissions.forEach((mission) => {
    console.log("DRIVER VEHICLE ", driverVehicle);
    // Trouver les chauffeurs pour le véhicule utilisé à l'aller
    const chauffeursAller = allDriverVehicles
      .filter(
        (dispo) =>
          dispo.PriseEnCharge_VéhiculeUtilisé ===
          mission.PriseEnCharge_VéhiculeUtilisé,
      )
      .map((dispo) => `${dispo.PrénomSelected} ${dispo.Nom}` || "")
      .filter(Boolean);

    let chauffeursRetour = [];
    if (mission.CC_Retour === "true") {
      // Trouver les chauffeurs pour le véhicule utilisé au retour
      chauffeursRetour = allDriverVehicles
        .filter(
          (dispo) =>
            dispo.PriseEnCharge_VéhiculeUtilisé ===
            mission.PriseEnCharge_VéhiculeUtiliséRetour,
        )
        .map((dispo) => `${dispo.PrénomSelected} ${dispo.Nom}`)
        .filter(Boolean);
    }

    // Fusionner les deux listes de chauffeurs
    const allChauffeurs = [...chauffeursAller, ...chauffeursRetour];

    // Supprimer les doublons (optionnel)
    const uniqueChauffeurs = [...new Set(allChauffeurs)];

    // Concaténer avec " & "
    const chauffeursConcat = uniqueChauffeurs.join(" & ");
    // Ajouter la propriété à la mission
    mission.chauffeurs = chauffeursConcat;
  });

  console.log("LIST OF MISSIONS ", listOfMissions);
  if (listOfMissions) {
    // for the groupé
    if (typeTelechargement === "Groupé") {
      await createPDF(listOfMissions, profilInfo);
      await updateStatusMission(listOfMissions);
    } else {
      for (const mission of listOfMissions) {
        await createPDFIndividuel(mission, profilInfo);
      }

      await updateStatusMission(listOfMissions);
      console.log("PDF LIST ", pdfList);
      downloadAllPDFsAsZip();
    }
  } else {
    console.log("Aucune mission trouvée pour cette date");
  }
  hidePopupLoading();
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
"
"console.log('Function 84', context);

const nbAccompagnateurs = docData.CC_NbAccompagnateur;

return nbAccompagnateurs >= 1
  ? { NomsDesAccompagnateurs: true }
  : { NomsDesAccompagnateurs: null };
"
"console.log('Function 85', context)

const isChecked = docData.RendezVousPrisParTiers

return isChecked === 'true'
  ? { NomDeLappelant: true, TéléphoneDeLappelant: true, callerStatus: true }
  : { NomDeLappelant: null, TéléphoneDeLappelant: null, callerStatus: null }
"
"console.log("Function 86", context);

const idsMissions = store.pageContentStore.checked;

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
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

const showPopupError = () => {
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
                <div>Veuillez décocher puis recochez les missions sélectionnées, puis réessayez.</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `,
  );
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

const buildFactureData = (missionData, beneficiary) => {
  // On décode la chaîne JSON des données du bénéficiaire
  const benefData = JSON.parse(beneficiary.data);

  return {
    PrénomSelected: missionData.PrénomSelected,
    Nom: missionData.NomFormMission,
    DateDeNaissance: missionData.DateDeNaissance,
    IdentifiantMission: missionData.IdentifiantMission,
    Maison: missionData.Maison,
    // On suppose que "MontantDu" est défini dans missionData ou dans un contexte global
    MontantDû: missionData.MontantDu,
    MontantPayé: "0",
    CalculPrix_Remise: "0",
    CoorFactu_Réception: benefData["CoorFactu_Réception"],
    dateValiditeAttestationMututelle:
      benefData.dateValiditeAttestationMututelle || "",
    InformationsPourLaFacturation:
      benefData.InformationsPourLaFacturation || "",
    CoorFactu_Courrier: benefData["CoorFactu_Courrier"],
    CoorFactu_Nom: benefData["CoorFactu_Nom"] || "",
    CoorFactu_Prénom: benefData["CoorFactu_Prénom"] || "",
    CoorFactu_Rue: benefData["CoorFactu_Rue"] || "",
    CoorFactu_Numéro: benefData["CoorFactu_Numéro"] || "",
    "CoorFactu_Code postal": benefData["CoorFactu_Code postal"] || "",
    CoorFactu_Ville: benefData["CoorFactu_Ville"] || "",
    CoorFactu_Pays: benefData["CoorFactu_Pays"] || "",
    AllocataireSocial: benefData["AllocataireSocial"] || "",
    CoorFactu_Qualité: benefData["CoorFactu_Qualité"] || "",
  };
};

const getBeneficiary = async (id) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "BÉNÉFICIAIRE",
        type: "TEXT",
      },
      { key: "FORMID", operator: "EQUALS", value: id, type: "TEXT" },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res.data.document;
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

const getMissions = async (ids) => {
  try {
    const res = await api({ local: true }).post("document/id", {
      ids: ids,
    });
    const missions = res?.data.documents;
    console.log("Résultat de la vérification des missions :", missions);
    return missions;
  } catch (error) {
    console.error("Erreur lors de la vérification des missions :", error);
    throw error;
  }
};

// returns a list of bills assigned to the mission
const checkIfFactureExists = async (data) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Facture",
        type: "TEXT",
      },
      { key: "Maison", operator: "EQUALS", value: data.Maison, type: "TEXT" },
      {
        key: "IdentifiantMission",
        operator: "EQUALS",
        value: data.IdentifiantMission,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Brouillon", type: "TEXT" },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

// updates form data and status to 'Acceptée'
const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: "Facturation en cours",
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId,
    };

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};

const createFactureForm = async (formLayoutId, filteredData) => {
  try {
    console.log(formatDataAPI(filteredData));
    try {
      const response = await api({ local: true }).post("document", {
        document: {
          data: formatDataAPI(filteredData),
          status: "Brouillon",
          active: true,
          template: { templateId: formLayoutId },
        },
      });
      console.log("Réponse de l'API :", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création du formulaire bénéficiaire :",
      error,
    );
    throw error;
  }
};

const main = async () => {
  try {
    let message = "Veuillez patienter, s'il vous plaît.";
    showPopupLoading(message);
    const missions = await getMissions(idsMissions);
    for (const m of missions) {
      if (m.status === "Facturée") {
        showPopupError();
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
        return;
      }
    }

    console.log("Missions récupérées :", missions);

    // returns missions without bill ID
    const filteredMissions = missions.filter((mission) => {
      const data = JSON.parse(mission.data);
      return !data.IdentifiantFacture;
    });

    // iterates over all missions regardless if they have a bill ID or not
    for (const mission of missions) {
      const data = JSON.parse(mission.data);
      console.log("OLD DATA", data);
      const factureExists = await checkIfFactureExists(data);
      console.log("Factures existantes: ", factureExists.ids.length);

      // if a bill is found for that mission, assign it
      if (factureExists.ids.length > 0) {
        console.log(
          `Facture already exists for mission ${data.IdentifiantMission}`,
        );
        const newData = { ...data, IdentifiantFacture: factureExists.ids[0] };
        console.log("NEW DATA", newData);
        console.log("MISSION ID", mission.documentID);
        await updateMissionForm(
          mission.documentID,
          newData,
          "0e44171d-1616-4a50-9b36-aff4d998c4a5",
        );
        // else make a new bill and assign it to the beneficiary, then to the mission
      } else {
        const beneficiary = await getBeneficiary(data.IdentifiantMission);
        console.log(beneficiary);

        // Création de la variable factureData avec les bonnes valeurs
        const factureData = await buildFactureData(data, beneficiary);
        console.log("Facture Data générée :", factureData);

        // Création de la facture
        const facture = await createFactureForm(
          "81e43068-2f10-426b-b78b-dfd855136bd5",
          factureData,
        );
        console.log("Facture créée :", facture);

        // Mise à jour de la mission avec l'identifiant de la facture
        const newData = {
          ...data,
          IdentifiantFacture: facture.data.id,
        };
        await updateMissionForm(
          mission.documentID,
          newData,
          "0e44171d-1616-4a50-9b36-aff4d998c4a5",
        );
      }
    }
    console.log("Missions sans IdentifiantFacture :", filteredMissions);
    hidePopupLoading();
  } catch (error) {
    console.error("Erreur lors de la récupération des missions :", error);
    hidePopupLoading();
  }
};

main();
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
"
"console.log('Function 87', context);

const isChecked = docData.CheckboxResterAvecBene;
const vehiculeAller = docData.PriseEnCharge_VéhiculeUtilisé;

return isChecked === "true"
  ? { PriseEnCharge_VéhiculeUtiliséRetour: vehiculeAller }
  : null;
"
"console.log('Function 89', context);

const dateDebut = "1900-01-01T05:00:00";
const dateFin = "2150-01-01T06:00:00";
return {
  InformationsAdmin_DateHeureDébut: dateDebut,
  InformationsAdmin_DateHeureFin: dateFin,
};
"
"console.log('Function 90', context)

const DataCollection = (key, array) => {
  let result = {}
  let itemCount = array?.length
  array.forEach((obj, index) => {
    Object.keys(obj).forEach(key => {
      let newKey = `${key}|${index + 1}`
      result[newKey] = obj[key]
    })
  })
  result[key] = itemCount.toString()
  return result
}

const excludeKeys = (obj, keys) =>
  Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key]
    }
    return result
  }, {})

const formatDataAPI = data => {
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) }
    }
  })
  return JSON.stringify(excludeKeys(data, ['FORMID', 'NUMBER']))
}

const createDisponibilitéForm = async (formData, status, formLayoutId) => {
  try {
    const response = await api({ local: true }).post('document', {
      document: {
        data: formatDataAPI(formData),
        status: status,
        active: true,
        template: { templateId: formLayoutId }
      }
    })
    console.log("Réponse de l'API :", response)
    return response
  } catch (error) {
    console.error("Erreur lors de l'appel API :", error)
    throw error
  }
}

const updateDisponibiliteForm = async (
  formId,
  formData,
  formLayoutId,
  status
) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: status,
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId
    }

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put('document', { document })

    console.log('Mise à jour réussie du formulaire mission :', res)
    return res
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour du formulaire mission :',
      error
    )
    throw error
  }
}

const getForm = async id => {
  try {
    const apiFilters = [
      {
        key: 'FORMID',
        operator: 'EQUALS',
        value: id,
        type: 'TEXT'
      }
    ]

    const res = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters
    })

    console.log("Réponse de l'API :", res)

    const doc = res?.data?.document

    return doc // Retourne l'ID du formulaire existant ou null
  } catch (error) {
    console.error('Erreur lors de la vérification du bénéficiaire :', error)
    throw error
  }
}

const main = async () => {
  const id = store.pageContentStore?.active[0]
  const form = store.pageContentStore.prepareDataRows.find(
    row => row.rowID === id
  )
  console.log('clicked on form :', form)
  if (!form) {
    console.error("Aucune donnée trouvée pour l'ID :", id)
    return
  }

  const key = form.key

  const completeForm = await getForm(key)
  const data = JSON.parse(completeForm?.data)
  console.log('data', data)
  const formLayoutId = form?.formLayoutId

  let createData = data
  const updateData = data

  let url_id = key
  if (
    !createData.IdentifiantFormulaireRécurrence &&
    createData.Planification_Récurrence !== 'Une seule fois'
  ) {
    createData = {
      ...createData,
      Planification_Date:
        createData.InformationsAdmin_DateHeureDébut.split('T')[0],
      Planification_Récurrence: 'Une seule fois',
      IdentifiantFormulaireRécurrence: key
    }
    const newUpdateData = {
      Exception_Récurrence: updateData.Exception_Récurrence
        ? `${updateData.Exception_Récurrence} | ${
            updateData.InformationsAdmin_DateHeureDébut.split('T')[0]
          }`
        : `${updateData.InformationsAdmin_DateHeureDébut.split('T')[0]}`
    }

    delete createData.customContextMenuProcesses
    delete createData.customOpenProcess

    try {
      const res = await createDisponibilitéForm(
        createData,
        form.status,
        formLayoutId
      )

      if (res?.data?.id) {
        // Update
        const resUpdate = await updateDisponibiliteForm(
          key,
          newUpdateData,
          formLayoutId,
          form.status
        )

        if (resUpdate) {
          console.log('Formulaire mis à jour avec succès :', resUpdate)
          url_id = res.data.id
        } else {
          console.error(
            'Erreur lors de la mise à jour du formulaire :',
            resUpdate
          )
        }
      } else {
        console.error("ID non trouvé dans la réponse de l'API")
      }
    } catch (error) {
      console.error('Erreur lors de la création du formulaire :', error)
    }
  }

  const url = new URL(window.location.href)

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split('/')

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex(seg => seg.startsWith('mcr.'))

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex]
    const section = segments[mcrIndex + 1] // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`
    url.pathname = newPath

    window.open(url.toString(), '_blank')
  } else {
    console.error('Segment MCR introuvable dans l’URL.')
  }
}

main()
"
"console.log('Function 91', context);

const vehicule = docData.Ident_Libellé;
return {PriseEnCharge_VéhiculeUtilisé: vehicule};"
return docData['FORMID'];
"console.log("Function 93", context);
const tpmr = docData?.TPMR === "Oui";

const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
  if (typeof document === "undefined") {
    return null;
  }

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

const showWarningBanner = (message) => {
  const warningBanner = createOrUpdateElement(
    "warningBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: #fff3cd;
      color: #856404;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border: 1px solid #ffeeba;
    `,
    `
      <div style="margin-right: 10px;">⚠️</div>
      <div>${message}</div>
      <div id="warningBannerProgress" 
           style="position: absolute; bottom: 0; left: 0; background-color: #856404; height: 4px; width: 0%;">
      </div>
    `,
  );

  if (!warningBanner) {
    return;
  }

  let progressElement = document.getElementById("warningBannerProgress");
  let width = 0;

  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      warningBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55);
};

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    // console.error("Failed to fetch document IDs:", error);
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
    // console.error("Failed to fetch documents:", error);
    return [];
  }
};

const getDocuments = async (apiFilters) => {
  const documentIDs = await getDocumentIDsByFilters(apiFilters);
  if (documentIDs.length === 0) {
    return [];
  }

  const documents = await getDocumentsByIDs(documentIDs);
  return documents.map((doc) => {
    try {
      doc.data = JSON.parse(doc.data);
    } catch (error) {
      doc.data = {};
    }
    return doc;
  });
};

const buildTarifFilters = (categoryValue, planificationDate) => {
  if (!planificationDate || !categoryValue) {
    return [];
  }

  return [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Tarif",
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "NOTEQUALS",
      value: "Supprimé(e)",
      type: "TEXT",
    },
    {
      key: "CE_DébutDeValidité",
      operator: "BETWEEN",
      value: `0001-12-31|${planificationDate}`,
      type: "DATE",
    },
    {
      key: "CE_FinDeValidité",
      operator: "BETWEEN",
      value: `${planificationDate}|9999-12-31`,
      type: "DATE",
    },
    {
      key: "Catégorie",
      operator: "CONTAINS",
      value: categoryValue,
      type: "TEXT",
    },
  ];
};

const sortTarifsByPriority = (tarifDocuments) => {
  const getPriority = (doc) => {
    const priority = Number(doc?.data?.Tarif_Priorite);
    return Number.isFinite(priority) ? priority : 0;
  };

  return [...tarifDocuments].sort((a, b) => getPriority(b) - getPriority(a));
};

const selectAppropriateTarif = (tarifDocuments) => {
  if (!tarifDocuments || tarifDocuments.length === 0) {
    return {};
  }
  return tarifDocuments[0].data;
};

const buildTarifSuggestions = (tarifDocuments) => {
  if (!tarifDocuments || tarifDocuments.length === 0) {
    return [];
  }

  return tarifDocuments.map((document) => {
    const data = document.data || {};
    const fields = [
      {
        key: "CalculPrix_CalculKilomètrage",
        value: data.CalculPrix_CalculKilomètrage || "",
        name: "Calcul du kilométrage",
      },
      {
        key: "CalculPrix_NbKMCouvertForfaitPriseEnCharge",
        value: data.CalculPrix_NbKMCouvertForfaitPriseEnCharge || "",
        name: "Nombre de km couverts par le forfait de prise en charge",
      },
      {
        key: "CalculPrix_PrixForfaitPriseEnChargeEuro",
        value: data.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
        name: "Prix du forfait de prise en charge en euros",
      },
      {
        key: "CalculPrix_PrixMiniEuro",
        value: data.CalculPrix_PrixMiniEuro || "",
        name: "Prix minimum en euros",
      },
      {
        key: "CalculPrix_PrixParKmEuro",
        value: data.CalculPrix_PrixParKmEuro || "",
        name: "Prix par km en euros",
      },
    ];

    return { title: data.CE_CatégorieMission || "", fields };
  });
};

const buildSuggestions = (documents) => {
  if (!documents || documents.length === 0) {
    return [];
  }

  return documents.map((doc) => {
    // console.log("Document:", doc);
    const data = doc.data;

    const fields = [
      /*{
        key: "Categorie_Nom",
        value: data.Categorie_Nom || "",
        name: "Nom de la catégorie",
      },*/
      {
        key: "Categorie_Number",
        value: doc.number || "",
        name: "Numéro de la catégorie",
      },
      /*{
        key: "Date de début",
        value: data.Categorie_DateDebut || "",
        name: "Date de début",
      },
      {
        key: "Date de fin",
        value: data.Categorie_DateFin || "",
        name: "Date de fin",
      },*/
      {
        key: "Categorie_Priorite",
        value: data.Categorie_Priorite || "",
        name: "Niveau de priorité",
      },
    ];
    return {
      title:
        //data[tpmr ? "Categorie_StatMissionTPMR" : "Categorie_StatMission"] ||
        data["Categorie_Nom"], // Categorie_StatMission
      fields,
    };
  });
};

const sortSuggestionsByPriority = (suggestions) => {
  const priorityOrder = ["0", "1", "2", "3", "4", "5"];
  const priorityIndex = new Map(
    priorityOrder.map((priority, index) => [priority, index]),
  );

  return [...suggestions].sort((a, b) => {
    const aPriority = String(
      a?.fields?.find((field) => field.key === "Categorie_Priorite")?.value ??
        "",
    );
    const bPriority = String(
      b?.fields?.find((field) => field.key === "Categorie_Priorite")?.value ??
        "",
    );

    const aRank = priorityIndex.has(aPriority)
      ? priorityIndex.get(aPriority)
      : Number.MAX_SAFE_INTEGER;
    const bRank = priorityIndex.has(bPriority)
      ? priorityIndex.get(bPriority)
      : Number.MAX_SAFE_INTEGER;

    return bRank - aRank;
  });
};

async function main() {
  const debutValidite = docData?.Planification_Date;
  const finValidite = docData?.Planification_DateFin;
  const today = new Date().toISOString().split("T")[0];
  const input = docData?.Catégorie || "";

  // console.log("Input value:", input);

  const filter = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Catégorie",
      type: "TEXT",
    },
    {
      key: "Categorie_Nom",
      operator: "CONTAINS",
      value: input,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistré",
      type: "TEXT",
    },
    {
      key: "Categorie_DateDebut",
      operator: "BETWEEN",
      value: `0001-01-01|${debutValidite || today}`,
      type: "DATE",
    },
    {
      key: "Categorie_DateFin",
      operator: "BETWEEN",
      value: `${finValidite || debutValidite || today}|9999-12-01`,
      type: "DATE",
    },
  ];

  const documents = await getDocuments(filter);
  const suggestions = sortSuggestionsByPriority(buildSuggestions(documents));

  const selectedCategory = suggestions?.[0]?.title || "";
  const tarifFilters = buildTarifFilters(
    selectedCategory || input,
    debutValidite,
  );
  const tarifDocuments = sortTarifsByPriority(
    tarifFilters.length > 0 ? await getDocuments(tarifFilters) : [],
  );
  const selectedPricingData = selectAppropriateTarif(tarifDocuments);
  const tarifSuggestions = buildTarifSuggestions(tarifDocuments);

  const newData = {
    ...docData,
    CE_CatégorieMission: selectedPricingData.CE_CatégorieMission || "",
    CalculPrix_CalculKilomètrage:
      selectedPricingData.CalculPrix_CalculKilomètrage || "",
    CalculPrix_NbKMCouvertForfaitPriseEnCharge:
      selectedPricingData.CalculPrix_NbKMCouvertForfaitPriseEnCharge || "",
    CalculPrix_PrixForfaitPriseEnChargeEuro:
      selectedPricingData.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
    CalculPrix_PrixMiniEuro: selectedPricingData.CalculPrix_PrixMiniEuro || "",
    CalculPrix_PrixParKmEuro:
      selectedPricingData.CalculPrix_PrixParKmEuro || "",
  };

  const prices =
    typeof calculatePrix === "function" ? calculatePrix(newData) || {} : {};

  const isDraft = docData?.STATUS === "Draft";

  callback({
    suggestions: {
      Catégorie: suggestions,
      CalculPrixBis_TarifAppliqué: tarifSuggestions,
    },
    data: isDraft
      ? {
          CalculPrixBis_TarifAppliqué:
            selectedPricingData.CE_CatégorieMission || "",
          CE_CatégorieMission: selectedPricingData.CE_CatégorieMission || "",
          CalculPrix_CalculKilomètrage:
            selectedPricingData.CalculPrix_CalculKilomètrage || "",
          CalculPrix_NbKMCouvertForfaitPriseEnCharge:
            selectedPricingData.CalculPrix_NbKMCouvertForfaitPriseEnCharge ||
            "",
          CalculPrix_PrixForfaitPriseEnChargeEuro:
            selectedPricingData.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
          CalculPrix_PrixMiniEuro:
            selectedPricingData.CalculPrix_PrixMiniEuro || "",
          CalculPrix_PrixParKmEuro:
            selectedPricingData.CalculPrix_PrixParKmEuro || "",
          ...prices,
        }
      : {},
  });
}

main();
"
"console.log("Function 94", context);
// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
const showPopupLoading = () => {
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
              <h1 style="color: #C70000; font-weight: bold; font-size: 120%; align-self: flex-start;">Attention !</h1>
                <div>Une mission n'a pas de prix assigné.</div>
                <button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
              </div>
            `
  );
};
// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const resultMcr = getArea();

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Mission",
    type: "TEXT",
  },
  {
    key: "IdentifiantFacture",
    operator: "EQUALS",
    value: docData.FORMID,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTEQUALS",
    value: "Supprimé(e)",
    type: "TEXT",
  },
  {
    key: "Maison",
    operator: "EQUALS",
    value: resultMcr,
    type: "TEXT",
  },
];

const getMissionData = async () => {
  try {
    // get the id of the form
    const res1 = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const idsMission = res1.data.ids;

    // get the infos
    const res2 = await api({ local: true }).post("document/id", {
      ids: idsMission,
    });
    //parse the info
    const missionList = res2.data.documents.map((mission) =>
      JSON.parse(mission.data)
    );
    return missionList;
  } catch (error) {
    console.log("ERREUR", error);
  }
};

// main function
const main = async () => {
  console.log("111");
  // get the list of mission infos
  const missions = await getMissionData();
  console.log("333");
  // if not undefined
  if (missions.length) {
    // var to store prixInitial
    let prixInitialTotal = 0;
    let prixInitialHorsForfaitTotal = 0;
    let totalForfaits = 0;
    // remise parsefloat
    const remise = parseFloat(docData.CalculPrix_Remise);
    // add every prixInitiail to the total
    missions.forEach((info) => {
      const prixInitial = info.CalculPrix_Prix;
      const prixForfaits = info.CalculPrix_PrixForfaitPriseEnChargeEuro || "0";
      const prixHorsForfait =
        parseFloat(prixInitial) - parseFloat(prixForfaits);
      if (prixInitial) {
        prixInitialTotal += parseFloat(prixInitial);
        totalForfaits += parseFloat(prixForfaits);
        prixInitialHorsForfaitTotal += prixHorsForfait;
      } else {
        console.log("222");
        showPopupLoading();
        // button to close the popup
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
        throw new Error("Error: One or more missions with undefined prices.");
      }
    });

    // if remise has a value and is not equal 0
    if (remise && remise !== 0) {
      // calculate difference and substrac
      const montantASoustraire = (prixInitialHorsForfaitTotal * remise) / 100;
      const montantFinalDu =
        prixInitialHorsForfaitTotal - montantASoustraire + totalForfaits;
      // inject the data
      injectDocData({
        fillData: {
          MontantInitial: parseFloat(prixInitialTotal.toFixed(2)),
          MontantDû: montantFinalDu.toFixed(2),
          Facture_PrixInitialHorsForfait: parseFloat(
            prixInitialHorsForfaitTotal.toFixed(2)
          ),
          Facture_PrixDesForfaits: parseFloat(totalForfaits.toFixed(2)),
        },
      });
    } else {
      // else we inject the same data because no remise
      injectDocData({
        fillData: {
          MontantInitial: parseFloat(prixInitialTotal.toFixed(2)),
          MontantDû: prixInitialTotal.toFixed(2),
          Facture_PrixInitialHorsForfait: parseFloat(
            prixInitialHorsForfaitTotal.toFixed(2)
          ),
          Facture_PrixDesForfaits: parseFloat(totalForfaits.toFixed(2)),
        },
      });
    }
  } else {
    console.log("Aucune mission trouvée.");
  }
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
"
"console.log('Function 95', context)

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = str => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split('/')
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1]
    if (isUUID(lastpart) || lastpart === 'new') {
      parts.pop()
    }
  }
  const viewGroupUrl = parts.join('/')
  return viewGroupUrl
}

if (docData.IdentifiantFormulaireRécurrence) {
  const url = viewGroupUrl() + '/' + docData.IdentifiantFormulaireRécurrence
  return {
    MarkdownRécurrenceDispo: `Vous modifiez une occurrence. [Modifier la récurrence](${url})`
  }
}

if (
  docData.Planification_Récurrence &&
  docData.Planification_Récurrence != 'Une seule fois'
) {
  return {
    MarkdownRécurrenceDispo: `Vous modifiez une suite de formulaires`
  }
}
"
"console.log('Function 96', context);

const reccurence = docData.Planification_Récurrence;
const hasRecurrence = docData.IdentifiantFormulaireRécurrence || (reccurence && reccurence !== 'Une seule fois');

return { MarkdownRécurrenceDispo: hasRecurrence ? true : null };"
"console.log("Function 97", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const getDisponibilitéById = async (id) => {
  try {
    const apiFilters = [
      { key: "FORMID", operator: "EQUALS", value: id, type: "TEXT" },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res?.data.document; // Retourne l'objet document existant ou null
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

const getIdsDisponibilitéById = async (id) => {
  try {
    const apiFilters = [
      { key: "FORMID", operator: "EQUALS", value: id, type: "TEXT" },
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Disponibilité",
        type: "TEXT",
      },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res?.data.ids; // Retourne un tableau d'IDs ou null
  } catch (error) {
    console.error("Erreur lors de la vérification des disponibilités :", error);
    throw error;
  }
};

const updateDisponibilitésForms = async (
  ids,
  docData,
  formLayoutId_Disponibilite
) => {
  const documents = ids.map((id) => ({
    data: JSON.stringify(docData), // object of the keys from the Field DB and its new value
    status: "Enregistrée", // key from Status FormLayout
    active: true,
    template: { templateId: formLayoutId_Disponibilite }, // id from DB FormLayout
    documentID: id, // FormID from DB Form
  }));

  console.log("documents", documents);
  api({ local: true })
    .put("document/Many", {
      documents: documents,
    })
    .then((res6) => {
      console.log("res6", res6);
    });
};

const deleteDisponibilitésForms = async (ids, formLayoutId_Disponibilite) => {
  const documents = ids.map((id) => ({
    data: JSON.stringify({}), // object of the keys from the Field DB and its new value
    status: "Supprimé(e)", // key from Status FormLayout
    active: true,
    template: { templateId: formLayoutId_Disponibilite }, // id from DB FormLayout
    documentID: id, // FormID from DB Form
  }));

  console.log("documents", documents);
  api({ local: true })
    .put("document/Many", {
      documents: documents,
    })
    .then((res6) => {
      console.log("res6", res6);
    });
};

const getDisponibilitéByFormReccurenceId = async (id) => {
  try {
    const apiFilters = [
      {
        key: "IdentifiantFormulaireRécurrence",
        operator: "IN",
        value: id,
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "Enregistrée",
        type: "TEXT",
      },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res?.data.ids; // Retourne un tableau d'IDs ou null
  } catch (error) {
    console.error("Erreur lors de la vérification des disponibilités :", error);
    throw error;
  }
};

const createDisponibilitéForm = async (docData, formLayoutId) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: JSON.stringify(docData),
        status: "Enregistrée",
        active: true,
        template: { templateId: formLayoutId },
      },
    });
    console.log("Formulaire créé avec succès :", response);
    return response;
  } catch (error) {
    console.error("Erreur lors de la création du formulaire :", error);
  }
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

const haveChanged = (docData, data) => {
  if (
    docData.Planification_Date !== data.Planification_Date ||
    docData.Planification_HeureDébut !== data.Planification_HeureDébut ||
    docData.Planification_HeureFin !== data.Planification_HeureFin ||
    docData.Planification_Récurrence !== data.Planification_Récurrence
  ) {
    return true;
  }

  if (docData.Planification_Récurrence === "Par semaine") {
    if (
      docData.Planification_Répéter.split("|").sort().join("|") !==
        data.Planification_Répéter.split("|").sort().join("|") ||
      docData.Planification_DateFin !== data.Planification_DateFin
    ) {
      return true;
    }
  }

  if (docData.Planification_Récurrence === "Par jour spécifique") {
    if (
      docData.Planification_MultiDate.split("|").sort().join("|") !==
      data.Planification_MultiDate.split("|").sort().join("|")
    ) {
      return true;
    }
  }

  return false;
};

const modifyDocData = (docData) => {
  const {
    Planification_Répéter,
    Planification_MultiDate,
    Planification_DateFin,
    Planification_Récurrence,
    Planification_HeureFin,
    Planification_HeureDébut,
    Planification_Date,
    InformationsAdmin_DateHeureDébut,
    InformationsAdmin_DateHeureFin,
    IdentifiantFormulaireRécurrence,
    Exception_Récurrence,
    ...rest
  } = docData;
  return rest;
};

const main = async (docData) => {
  console.log("Début de l'exécution");

  const formLayoutId_Disponibilite = "cd81267c-4a6b-451b-846f-22999f0be1f5";

  if (!isValidDocument(t, docData)) {
    if (docData.STATUS === "Draft") {
      const res = await createDisponibilitéForm(
        docData,
        formLayoutId_Disponibilite
      );
      console.log("Résultat création :", res);
    } else {
      const data = await getDisponibilitéById(docData.FORMID);
      console.log("Données existantes :", data);

      if (!haveChanged(docData, JSON.parse(data.data))) {
        const newDocData = modifyDocData(docData);
        console.log("Données modifiées :", newDocData);
        const ids = await getDisponibilitéByFormReccurenceId(docData.FORMID);
        ids.push(docData.FORMID);

        console.log("ids : ", ids);

        await updateDisponibilitésForms(
          ids,
          newDocData,
          formLayoutId_Disponibilite
        );
      } else {
        const newDocData = { ...docData, Exception_Récurrence: "" };
        console.log("Données modifiées :", newDocData);
        const ids = await getDisponibilitéByFormReccurenceId(docData.FORMID);
        const id = [docData.FORMID];

        console.log("ids : ", ids);

        await updateDisponibilitésForms(
          id,
          newDocData,
          formLayoutId_Disponibilite
        );

        await deleteDisponibilitésForms(ids, formLayoutId_Disponibilite);
      }
    }
    navigateBack();
    //redirectToViewGroup()
  } else {
    console.log("Document invalide");
  }
};

// Exécuter la fonction principale
main(docData);
"
"console.log("Function 98", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

const deleteDisponibilitésForms = async (ids, formLayoutId_Disponibilite) => {
  const documents = ids.map((id) => ({
    data: JSON.stringify({}), // object of the keys from the Field DB and its new value
    status: "Supprimé(e)", // key from Status FormLayout
    active: true,
    template: { templateId: formLayoutId_Disponibilite }, // id from DB FormLayout
    documentID: id, // FormID from DB Form
  }));

  console.log("documents", documents);
  api({ local: true })
    .put("document/Many", {
      documents: documents,
    })
    .then((res6) => {
      console.log("res6", res6);
    });
};

const getDisponibilitéByFormReccurenceId = async (id) => {
  try {
    const apiFilters = [
      {
        key: "IdentifiantFormulaireRécurrence",
        operator: "IN",
        value: id,
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "Enregistrée",
        type: "TEXT",
      },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res?.data.ids; // Retourne un tableau d'IDs ou null
  } catch (error) {
    console.error("Erreur lors de la vérification des disponibilités :", error);
    throw error;
  }
};

const main = async (docData) => {
  console.log("Début de l'exécution");

  const formLayoutId_Disponibilite = "cd81267c-4a6b-451b-846f-22999f0be1f5";

  const ids = await getDisponibilitéByFormReccurenceId(docData.FORMID);
  ids.push(docData.FORMID);

  console.log("ids : ", ids);

  await deleteDisponibilitésForms(ids, formLayoutId_Disponibilite);

  navigateBack();
  //redirectToViewGroup()
};

// Exécuter la fonction principale
main(docData);
"
"console.log('Function 99', context);

// fills field DateEnregistrement in forms Mission & Bénéficiaire
const { STATUS } = docData;
const today = new Date();
const formattedDate = today.toISOString().split('T')[0]; // Formate en YYYY-MM-DD

return STATUS === 'Draft' ? { 'DateEnregistrement': formattedDate, CC_NbAccompagnateur: '0' } : {undefined, undefined};"
"console.log("Function 101", context);

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
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
            `
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

// get the ids
const formIDs = store.pageContentStore.checked;
let index = 1;
// api to get the invoices info
const getFactureInfo = async () => {
  if (formIDs) {
    // constant to store the document to update status
    const documentFacture = [];
    const documentN8n = [];
    try {
      const res1 = await api({ local: true }).post("document/id", {
        ids: formIDs,
      });
      const pdfList = [];
      res1.data.documents.forEach((document) => {
        // Parse the document data (to extract the PDF path)
        const documentData = JSON.parse(document.data);
        console.log("documentData", documentData);
        const prenom = documentData.PrénomSelected;
        const nom = documentData.Nom;
        // if CoorFactu_Réception is Courrier postal we download and update the status
        if (documentData.CoorFactu_Réception === "Courrier postal") {
          try {
            // Parse the FichierPDFFacture if it's a JSON string
            const pdf = JSON.parse(documentData.FichierPDFFacture);
            console.log("PDF", pdf);
            // Extract the PDF path and filename
            const pdfPath = pdf.path;
            // custom name for file
            const newFilename = `Facture_${documentData.NuméroFacture}_${prenom}_${nom}.pdf`;
            // If a valid PDF path exists, create a download link
            if (pdfPath) {
              pdfList.push({ path: pdfPath, filename: newFilename }); // Use the new filename here
            }
            index++;
            // push the document we need to update status to Envoyée
            documentFacture.push({
              documentID: document.documentID,
              data: JSON.stringify({}),
              status: "Envoyée",
              active: true,
              template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
            });
          } catch (error) {
            console.log("Erreur lors du téléchargement de la facture", error);
          }
        }

        // if courrier electronique we do a
        if (documentData.CoorFactu_Réception === "Courrier électronique") {
          documentN8n.push({
            documentID: document.documentID,
            data: JSON.stringify({}),
            status: "Envoi en cours",
            active: true,
            template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
          });
        }
      });
      if (documentN8n.length) {
        const res2 = await api({ local: true }).put("document/Many", {
          documents: documentN8n,
        });
        try {
          // then call the webhook
          // webhook n8n
          fetch("https://n8n.mcrbe-test.fastercom.io/webhook/email", {
            method: "GET",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
          });
          hidePopupLoading();
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour des formulaires :",
            error
          );
          hidePopupLoading();
          throw error;
        }
      }

      // if at least 1 we update
      if (documentFacture.length) {
        // put/many for multiple updates (on facture and missions)
        const res = await api({ local: true }).put("document/Many", {
          documents: documentFacture,
        });
      }
      if (pdfList.length) {
        await downloadAllPDFsAsZip(pdfList);
      }
      hidePopupLoading();
    } catch (error) {
      console.log("Erreur lors de la récupération des factures", error);
      hidePopupLoading();
    }
  } else {
    console.log("Erreur, veuillez sélectionner une facture.");
    hidePopupLoading();
  }
};

const downloadAllPDFsAsZip = async (pdfList) => {
  const zip = new JSZip();

  for (const { path, filename } of pdfList) {
    try {
      const response = await fetch(path);
      console.log("RESPONSE ", response);
      const blob = await response.blob();
      console.log("BLOB ", blob);
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${filename}`, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "Factures.zip");
  });
};

// main
const main = async () => {
  let message = "Veuillez patienter, s'il vous plaît.";
  showPopupLoading(message);
  // api call
  await getFactureInfo();
};

main();
"
"console.log("Function 102", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};
/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const fieldKeys = {
  paid: "MontantPayé",
  factured: "MontantDû",
};

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

// to update the facture form
const updateFactureForms = async (formData) => {
  const currentStatus = docData.FactureStatus ?? "Brouillon";
  const draftStatusArray = ["Draft", "Brouillon"];
  const newStatus =
    !draftStatusArray.includes(currentStatus) &&
    Number(docData[fieldKeys.paid]) >= Number(docData[fieldKeys.factured])
      ? "Acquittée"
      : currentStatus;
  const document = {
    data: formatDataAPI(formData), // object of the keys from the Field DB and its new value
    status: newStatus, // key from Status FormLayout
    active: true,
    template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" }, // id from DB FormLayout
    documentID: docData.FORMID, // FormID from DB Form
  };

  // update the form
  const res1 = api({ local: true }).put("document", {
    document,
  });
};

// main
const main = async () => {
  await updateFactureForms(docData);
  navigateBack();
  //redirectToViewGroup()
};

// Exécuter la fonction principale
main();
"
"console.log("Function 103 - prefill collections", context);
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
};

const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];
let data = {};

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (
      mcrDictionary[AREA] &&
      docData.STATUS === "Draft" &&
      !docData.CC_Destinations.length
    ) {
      data = {
        Téléphones: [{}],
        "E-mails": [{}],
        "Contacts supplémentaires": [{}],
        AdressePreférées: [{}],
        CC_Destinations: [{}],
      };
    }
    break;
  case "Facture":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      data = {
        Relances: [{}],
        Paiements: [{}],
      };
    }
    break;
  case "Véhicule":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
    }
    break;
  case "Volontaire":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      data = {
        Téléphones: [{}],
        "E-mails": [{}],
        "Contacts supplémentaires Chauffeur": [{}],
      };
    }
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
    }
    break;
  case "Bénéficiaire":
    if (mcrDictionary[AREA] && docData.STATUS === "Draft") {
      data = {
        Téléphones: [{}],
        "E-mails": [{}],
        AdressePreférées: [{}],
        "Contacts supplémentaires": [{}],
      };
    }
    break;
  default:
    break;
}

callback({
  data: data,
});
"
"console.log('Function 104', context);

const status = docData.STATUS;
if(status !== 'Draft'){
return {'FactureStatus': status}
};"
"//console.log('Function 105', context);
let backgroundColor;
let color;
// colors for 'other' statuses
if (docData.STATUS === "Enregistré") {
  backgroundColor = "#AECFD5";
  color = "#013B4E";
}
if (docData.STATUS === "Enregistrée") {
  backgroundColor = "#AECFD5";
  color = "#013B4E";
}
if (docData.STATUS === "Modifié") {
  backgroundColor = "#e7c971";
  color = "#322300";
}
if (docData.STATUS === "Supprimé(e)") {
  backgroundColor = "#cbcbcb";
  color = "#151515";
}
if (docData.STATUS === "À facturer") {
  backgroundColor = "#E3F2EB";
  color = "#003719";
}
if (docData.STATUS === "Archivé") {
  backgroundColor = "#E3DED1";
  color = "#322300";
}
// colors for facture statues
if (docData.STATUS === "Brouillon") {
  backgroundColor = "#cfc6b1";
  color = "#322300";
}
if (docData.STATUS === "Validée") {
  backgroundColor = "#c5e3f9";
  color = "#062D4A";
}
if (docData.STATUS === "Envoi en cours") {
  backgroundColor = "#e1d8f6";
  color = "#1D0555";
}
if (docData.STATUS === "Envoyée") {
  backgroundColor = "#beb4ed";
  color = "#1D0555";
}
if (docData.STATUS === "Acquittée") {
  backgroundColor = "#98d4b3";
  color = "#003719";
}

// colors for mission statuses
if (docData.STATUS === "Draft") {
  backgroundColor = "#e1e1e1";
  color = "#151515";
}
if (docData.STATUS === "Refusée") {
  backgroundColor = "#e6c0c1";
  color = "#4A0305";
}
if (docData.STATUS === "Acceptée") {
  backgroundColor = "#c5e3f9";
  color = "#062D4A";
}
if (docData.STATUS === "Annulée") {
  backgroundColor = "#e29294";
  color = "#4A0305";
}
if (docData.STATUS === "Facturation en cours") {
  backgroundColor = "#c6e7d7";
  color = "#003719";
}
if (docData.STATUS === "Facturée") {
  backgroundColor = "#98d4b3";
  color = "#003719";
}

return { backgroundColor: backgroundColor, color: color };
"
"console.log('Function 106', context);

const formatApiFilter = async (apiFilters, dateWindow) => {
    const rangeDateDebut = '0001-01-01|' + dateWindow[1];
    const rangeDateFin = dateWindow[0] + '|9999-12-31';

    return [...apiFilters, {
        key: "InformationsAdmin_DateHeureDébut",
        operator: "BETWEEN",
        value: rangeDateDebut,
        type: "DATE",
    }, {
        key: "InformationsAdmin_DateHeureFin",
        operator: "BETWEEN",
        value: rangeDateFin,
        type: "DATE",
    }];
};

const apiFilters = [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Disponibilité",
        type: "TEXT",
    },
    {
        key: "Planification_Disponiblité",
        operator: "IN",
        value: "Disponible|Indisponible",
        type: "TEXT",
    }
];

const isBetweenDates = (date, start, end) => {
    return date >= start && date <= end
};

const getDayIndex = (day) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return days.indexOf(day);
};

const getWeekday = (dateStr) => {
    // Split the input and parse integers
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create a Date object (note: month is 0-indexed in JS)
    const date = new Date(year, month - 1, day);

    // Days of the week
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // Return corresponding day
    return days[date.getDay()];
};

const formatReccurenceObject = (documents, dateWindow) => {
    const formatedDocuments = [];
    documents.forEach((doc) => {
        console.log(formatedDocuments);
        const data = typeof doc.data === 'string' ? JSON.parse(doc.data) : doc.data;
        console.log("data", data);

        const exceptions = data.Exception_Récurrence
            ? data.Exception_Récurrence.split('|').map(date => new Date(date).toISOString().split('T')[0])
            : [];

        if (data.IdentifiantFormulaireRécurrence || data.Planification_Récurrence === 'Une seule fois') {
            console.log("test1");
            if (isBetweenDates(data.Planification_Date, dateWindow[0], dateWindow[1])) {
                const occurrenceDateStr = data.Planification_Date.split('T')[0];
                const dateavecHeureDebut = occurrenceDateStr + 'T' + data.Planification_HeureDébut + ':00';
                const dateavecHeureFin = occurrenceDateStr + 'T' + data.Planification_HeureFin + ':00';
                const newData = {
                    ...data,
                    InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                    InformationsAdmin_DateHeureFin: dateavecHeureFin,
                };
                formatedDocuments.push({
                    ...doc,
                    doesExist: true,
                    data: JSON.stringify(newData),
                });
            }
        } else if (data.Planification_Récurrence === 'Par semaine') {
            if (dateWindow[0] === dateWindow[1]) {
                console.log("test2");
                const date = dateWindow[0];
                const day = getWeekday(date);
                const days = data.Planification_Répéter.split('|');

                const occurrenceDateStr = date.split('T')[0];
                const dateavecHeureDebut = occurrenceDateStr + 'T' + data.Planification_HeureDébut + ':00';
                const dateavecHeureFin = occurrenceDateStr + 'T' + data.Planification_HeureFin + ':00';
                if (days.includes(day)) {
                    const newData = {
                        ...data,
                        InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                        InformationsAdmin_DateHeureFin: dateavecHeureFin,
                    };

                    formatedDocuments.push({
                        ...doc,
                        data: JSON.stringify(newData),
                        doesExist: false,
                    });
                }
            } else {
                console.log("test3");
                const touteLesCombienDeSemaine = 1;
                const dateFin = new Date(data.InformationsAdmin_DateHeureFin.split('T')[0]);
                const dateCourante = new Date(data.Planification_Date);
                const repeterLe = data.Planification_Répéter.split('|');

                // La date limite est soit dateFin soit maxDate (le plus petit des deux)
                const limite = dateFin < dateWindow[1] ? dateFin : dateWindow[1];
                console.log("condition while", dateCourante <= limite);
                console.log("dateCourante", dateCourante);
                console.log("limite", limite);
                while (dateCourante.toISOString().split('T')[0] <= limite) {
                    // Vérifier si la date courante est dans la fenêtre de dates
                    const dateCouranteStr = dateCourante.toISOString().split('T')[0];
                    console.log("Condition if", dateCouranteStr >= dateWindow[0]);
                    if (dateCouranteStr >= dateWindow[0]) {
                        repeterLe.forEach((jour) => {
                            const jourIndex = getDayIndex(jour);
                            const occurrenceDate = new Date(dateCourante);
                            occurrenceDate.setDate(dateCourante.getDate() + ((jourIndex - dateCourante.getDay() + 7) % 7));
                            // Declare occurrenceDateStr first:
                            const occurrenceDateStr = occurrenceDate.toISOString().split('T')[0];
                            const dateavecHeureDebut = occurrenceDateStr + 'T' + data.Planification_HeureDébut + ':00';
                            const dateavecHeureFin = occurrenceDateStr + 'T' + data.Planification_HeureFin + ':00';
                            console.log(occurrenceDate <= limite && !exceptions.includes(occurrenceDateStr));
                            console.log("occurrenceDate", occurrenceDate);

                            if (occurrenceDateStr <= limite && !exceptions.includes(occurrenceDateStr)) {
                                const newData = {
                                    ...data,
                                    InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                                    InformationsAdmin_DateHeureFin: dateavecHeureFin,
                                };
                                formatedDocuments.push({
                                    ...doc,
                                    data: JSON.stringify(newData),
                                    doesExist: false,
                                });
                            }
                        });
                    }
                    // Advance the date by the set number of weeks
                    dateCourante.setDate(dateCourante.getDate() + 7 * touteLesCombienDeSemaine);
                }
            }

        } else if (data.Planification_Récurrence === 'Par jour spécifique') {
            console.log("test4");
            const multiDate = data.Planification_MultiDate.split('|');

            multiDate.forEach((date) => {
                if (isBetweenDates(date, dateWindow[0], dateWindow[1])) {
                    const dateStr = new Date(date).toISOString().split('T')[0];
                    const dateavecHeureDebut = dateStr + 'T' + data.Planification_HeureDébut + ':00';
                    const dateavecHeureFin = dateStr + 'T' + data.Planification_HeureFin + ':00';
                    if (!exceptions.includes(dateStr)) {
                        const newData = {
                            ...data,
                            InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                            InformationsAdmin_DateHeureFin: dateavecHeureFin,
                        };
                        formatedDocuments.push({
                            ...doc,
                            data: JSON.stringify(newData),
                            doesExist: false,
                        });
                    }
                }
            });
        }
    });

    return {

        documents: formatedDocuments,

    };


};

const REC_api_document_id = async (filters, dateWindow) => {

    let apiFilters = filters;
    if (dateWindow !== null) {
        apiFilters = await formatApiFilter(filters, dateWindow);
    }

    // Step 2 : Get the document with the document/id/filter api
    const res = await api({ local: true }).post("document/id/filter", {
        filters: apiFilters,
    });
    const ids = res.data.ids;

    // Step 3 : Get the documents data with the "document/id" api
    const objects = await api({ local: true }).post("document/id", { ids: ids });

	console.log("ids", ids);
    // Step 4 : Interpret the documents thanks to the dateWindow
    return formatReccurenceObject(objects.data.documents, dateWindow);
    // returns a list of documents.
    // one document = {
    // data,
    // documentID, -> real documentID if doesExist, recurrence documentID if not.
    // ...
    // doesExist : bool
    // }
};

const main = async () => {
    const date = ['2025-03-26', '2025-03-26'];
    const dateWindow = ['2025-03-01', '2025-03-31'];
    const filters = apiFilters;
    console.log("=============== TEST 1 ===============");
    const res = await REC_api_document_id(filters, date);
    console.log(res);
    console.log("=============== TEST 2 ===============");
    const res2 = await REC_api_document_id(filters, dateWindow);
    console.log(res2);

}

main();"
"console.log("Function 108", context);
const { Paiements, MontantDû, MontantPayé, MontantRestantDû } = docData;
const dataKey = "Paiements|3|Montant";
let total = 0;
Paiements.forEach((element) => {
  total += parseFloat(element[dataKey]) ? parseFloat(element[dataKey]) : 0;
});
const montantRestant = parseFloat(MontantDû) - parseFloat(total);
const restantAPayer = montantRestant < 0 ? 0 : montantRestant;

return {
  MontantPayé: total.toFixed(2),
  MontantRestantDû: restantAPayer.toFixed(2),
};
"
"console.log('Function 110', context);

const isDev = store.moduleStore.user.roles;
return {
    Facture_Information_Dev: isDev.includes('1. DEVELOPPEUR') ? true : null
};"
"console.log("Function 111", context);
//constants
const { NUMBER, STATUS } = docData;
const user = store.moduleStore.user.username;
const FIRST_VOLONTAIRE = 0; // we define the first form to be applied to the fields, if there is more than 1
const fieldMapping = [
  ["Prénom", "PrénomSelected"],
  ["Nom", "Nom"],
  ["Nom", "NomFormMission"],
  ["DateDeNaissance", "DateDeNaissance"],
  ["IdentifiantDispo", "IdentifiantDispo"],
];

const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Volontaire",
    type: "TEXT",
  },
  {
    key: "NomDutilisateur",
    operator: "EQUALS",
    value: user,
    type: "TEXT",
  },
];

//sync functions
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

const hidePopupInfo = () => {
  const infoPopup = document.getElementById("infoPopup");
  if (infoPopup) infoPopup.style.display = "none";
};

const showPopupInfo = (infoMessage) => {
  const popup = createOrUpdateElement(
    "infoPopup",
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
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center; position: relative; width: 300px; text-align: center;">
          <button id="closePopup" style="position: absolute; top: 0px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
          <div style="margin-top: 20px;">${infoMessage}</div>
      </div>
      `
  );

  document
    .getElementById("closePopup")
    .addEventListener("click", hidePopupInfo.bind(this));
};

//async functions
const getIds = async () => {
  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;

    return ids;
  } catch (error) {
    console.error("Erreur lors de la récupération des ids :", error);
    throw error;
  }
};

const getDocuments = async (ids) => {
  try {
    const res = await api({ local: true }).post("document/id", { ids });

    const documents = res?.data?.documents;
    return documents.map((doc) => {
      const data = JSON.parse(doc.data);
      const fields = {};

      fieldMapping.forEach(([sourceKey, destinationKey]) => {
        fields[destinationKey] = data[sourceKey];
      });

      fields["IdentifiantDispo"] = doc.documentID;
      return fields;
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    throw error;
  }
};

//main
const main = async () => {
  try {
    // 0. Check if form STATUS === 'Brouillon', 'Draft', otherwise ABORT
    if (["Draft", "Brouillon"].includes(STATUS)) {
      // 1. retrieve ids according to filters
      const ids = await getIds();
      console.log("ids", ids);

      // 2. retrieve documents by their ids
      const documents = await getDocuments(ids);
      console.log("documents", documents);

      // 3. handle autofill based on documents obtained
      const docLength = documents.length;
      const data = docLength > 0 ? documents[FIRST_VOLONTAIRE] : {};
      console.log(data);

      if (docLength > 1) {
        // show info popup
        console.log("show popup multiple volontaires");
        showPopupInfo(
          "Il semble que votre nom d'utilisateur figure sur plusieurs formulaires de volontaires."
        );
      }
      // 4. autofill data via callback
      callback({
        data,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des volontaires :", error);
  }
};

main();
"
"console.log("Function 112", context);
const status = docData.STATUS;

return status === "Brouillon"
  ? {
      BatchFacture: true,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: true,
      BatchFactureRelancerEtEnregistrer: null,
    }
  : status === "Envoyée"
  ? {
      BatchFactureRelancerEtEnregistrer: true,
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: null,
    }
  : status === "Annulée"
  ? {
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: null,
      BatchFactureRelancerEtEnregistrer: null,
    }
  : status === "Supprimé(e)"
  ? {
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: null,
      sectionButtonActualiserPrix: null,
      BatchFactureRelancerEtEnregistrer: null,
    }
  : {
      BatchFacture: null,
      BatchFactureEnregistrerSeulement: true,
      sectionButtonActualiserPrix: null,
      BatchFactureRelancerEtEnregistrer: null,
    };
"
"console.log('Function 113', context);

return docData['CoorFactu_Réception'] === 'Courrier électronique'
  ? { CoorFactu_Courrier: true }
  : { CoorFactu_Courrier: null }
"
"console.log("Function 114", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

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
const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};
// to update the facture form
const updateFactureForms = async (formData) => {
  const document = {
    data: formatDataAPI(formData), // object of the keys from the Field DB and its new value
    status: "Supprimé(e)", // key from Status FormLayout
    active: true,
    template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" }, // id from DB FormLayout
    documentID: docData.FORMID, // FormID from DB Form
  };

  // update the form
  const res1 = api({ local: true }).put("document", {
    document,
  });
};

// main
const main = async () => {
  await updateFactureForms(docData);
  navigateBack();
  //redirectToViewGroup()
};

// Exécuter la fonction principale
main();
"
"console.log("Function 117", context);

function getInfos() {
  const date = docData.Planification_Date;
  const heureDebut = docData.CC_Récupération;

  let heureFin;
  if (docData.CC_Retour == "true") {
    heureFin = docData.CC_Arrivée ? docData.CC_Arrivée : `23:59`;
  } else {
    heureFin =
      docData.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
        "CC_Destinations|400|Début de RDV"
      ] ||
      docData?.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
        "CC_Destinations|300|Arrivée"
      ];
  }

  // Construction des Date objets sécurisés
  let dateavecHeureDebut = new Date(`${date}T${heureDebut || "00:00"}:00`);
  let dateavecHeureFin = new Date(`${date}T${heureFin || "00:00"}:00`);

  // Formater la date et l'heure selon l'heure locale
  function formatDateLocal(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Mois de 1 à 12
    const day = String(dateObj.getDate()).padStart(2, "0"); // Jour de 1 à 31
    const hours = String(dateObj.getHours()).padStart(2, "0"); // Heures de 00 à 23
    const minutes = String(dateObj.getMinutes()).padStart(2, "0"); // Minutes de 00 à 59

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  if (
    docData.Planification_Récurrence == "Une seule fois" ||
    docData.IdentifiantFormulaireRécurrence
  ) {
    if (date && heureDebut && heureFin) {
      return {
        InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
          ? `${date}T23:59:00`
          : formatDateLocal(dateavecHeureDebut),
        InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
          ? `${date}T23:59:00`
          : formatDateLocal(dateavecHeureFin),
      };
    }
  } else {
    if (docData.Planification_Récurrence == "Par semaine") {
      if (docData.Planification_DateFin) {
        const dateFin = docData.Planification_DateFin;
        dateavecHeureFin = new Date(`${dateFin}T${heureFin || "00"}:00`);
        console.log("DATE AVC HEURE ", dateavecHeureFin);
        return {
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureFin),
        };
      } else {
        return {
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
        };
      }
    } else if (docData.Planification_Récurrence == "Par jour spécifique") {
      if (docData.Planification_MultiDate) {
        const date = docData.Planification_MultiDate.split("|")[0];
        const multiDate = docData.Planification_MultiDate.split("|");
        const latestDate = multiDate.reduce((latest, current) =>
          new Date(current) > new Date(latest) ? current : latest,
        );
        const earliestDate = multiDate.reduce((earliest, current) =>
          new Date(current) < new Date(earliest) ? current : earliest,
        );

        dateavecHeureDebut = new Date(
          `${earliestDate}T${heureDebut || "00:00"}:00`,
        );
        dateavecHeureFin = new Date(`${latestDate}T${heureFin || "00:00"}:00`);

        return {
          Planification_Date: date,
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureFin),
        };
      }
    }
  }

  // Fallback final
  return {
    InformationsAdmin_DateHeureDébut: `${date}T00:01:00`,
    InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
  };
}

const result = getInfos();
console.log("result ========", result);
return result;
"
"console.log('Function 119', context);

const main = async () => {
    const id = store.pageContentStore?.active[0];
    const form = store.pageContentStore.prepareDataRows.find((row) => row.rowID === id);

    if (!form) {
        console.error("Aucune donnée trouvée pour l'ID :", id);
        return;
    }
    
    try {
        const url_id = form.key;
        const url = new URL(window.location.href);
        
        // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
        const segments = url.pathname.split("/");
        
        // Cherche l'index du segment MCR (ex: "mcr.arlon")
        const mcrIndex = segments.findIndex(seg => seg.startsWith("mcr."));
        
        if (mcrIndex !== -1) {
            const mcrSegment = segments[mcrIndex];
            const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

            // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
            const newPath = `/${mcrSegment}/${section}/${url_id}`;
            url.pathname = newPath;

            window.open(url.toString(), "_blank");
        } else {
            console.error("Segment MCR introuvable dans l’URL.");
        }

    } catch (error) {
        console.error("Erreur lors de la création du formulaire :", error);
    }
};

main();
"
"console.log("Function 121", context);
const {
  PrénomSelected,
  Nom,
  DateDeNaissance,
  IdentifiantMission,
  NuméroFacture,
  MontantInitial,
  MontantDû,
  FichierPDFFacture,
  DateEnvoi,
  CoorFactu_Réception,
  CoorFactu_Courrier,
  CoorFactu_Prénom,
  CoorFactu_Nom,
  CoorFactu_Rue,
  "CoorFactu_Code postal": CoorFactu_CodePostal,
  CoorFactu_Numéro,
  CoorFactu_Ville,
  CoorFactu_Pays,
  Relances,
  Maison,
  MontantRestantDû,
  MontantPayé,
} = docData;

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

const showErrorBanner = (errorMessage) => {
  const errorBanner = createOrUpdateElement(
    "errorBanner",
    "div",
    `
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
    `,
    `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
};

// if every info is filled we can proceed
if (
  PrénomSelected &&
  Nom &&
  IdentifiantMission &&
  NuméroFacture &&
  MontantInitial &&
  MontantDû &&
  FichierPDFFacture &&
  DateEnvoi &&
  CoorFactu_Réception
) {
  // we create a new date for today
  const date = new Date();
  // get the year, month and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // reformat the date
  const formattedDate = `${day}/${month}/${year}`;
  const formDate = `${year}-${month}-${day}`;
  console.log("FORMATTED DATE", formattedDate);
  console.log("Function 78", context);

  /**
   * Test if a string is a UUID
   * @param {string} str
   * @returns {boolean}
   */
  const isUUID = (str) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  /**
   * Get the viewGroup Url
   * This can be usefull in order to redirect the users
   * @returns
   */
  const viewGroupUrl = () => {
    // Step 1: Get the current Url
    const currentUrl = window.location.href;
    // Step 2 : Remove the unecessary segments
    const parts = currentUrl.split("/");
    for (let i = 0; i < 3; i++) {
      const lastpart = parts[parts.length - 1];
      if (isUUID(lastpart) || lastpart === "new") {
        parts.pop();
      }
    }
    const viewGroupUrl = parts.join("/");
    return viewGroupUrl;
  };

  /**
   * Redirect the user to the last viewgroup
   */
  const redirectToViewGroup = () => {
    window.location.href = viewGroupUrl();
  };

  // function to create the popup loading element
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
  // function to hide the popuploading
  const hidePopupLoading = () => {
    const loadingPopup = document.getElementById("loadingPopup");
    if (loadingPopup) loadingPopup.style.display = "none";
  };
  // function to show the popup loading while waiting for api
  const showPopupLoadingWaiting = () => {
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
                  <div>Veuillez patienter, la relance est en train d'être générée.</div>
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
  // constant to update the facture form and missions related form
  const updateDocuments = async (formData, formId) => {
    // for the facture doc
    const documentFacture = {
      data: formatDataAPI(formData),
      status: "Envoyée",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: formId,
    };
    // put/many for multiple updates (on facture and missions)
    const res = await api({ local: true }).put("document", {
      document: documentFacture,
      preventNotify: "FULL",
    });

    return res;
  };

  // function to generate the PDF
  const createPDF = async (profilInfo) => {
    const tableUseless = [
      {
        headers: ["", ""],
        rows: [],
      },
    ];
    // new entry
    tableUseless[0].rows.push(["", ""]);
    // client billing informations
    const clientAddress = `${CoorFactu_Rue} ${CoorFactu_Numéro},`;
    const clientAddressPt2 = `${CoorFactu_CodePostal}, ${CoorFactu_Ville}, ${CoorFactu_Pays}`;
    const clientName = `${CoorFactu_Prénom} ${CoorFactu_Nom.toUpperCase()}`;
    const clientName2 = `${PrénomSelected} ${Nom.toUpperCase()}`;
    const result = [];
    /* here we treat the mcr informations */
    // necessary info for mcr
    let mcrStreet;
    let mcrIban;
    let mcrPhone;
    let mcrName;
    let mcrTVA;
    let mcrArea;
    let mcrOffName;

    mcrStreet = profilInfo?.AdresseMCR || "";
    mcrPhone = profilInfo?.TelephoneMCR || "";
    mcrIban = profilInfo?.IBANMCR || "";
    mcrTVA = profilInfo?.TVAMCR || "";
    mcrOffName = profilInfo?.NomMCR || "";
    // if maison is Arlon
    if (Maison === "MCR Arlon") {
      mcrArea = "Arlon";
      mcrName = "ARLON";
    }
    // if aubange messancy
    if (Maison === "MCR Aubange-Messancy") {
      mcrArea = "Aubange-Messancy";
      mcrName = "AUBANGE-MESSANCY";
    }
    // if maison is sud gaume
    if (Maison === "MCR Sud Gaume") {
      mcrArea = "Sud Gaume";
      mcrName = "SUD GAUME";
    }
    // if maison is rulles et semois
    if (Maison === "MCR Rulles-Semois") {
      mcrArea = "Rulles-Semois";
      mcrName = "RULLES-ET-SEMOIS";
    }

    if (Maison === "MCR Docteur Lagneau") {
      mcrArea = "Docteur Lagneau";
      mcrName = "DR LAGNEAU BOUILLON PALISEUL";
    }

    if (Maison === "MCR Marche") {
      mcrArea = "Marche";
      mcrName = "MARCHE";
    }

    if (Maison === "MCR Gembloux") {
      mcrArea = "Gembloux";
      mcrName = "GEMBLOUX";
    }

    if (Maison === "MCR Namur") {
      mcrArea = "Namur";
      mcrName = "NAMUR";
    }
    
    if (Maison === "MCR Florenville") {
      mcrArea = "Florenville";
      mcrName = "FLORENVILLE";
    }

    if (Maison === "MCR Rochefort") {
      mcrArea = "Rochefort";
      mcrName = "ROCHEFORT";
    }
    // change dates to european standard
    let dateEnvoiSplit = DateEnvoi.split("-");
    const newDateEnvoi = `${dateEnvoiSplit[2]}/${dateEnvoiSplit[1]}/${dateEnvoiSplit[0]}`;
    // add other maison conditions ...
    /* get the right montant restant dû by verifying if a payment has been made yet*/
    const restantDû = MontantPayé === "0" ? MontantDû : MontantRestantDû;
    /** every part needed for the informations of letter */
    const infoTitle = `Madame, Monsieur`;
    const infoPart1 = `À la suite d'une vérification de nos comptes, nous ne trouvons pas de trace du règlement de notre facture n° ${NuméroFacture} datée du ${newDateEnvoi}, au nom de ${clientName2}, pour un montant restant dû de ${restantDû}€`;
    const infoPart2 = `Si entretemps vous avez fait le nécessaire, veuillez nous excuser du présent rappel et nous faire savoir par quel mode de paiement et à quelle date vous l'avez exécuté.`;
    const infoPart3 = `Dans le cas contraire, nous vous remercions d'apurer ce montant sur notre compte bancaire IBAN ${mcrIban} dans les 5 jours ouvrables`;
    const infoPart4 = `Veuillez croire, Madame, Monsieur, à l'assurance de nos sentiments distingués.`;

    const nbRelances = Relances.length + 1;
    let relanceMsg;
    switch (nbRelances) {
      case 1:
        relanceMsg = "1er";
        break;
      case 2:
        relanceMsg = "2ème";
        break;
      case 3:
        relanceMsg = "3ème";
        break;
      default:
        relanceMsg = `${nbRelances}ème`;
    }
    /* push the data informations of ODS file*/

    const factureInfo = `{ "IBAN": "${mcrIban}", "Adresse": "${mcrStreet}", "Telephone": "${mcrPhone}", "nameOfficiel": "${mcrOffName}",
        "CurrentDate": "${formattedDate}", "NbRappel": "${relanceMsg}", "Name": "${mcrName}", "tva": "${mcrTVA}", "areaName": "${mcrArea}",
       "ClientName": "${clientName}", "ClientAddress": "${clientAddress}", "ClientAddressPt2": "${clientAddressPt2}", "InfoTitle": "${infoTitle}",
       "InfoPart1": "${infoPart1}", "InfoPart2": "${infoPart2}", "InfoPart3": "${infoPart3}", "InfoPart4": "${infoPart4}" }`;
    result.push(factureInfo);

    const res10 = await api({ local: true }).post(
      `document/download/sheets/FactureRelance/pdf/${NuméroFacture}`,
      {
        sheets: [
          {
            name: "InvoiceSheet",
            datas: result,
            sheetNames: [NuméroFacture],
            tableDatas: [tableUseless],
          },
        ],
      },
    );
    console.log("RES10", res10);
    const fileUrl = res10.data.fileUrl;
    return fileUrl;
  };

  // function to convert and update the facture form
  const convertAndUpdateFactureForm = async (fileUrl, numéroFacture) => {
    if (!fileUrl) {
      console.error("URL du fichier non trouvée dans la réponse.");
      return;
    }
    // Step 1: Get the file and convert in base64
    const fileDataString = await fetch(fileUrl)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Data = reader.result.split(",")[1]; // Extraction du Base64
              resolve(
                `{"filename":"${btoa(
                  numéroFacture,
                )}.pdf","data":"data:application/vnd.oasis.opendocument.spreadsheet;base64,${base64Data}"}`,
              );
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      )
      .catch((error) => {
        console.error(
          "Erreur lors du téléchargement ou conversion du fichier :",
          error,
        );
        return null;
      });

    if (!fileDataString) return;

    // Step 2: Update the form
    const clonedDocData = { ...docData };
    clonedDocData.Relances.push({
      "Relances|1|Date": formDate,
      "Relances|2|Facture": fileDataString,
    });
    console.log("Mise à jour des données du formulaire :", clonedDocData);
    console.log("ID du formulaire à mettre à jour :", docData.FORMID);
    // last step update the documents for mission and facture
    await updateDocuments(clonedDocData, docData.FORMID);
    if (CoorFactu_Réception === "Courrier postal") {
      // download the pdf
      // creates a download link
      const fileName = fileUrl.split("/").pop();
      const downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // last step update the documents for mission and facture
      /**
       * n8n call here
       *  */
      // if there is value for the email
      if (CoorFactu_Courrier) {
        try {
          const formID = docData.FORMID;
          // then call the webhook
          // webhook n8n
          const res = await fetch(
            "https://n8n.mcrbe-test.fastercom.io/webhook/relance",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                formID,
              }),
            },
          );
          const data = await res.json();
          console.log("data", data);
          if (!data[0].accepted[0]) {
            console.log("Erreur lors de l`envoi de courriel");
            showErrorBanner(
              "Erreur lors de l'envoi de courriel, veuillez-réessayer",
            );
            hidePopupLoading();
            return;
          }
          await updateDocuments(clonedDocData, docData.FORMID);
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour des formulaires :",
            error,
          );
          throw error;
        }
      } else {
        console.log("ERREUR ");
      }
    }
    hidePopupLoading();
    navigateBack();
  };
  const navigateBack = async () => {
    let viewGroup;
    const lastPage = localStorage.getItem("lastCustomPage");
    console.log("LAST PAGE ", lastPage);
    if (lastPage) {
      // Extraire le premier segment (le viewgroup)
      viewGroup = lastPage;
      window.location.href = viewGroup;
    } else {
      window.history.back(); // fallback si rien n’est trouvé
    }
  };

  const getProfil = async () => {
    try {
      const apiFilters2 = [
        {
          key: "FORMLAYOUTNAME",
          operator: "EQUALS",
          value: "Profil MCR",
          type: "TEXT",
        },
        {
          key: "Maison",
          operator: "EQUALS",
          value: Maison,
          type: "TEXT",
        },
        { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
      ];
      console.log("API FILTER", apiFilters2);
      const responseID = await api({ local: true }).post("document/id/filter", {
        filters: apiFilters2,
      });
      const ids = responseID?.data?.ids;

      const responseInfos = await api({ local: true }).post("document/id", {
        ids,
      });

      console.log("------responseInfos", responseInfos);

      const parsedData = responseInfos.data.documents.map((info) => ({
        ...JSON.parse(info.data),
        FORMID: info.metaData["FORMID"],
      }));

      return parsedData?.[0] || [];
    } catch (error) {
      console.log("Erreur", error);
      hidePopupLoading();
    }
  };

  // main
  const main = async () => {
    // we show the waiting popup
    showPopupLoadingWaiting();
    const profilInfo = await getProfil();
    // Get the new facture number
    const numéroFacture = `${NuméroFacture}_Relance`;
    console.log("Numéro de facture", numéroFacture);
    // create the pdf and get the file from url
    const fileUrl = await createPDF(profilInfo);
    // convert and update the facture form and give all the necessary infos
    await convertAndUpdateFactureForm(fileUrl, numéroFacture);
    //redirectToViewGroup();
  };
  window.addEventListener("popstate", hidePopupLoading);
  window.addEventListener("hashchange", hidePopupLoading);
  main(docData);
} else {
  console.log(
    "Erreur lors de la génération de la relance, un champ nécéssaire n'est pas remplit",
  );
}
"
"console.log("Function 122", context);

const recurrence = {
  formatApiFilter(apiFilters, dateWindow) {
    const rangeDateDebut = "0001-01-01|" + dateWindow[1];
    const rangeDateFin = dateWindow[0] + "|9999-12-31";

    return [
      ...apiFilters,
      {
        key: "InformationsAdmin_DateHeureDébut",
        operator: "BETWEEN",
        value: rangeDateDebut,
        type: "DATETIME",
      },
      {
        key: "InformationsAdmin_DateHeureFin",
        operator: "BETWEEN",
        value: rangeDateFin,
        type: "DATETIME",
      },
    ];
  },

  /**
   * Check if the fieldValue obtained thanks to data[fieldKey]
   * represent an empty field.
   * @param {string} fieldValue
   * @returns {bool}
   */
  fieldIsEmpty(fieldValue) {
    return [undefined, ""].includes(fieldValue);
  },

  /**
   * This function check if a form is a row or a document in order to treat it correctly
   * Example 1: The formID is kept with the key 'key' in a row but in a document
   * it is the key 'documentID'
   * Example 2: document data is exhaustive but row data only contains the data of the grid.
   * @param {object} form
   * @returns {string}
   */
  isDocumentOrRow(form) {
    let result = undefined;
    if ("rowID" in form) {
      result = "row";
    } else if ("documentID" in form) {
      result = "document";
    }
    return result;
  },

  /**
   * Returns the maximum of the 2 strings that are in input.
   * @param {string} str_1
   * @param {string} str_2
   * @returns {string}
   */
  maxDateString(str_1, str_2) {
    let result;
    result = str_1;
    if (str_1 <= str_2) {
      result = str_2;
    }
    return result;
  },

  /**
   * Returns the minimum of the 2 strings that are in input.
   * @param {string} str_1
   * @param {string} str_2
   * @returns {string}
   */
  minString(str_1, str_2) {
    let result = str_1;
    if (str_2 <= str_1) {
      result = str_2;
    }
    return result;
  },

  /**
   * This function takes french week days as a parameter and returns their indices
   * @param {string} multiselectFieldValue
   * @returns {array}
   */
  getFrenchWeekDayIndices(multiselectFieldValue) {
    let result = []; // FIX: ajout de let
    // FIX: validation du type
    if (typeof multiselectFieldValue !== "string") {
      console.warn(
        "Valeur invalide pour Planification_Répéter :",
        multiselectFieldValue
      );
      return result;
    }
    let frenchDays = multiselectFieldValue.split("|"); // FIX: ajout de let
    const frenchDayIndexMapping = {
      Dimanche: 0,
      Lundi: 1,
      Mardi: 2,
      Mercredi: 3,
      Jeudi: 4,
      Vendredi: 5,
      Samedi: 6,
    };
    for (const frenchDay of frenchDays) {
      if (frenchDay in frenchDayIndexMapping) {
        result.push(frenchDayIndexMapping[frenchDay]);
      } else {
        console.error(`${frenchDay} is unknown from frenchDayIndexMapping`); // FIX: template literal
      }
    }
    return result;
  },

  /**
   * Returns whether or not, the specified document needs to be interpreted in order to extract occurences
   * @param {*} data
   */
  needsInterpretation(data) {
    const isGeneratedOccurrence = !this.fieldIsEmpty(
      data["IdentifiantFormulaireRécurrence"]
    );
    const isSingleForm =
      this.fieldIsEmpty(data["Planification_Récurrence"]) ||
      data["Planification_Récurrence"] === "Une seule fois";
    return !(isGeneratedOccurrence || isSingleForm);
  },

  /**
   * Returns a list with the occurrence documents
   * @param {object} formToInterpret - The document that needs to be interpreted
   * @param {array} stringDates - The dates on which we want to create an occurrence
   * @returns {array}
   */
  formatOccurrenceForms(formToInterpret, stringDates) {
    let sourceFormId;
    switch (this.isDocumentOrRow(formToInterpret)) {
      case "row":
        sourceFormId = formToInterpret.key;
        break;
      case "document":
        sourceFormId = formToInterpret.documentID;
        break;
      default:
        console.error(
          "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
          formatedForm
        );
    }

    const data =
      typeof formToInterpret.data === "string"
        ? JSON.parse(formToInterpret.data)
        : formToInterpret.data;
    const result = [];
    const exceptions = data.Exception_Récurrence
      ? data.Exception_Récurrence.split("|").map(
          (date) => new Date(date).toISOString().split("T")[0]
        )
      : [];

    const heureDebut =
      data.Planification_HeureDébut ||
      data.InformationsAdmin_DateHeureDébut.split("T")[1].slice(0, 5);
    const heureFin =
      data.Planification_HeureFin ||
      data.InformationsAdmin_DateHeureFin.split("T")[1].slice(0, 5);

    for (const stringDate of stringDates) {
      const dateavecHeureDebut = stringDate + "T" + heureDebut + ":00";
      const dateavecHeureFin = stringDate + "T" + heureFin + ":00";
      if (!exceptions.includes(stringDate)) {
        const newData = {
          ...data,
          IdentifiantFormulaireRécurrence: sourceFormId,
          Planification_Récurrence: "Une seule fois",
          Planification_Date: stringDate,
          InformationsAdmin_DateHeureDébut: dateavecHeureDebut, // For display on timeline/agenda
          InformationsAdmin_DateHeureFin: dateavecHeureFin, // For display on timeline/agenda
        };
        result.push({
          ...formToInterpret,
          data: JSON.stringify(newData),
          doesExist: false,
          occurrenceDate: stringDate, // To identify the occurrence
          sourceForm: formToInterpret,
        });
      }
    }
    return result;
  },

  /**
   * Interpret documents that can be recurrences in order to get all the occurrences
   * @param {array} documents
   * @param {array} dateWindow
   * @returns
   */
  interpretForms(documents, dateWindow) {
    const formatedDocuments = [];
    // Loop over all documents in order to interpret them
    documents.forEach((document, index) => {
      const data =
        typeof document.data === "string"
          ? JSON.parse(document.data)
          : document.data;

      // Vérification : si les deux sources pour l'heure de début ou pour l'heure de fin sont absentes, on passe au document suivant.
      if (
        (data.Planification_HeureDébut ||
          data.InformationsAdmin_DateHeureDébut) &&
        (data.Planification_HeureFin || data.InformationsAdmin_DateHeureFin)
      ) {
        if (!this.needsInterpretation(data)) {
          console.log(
            "data of document that do not need interpretation:",
            data
          );
          formatedDocuments.push({
            ...document,
            data: JSON.stringify(data),
            doesExist: true,
          });
        } else {
          if (data.Planification_Récurrence === "Par jour spécifique") {
            const occurrenceDates = data.Planification_MultiDate.split("|");
            const validOccurrencesDates = occurrenceDates.filter(
              (date) => dateWindow[0] <= date && date <= dateWindow[1]
            );

            formatedDocuments.push(
              ...this.formatOccurrenceForms(document, validOccurrencesDates)
            );
          } else if (data.Planification_Récurrence === "Par semaine") {
            const occurrenceDates = [];
            const recurrenceStartDate = this.fieldIsEmpty(
              data.Planification_Date
            )
              ? "0001-01-01"
              : data.Planification_Date;
            const recurrenceEndDate = this.fieldIsEmpty(
              data.Planification_DateFin
            )
              ? "9999-01-01"
              : data.Planification_DateFin;
            const occurrencesToGenerateDateWindow = [
              new Date(this.maxDateString(recurrenceStartDate, dateWindow[0])),
              new Date(this.minString(recurrenceEndDate, dateWindow[1])),
            ];
            let currentDate = new Date(occurrencesToGenerateDateWindow[0]); // Copy the date window start
            // Find the dates where an occurrence should be generated
            while (currentDate <= occurrencesToGenerateDateWindow[1]) {
              // Test if the date day match the recurrence days in order to
              // know if we need to create a occurence at this date
              if (
                this.getFrenchWeekDayIndices(
                  data.Planification_Répéter
                ).includes(currentDate.getUTCDay())
              ) {
                occurrenceDates.push(currentDate.toISOString().split("T")[0]);
              }
              // condition to pass to the next day
              currentDate.setDate(currentDate.getDate() + 1);
            }
            formatedDocuments.push(
              ...this.formatOccurrenceForms(document, occurrenceDates)
            );
          } else {
            console.error(
              `${data.Planification_Récurrence} is not known as a recurrence rule` // FIX: template literal
            );
          }
        }
      }
    });

    return {
      documents: formatedDocuments,
    };
  },

  /**
   * Gather documents that can be recurrences and interpret them in order to return the occurences
   * @param {*} filters
   * @param {*} dateWindow
   * @returns
   */
  async getDocuments(filters, dateWindow, api) {
    let apiFilters = filters;
    if (dateWindow !== null) {
      apiFilters = this.formatApiFilter(filters, dateWindow);
    }

    // Step 2 : Get the document with the document/id/filter api
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res.data.ids;

    console.log("documentsID to interpret", res);

    // Step 3 : Get the documents data with the document/id api
    const documentsToInterpret = (
      await api({ local: true }).post("document/id", { ids: ids })
    ).data.documents;

    console.log("document to interpret", documentsToInterpret);

    console.log(
      "datas of documents that needs to be interpreted",
      documentsToInterpret.map((document) => JSON.parse(document.data))
    );

    // Step 4 : Interpret the documents thanks to the dateWindow
    return { data: this.interpretForms(documentsToInterpret, dateWindow) };
    // returns a list of documents.
    // one document = {
    // data,
    // documentID, -> real documentID if doesExist, recurrence documentID if not.
    // ...
    // doesExist : bool
    // }
  },

  /**
   * Takes interpreted forms as input and make sure every form exists in the database.
   * Indeed, if the form doesn't exist in the database, this function creates it.
   * This is a usefull operation to do before any manipulation on forms that need to exist in the database.
   * @param {objects[]} interpretedForms
   * @returns {objects[]} existing forms
   */
  async createFormsIfNeeded(interpretedForms, api) {
    const createInterpretedDocuments = async (interpretedDocuments) => {
      const documentsToCreateWithAPI = interpretedDocuments.map(
        (interpretedDocument) => {
          const parsedData =
            typeof interpretedDocument.data === "string"
              ? JSON.parse(interpretedDocument.data)
              : interpretedDocument.data;
          const dataWithOccurrenceFlag = {
            ...parsedData,
            isOccurence: true,
          };
          return {
            data: JSON.stringify(dataWithOccurrenceFlag),
            status: "Draft", // Set the status to Draft first. Thus it has no incidence until we set the status to the good one.
            active: true,
            template: interpretedDocument.template,
          };
        }
      );
      return await api({ local: true }).post("document/Many", {
        documents: documentsToCreateWithAPI,
      });
    };

    const result = [];

    const interpretedDocumentsToCreate = [];

    const prepareDataRows = [];
    // Step 1: Sort forms into different lists in order to process them differently depending of their category
    for (const formatedForm of interpretedForms) {
      if (formatedForm.doesExist) {
        result.push(formatedForm);
      } else {
        switch (this.isDocumentOrRow(formatedForm)) {
          case "row":
            prepareDataRows.push(formatedForm);
            break;
          case "document":
            interpretedDocumentsToCreate.push(formatedForm);
            break;
          default:
            console.error(
              "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
              formatedForm
            );
        }
      }
    }
    // Step 2 : Special step for prepareData rows only :
    // Gather documents data for prepareData rows because rows don't contain all
    // the documents data but only what is specified in the grid columns.
    if (prepareDataRows.length > 0) {
      const formIdsToGather = prepareDataRows.map(
        (formatedRowToProcess) => formatedRowToProcess.sourceForm.key
      );
      const prepareDataRowsSourceDocuments = (
        await api({ local: true }).post(`document/id`, { ids: formIdsToGather })
      ).data.documents;

      console.log(
        "formatedRowsTopProcessDocuments :",
        prepareDataRowsSourceDocuments
      );

      for (const prepareDataRowSourceDocument of prepareDataRowsSourceDocuments) {
        const prepareDataRow = prepareDataRows.find(
          (formatedRowToProcess) =>
            formatedRowToProcess.key === prepareDataRowSourceDocument.documentID
        );
        console.log("found formatedRowToProcess", prepareDataRow);
        console.log("occurrenceDate", prepareDataRow.occurrenceDate);

        // Interpret a second time the row even if prepareData did it one time in order to get the
        // data of the row interpreted in the recurrence context and not especially in the prepareData
        // context of the viewcontent.
        // Example : prepareData can change the row after the interpretation of the source form as
        // the start and end datetimes, duplicating the row etc...
        const interpretedDocument = this.interpretForms(
          [prepareDataRowSourceDocument],
          [prepareDataRow.occurrenceDate, prepareDataRow.occurrenceDate]
        ).documents[0];
        console.log("interpretedDocument", interpretedDocument);
        interpretedDocumentsToCreate.push(interpretedDocument);
      }
    }

    // Step 3 : Create the occurence forms if needed

    if (interpretedDocumentsToCreate.length > 0) {
      const documentCreationAPIAnswer = await createInterpretedDocuments(
        interpretedDocumentsToCreate
      );

      console.log("createdDocuments", documentCreationAPIAnswer);

      // Step 3.1 : Update the known documents in order to add them to the list of documents
      const createdDocuments = interpretedDocumentsToCreate;
      for (const [
        index,
        createdDocument,
      ] of documentCreationAPIAnswer.data.docs.entries()) {
        createdDocuments[index].documentID = createdDocument.docID;
        createdDocuments[index].number = createdDocument.number;
        createdDocuments[index].doesExist = true;
      }
      result.push(...createdDocuments);

      // Step 3.2 : Update the occurence forms to the good status and the 'Exception' field of
      // the recurrence form
      const documentsToUpdate = [];
      for (const createdDocument of createdDocuments) {
        // Update the recurrence form Exception field in order to interpret
        // them correctly in futur interpretations
        const recurrenceDocumentToUpdateId =
          createdDocument.sourceForm.documentID;
        let recurrenceDocumentToUpdate = documentsToUpdate.find(
          (doc) => doc.documentID === recurrenceDocumentToUpdateId
        );
        if (recurrenceDocumentToUpdate === undefined) {
          console.log("createdDocument", createdDocument);
          const sourceFormData = JSON.parse(createdDocument.sourceForm.data);
          const oldExceptionValue =
            "Exception_Récurrence" in sourceFormData
              ? sourceFormData["Exception_Récurrence"]
              : "";
          console.log("oldExceptionValue", oldExceptionValue);
          recurrenceDocumentToUpdate = {
            data: JSON.stringify({ Exception_Récurrence: oldExceptionValue }), // object of the keys from the Field DB and its new value
            status: createdDocument.sourceForm.status, // key from Status FormLayout
            active: true,
            template: createdDocument.sourceForm.template, // id from DB FormLayout
            documentID: createdDocument.sourceForm.documentID, // FormID from DB Form
          };
          documentsToUpdate.push(recurrenceDocumentToUpdate);
        }
        let recurrenceDocumentToUpdateData = JSON.parse(
          recurrenceDocumentToUpdate.data
        );
        if (
          this.fieldIsEmpty(
            recurrenceDocumentToUpdateData["Exception_Récurrence"]
          )
        ) {
          recurrenceDocumentToUpdateData["Exception_Récurrence"] =
            createdDocument.occurrenceDate;
        } else {
          recurrenceDocumentToUpdateData["Exception_Récurrence"] +=
            "|" + createdDocument.occurrenceDate;
        }
        recurrenceDocumentToUpdate.data = JSON.stringify(
          recurrenceDocumentToUpdateData
        );

        console.log(
          "createdDocument.occurrenceDate :",
          createdDocument.occurrenceDate
        );
        console.log("recurrenceDocumentToUpdate", recurrenceDocumentToUpdate);

        // Update the occurrence form to the good status instead of Draft at the same time in order
        // to make sure that even if this update fails, the users are not impact. Indeed, the created forms will stay
        // at draft status.
        const occurrenceDocumentToUpdate = {
          status: createdDocument.status,
          active: true,
          template: createdDocument.template,
          documentID: createdDocument.documentID,
        };
        documentsToUpdate.push(occurrenceDocumentToUpdate);
      }
      console.log("documentsToUpdate :", documentsToUpdate);

      try {
        const updateResponse = await api({ local: true })
          .put("document/Many", {
            documents: documentsToUpdate,
          })
          .catch((error) =>
            console.error(
              "An error has occured during updating the forms :",
              error
            )
          );
        console.log("updateResponse", updateResponse);
      } catch (error) {
        console.error(
          "An error has occured during updating the forms :",
          error
        );
      }
    }

    return result;
  },
};



// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

const main = async () => {
  console.log("context :", context);
  const clickedFormId = store.pageContentStore?.active[0];
  const interpretedForm = store.pageContentStore.prepareDataRows.find(
    (row) => row.rowID === clickedFormId,
  );

  console.log("clicked on form :", interpretedForm);
  if (!interpretedForm) {
    console.error("Aucune donnée trouvée pour l'ID :", clickedFormId);
    return;
  }

  // Make sure the form exists in order to be able to redirect the user to its web page.
  const existingForm = (
    await recurrence.createFormsIfNeeded([interpretedForm], api)
  )[0];

  console.log("existingForm :", existingForm);
  let url_id;
  switch (recurrence.isDocumentOrRow(existingForm)) {
    case "document":
      url_id = existingForm.documentID;
      break;
    case "row":
      url_id = existingForm.key;
      break;
    default:
      console.error(
        "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
        formatedForm,
      );
  }

  const url = new URL(window.location.href);

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split("/");

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex((seg) => seg.startsWith("mcr."));

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex];
    const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`;
    url.pathname = newPath;

    window.open(url.toString(), "_blank");
  } else {
    const section = segments[1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base sans MCR : /volontaires ou /tableaudebord
    const newPath = `/${section}/${url_id}`;
    url.pathname = newPath;

    window.open(url.toString(), "_blank");
  }
};

main();
"
"console.log("Function 124", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;

  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0];

  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found");
    return;
  }

  window.location.replace(`${origin}/${tenant}/transports`);
};

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

const createForm = async (formData, status, formLayoutId) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: formatDataAPI(formData),
        status: status,
        active: true,
        template: { templateId: formLayoutId },
      },
    });
    console.log("Réponse de l'API :", response);
    return response;
  } catch (error) {
    console.error("Erreur lors de l'appel API :", error);
    throw error;
  }
};

const updateForm = async (formId, formData, formLayoutId, status) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: status,
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId,
    };

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};

const getOccurences = async (formId) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "MISSION",
        type: "TEXT",
      },
      {
        key: "IdentifiantFormulaireRécurrence",
        operator: "EQUALS",
        value: formId,
        type: "TEXT",
      },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;
    return ids;
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

const getMissions = async (ids) => {
  console.log("ids", ids);
  try {
    const res = await api({ local: true }).post("document/id", {
      ids: ids,
    });
    const missions = res?.data.documents;
    console.log("Résultat de la vérification des missions :", missions);
    return missions;
  } catch (error) {
    console.error("Erreur lors de la vérification des missions :", error);
    throw error;
  }
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

const main = async () => {
  const startModificationDate =
    store.pageContentStore.processData[0].edits.APartirDeBatchstep;
  console.log("context", context);

  let createData = docData;
  const updateID = docData.FORMID;

  const formLayoutId = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
  const status = docData.STATUS;

  const d = new Date(startModificationDate);
  d.setDate(d.getDate() - 1);
  const Planification_DateFin = d.toISOString().split("T")[0];
  let updateData = {};
  if (docData.Planification_Récurrence === "Par semaine") {
    createData = {
      ...createData,
      Planification_Date: startModificationDate,
      Exception_Récurrence: "",
      InformationsAdmin_DateHeureDébut:
        startModificationDate +
        "T" +
        docData.InformationsAdmin_DateHeureDébut.split("T")[1],
    };

    // we lose InformationsAdmin_DateHeureFin on update because an ONCHANGE value update is triggered
    // the previous time must be saved in a constant field (InformationsAdmin_LastKnownDateHeureFin)
    // using this field instead ensures we correctly update the current mission and keep the same end time
    updateData = {
      Planification_DateFin: Planification_DateFin,
      InformationsAdmin_DateHeureFin:
        Planification_DateFin +
        "T" +
        docData.InformationsAdmin_LastKnownDateHeureFin.split("T")[1],
    };
  } else if (docData.Planification_Récurrence === "Par jour spécifique") {
    const multiDate = docData.Planification_MultiDate;
    const dateArray = multiDate.split("|");

    const newRecurrenceDates = dateArray.filter(
      (d) => new Date(d) >= new Date(startModificationDate),
    );

    console.log("filteredDates", newRecurrenceDates);

    createData = {
      ...createData,
      Planification_MultiDate: newRecurrenceDates.join("|"),
      Exception_Récurrence: "",
    };

    const otherDates = dateArray.filter((d) => !newRecurrenceDates.includes(d));

    updateData = {
      Planification_MultiDate: otherDates.join("|"),
      Planification_DateFin: Planification_DateFin,
      InformationsAdmin_DateHeureFin:
        Planification_DateFin +
        "T" +
        docData.InformationsAdmin_LastKnownDateHeureFin.split("T")[1],
    };
  }

  console.log("createData", createData);
  console.log("updateData", updateData);

  //modify occurence

  const occurences = await getOccurences(updateID);
  console.log("occurences", occurences);

  const missions = await getMissions(occurences);
  console.log("missions", missions);

  const newMissions = missions.filter((mission) => {
    const data = JSON.parse(mission.data);
    const isAfter = data.Planification_Date >= startModificationDate;

    if (mission.status === "Facturée") {
      createData = {
        ...createData,
        Exception_Récurrence: createData.Exception_Récurrence
          ? createData.Exception_Récurrence + "|" + data.Planification_Date
          : data.Planification_Date,
      };
    }
    return isAfter && mission.status !== "Facturée";
  });

  const updateResponse = await updateForm(
    updateID,
    updateData,
    formLayoutId,
    status,
  );

  const documents = newMissions.map((mission) => ({
    data: mission.data,
    status: "Supprimé(e)",
    active: mission.active,
    template: { templateId: mission.template.templateId },
    documentID: mission.documentID,
  }));

  console.log("updateResponse", updateResponse);
  const createResponse = await createForm(createData, status, formLayoutId);
  console.log("createResponse", createResponse);

  console.log("documents", documents);

  api({ local: true })
    .put("document/Many", {
      documents: documents,
    })
    .then((res6) => {
      console.log("res6", res6);
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour des documents :", error);
    });


  const rawDate =
    docData.Planification_Date || docData.InformationsAdmin_DateHeureDébut;

  let timelineDate = null;

  if (rawDate) {
    const d =
      rawDate.length === 10
        ? new Date(`${rawDate}T00:00:00`)
        : new Date(rawDate);

    if (!isNaN(d)) {
      const offsetMin = d.getTimezoneOffset();
      const sign = offsetMin <= 0 ? "+" : "-";
      const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
      const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");

      timelineDate =
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` +
        `T00:00:00${sign}${hh}:${mm}`;
    }
  }

  // store for next page (timeline restoration)
  sessionStorage.removeItem("TRANSPORTS_TIMELINE_DATE");

  if (timelineDate) {
    sessionStorage.setItem("TRANSPORTS_TIMELINE_DATE", timelineDate);
  }

  // navigateBack();
  redirectToViewGroup();
};

if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  main();
}
"
"console.log('Function 125', context);

const status = docData.STATUS;

return {'STATUS': status}
"
"console.log("Function 126", context);
// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh
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

const main = async () => {
  console.log("context :", context);
  const clickedFormId = store.pageContentStore?.active[0];
  const interpretedForm = store.pageContentStore.prepareDataRows.find(
    (row) => row.rowID === clickedFormId,
  );

  console.log("clicked on form :", interpretedForm);
  if (!interpretedForm) {
    console.error("Aucune donnée trouvée pour l'ID :", clickedFormId);
    return;
  }

  // Make sure the form exists in order to be able to redirect the user to its web page.
  const existingForm = (
    await recurrence.createFormsIfNeeded([interpretedForm], api)
  )[0];

  console.log("existingForm :", existingForm);
  let url_id;
  switch (recurrence.isDocumentOrRow(existingForm)) {
    case "document":
      url_id = existingForm.documentID;
      break;
    case "row":
      url_id = existingForm.key;
      break;
    default:
      console.error(
        "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
        formatedForm,
      );
  }

  const url = new URL(window.location.href);

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split("/");

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex((seg) => seg.startsWith("mcr."));

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex];
    const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`;
    url.pathname = newPath;

    window.location.href = url.toString();
  } else {
    const section = segments[1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base sans MCR : /volontaires ou /tableaudebord
    const newPath = `/${section}/${url_id}`;
    url.pathname = newPath;

    window.location.href = url.toString();
    /*
    const apiFilters = [
      {
        key: "FORMID",
        operator: "EQUALS",
        value: url_id,
        type: "TEXT",
      },
    ];

    const res = await getDocumentIDsByFilters(apiFilters);
    console.log("res :", res);

    if (res.length > 0) {
      const documentIDs = res;
      const documents = await getDocumentsByIDs(documentIDs);
      console.log("documents :", documents);
    }

    const data = JSON.parse(documents[0].data);

    console.log("data :", data);
    console.error("Segment MCR introuvable dans l’URL.");
    */
  }
};

main();
"
"console.log("Function 127", context);

if (
  (docData.Planification_Récurrence === "Par semaine" ||
    docData.Planification_Récurrence === "Par jour spécifique") &&
  docData.STATUS !== "Draft"
) {
  return {
    Planification_Date: "true",
    Planification_DateFin: "true",
    Planification_MultiDate: "true",
    Planification_Récurrence: "true",
    Planification_Répéter: "true",
  };
}
"

"console.log("Function 129", context);

const showCustomPopup = (params) => {
  if (document.getElementById("customPopup")) return;
  const { title, commentHTML, fields, buttons } = params;
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
    } = params2;
    const wrapper = document.createElement("div");
    wrapper.className = "popup-input";
    const fieldTitle = document.createElement("label");
    fieldTitle.innerHTML = required
      ? `${name || key} <span style="color: #FF0000">*</span>`
      : name || key;
    fieldTitle.htmlFor = key;
    switch (type.toLocaleLowerCase()) {
      case "select":
        let select = document.createElement("select");
        select.name = key;
        if (style2) select.style = style2;
        select.id = key;
        (options || []).forEach(({ value, label: label2 }) => {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label2;
          select.appendChild(opt);
        });
        wrapper.append(fieldTitle, select);
        break;
      case "checkbox":
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = key;
        if (style2) checkbox.style = style2;
        checkbox.id = key;
        wrapper.classList.add("popup-input-row");
        wrapper.append(checkbox, fieldTitle);
        break;
      case "number":
        let numberInput = document.createElement("input");
        numberInput.type = "number";
        numberInput.name = key;
        if (style2) numberInput.style = style2;
        if (defaultValue !== void 0) numberInput.value = defaultValue;
        if (min !== void 0) numberInput.min = min;
        if (max !== void 0) numberInput.max = max;
        if (required) numberInput.required = true;
        numberInput.step = "1";
        numberInput.id = key;
        numberInput.addEventListener("input", () => {
          let cleaned = numberInput.value.replace(/[^\d]/g, "");
          if (cleaned === "") {
            numberInput.value = "";
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
          numberInput.value = value.toString();
        });
        wrapper.append(fieldTitle, numberInput);
        break;
      case "label":
        const label = document.createElement("span");
        label.innerHTML = name || "";
        if (style2) label.style = style2;
        wrapper.appendChild(label);
        break;
      case "date":
        let dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.name = key;
        if (style2) dateInput.style = style2;
        if (defaultValue) dateInput.value = defaultValue;
        if (required) dateInput.required = true;
        dateInput.id = key;
        wrapper.append(fieldTitle, dateInput);
        break;
      case "time":
        let timeInput = document.createElement("input");
        timeInput.type = "time";
        timeInput.name = key;
        if (style2) timeInput.style = style2;
        if (defaultValue) timeInput.value = defaultValue;
        if (required) timeInput.required = true;
        timeInput.id = key;
        wrapper.append(fieldTitle, timeInput);
        break;
      default:
        let input = document.createElement("input");
        input.type = type.toLowerCase();
        input.name = key;
        if (style2) input.style = style2;
        input.id = key;
        wrapper.append(fieldTitle, input);
        break;
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
        const values = {};
        const elements = popup.querySelectorAll("input, select");
        for (const el of elements) {
          values[el.name] = el.type === "checkbox" ? el.checked : el.value;
        }
        button.onClick(values);
        document.body.removeChild(overlay);
      };
      buttonRow.appendChild(btn);
    }
  }
  popup.appendChild(buttonRow);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

function toggleLoadingPopup(show, success, errorMessage, loadingMessage) {
  let loadingPopup = document.getElementById("loadingPopup");
  let errorBanner = document.getElementById("errorBanner");

  if (show) {
    if (!loadingPopup) {
      // Création du popup de chargement s'il n'existe pas
      loadingPopup = document.createElement("div");
      loadingPopup.id = "loadingPopup";
      loadingPopup.style = `
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
            `;
      document.body.appendChild(loadingPopup);

      // Ajout du CSS pour l'animation du spinner
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
    }
    // Mise à jour ou création du contenu du popup de chargement
    loadingPopup.innerHTML = `
          <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
            <div>${loadingMessage}</div>
            <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
          </div>
        `;
    loadingPopup.style.display = "flex";
    if (errorBanner) errorBanner.style.display = "none";
  } else {
    if (loadingPopup) loadingPopup.style.display = "none";
    if (success === false && errorMessage) {
      if (!errorBanner) {
        // Création du banner d'erreur s'il n'existe pas
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
      // Mise à jour ou création du contenu du banner d'erreur
      errorBanner.innerHTML = `
            <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
            <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
          `;
      errorBanner.style.display = "flex";
      // Initialisation ou réinitialisation de la barre de progression
      let progressElement = document.getElementById("errorBannerProgress");
      let width = 0;
      let interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          errorBanner.style.display = "none";
        } else {
          width++;
          progressElement.style.width = width + "%";
        }
      }, 55); // La barre progresse sur 5 secondes
    }
  }
}

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

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

const updateForm = async (formId, formData, formLayoutId, status) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: status,
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId,
      preventNotify: undefined,
    };

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};

const mainSaveFormOnly = async () => {
  const collection = docData?.["CC_Destinations"];
  const heureDebut = docData?.CC_Récupération;
  const heureFin = docData?.CC_Arrivée
    ? docData?.CC_Arrivée
    : collection[collection.length - 1]?.[`CC_Destinations|600|Fin de RDV`];

  // Convertit "HH:MM" en minutes depuis minuit (null si invalide)
  const toMinutes = (hhmm) => {
    if (typeof hhmm !== "string") return null;
    const match = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
  };

  const debutMin = toMinutes(heureDebut);
  const finMin = toMinutes(heureFin);
  console.log("DEBUT MIN, FIN MIN", debutMin, finMin);
  if (debutMin !== null && finMin !== null && finMin < debutMin) {
    toggleLoadingPopup(
      false,
      false,
      "Erreur : L'heure de fin est antérieure à l'heure de début.",
    );
    return;
  }
  const updateID = docData.FORMID;
  const formLayoutId = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
  const status = docData.STATUS;

  if (new Date(docData.InformationsAdmin_DateHeureDébut) < new Date()) {
    const popup = await new Promise((resolve) => {
      showCustomPopup({
        title: "Attention!",
        commentHTML: `La date de la mission est dans le passé. Voulez-vous continuer l'enregistrement?`,
        buttons: [
          {
            key: "cancel",
            name: "Annuler",
            preset: "cancel",
            onClick: () => resolve(false),
          },
          {
            key: "ok",
            name: "Confirmer",
            preset: "action",
            onClick: (values) => resolve(values),
          },
        ],
      });
    });
    console.log(popup);
    if (!popup) return;
  }

  const updateResponse = await updateForm(
    updateID,
    docData,
    formLayoutId,
    status,
  );

  console.log("Mise à jour réussie du formulaire principal :", updateResponse);

  //navigateBack();

  const rawDate =
    docData.Planification_Date || docData.InformationsAdmin_DateHeureDébut;

  let timelineDate = null;

  if (rawDate) {
    const d =
      rawDate.length === 10
        ? new Date(`${rawDate}T00:00:00`)
        : new Date(rawDate);

    if (!isNaN(d)) {
      const offsetMin = d.getTimezoneOffset();
      const sign = offsetMin <= 0 ? "+" : "-";
      const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
      const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");

      timelineDate =
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` +
        `T00:00:00${sign}${hh}:${mm}`;
    }
  }

  sessionStorage.removeItem("TRANSPORTS_TIMELINE_DATE");

  // If the timeline has already been loaded, it already has a date and must be changed through the local storage to trigger the update of the timeline
  // If not, the date can be set directly in the session storage
  // This is due to the fact that the timeline date is set in the local storage on the first load of the timeline, and then updated through the local storage on subsequent loads
  // The sessionStorage is used to store the date to redirect to, and the localStorage is used to store the date currently displayed in the timeline
  if (timelineDate) {
    sessionStorage.setItem("TRANSPORTS_TIMELINE_DATE_REDIRECT", timelineDate);
    sessionStorage.setItem("TRANSPORTS_TIMELINE_DATE", timelineDate);

    const timelineDay = timelineDate.split("T")[0];

    const tables = JSON.parse(localStorage.getItem("tables") || "{}");

    if (!tables.TimeLineChauffeur) {
      tables.TimeLineChauffeur = {};
    }

    if (!tables.TimeLineChauffeur.mask) {
      tables.TimeLineChauffeur.mask = {};
    }

    if (!tables.TimeLineChauffeur.mask.TIMELINE) {
      tables.TimeLineChauffeur.mask.TIMELINE = {};
    }

    tables.TimeLineChauffeur.mask.TIMELINE.date = `${timelineDay}|${timelineDay}`;

    tables.TimeLineChauffeur.mask.TIMELINE.type = "DAY";

    localStorage.setItem("tables", JSON.stringify(tables));
  }

  console.log(sessionStorage.getItem("TRANSPORTS_TIMELINE_DATE_REDIRECT"));
  console.log(sessionStorage.getItem("TRANSPORTS_TIMELINE_DATE"));

  const { origin, pathname } = window.location;
  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0];

  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found in URL");
    return;
  }

  const targetUrl = `${origin}/${tenant}/transports`;
  window.location.href = targetUrl;

  // redirectToViewGroup();
};

if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  mainSaveFormOnly();
}
"
"console.log("Function 130", context);

// -------------------- SETUP --------------------
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
};

const noDeleteStatus = ["Draft", "Supprimé(e)"];

const { STATUS } = docData;
const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];

// -------------------- ROLES --------------------
const roles = store.moduleStore.user.roles;

const isDev = roles.includes("1. DEVELOPPEUR");

const isPrivileged =
  isDev ||
  roles.includes("1. RESPONSABLE D'ACTIVITÉ") ||
  roles.includes("1. COORDINATEUR") ||
  roles.includes("1. ADMIN") ||
  roles.includes("1. CHARGÉ DE LA FACTURATION") ||
  roles.includes("1. DISPATCHEUR");

// -------------------- BASE RESULT --------------------
const baseResult = {
  BatchSauvegarder: null,
  BatchMissionOccurence: null,
  Section_Mission_enCoursFactu: null,
  BatchMission: null,
  RaisonAnnulationOuRefus: null,
  BatchAccepterMission: null,
  BatchMissionRecurrence: null,
  MarkdownRécurrenceDispo: null,
};

// -------------------- HELPERS --------------------
const isAcceptedOrRefused = STATUS === "Acceptée" || STATUS === "Refusée";

const isRecurrent =
  docData.Planification_Récurrence === "Par semaine" ||
  docData.Planification_Récurrence === "Par jour spécifique";

const isSourceRecurrence =
  docData?.isOccurence !== "true" &&
  docData?.Planification_Récurrence !== "Une seule fois";

const reccurence = docData.Planification_Récurrence;
const hasRecurrence =
  docData.IdentifiantFormulaireRécurrence ||
  (reccurence && reccurence !== "Une seule fois");

console.log("isSourceRecurrence", isSourceRecurrence);

// -------------------- SWITCH --------------------
switch (FORMLAYOUTNAME) {
  case "Mission": {
    if (!mcrDictionary[AREA]) break;

    let result = { ...baseResult };

    // -------------------- STATUS --------------------
    if (STATUS === "Annulée") {
      result.BatchAccepterMission = true;
      result.RaisonAnnulationOuRefus = true;
    } else if (["À facturer", "Facturée"].includes(STATUS)) {
      result.BatchMissionOccurence = isSourceRecurrence ? null : true;
      result.BatchMissionRecurrence = isSourceRecurrence ? true : null;
    } else if (STATUS === "Facturation en cours") {
      result.BatchMissionOccurence = isSourceRecurrence ? null : true;
      result.BatchMissionRecurrence = isSourceRecurrence ? true : null;
    } else if (STATUS === "Acceptée") {
      result.BatchMissionRecurrence = isSourceRecurrence ? true : null;
    } else if (STATUS === "Draft") {
      result.BatchSauvegarder = true;
    } else if (STATUS === "Refusée") {
      return {
        ...result,
        RaisonAnnulationOuRefus: true,
      };
    }

    // -------------------- PRIVILEGED --------------------
    if (isPrivileged && isAcceptedOrRefused && !isSourceRecurrence) {
      result.BatchMission = isRecurrent ? true : null;
      result.BatchMissionOccurence = isRecurrent ? null : true;
    }

    // -------------------- RÉCURRENCE --------------------
    if (hasRecurrence) {
      result.MarkdownRécurrenceDispo = true;
    }

    // -------------------- NON PRIVILEGED --------------------
    if (!isPrivileged) {
      return baseResult;
    }

    return result;
  }

  case "Véhicule":
    if (mcrDictionary[AREA]) {
      return {
        BatchVolontaire: null,
        Vehicule_Information_Dev: isDev ? true : null,
      };
    }
    break;

  case "Volontaire":
    if (mcrDictionary[AREA] && noDeleteStatus.includes(STATUS)) {
      return {
        BatchVolontaire: null,
      };
    }
    break;

  case "Disponibilité":
    return mcrDictionary[AREA] && STATUS === "Draft"
      ? {
          BatchDisponibilité: null,
          Enregistrer_Disponibilite: true,
        }
      : {
          Enregistrer_Disponibilite: null,
        };

  default:
    break;
}
"
"console.log("Function 131", context);

// TODO : À nettoyer -> Cette fonction créer toujours un formulaire au statut
// "Refusée", pas besoin de différencier le cas où le formulaire est draft ou non.

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const formLayoutId_Mission = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
// reason of refusal and date of refusal
const reasonOfAnnulation =
  store.pageContentStore.processData[0].edits.RaisonAnnulationAffichage;
const askedBy =
  store.pageContentStore.processData[0].edits.AnnulationDemandéPar;
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

const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    // prepares data to update
    const document = {
      // converts data in json
      data: formatDataAPI(formData),
      // set the status
      status: "Annulée",
      // set to active
      active: true,
      // id of template
      template: { templateId: formLayoutId },
      // id of existing form to update
      documentID: formId,
    };

    // put API to update form
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};
const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};
// main
const main = async () => {
  const newDocData = {
    ...docData,
    RaisonAnnulation: reasonOfAnnulation,
    AnnulationDemandéPar: askedBy,
  };
  try {
    console.log("Mise à jour du formulaire mission existant.");
    await updateMissionForm(
      newDocData.FORMID,
      newDocData,
      formLayoutId_Mission,
    );
    navigateBack();
    //redirectToViewGroup()
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    throw error;
  }
};

main();
"
"console.log('Function 132', context);
const { FORMID } = docData;
const formLayoutID = "7c6d6132-ca2b-411c-86e9-baaaa130faa3";

// sync functions

/**
   * Get the viewGroup Url
   * This can be usefull in order to redirect the users
   * @returns
   */
const viewGroupUrl = () => {
    // Step 1: Get the current Url
    const currentUrl = window.location.href
    // Step 2 : Remove the unecessary segments
    const parts = currentUrl.split('/')
    for (let i = 0; i < 3; i++) {
        const lastpart = parts[parts.length - 1]
        if (isUUID(lastpart) || lastpart === 'new') {
            parts.pop()
        }
    }
    const viewGroupUrl = parts.join('/')
    return viewGroupUrl
}
  
/**
* Redirect the user to the last viewgroup
*/
const redirectToViewGroup = () => {
    window.location.href = viewGroupUrl()
}

const DataCollection = (key, array) => {
    let result = {}
    let itemCount = array?.length
    array.forEach((obj, index) => {
        Object.keys(obj).forEach(key => {
            let newKey = `${key}|${index + 1}`
            result[newKey] = obj[key]
        })
    })
    result[key] = itemCount.toString()
    return result
}
  
const excludeKeys = (obj, keys) =>
    Object.keys(obj).reduce((result, key) => {
        if (!keys.includes(key)) {
            result[key] = obj[key]
        }
        return result
}, {})
  
const formatDataAPI = data => {
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data = { ...data, ...DataCollection(key, data[key]) }
        }
    })
    return JSON.stringify(excludeKeys(data, ['FORMID', 'NUMBER']))
}

// main
const main = async () => {
    const newStatus = "Supprimé(e)";

    const document = {
        data: formatDataAPI(docData),
        status: newStatus,
        active: true, // inchangé
        template: { templateId: formLayoutID },
        documentID: FORMID,
    };

    console.log("document", document);

    await api({ local: true })
        .put("document", {
            document,
        })
        .then((res) => {
            console.log("res", res);
        })
        .catch((error) => {
            console.error("Erreur lors de la suppression du volontaire :", error)
        })
};

main();"
"console.log('Function 133', context);

return docData.STATUS === 'Archivé' || docData.STATUS === 'Enregistré'
  ? { MotifArchivage: true }
  : { MotifArchivage: null }
"
"console.log("Function 134", context);

/**
 * Check if the fieldValue obtained thanks to data[fieldKey]
 * represent an empty field.
 * @param {string} fieldValue
 * @returns {bool}
 */
const fieldIsEmpty = (fieldValue) => {
  return [undefined, ""].includes(fieldValue);
};

// ONLOADMASTER SHOW FIELD
const dictionary = {
  "0e44171d-1616-4a50-9b36-aff4d998c4a5": "Mission",
  "81e43068-2f10-426b-b78b-dfd855136bd5": "Facture",
  "56f6c94d-6706-4630-a0a6-3588cd954e06": "Véhicule",
  "7c6d6132-ca2b-411c-86e9-baaaa130faa3": "Volontaire",
  "43eb719b-4a1c-44ac-9cf3-276cbc089fad": "Tarif",
  "cd81267c-4a6b-451b-846f-22999f0be1f5": "Disponibilité",
  "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Bénéficiaire",
  "40307eab-5d1b-4ae2-adae-bcd79c11fcd5": "Profil MCR",
};

const noDeleteStatus = ["Draft", "Supprimé(e)"];

const { STATUS } = docData;
const FORMLAYOUTNAME = dictionary[docData.FORMLAYOUTID] || "";
const AREA = window.location.pathname.split("/")[1];
const isDev = store.moduleStore.user.roles.includes("1. DEVELOPPEUR");

const result = {};

switch (FORMLAYOUTNAME) {
  case "Mission":
    if (mcrDictionary[AREA] && !isDev) {
      Object.assign(result, {
        "AdressePreférées|500|Rue": null,
        "AdressePreférées|510|Numéro": null,
        "AdressePreférées|520|Code_postal": null,
        "AdressePreférées|530|Ville": null,
        "AdressePreférées|540|Pays": null,
        "AdressePreférées|800|Latitude": null,
        "AdressePreférées|810|Longitude": null,
      });
      switch (docData.STATUS) {
        case "Annulée":
          Object.assign(result, {
            RaisonAnnulation: true,
            RaisonRefus: null,
          });
          break;
        case "Refusée":
          Object.assign(result, {
            RaisonAnnulation: null,
            RaisonRefus: true,
          });
          break;
      }
      // Hide Récurrence Field when the form is an occurrence
      if (
        docData.Planification_Récurrence === "Une seule fois" &&
        !fieldIsEmpty(docData.IdentifiantFormulaireRécurrence)
      ) {
        Object.assign(result, {
          Planification_Récurrence: null,
        });
      } else {
        Object.assign(result, {
          Planification_Récurrence: true,
        });
      }
    }
    break;
  case "Facture":
    break;
  case "Véhicule":
    break;
  case "Volontaire":
    break;
  case "Tarif":
    break;
  case "Disponibilité":
    // Hide Récurrence Field when the form is an occurrence
    if (
      docData.Planification_Récurrence === "Une seule fois" &&
      !fieldIsEmpty(docData.IdentifiantFormulaireRécurrence)
    ) {
      Object.assign(result, {
        Planification_Récurrence: null,
      });
    } else {
      Object.assign(result, {
        Planification_Récurrence: true,
      });
    }
    break;
  case "Bénéficiaire":
    if (mcrDictionary[AREA] && !isDev) {
      Object.assign(result, {
        "AdressePreférées|500|Rue": null,
        "AdressePreférées|510|Numéro": null,
        "AdressePreférées|520|Code_postal": null,
        "AdressePreférées|530|Ville": null,
        "AdressePreférées|540|Pays": null,
        "AdressePreférées|800|Latitude": null,
        "AdressePreférées|810|Longitude": null, // hide
      });
    }
    break;
  case "Profil MCR":
    break;
  default:
    break;
}

return result;
"
"console.log('Function 135', context);
const { CoorFactu_Qualité, FORMLAYOUTID } = docData;
const isBeneficiaire = CoorFactu_Qualité === "Bénéficiaire";
const prenomByForm = {
    "0e44171d-1616-4a50-9b36-aff4d998c4a5": "PrénomSelected",
    "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Prénom",
    "81e43068-2f10-426b-b78b-dfd855136bd5": "PrénomSelected",
}
const nomByForm = {
    "0e44171d-1616-4a50-9b36-aff4d998c4a5": "NomFormMission",
    "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Nom",
    "81e43068-2f10-426b-b78b-dfd855136bd5": "Nom",
};

const fields = isBeneficiaire ? 
    {
        CoorFactu_Prénom: docData[prenomByForm[FORMLAYOUTID]] || '',
        CoorFactu_Nom: docData[nomByForm[FORMLAYOUTID]] || '',
    } 
    : {};

return fields;"
"console.log('Function 136', context);
const { CoorFactu_Qualité, PrénomSelected, Nom } = docData;

return CoorFactu_Qualité === 'Bénéficiaire' ?
    {
        CoorFactu_Prénom: PrénomSelected || '',
        CoorFactu_Nom: Nom || '',
    } : {};"
"console.log("Function137", context);
return (docData.FORMLAYOUTID === "0e44171d-1616-4a50-9b36-aff4d998c4a5" ||
  docData.FORMLAYOUTID === "3da52cab-039f-4a19-93ce-c904fe1e2ef0" ||
  docData.FORMLAYOUTID === "81e43068-2f10-426b-b78b-dfd855136bd5") &&
  docData.AllocataireSocial === "true"
  ? { dateValiditeAttestationMututelle: true }
  : { dateValiditeAttestationMututelle: null };
"
"console.log("Function 138", context);
const reasonOfRefusal =
  store.pageContentStore.processData[0].edits.Facture_MotifAnnulation;

// SET TO FALSE ON PROD
const isTestEnvironment = true;

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = async () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// function to show the popup loading while waiting for api
const showPopupLoadingWaiting = () => {
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
                  <div>Annulation en cours</div>
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

const showPopUpError = (message) => {
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
                  <div>${message}</div>
                   <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
                </div>
              `,
  );
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

// function to get the related missions Infos
const getMissionInfo = async () => {
  const apiFiltersMission = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Mission",
      type: "TEXT",
    },
    {
      key: "IdentifiantFacture",
      operator: "EQUALS",
      value: docData.FORMID,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "NOTIN",
      value: "Supprimé(e)|Refusée|Annulée|Draft",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];

  // get the id of the form
  const res1 = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersMission,
  });
  const idsMission = res1.data.ids;

  // get the infos
  const res2 = await api({ local: true }).post("document/id", {
    ids: idsMission,
  });
  //parse the info
  const missionList = res2.data.documents.map((mission) => ({
    ...JSON.parse(mission.data),
    id: mission.documentID,
    number: mission.number,
  }));
  console.log("missionList", missionList);
  return missionList;
};

// cancel the bill and missions reset to À facturer
const annulerFactureEtMissions = async (missionList) => {
  try {
    const documentsToUpdate = [];
    // for the missions
    missionList.forEach((mission) => {
      documentsToUpdate.push({
        data: formatDataAPI({ IdentifiantFacture: "" }),
        status: "À facturer",
        active: true,
        template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" },
        documentID: mission.id,
      });
    });
    // for the bill
    documentsToUpdate.push({
      data: formatDataAPI({}),
      status: "Annulée",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: docData.FORMID,
    });
    const response = await api({ local: true }).put("document/Many", {
      documents: documentsToUpdate,
      preventNotify: "FULL",
    });
  } catch (error) {
    console.warn(
      "Erreur lors de l`annulation de la facture et du repassage des missions ",
      error,
    );
  }
};

let noteCreditNumbers = [];
// function that gets every facture numbers for current month + 1
const getNumberNoteCredit = async (mois, annee, Maison) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "FACTURE",
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "NOTIN",
        value: "Brouillon|Draft|Supprimé(e)",
        type: "TEXT",
      },
      {
        key: "NumeroNoteDeCredit",
        operator: "CONTAINS",
        value: `${annee}-${mois.toString().padStart(2, "0")}`,
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: Maison,
        type: "TEXT",
      },
    ];
    // get the ids of the invoices
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const idsFacture = res?.data?.ids;
    // if there is already facture ids
    if (idsFacture.length) {
      // get the facture informations
      const res2 = await api({ local: true }).post("document/id", {
        ids: idsFacture,
      });
      //parse the info
      const factureListNumber = res2.data.documents.map((documentDispo) =>
        JSON.parse(documentDispo.data),
      );
      console.log("FACTURE LIST NUMBER ", factureListNumber);
      // push the numéroFacture in the list to compare later
      factureListNumber.forEach((numero) => {
        noteCreditNumbers.push(numero.NumeroNoteDeCredit);
      });
      console.log("FACTURE LIST", noteCreditNumbers);
      // call the function that returns the new facture number
      return getNewFactureNumber(noteCreditNumbers, mois, annee);
    }
    // else there is no facture for this current month + 1 create new number
    else {
      let factureNo = `NC-${annee}-${mois.toString().padStart(2, "0")}-001`;
      if (isTestEnvironment) {
        factureNo += "_TEST";
      }
      return factureNo;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

// function that compares and gets the biggest number to add +1 to it
const getNewFactureNumber = (factureNumbers, mois, annee) => {
  // parse through the list and get rid of _TEST
  const allNumbers = factureNumbers.map((nombre) => {
    const cleaned = nombre.replace("_TEST", "").replace("NC-", "");
    const parts = cleaned.split("-");
    return parseInt(parts[2], 10);
  });
  console.log("ALL NUMBERS", allNumbers);
  // Trouver la plus grande valeur dans le tableau
  const maxValue = Math.max(...allNumbers);
  const nextNumber = maxValue + 1;

  let formattedNumber = "";
  if (nextNumber < 100) {
    formattedNumber = nextNumber.toString().padStart(3, "0");
  } else {
    formattedNumber = nextNumber.toString(); // 100 et plus
  }
  let result = `NC-${annee}-${mois
    .toString()
    .padStart(2, "0")}-${formattedNumber}`;
  if (isTestEnvironment) {
    result += "_TEST";
  }
  return result;
};

// updates the facture unique number
const updateFactureUniqueNumber = async (numéroNoteCredit) => {
  try {
    const datacloned = { ...docData };
    datacloned.NumeroNoteDeCredit = numéroNoteCredit;
    // for the facture doc
    const document = {
      data: formatDataAPI(datacloned),
      status: "Annulée",
      active: true,
      template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
      documentID: docData.FORMID,
    };
    // put/many for multiple updates (on facture and missions)
    const res = await api({ local: true }).put("document", {
      document,
      preventNotify: "FULL",
    });
    return res;
  } catch (error) {
    console.log("Erreur lors de la mise à jour du numéro séquentiel :", error);
  }
};

// step that verifies if the number is present
const verifyUniqueNumberFacture = async (numéroNoteCredit) => {
  const apiFiltersVerify = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "FACTURE",
      type: "TEXT",
    },
    {
      key: "NumeroNoteDeCredit",
      operator: "EQUALS",
      value: numéroNoteCredit,
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];

  const res = await api({ local: true }).post("document/id/filter", {
    filters: apiFiltersVerify,
  });
  const ids = res?.data?.ids;
  console.log("Résultat de la vérification du bénéficiaire :", ids);
  return ids; // Retourne le nombre d'éléments
};

// constant to injectMissionSupp
const injecterMissionSupplémentaire = (
  description,
  missionLabel = "Mission(s) supplémentaire(s)",
) => {
  const lignes = description.split("\n");
  const indexDepart = lignes.findIndex((line) =>
    line.trim().startsWith("Lieu de départ"),
  );
  if (indexDepart !== -1) {
    lignes.splice(indexDepart, 0, missionLabel);
  } else {
    lignes.push(missionLabel); // fallback si "Lieu de départ" non trouvé
  }
  return lignes.join("\n");
};

// function that gets the correct area and returns it
const getArea = () => {
  const AREA = window.location.pathname.split("/")[1];
  let mcr = mcrDictionary[AREA];
  return mcr;
};
const resultMcr = getArea();

const getProfil = async () => {
  try {
    const apiFilters2 = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Profil MCR",
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: resultMcr,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    console.log("API FILTER", apiFilters2);
    const responseID = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters2,
    });
    const ids = responseID?.data?.ids;

    const responseInfos = await api({ local: true }).post("document/id", {
      ids,
    });

    console.log("------responseInfos", responseInfos);

    const parsedData = responseInfos.data.documents.map((info) => ({
      ...JSON.parse(info.data),
      FORMID: info.metaData["FORMID"],
    }));

    return parsedData?.[0] || [];
  } catch (error) {
    console.log("Erreur", error);
    hidePopupLoading();
  }
};

// function to generate the PDF
const createPDF = async (
  missionList,
  noFactureAnnulée,
  numéroNoteCredit,
  profilInfo,
) => {
  // necessary constant for mission Info
  const now = new Date();
  const factureTodayDate =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  const tableDataMission = [
    {
      headers: [
        "Date (Numéro de mission)",
        "Description",
        "Quantité",
        "Prix unitaire",
        "Remise",
        "Prix Final",
      ],
      rows: [],
    },
  ];
  const groupedRows = [];
  const result = [];
  // necessary lists for the tableDataMission
  const missionDateStorage = [];
  let missionDate = [];
  let missionDescription = [];
  let missionQuantite = [];
  let missionPrixUni = [];
  let missionRemise = [];
  let missionFinalPrice = [];
  let listeDestination = [];
  let missionPrixUniFinal = [];
  /**
   * INFO ABOUT CLIENT ADDRESS AND NAME
   */
  const {
    CoorFactu_Rue,
    CoorFactu_Numéro,
    CoorFactu_Ville,
    CoorFactu_Pays,
    CoorFactu_Prénom,
    CoorFactu_Nom,
    "CoorFactu_Code postal": CoorFactu_CodePostal,
    Maison,
    MontantInitial,
    CalculPrix_Remise,
    MontantDû,
    PrénomSelected,
    Nom,
    CommentaireFacture,
  } = docData;
  const clientAddress = `${CoorFactu_Rue} ${CoorFactu_Numéro}`;
  const clientAdressPt2 = `${CoorFactu_CodePostal} ${CoorFactu_Ville} ${CoorFactu_Pays}`;
  const clientName = `${CoorFactu_Prénom} ${CoorFactu_Nom.toUpperCase()}`;
  const beneName = `${PrénomSelected} ${Nom}`;
  /* here we treat the mcr informations */
  // necessary info for mcr
  let mcrStreet;
  let mcrName;
  let mcrIban;
  let mcrForm;
  let mcrPhone;
  let mcrTVA;
  let mcrTown;
  let mcrOffName;

  /*******  INFO FOR HOUSES *******/
  mcrStreet = profilInfo?.AdresseMCR || "";
  mcrPhone = profilInfo?.TelephoneMCR || "";
  mcrIban = profilInfo?.IBANMCR || "";
  mcrTVA = profilInfo?.TVAMCR || "";
  mcrOffName = profilInfo?.NomMCR || "";
  // if house is arlon
  if (Maison === "MCR Arlon") {
    mcrName = "Maison Croix-Rouge Arlon";
    mcrTown = "ARLON";
  }
  // if house is Aubange-Messancy
  if (Maison === "MCR Aubange-Messancy") {
    mcrName = "Maison Croix-Rouge Aubange-Messancy";
    mcrTown = "AUBANGE-MESSANCY";
  }
  if (Maison === "MCR Sud Gaume") {
    mcrName = "MCR 588 VSL Sud Gaume";
    mcrTown = "SUD GAUME";
  }
  if (Maison === "MCR Rulles-Semois") {
    mcrName = "Maison Croix-Rouge Rulles-et-Semois";
    mcrTown = "RULLES-ET-SEMOIS";
  }
  if (Maison === "MCR Docteur Lagneau") {
    mcrName = "Maison Croix-Rouge Dr Lagneau Bouillon Paliseul";
    mcrTown = "Bouillon Paliseul";
  }

  if (Maison === "MCR Marche") {
    mcrName = "Maison Croix-Rouge Marche";
    mcrTown = "Marche";
  }

  if (Maison === "MCR Gembloux") {
    mcrName = "Maison Croix-Rouge Gembloux";
    mcrTown = "Gembloux";
  }

  if (Maison === "MCR Namur") {
    mcrName = "Maison Croix-Rouge Namur";
    mcrTown = "Namur";
  }
  
  if (Maison === "MCR Florenville") {
    mcrName = "Maison Croix-Rouge Florenville-Chiny";
    mcrTown = "Florenville";
  }

  if (Maison === "MCR Rochefort") {
    mcrName = "Maison Croix-Rouge Rochefort";
    mcrTown = "Rochefort";
  }

  // add other maison conditions ...

  // tri to put them in order (old to new)
  missionList.sort((a, b) => {
    const dateA = new Date(a.Planification_Date);
    const dateB = new Date(b.Planification_Date);
    return dateA - dateB; // ordre croissant (plus vieux en premier)
  });
  /* LOOP AND REDECLARE CONSTANTS FOR EACH MISSION */
  missionList.forEach((mission) => {
    const {
      Planification_Date,
      CalculPrix_CalculKilomètrage,
      DistanceGarageGarage,
      DistanceDepartDestination,
      CalculPrixBis_PrixInitial,
      CalculPrix_Remise,
      CalculPrix_Prix,
      CC_AdresseDépart,
      CC_Destinations,
      CalculPrixBis_TarifAppliqué,
      CalculPrix_PrixParKmEuro,
      CalculPrix_PrixForfaitPriseEnChargeEuro,
      CC_Retour,
      number,
      MontantKmSupp,
      NbKMSupp,
      CalculPrix_NbKMCouvertForfaitPriseEnCharge,
    } = mission;
    const montantKMSUPP = Number(MontantKmSupp);
    const nbKMSUPP = Number(NbKMSupp);
    missionPrixUniFinal.push(Number(CalculPrix_Prix));
    // re initialize lists
    missionDate = [];
    missionQuantite = [];
    missionPrixUni = [];
    missionRemise = [];
    missionFinalPrice = [];
    missionDescription = [];
    listeDestination = [];

    // re format the missions dates and add the mission number
    let missionNumber = number;
    let missionParts = Planification_Date.split("-");
    let missionDateFormatted = `${missionParts[2]}/${missionParts[1]}/${missionParts[0]}`;
    // get the date of mission and push it
    missionDate.push(`${missionDateFormatted} (${missionNumber})`);
    // and we store it to use it as verification for emission date
    missionDateStorage.push(Planification_Date);

    const missionDestinationsLength = CC_Destinations || 0;
    for (let i = 1; i <= missionDestinationsLength; i++) {
      const address = mission[`CC_Destinations|100|Adresse|${i}`];
      listeDestination.push(address);
    }
    const destinations = listeDestination.join("\n");
    /* here we get right description details*/
    const forfait = CalculPrixBis_TarifAppliqué;
    const trajetInfo = CC_Retour ? "Aller-Retour" : "Aller";

    /***************** HERE IS WHERE WE PUSH INFO IN LISTS DEPENDING ON CASES *******************/
    /*** if km is garage to garage *******/
    if (
      CalculPrix_CalculKilomètrage === "Du garage au garage" &&
      CalculPrix_CalculKilomètrage
    ) {
      // if there is a km supplémentaires and forfait
      if (montantKMSUPP && nbKMSUPP) {
        const km = DistanceGarageGarage;
        // push info in the lists (Description, quantitie, Prix unitaire, final price)
        missionDescription.push(
          `${trajetInfo}, ${forfait}\nKM parcourus: \nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait) \nKm supplémentaire au-delà du forfait\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
        );
        missionQuantite.push(`\n${km}\n1\n${nbKMSUPP}`);
        missionPrixUni.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${CalculPrix_PrixParKmEuro}`,
        );
        missionFinalPrice.push(
          `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}\n-${montantKMSUPP}`,
        );
      }
      // else proceed as usual
      else {
        const km = DistanceGarageGarage;
        // if there is a forfait
        if (CalculPrix_PrixForfaitPriseEnChargeEuro) {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait)\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}\n1`);
          missionPrixUni.push(`\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`);
          missionFinalPrice.push(
            `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}`,
          );
        }
        // else no forfait
        else {
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}`);
          missionPrixUni.push(`\n${CalculPrix_PrixParKmEuro}`);
          missionFinalPrice.push(`\n-${CalculPrixBis_PrixInitial}`);
        }
      }
      /*** else if km is départ to destination*******/
    } else if (
      CalculPrix_CalculKilomètrage ===
        "Du lieu de départ au lieu de destination" &&
      CalculPrix_CalculKilomètrage
    ) {
      // if there is a km supplémentaires and forfait
      if (montantKMSUPP && nbKMSUPP) {
        const km = DistanceDepartDestination;
        // push info in the lists (Description, quantitie, Prix unitaire, final price)
        missionDescription.push(
          `${trajetInfo}, ${forfait}\nKM parcourus: \nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait) \nKm supplémentaire au-delà du forfait\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
        );
        missionQuantite.push(`\n${km}\n1\n${nbKMSUPP}`);
        missionPrixUni.push(
          `\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}\n${CalculPrix_PrixParKmEuro}`,
        );
        missionFinalPrice.push(
          `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}\n-${montantKMSUPP}`,
        );
      } else {
        const km = DistanceDepartDestination;
        // if there is a forfait
        if (CalculPrix_PrixForfaitPriseEnChargeEuro) {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nPrise en charge + ${CalculPrix_NbKMCouvertForfaitPriseEnCharge} km (forfait)\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}\n1`);
          missionPrixUni.push(`\n\n${CalculPrix_PrixForfaitPriseEnChargeEuro}`);
          missionFinalPrice.push(
            `\n\n-${CalculPrix_PrixForfaitPriseEnChargeEuro}`,
          );
        } else {
          // push info in the lists (Description, quantitie, Prix unitaire, final price)
          missionDescription.push(
            `${trajetInfo}, ${forfait}\nKM parcourus:\nLieu de départ: ${CC_AdresseDépart} \nDestinations : \n${destinations}`,
          );
          missionQuantite.push(`\n${km}`);
          missionPrixUni.push(`\n${CalculPrix_PrixParKmEuro}`);
          missionFinalPrice.push(`\n-${CalculPrixBis_PrixInitial}`);
        }
      }
    } // else proceed as usual
    else {
      missionDescription.push(
        `${trajetInfo}\nNombre de KM : ... \nLieu de départ: ${CC_AdresseDépart} \nDestination(s) : \n${destinations}`,
      );
      missionQuantite.push(``);
      missionPrixUni.push(``);
      missionFinalPrice.push(``);
    }

    // push remise in the list
    missionRemise.push(
      CalculPrix_Remise ? `\n\n\n${CalculPrix_Remise} %` : "\n\n\n0 %",
    );

    /* // new entry for tableDataMission
    tableDataMission[0].rows.push([
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ]); */
    const currentRow = [
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ];
    currentRow._missionsCount = 1;
    currentRow._prixSource = parseFloat(CalculPrix_Prix);
    currentRow._originalKey = [...currentRow];

    const currentRowOriginal = [
      missionDate[0],
      missionDescription[0],
      missionQuantite[0],
      missionPrixUni[0],
      missionRemise[0],
      missionFinalPrice[0],
    ];

    const existingIndex = groupedRows.findIndex((row) => {
      const original = row._originalKey;
      if (!original) return false;
      for (let i = 1; i < 6; i++) {
        if (original[i] !== currentRowOriginal[i]) return false;
      }
      return true;
    });

    if (existingIndex !== -1) {
      const existingRow = groupedRows[existingIndex];

      existingRow._missionsCount = (existingRow._missionsCount || 1) + 1;

      existingRow[0] += `\n${currentRow[0]}`;
      if (existingRow._missionsCount === 2) {
        existingRow[1] = injecterMissionSupplémentaire(
          existingRow[1],
          "Mission(s) supplémentaire(s)",
        );
      }
    } else {
      currentRow._totalFinal =
        parseFloat(currentRow[5].replace(/[^\d.-]/g, "")) || 0;
      groupedRows.push(currentRow);
    }
  });

  groupedRows.forEach((row) => {
    if (row._missionsCount > 1) {
      const count = row._missionsCount - 1; // Nombre de missions supplémentaires
      const prix = row._prixSource; // Prix unitaire de la mission supplémentaire
      const total = (prix * count).toFixed(2); // Total des missions supplémentaires

      // Ajouter "Mission(s) supplémentaire(s)" seulement une fois à la fin du groupe
      row[2] += `\n${count}`; // Nombre de missions supplémentaires
      row[3] += `\n${prix}`; // Prix unitaire
      row[5] += `\n-${total}`; // Total price for the additional missions
    }
  });

  // Nettoyer les props temporaires
  tableDataMission[0].rows = groupedRows.map((row) => {
    delete row._missionsCount;
    delete row._totalFinal;
    delete row._originalKey;
    return row;
  });

  /* here we calculate the biggest date and use it as emission date */
  missionDateStorage.push(factureTodayDate);
  // recuperate the biggest date to use
  let maxDate = new Date(
    Math.max(...missionDateStorage.map((date) => new Date(date))),
  );
  let dateEcheance = new Date(maxDate);
  dateEcheance.setDate(dateEcheance.getDate() + 60);
  const emissionDate = maxDate.toISOString().split("T")[0];
  const echeanceDate = dateEcheance.toISOString().split("T")[0];

  // re format the emissionDate and echeance date
  const emissionDateParts = emissionDate.split("-");
  const emissionDateFormatted = `${emissionDateParts[2]}/${emissionDateParts[1]}/${emissionDateParts[0]}`;
  const echeanceDateParts = echeanceDate.split("-");
  const echeanceDateFormatted = `${echeanceDateParts[2]}/${echeanceDateParts[1]}/${echeanceDateParts[0]}`;
  /* push the data informations of ODS file*/
  for (let b = 0; b < missionList.length; b++) {
    const factureInfo = `{ "NoFacture": "${noFactureAnnulée}", "NoCredit": "${numéroNoteCredit}", "donneeIban": "${mcrIban}", "nameOfficiel": "${mcrOffName}",
    "Title": "NOTE DE CRÉDIT", "Date": "${emissionDateFormatted}", "Échéance": "${echeanceDateFormatted}", "Adresse": "${mcrStreet}",
      "Name": "${mcrTown}", "Telephone": "${mcrPhone}", "TVAMCR": "${mcrTVA}", "BeneName": "${beneName}", "Comment": "${
        CommentaireFacture || ""
      }",
       "ClientName": "${clientName}", "ClientAddress": "${clientAddress}", "ClientAddressPt2": "${clientAdressPt2}",
      "SsTot": "-${MontantInitial} €", "TVAM": "0 €", "Rem": "${
        CalculPrix_Remise ? CalculPrix_Remise : 0
      } %", "Tot": "-${MontantDû} €", "donneeMontant": "${MontantDû} €", "donneeCommunication": "${numéroNoteCredit}",}`;
    result.push(factureInfo);
  }
  console.log("RESULT", result);
  console.log("NUMÉRO NOTE CREDIT", numéroNoteCredit);
  console.log("TABLEDAAMISSION", tableDataMission);
  const res10 = await api({ local: true }).post(
    `document/download/sheets/NOTE_DE_CREDIT/pdf/${numéroNoteCredit}`,
    {
      sheets: [
        {
          name: "InvoiceSheet",
          datas: result,
          sheetNames: [numéroNoteCredit],
          tableDatas: [tableDataMission],
        },
      ],
    },
  );
  console.log("RES10", res10);
  const fileUrl = res10.data.fileUrl;
  return { fileUrl, emissionDate };
};

// function to convert and update the facture form
const convertAndUpdateFactureForm = async (fileUrl, numéroNoteCredit) => {
  if (!fileUrl) {
    console.error("URL du fichier non trouvée dans la réponse.");
    return;
  }
  // Step 1: Get the file and convert in base64
  const fileDataString = await fetch(fileUrl)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1]; // Extraction du Base64
            resolve(
              `{"filename":"${btoa(
                numéroNoteCredit,
              )}.pdf","data":"data:application/vnd.oasis.opendocument.spreadsheet;base64,${base64Data}"}`,
            );
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    )
    .catch((error) => {
      console.error(
        "Erreur lors du téléchargement ou conversion du fichier :",
        error,
      );
      return null;
    });

  if (!fileDataString) return;

  // Step 2: Update the form
  const clonedDocData = { ...docData };
  clonedDocData.NumeroNoteDeCredit = numéroNoteCredit;
  clonedDocData.NoteDeCredit = fileDataString;
  clonedDocData.Facture_MotifAnnulation = reasonOfRefusal;
  console.log("Mise à jour des données du formulaire :", clonedDocData);
  console.log("ID du formulaire à mettre à jour :", docData.FORMID);

  // last step update the documents for mission and facture
  await updateDocuments(clonedDocData, docData.FORMID);
};

// constant to update the facture form and missions related form
const updateDocuments = async (formData, formId) => {
  // for the facture doc
  const document = {
    data: formatDataAPI(formData),
    status: "Annulée",
    active: true,
    template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" },
    documentID: formId,
  };

  // put/many for multiple updates (on facture and missions)
  const res = await api({ local: true }).put("document", {
    document,
  });
  hidePopupLoading();
  return res;
};

// main
const main = async () => {
  try {
    // get every missions related to the bill
    const missionList = await getMissionInfo();
    const profilInfo = await getProfil();
    console.log("profilInfo", profilInfo);
    // we show the waiting popup
    showPopupLoadingWaiting();
    // get the date, month and year
    const date = new Date();
    const mois = date.getMonth() + 1;
    const annee = date.getFullYear();
    const MCR = docData["Maison"];
    const noFactureAnnulée = docData.NuméroFacture;
    // Get the new facture number
    const numéroNoteCredit = await getNumberNoteCredit(mois, annee, MCR);
    console.log("Numéro note de crédit", numéroNoteCredit);

    // step 1 : update the invoice form with the "Numéro séquentiel unique" that we want to give to the pdf file
    const updateFactureResponse =
      await updateFactureUniqueNumber(numéroNoteCredit);

    // here we update the facture number and verifies if it unique
    try {
      // Step 2 : Verify that there is only one form with this "Numéro séquentiel unique" among  all the invoice forms
      const id = await verifyUniqueNumberFacture(numéroNoteCredit);
      console.log("ID", id);
      // If there is only one form, continue
      if (id.length === 1) {
        console.log("yes only 1!");
        // create the pdf and get the file from url
        const { fileUrl, emissionDate } = await createPDF(
          missionList,
          noFactureAnnulée,
          numéroNoteCredit,
          profilInfo,
        );
        // convert and update the facture form and give all the necessary infos
        await convertAndUpdateFactureForm(fileUrl, numéroNoteCredit);
        await annulerFactureEtMissions(missionList);
        hidePopupLoading();
      }
      // Else, show error message
      else {
        hidePopupLoading();
        let errorMultiple = "Ce numéro de note de crédit n'est pas unique";
        showPopUpError(errorMultiple);
        console.log(
          "Erreur plusieurs documents possède ce numéro de facture :",
        );
        // button to close the popup
        const closePopupButton = document.getElementById("closePopupBtn");
        if (closePopupButton) {
          closePopupButton.addEventListener("click", hidePopupLoading);
        }
      }
    } catch (error) {
      console.log("Erreur lors de la vérification du numéro séquentiel", error);
      hidePopupLoading();
    }
  } catch (error) {
    console.warn("Erreur lors de l`annulation de la commande ", error);
    hidePopupLoading();
  }
};
window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
main();
"
"console.log("Function139", context);

// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

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

// function to create the popup loading element
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
// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

// function to show the popup loading
const showPopup = () => {
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
      <div style="
        background-color: white; 
        padding: 20px; 
        border-radius: 5px; 
        display: flex; 
        flex-direction: column; 
        align-items: center;
      ">
        
        <h1 style="
          color: #C70000; 
          font-weight: bold; 
          font-size: 120%;
          align-self: flex-start;
        ">Attention !</h1>

        <div>Un chevauchement a été détecté, voulez-vous tout de même poursuivre?</div>

        <!-- CONTENEUR FLEX POUR LES DEUX BOUTONS -->
        <div style="
          display: flex; 
          flex-direction: row; 
          gap: 15px; 
          margin-top: 20px;
        ">

          <button id="continuePopupBtn" style="
            border: 2px solid #3498db; 
            background-color: #3498db; 
            color: #FFFFFF; 
            width: 80px; 
            height: 35px; 
            border-radius: 10px;
          ">Ok</button>

          <button id="closePopupBtn" style="
            border: 2px solid #F00A0A; 
            background-color: #F00A0A; 
            color: #FFFFFF; 
            width: 80px; 
            height: 35px; 
            border-radius: 10px;
          ">Retour</button>

        </div>

      </div>
    `,
  );
};

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};
// constant document to save the form
const documentPayload = {
  data: formatDataAPI(docData),
  status: "Enregistrée",
  active: true,
  template: { templateId: "cd81267c-4a6b-451b-846f-22999f0be1f5" },
  documentID: docData.FORMID,
};

console.log("DOCUMENT", documentPayload);

// function that updates the form
const updateForm = async () => {
  try {
    // update the form
    const response = api({ local: true }).put("document", {
      document: documentPayload,
      preventNotify: "FULL",
    });
  } catch (error) {
    console.log("Erreur lors de l`ajout du client");
  }
};

const verifyAvailabilityForDay = async () => {
  const date = docData.Planification_Date;
  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Disponibilité",
      type: "TEXT",
    },
    {
      key: "PrénomSelected",
      operator: "EQUALS",
      value: docData.PrénomSelected,
      type: "TEXT",
    },
    {
      key: "NomFormMission",
      operator: "EQUALS",
      value: docData.NomFormMission,
      type: "TEXT",
    },
    {
      key: "DateDeNaissance",
      operator: "EQUALS",
      value: docData.DateDeNaissance,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistrée",
      type: "TEXT",
    },
    {
      key: "Maison",
      operator: "EQUALS",
      value: docData.Maison,
      type: "TEXT",
    },
  ];
  console.log(
    "---------------------------AVAILABILITIES---------------------------",
  );
  const res = await recurrence.getDocuments(apiFilters, [date, date], api);
  console.log("recurrence.getDocuments", res);

  //parse the info
  const parsedData = res.data.documents.map((documentDispo) =>
    JSON.parse(documentDispo.data),
  );

  const newStart = docData.Planification_HeureDébut;
  const newEnd = docData.Planification_HeureFin;
  return { parsedData, newStart, newEnd };
};

const hasTimeConflict = (newStart, newEnd, existingForms) => {
  for (const form of existingForms) {
    const existingStart = form.Planification_HeureDébut;
    const existingEnd = form.Planification_HeureFin;

    // Convertir les heures en objets Date pour comparaison
    const startA = new Date(`1970-01-01T${newStart}:00`);
    const endA = new Date(`1970-01-01T${newEnd}:00`);
    const startB = new Date(`1970-01-01T${existingStart}:00`);
    const endB = new Date(`1970-01-01T${existingEnd}:00`);
    console.log("START A , END A", startA, endA);
    console.log("START B, END B ", startB, endB);
    // Vérifie s'il y a un chevauchement
    if (startA < endB && endA > startB) {
      console.log("TRUE");
      return true;
    }
  }
  return false;
};

const proceed = async () => {
  hidePopupLoading();
  updateForm();
  navigateBack();
};

const main = async () => {
  const { parsedData, newStart, newEnd } = await verifyAvailabilityForDay();
  const conflict = hasTimeConflict(newStart, newEnd, parsedData);
  if (conflict) {
    console.warn(
      "Un conflit a été détecté, veuillez-modifier les heures de disponibilité",
    );
    showPopup();
    const closePopupButton = document.getElementById("closePopupBtn");
    const continuePopupBtn = document.getElementById("continuePopupBtn");
    if (closePopupButton) {
      closePopupButton.addEventListener("click", hidePopupLoading);
    }
    if (continuePopupBtn) {
      continuePopupBtn.addEventListener("click", proceed);
    }
  } else {
    updateForm();
    navigateBack();
  }
};

window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);
if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  main();
}
"
"console.log("Function140", context);

if (docData.STATUS === "Draft" || docData.STATUS === "Acceptée") {
  return {};
} else {
  return {
    Planification_Récurrence: true,
  };
}
"
"console.log("Function141", context);
const FORM_LAYOUT_ID_MISSION = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
const TABLES_STORAGE_KEY = "tables";
const TIMELINE_DATE_KEY = "TRANSPORTS_TIMELINE_DATE";
const TIMELINE_DATE_REDIRECT_KEY = "TRANSPORTS_TIMELINE_DATE_REDIRECT";

// sync functions
const dataCollection = (key, array) => {
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

const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...dataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(data);
};

/**
 * Redirect explicitly to the Transports viewgroup
 * This avoids accidental navigation to other modules
 */
const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;

  // pathname example:
  // /mcr.arlon/transports/mission/new/UUID
  const segments = pathname.split("/").filter(Boolean);

  // The tenant is always the first segment (e.g. "mcr.arlon")
  const tenant = segments[0];

  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found in URL");
    return;
  }

  const targetUrl = `${origin}/${tenant}/transports`;

  window.location.href = targetUrl;
};

const getTimelineDate = (rawDate) => {
  if (!rawDate || typeof rawDate !== "string") return null;

  const date =
    rawDate.length === 10 ? new Date(`${rawDate}T00:00:00`) : new Date(rawDate);

  if (Number.isNaN(date.getTime())) return null;

  const offsetMin = date.getTimezoneOffset();
  const sign = offsetMin <= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
  const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");

  return (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` +
    `T00:00:00${sign}${hh}:${mm}`
  );
};

const updateTimelineStorage = (timelineDate) => {
  sessionStorage.removeItem(TIMELINE_DATE_KEY);

  if (!timelineDate) return;

  sessionStorage.setItem(TIMELINE_DATE_REDIRECT_KEY, timelineDate);

  const timelineDay = timelineDate.split("T")[0];
  const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || "{}");

  if (!tables.TimeLineChauffeur) {
    tables.TimeLineChauffeur = {};
  }

  if (!tables.TimeLineChauffeur.filters) {
    tables.TimeLineChauffeur.filters = {};
  }

  if (!tables.TimeLineChauffeur.mask) {
    tables.TimeLineChauffeur.mask = {};
  }

  if (!tables.TimeLineChauffeur.mask.TIMELINE) {
    tables.TimeLineChauffeur.mask.TIMELINE = {};
  }

  tables.TimeLineChauffeur.mask.TIMELINE.date = `${timelineDay}|${timelineDay}`;
  tables.TimeLineChauffeur.mask.TIMELINE.type = "DAY";

  localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
  console.log("[TIMELINE] Updated localStorage tables:", tables);
};

const save_form = async () => {
  try {
    const document = {
      data: formatDataAPI(docData),
      status: docData.STATUS,
      active: true,
      template: { templateId: FORM_LAYOUT_ID_MISSION },
      documentID: docData["FORMID"],
    };
    await api({ local: true }).put("document", {
      document: document,
      PreventNotify: "FULL",
    });
  } catch (error) {
    console.warn("Erreur lors de l`enregistrement du formulaire", error);
  }
};

// main function
const main = async () => {
  await save_form();

  const rawDate =
    docData.Planification_Date || docData.InformationsAdmin_DateHeureDébut;
  const timelineDate = getTimelineDate(rawDate);

  updateTimelineStorage(timelineDate);

  redirectToViewGroup();
};

if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  main();
}
"
"console.log("Function142", context);
/***********POPUP CODE */
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

const showErrorBanner = (errorMessage) => {
  const errorBanner = createOrUpdateElement(
    "errorBanner",
    "div",
    `
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
    `,
    `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
};

const showSuccessBanner = (successMessage) => {
  const successBanner = createOrUpdateElement(
    "successBanner",
    "div",
    `
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
    `,
    `
      <div style="margin-right: 10px; color: green;">&#10003;</div><div>${successMessage}</div>
      <div id="successBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: green; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("successBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      successBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
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

const getDocumentsByFiltersWithRecurrence = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const interpretedResult = await getDocumentsByIDs(
      response?.data?.ids || [],
    );
    const result = interpretedResult.map((document) => {
      const dataParsed = JSON.parse(document.data);
      return {
        ...document,
        data: dataParsed,
      };
    });
    return result || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const generateAllOccurrences = async (dateWindow) => {
  try {
    const recurrenceDocument = {
      documentID: docData.FORMID,
      status: docData.STATUS,
      template: {
        templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5",
      },
      data: JSON.stringify(docData),
    };

    const recurrenceFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Mission",
        type: "TEXT",
      },
      {
        key: "FORMID",
        operator: "EQUALS",
        value: recurrenceDocument.documentID,
        type: "TEXT",
      },
    ];
    const interpreted = await recurrence.getDocuments(
      recurrenceFilters,
      dateWindow,
      api,
    );
    const newForms = await recurrence.createFormsIfNeeded(
      interpreted?.data?.documents || [],
      api,
    );
    console.log("142 New Forms Created:", newForms);
  } catch (error) {
    console.error("Failed to generate occurrences:", error);
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

const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((k) => {
      result[`${k}|${index + 1}`] = obj[k];
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

const getDateWindow = () => {
  switch (docData.Planification_Récurrence) {
    case "Par jour spécifique": {
      const dates = (docData?.Planification_MultiDate || "")
        .split("|")
        .map((date) => date.trim())
        .filter(Boolean)
        .sort();

      return dates.length
        ? [dates[0], dates[dates.length - 1]]
        : ["2000-01-01", "2222-01-01"];
    }
    case "Par semaine": {
      return [
        docData.Planification_Date || "2000-01-01",
        docData.Planification_DateFin || "2222-01-01",
      ];
    }
    default:
      return ["2000-01-01", "2222-01-01"];
  }
};

/******************* FUNCTION CODE */

const main = async () => {
  const date = new Date(
    store.pageContentStore.processData[0].edits.DateAnnulation,
  )
    .toISOString()
    .split("T")[0];
  const dateWindow = getDateWindow();

  await generateAllOccurrences(dateWindow);

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Mission",
      type: "TEXT",
    },
    {
      key: "isOccurence",
      operator: "EQUALS",
      value: "true",
      type: "TEXT",
    },
    {
      key: "IdentifiantFormulaireRécurrence",
      operator: "EQUALS",
      value: docData.FORMID,
      type: "TEXT",
    },
    {
      key: "Planification_Date",
      operator: "BETWEEN",
      value: `${date}|${dateWindow[1]}`,
      type: "DATE",
    },
  ];

  const docs = await getDocumentsByFiltersWithRecurrence(apiFilters);
  const documents = docs.sort(
    (a, b) =>
      new Date(a?.data?.Planification_Date) -
      new Date(b?.data?.Planification_Date),
  );

  console.log("142 DOCUMENTS ", documents);

  const documentToUpdate = [];

  documentToUpdate.push({
    data: formatDataAPI({
      ...docData.data,
    }),
    status: "Annulée",
    active: true,
    template: { templateId: "0e44171d-1616-4a50-9b36-aff4d998c4a5" },
    documentID: docData.FORMID,
  });

  documents?.forEach((doc) => {
    documentToUpdate.push({
      data: formatDataAPI(doc.data),
      status: "Annulée",
      active: true,
      template: { templateId: doc.template.templateId },
      documentID: doc.metaData.FORMID,
    });
  });

  console.log("142 DOCUMENTS TO UPDATE", documentToUpdate);

  await updateDocuments(documentToUpdate);
  window.location.reload();
};

main();
"
"console.log("Function143", context);

const rdvPec =
  docData?.TypeTransport === "RDV au lieu de prise en charge" ? true : false;

return rdvPec ? { CheckboxResterAvecBene: false, CC_Retour: false } : {};
"
"console.log("Function144", context);

const rdvPec =
  docData?.TypeTransport === "RDV au lieu de prise en charge" ? true : false;

return rdvPec
  ? { CheckboxResterAvecBene: true, CC_Retour: true }
  : { CheckboxResterAvecBene: false, CC_Retour: false };
"
"console.log("Function145", context);

const rdvPec =
  docData?.TypeTransport === "RDV au lieu de prise en charge" ? true : false;

if (
  docData.EntrerHeuresManuellement === "false" ||
  !docData.EntrerHeuresManuellement
) {
  return rdvPec
    ? {
        CC_TempsTrajet: null,
        CC_Arrivée: null,
        "CC_Destinations|300|Arrivée": true,
        "CC_Destinations|400|Début de RDV": null,
        "CC_Destinations|500|Temps sur place": null,
        "CC_Destinations|600|Fin de RDV": null,
      }
    : {
        CC_TempsTrajet: true,
        CC_Arrivée: true,
        "CC_Destinations|400|Début de RDV": true,
        "CC_Destinations|500|Temps sur place": true,
        "CC_Destinations|600|Fin de RDV": true,
      };
} else {
  return rdvPec
    ? {
        CC_TempsTrajet: null,
        CC_Arrivée: null,
      }
    : {
        CC_TempsTrajet: true,
        CC_Arrivée: true,
      };
}
"
"console.log('Function 271', context);

const roles = store.moduleStore.user.roles || [];

const privilegedRoles = [
  "1. ADMIN",
  "1. COORDINATEUR",
  "1. DISPATCHEUR",
  "1. RESPONSABLE D'ACTIVITÉ",
  "1. DEVELOPPEUR"
];

const hasPrivilegedRole = roles.some(role =>
  privilegedRoles.includes(role)
);

const hasChauffeurRole = roles.some(role =>
  role.toUpperCase().includes("CHAUFFEUR")
);

if (hasChauffeurRole && !hasPrivilegedRole) {
  return {
    PrénomSelected: true,
    NomFormMission: true,
    DateDeNaissance: true,
  };
}
"
"console.log("Fonction 274", context);

const getFieldValue = (data, key) => {
  const parts = key.split('|');
  console.log("getFieldValue for key:", key, "parts:", parts);
  if (parts.length === 3) {
    const arrayName = parts[0];
    const indexOrId = parts[1];
    const fieldName = parts[2];
    const array = data[arrayName];
    console.log("array:", array, "arrayName:", arrayName);
    if (Array.isArray(array)) {
      const item = array.find(item => item.id === indexOrId || item.ID === indexOrId) || array[parseInt(indexOrId)] || array[0];
      console.log("item:", item, "indexOrId:", indexOrId, "parseInt:", parseInt(indexOrId));
      const value = item?.[key]; 
      console.log("key:", key, "value:", value);
      return value;
    }
  }
  const value = data[key];
  console.log("fallback value:", value);
  return value;
};

const dateDebut = getFieldValue(docData, "CC_Destinations|400|Début de RDV");
const dateFin = getFieldValue(docData, "CC_Destinations|600|Fin de RDV");
const oldDateDebut = context?.previousData ? getFieldValue(context.previousData, "CC_Destinations|400|Début de RDV") : undefined;
const oldDateFin = context?.previousData ? getFieldValue(context.previousData, "CC_Destinations|600|Fin de RDV") : undefined;
 
console.log("docData:", docData); console.log("dateDebut:", dateDebut, "dateFin:", dateFin); console.log("document.body:", !!document.body);

const clearDate = () => {
  const updatedCollection = Array.isArray(docData?.CC_Destinations) 
    ? [...docData.CC_Destinations] 
    : [{}];

  if (updatedCollection[indexItemChange]) {
    updatedCollection[indexItemChange]["CC_Destinations|300|Arrivée"] = "";
    updatedCollection[indexItemChange]["CC_Destinations|400|Début de RDV"] = "";
    updatedCollection[indexItemChange]["CC_Destinations|500|Temps sur place"] = "";
    updatedCollection[indexItemChange]["CC_Destinations|600|Fin de RDV"] = "";
  }
  
  
  // 3. Return the entire modified collection back to the platform
  callback({
    data: {
      CC_Destinations: updatedCollection
    }
  });
};
 
// Modifying the popup to accept a closing action callback
const createErrorPopup = (title, message, onCloseCallback) => {
  const existingPopup = document.getElementById("date-validation-popup-overlay");
  if (existingPopup) {
    existingPopup.remove();
  }
 
  const overlay = document.createElement("div");
  overlay.id = "date-validation-popup-overlay";
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;";
 
  const popup = document.createElement("div");
  popup.style.cssText = "background:white;padding:24px;border-radius:8px;min-width:400px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.3);";
 
  const titleEl = document.createElement("h2");
  titleEl.textContent = title;
  titleEl.style.cssText = "margin:0 0 20px 0;font-size:1.4em;";
  popup.appendChild(titleEl);
 
  const messageEl = document.createElement("div");
  messageEl.innerHTML = message;
  messageEl.style.cssText = "margin-bottom:20px;";
  popup.appendChild(messageEl);
 
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = "display:flex;gap:12px;justify-content:flex-end;margin-top:20px;";
 
  const closeButton = document.createElement("button");
  closeButton.textContent = "OK";
  closeButton.style.cssText = "padding:10px 24px;border:none;border-radius:4px;cursor:pointer;font-size:1em;background-color:#ffc9c9;color:#1e1e1e;";
  
  closeButton.addEventListener("click", () => {
    overlay.remove();
    if (onCloseCallback) onCloseCallback(); // Fires clearDate() when user acknowledges error
  });
 
  buttonContainer.appendChild(closeButton);
  popup.appendChild(buttonContainer);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};
 
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

// Validation Logic
const validateDates = () => {
  try {
    if (dateDebut && dateFin) {
      const minutesDebut = parseTimeToMinutes(dateDebut);
 
      if (minutesDebut === null) {
        createErrorPopup(
          "Erreur de format",
          `L'heure de début doit être au format valide (HH:MM).<br><b>Début:</b> ${dateDebut}`,
          clearDate
        );
        return false;
      }
 
      const minutesFin = parseTimeToMinutes(dateFin);
 
      if (minutesFin === null) {
        createErrorPopup(
          "Erreur de format",
          `L'heure de fin doit être au format valide (HH:MM).<br><b>Fin:</b> ${dateFin}`,
          clearDate
        );
        return false;
      }
 
      if (minutesDebut > minutesFin) {
        createErrorPopup(
          "Erreur de dates",
          `L'heure de fin ne peut pas être antérieure à l'heure de début.<br><b>Début:</b> ${dateDebut}<br><b>Fin:</b> ${dateFin}`,
          clearDate
        );
        return false;
      }
 
      if (minutesDebut === minutesFin) {
        createErrorPopup(
          "Erreur de dates",
          `Les heures de début et fin ne peuvent pas être identiques.<br><b>Début:</b> ${dateDebut}<br><b>Fin:</b> ${dateFin}`,
          clearDate
        );
        return false;
      }
    }
    return true;
  } catch (error) {
    createErrorPopup(
      "Erreur",
      `Une erreur est survenue lors de la validation des heures.<br><br><b>Détail:</b> ${error.message}`,
      clearDate
    );
    return false;
  }
};
 
validateDates();"
"console.log("TPMR vehicle status popup started");

// -----------------------------
// Mission TPMR normalization
// -----------------------------
const isMissionTPMR = () => {
  const rawValue = docData?.TPMR;
  return String(rawValue || "").trim().toLowerCase() === "oui";
};

// -----------------------------
// Vehicle TPMR normalization
// -----------------------------
const isVehiculeTPMR = (vehicule) => {
  const rawValue = vehicule?.CT_TPMR;
  return String(rawValue || "").trim().toLowerCase() === "true";
};

// -----------------------------
// Popup creation
// -----------------------------
const createInfoPopup = (title, messageHtml) => {
  const existingPopup = document.getElementById("tpmr-popup-overlay");
  if (existingPopup) existingPopup.remove();

  const overlay = document.createElement("div");
  overlay.id = "tpmr-popup-overlay";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;";

  const popup = document.createElement("div");
  popup.style.cssText =
    "background:white;padding:24px;border-radius:8px;min-width:420px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.3);";

  const titleEl = document.createElement("h2");
  titleEl.textContent = title;
  titleEl.style.cssText = "margin:0 0 16px 0;font-size:1.4em;";
  popup.appendChild(titleEl);

  const messageEl = document.createElement("div");
  messageEl.innerHTML = messageHtml;
  messageEl.style.cssText = "margin-bottom:20px;line-height:1.4;";
  popup.appendChild(messageEl);

  const button = document.createElement("button");
  button.textContent = "OK";
  button.style.cssText =
    "padding:10px 24px;border:none;border-radius:4px;cursor:pointer;font-size:1em;background-color:#cce5ff;color:#1e1e1e;";
  button.onclick = () => overlay.remove();

  popup.appendChild(button);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};

// -----------------------------
// Fetch vehicle helper
// -----------------------------
const fetchVehicule = async (vehiculeValue) => {
  if (!vehiculeValue) return null;

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Véhicule",
      type: "TEXT",
    },
    {
      key: "PriseEnCharge_VéhiculeUtilisé",
      operator: "EQUALS",
      value: vehiculeValue,
      type: "TEXT",
    },
  ];

  const resIds = await api({ local: true }).post("document/id/filter", {
    filters,
  });

  const ids = resIds?.data?.ids || [];
  if (!ids.length) return null;

  const resDocs = await api({ local: true }).post("document/id", {
    ids: [ids[0]],
  });

  const doc = resDocs?.data?.documents?.[0];
  return doc ? JSON.parse(doc.data) : null;
};

// -----------------------------
// Render vehicle status block
// -----------------------------
const buildVehiculeStatusHtml = async (label, fieldKey) => {
  if (!(fieldKey in docData)) {
    return "";
  }

  const value = docData[fieldKey];
  let html = `<br><br><b>${label} :</b><br>`;

  if (!value) {
    html += "<span style='color:#666;'>Aucun véhicule sélectionné</span>";
    return html;
  }

  const vehicule = await fetchVehicule(value);

  if (vehicule && isVehiculeTPMR(vehicule)) {
    html += "<span style='color:green;font-weight:bold;'>Véhicule TPMR</span>";
  } else {
    html += "<span style='color:red;font-weight:bold;'>Véhicule NON TPMR</span>";
  }

  return html;
};

// -----------------------------
// Main popup logic
// -----------------------------
const showTPMRVehicleStatusPopup = async () => {
  try {
    if (!isMissionTPMR()) return;

    let messageHtml =
      "Le transport est marqué comme <b>TPMR</b>.<br><br>";

    const allerHtml = await buildVehiculeStatusHtml(
      "Véhicule aller",
      "PriseEnCharge_VéhiculeUtilisé"
    );

    const retourHtml = await buildVehiculeStatusHtml(
      "Véhicule retour",
      "PriseEnCharge_VéhiculeUtiliséRetour"
    );

    if (!allerHtml && !retourHtml) {
      messageHtml +=
        "<span style='color:#666;'>Aucun véhicule n’est encore sélectionné pour cette mission TPMR.</span>";
    } else {
      messageHtml += "Statut des véhicules sélectionnés :";
      messageHtml += allerHtml;
      messageHtml += retourHtml;
    }

    createInfoPopup("Statut TPMR des véhicules", messageHtml);
  } catch (error) {
    console.error("TPMR vehicle popup error:", error);
  }
};

// -----------------------------
// Execute
// -----------------------------
showTPMRVehicleStatusPopup();
``"
console.log('277', docData.PriseEnCharge_VéhiculeUtilisé)
"// Vehicle identifier from the mission
var specifiedVehicule = docData["PriseEnCharge_VéhiculeUtilisé"];

console.log("Specified vehicle:", specifiedVehicule);

// Filters to retrieve the vehicle form
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: specifiedVehicule,
    type: "TEXT",
  },
];

/**
 * Get a list of documents based on given filters
 */
const searchForms = async (filters, limit, onlyIds = false) => {
  try {
    console.log("Searching with filters:", filters);

    const resIds = await api({ local: true }).post("document/id/filter", {
      filters,
    });

    console.log("ID response:", resIds);

    const ids = resIds.data?.ids;

    if (!ids || ids.length === 0) {
      return [];
    }

    const finalIds = limit ? ids.slice(0, limit) : ids;

    if (onlyIds) {
      return finalIds.map((id) => ({ FORMID: id }));
    }

    const resDocs = await api({ local: true }).post("document/id", {
      ids: finalIds,
    });

    const documents = resDocs?.data?.documents;

    if (!documents) {
      throw new Error("Error while retrieving documents");
    }

    return documents.map((doc) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error("Error in searchForms:", error);
    throw error;
  }
};

// -----------------------------
// Popup creation (same style as your TPMR popup)
// -----------------------------
const createInfoPopup = (title, messageHtml) => {
  const existingPopup = document.getElementById("tpmr-mission-popup");
  if (existingPopup) existingPopup.remove();

  const overlay = document.createElement("div");
  overlay.id = "tpmr-mission-popup";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;";

  const popup = document.createElement("div");
  popup.style.cssText =
    "background:white;padding:24px;border-radius:8px;min-width:420px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.3);";

  const titleEl = document.createElement("h2");
  titleEl.textContent = title;
  titleEl.style.cssText = "margin:0 0 16px 0;font-size:1.4em;";
  popup.appendChild(titleEl);

  const messageEl = document.createElement("div");
  messageEl.innerHTML = messageHtml;
  messageEl.style.cssText = "line-height:1.4;margin-bottom:20px;";
  popup.appendChild(messageEl);

  const button = document.createElement("button");
  button.textContent = "OK";
  button.style.cssText =
    "padding:10px 24px;border:none;border-radius:4px;cursor:pointer;font-size:1em;background-color:#cce5ff;color:#1e1e1e;";
  button.onclick = () => overlay.remove();

  popup.appendChild(button);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};

// -----------------------------
// Execute logic
// -----------------------------
(async () => {
  console.log("Script execution started");

  const vehiculeData = await searchForms(apiFilters);

  if (!vehiculeData.length) {
    return;
  }

  const vehicule = vehiculeData[0];

  const missionIsTPMR = docData["TPMR"] === "Oui";
  const vehiculeIsTPMR = vehicule.CT_TPMR === "true";

  if (missionIsTPMR && !vehiculeIsTPMR) {
    createInfoPopup(
      "Véhicule non conforme TPMR",
      "Cette mission est marquée comme <b>TPMR</b>.<br><br>" +
        "<span style='color:red;font-weight:bold;'>Le véhicule sélectionné n'est pas TPMR.</span><br><br>" +
        "Veuillez sélectionner un <b>véhicule TPMR</b> pour cette mission."
    );
  }

  console.log("Script execution finished");
})();
``"
"// Vehicle identifier from the mission (RETURN)
var specifiedVehiculeRetour = docData["PriseEnCharge_VéhiculeUtiliséRetour"];

console.log("Function 281", context);

// Filters to retrieve the RETURN vehicle form
const apiFilters = [
  {
    key: "FORMLAYOUTNAME",
    operator: "EQUALS",
    value: "Véhicule",
    type: "TEXT",
  },
  {
    key: "PriseEnCharge_VéhiculeUtilisé",
    operator: "EQUALS",
    value: specifiedVehiculeRetour,
    type: "TEXT",
  },
];

/**
 * Get a list of documents based on given filters
 */
const searchForms = async (filters, limit, onlyIds = false) => {
  try {
    const resIds = await api({ local: true }).post("document/id/filter", {
      filters,
    });

    const ids = resIds.data?.ids;
    if (!ids || ids.length === 0) {
      return [];
    }

    const finalIds = limit ? ids.slice(0, limit) : ids;

    if (onlyIds) {
      return finalIds.map((id) => ({ FORMID: id }));
    }

    const resDocs = await api({ local: true }).post("document/id", {
      ids: finalIds,
    });

    const documents = resDocs?.data?.documents;
    if (!documents) {
      throw new Error("Error while retrieving documents");
    }

    return documents.map((doc) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error("Function 281 - searchForms error:", error);
    throw error;
  }
};

// -----------------------------
// Popup creation (same style as TPMR popup)
// -----------------------------
const createInfoPopup = (title, messageHtml) => {
  const existingPopup = document.getElementById("tpmr-mission-popup");
  if (existingPopup) existingPopup.remove();

  const overlay = document.createElement("div");
  overlay.id = "tpmr-mission-popup";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;";

  const popup = document.createElement("div");
  popup.style.cssText =
    "background:white;padding:24px;border-radius:8px;min-width:420px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.3);";

  const titleEl = document.createElement("h2");
  titleEl.textContent = title;
  titleEl.style.cssText = "margin:0 0 16px 0;font-size:1.4em;";
  popup.appendChild(titleEl);

  const messageEl = document.createElement("div");
  messageEl.innerHTML = messageHtml;
  messageEl.style.cssText = "line-height:1.4;margin-bottom:20px;";
  popup.appendChild(messageEl);

  const button = document.createElement("button");
  button.textContent = "OK";
  button.style.cssText =
    "padding:10px 24px;border:none;border-radius:4px;cursor:pointer;font-size:1em;background-color:#cce5ff;color:#1e1e1e;";
  button.onclick = () => overlay.remove();

  popup.appendChild(button);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
};

// -----------------------------
// Execute logic
// -----------------------------
(async () => {
  const vehiculeData = await searchForms(apiFilters);

  if (!vehiculeData.length) {
    return;
  }

  const vehiculeRetour = vehiculeData[0];

  const missionIsTPMR = docData["TPMR"] === "Oui";
  const vehiculeIsTPMR = vehiculeRetour.CT_TPMR === "true";

  if (missionIsTPMR && !vehiculeIsTPMR) {
    createInfoPopup(
      "Véhicule retour non conforme TPMR",
      "Cette mission est marquée comme <b>TPMR</b>.<br><br>" +
        "<span style='color:red;font-weight:bold;'>Le véhicule de retour sélectionné n'est pas TPMR.</span><br><br>" +
        "Veuillez sélectionner un <b>véhicule TPMR</b> pour le retour."
    );
  }
})();"
"console.log("Function 281", context);

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
"
"console.log("Function 283", context);

// const planificationDate = docData?.Planification_Date;
// console.log("Planification_Date:", planificationDate);

// if (planificationDate) {
//  const startDate = planificationDate.split("T")[0]; // YYYY-MM-DD
//  sessionStorage.setItem("TRANSPORTS_START_DATE", startDate);
//  console.log("Stored TRANSPORTS_START_DATE:", startDate);
//}

//window.location.href = "/mcr.arlon/transports/";"
"console.log("Function 290", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 */
const viewGroupUrl = () => {
  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  return parts.join("/");
};

//const redirectToViewGroup = () => {
//  window.location.href = viewGroupUrl();
//};

const formLayoutId_Mission = "0e44171d-1616-4a50-9b36-aff4d998c4a5";

// Sync functions
const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((k) => {
      let newKey = `${k}|${index + 1}`;
      result[newKey] = obj[k];
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
  let formattedData = { ...data };
  Object.keys(formattedData).forEach((key) => {
    if (Array.isArray(formattedData[key])) {
      formattedData = {
        ...formattedData,
        ...DataCollection(key, formattedData[key]),
      };
    }
  });
  return JSON.stringify(excludeKeys(formattedData, ["FORMID", "NUMBER"]));
};

const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    const document = {
      data: formatDataAPI(formData),
      status: "Acceptée",
      active: true,
      template: { templateId: formLayoutId },
      documentID: formId,
    };
    console.log(document);

    const res = await api({ local: true }).put("document", { document });
    console.log("Mise à jour réussie (Statut: Acceptée) :", res);
    return res;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du formulaire :", error);
    throw error;
  }
};

const navigateBack = async () => {
  const lastPage = localStorage.getItem("lastCustomPage");
  if (lastPage) {
    window.location.href = lastPage;
  } else {
    window.history.back();
  }
};

// Main execution logic
const main = async () => {
  // Check if the current status is "Annulée" before proceeding
  // Using docData or store data depending on your environment availability
  if (docData.status === "Annulée" || docData.STATUS === "Annulée") {
    const newDocData = {
      ...docData,
    };

    try {
      console.log("Passage du statut Annulée à Acceptée...");
      await updateMissionForm(
        newDocData.FORMID,
        newDocData,
        formLayoutId_Mission,
      );
      navigateBack();
    } catch (error) {
      console.error("Erreur dans le processus principal :", error);
    }
  } else {
    console.log("Le statut n'est pas 'Annulée', aucune action requise.");
  }
};

main();
"
"console.log("Function 291", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(str);
};

const viewGroupUrl = () => {
  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");

  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];

    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }

  return parts.join("/");
};

const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const formLayoutId_Vehicule =
  "56f6c94d-6706-4630-a0a6-3588cd954e06";

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
      data = {
        ...data,
        ...DataCollection(key, data[key]),
      };
    }
  });

  return JSON.stringify(
    excludeKeys(data, ["FORMID", "NUMBER"])
  );
};


const reactivateVehiculeForm = async (
  formId,
  formData,
  formLayoutId
) => {
  try {
    const document = {
      data: formatDataAPI(formData),

      status: "Enregistré",

      active: true,

      template: {
        templateId: formLayoutId,
      },

      documentID: formId,
    };

    const res = await api({ local: true }).put(
      "document",
      { document }
    );

    console.log(
      "Véhicule réactivé avec succès :",
      res
    );

    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la réactivation du véhicule :",
      error
    );

    throw error;
  }
};

const navigateBack = async () => {
  let viewGroup;

  const lastPage =
    localStorage.getItem("lastCustomPage");

  console.log("LAST PAGE ", lastPage);

  if (lastPage) {
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back();
  }
};

const main = async () => {
  const updatedDocData = {
    ...docData,

    VehiculeArchivage: null,

    STATUS: "Enregistré",
  };

  try {
    console.log(
      "Réactivation du véhicule en cours..."
    );

    await reactivateVehiculeForm(
      updatedDocData.FORMID,
      updatedDocData,
      formLayoutId_Vehicule
    );

    navigateBack();

  } catch (error) {
    console.error(
      "Erreur dans le processus principal :",
      error
    );

    throw error;
  }
};

main();"
"console.log("Function 292", context)

if (docData.STATUS != "Archivé") {
  console.log("Non archivé")
  return {
    BatchVehiculeReactiver: null,
  }
}"
"console.log("Function 293", context);

const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
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

const showWarningBanner = (message) => {
  const warningBanner = createOrUpdateElement(
    "warningBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: #fff3cd;
      color: #856404;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border: 1px solid #ffeeba;
    `,
    `
      <div style="margin-right: 10px;">⚠️</div>
      <div>${message}</div>
      <div id="warningBannerProgress"
           style="position: absolute; bottom: 0; left: 0; background-color: #856404; height: 4px; width: 0%;">
      </div>
    `,
  );

  const progressElement = document.getElementById("warningBannerProgress");
  let width = 0;

  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      warningBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55);
};

const viewGroupUrl = () => {
  const parts = window.location.href.split("/");
  for (let i = 0; i < 3; i++) {
    const last = parts[parts.length - 1];
    if (isUUID(last) || last === "new") parts.pop();
  }
  return parts.join("/");
};

const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;
  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0];
  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found in URL");
    return;
  }
  window.location.href = `${origin}/${tenant}/transports`;
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
    const style = document.createElement("style");
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

const showConfirmationPopup = (message) =>
  new Promise((resolve) => {
    const overlay = createOrUpdateElement(
      "confirmationPopup",
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
        <div style="background-color: white; padding: 20px; border-radius: 5px; max-width: 400px; text-align: center;">
          <div style="margin-bottom: 20px;">${message}</div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirmPopupNo"  style="border: 2px solid #6c757d; background-color: #6c757d; color: #fff; padding: 8px 20px; border-radius: 8px; cursor: pointer;">Non</button>
            <button id="confirmPopupYes" style="border: 2px solid #3498db; background-color: #3498db; color: #fff; padding: 8px 20px; border-radius: 8px; cursor: pointer;">Oui</button>
          </div>
        </div>
      `,
    );

    const close = (result) => {
      overlay.style.display = "none";
      resolve(result);
    };

    document.getElementById("confirmPopupYes").onclick = () => close(true);
    document.getElementById("confirmPopupNo").onclick = () => close(false);
  });

const checkIfFormExist = async () => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Profil MCR",
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: docData.Maison,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res.data.ids;
    return ids && ids.length > 0 ? ids[0] : null;
  } catch (error) {
    console.error("Erreur lors de la verification du formulaire :", error);
    return undefined;
  }
};

const createForm = async () => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: JSON.stringify(docData),
        status: "Actif",
        active: true,
        template: { templateId: "40307eab-5d1b-4ae2-adae-bcd79c11fcd5" },
      },
    });
    return response;
  } catch (error) {
    console.error("Erreur lors de la creation du formulaire :", error);
    throw error;
  }
};

const updateForm = async () => {
  try {
    const res = await api({ local: true }).put("document", {
      document: {
        data: JSON.stringify(docData),
        status: "Actif",
        active: true,
        template: { templateId: "40307eab-5d1b-4ae2-adae-bcd79c11fcd5" },
        documentID: docData.FORMID,
      },
    });
    return res;
  } catch (error) {
    console.error("Erreur lors de la mise a jour du formulaire :", error);
    throw error;
  }
};

const deactivateExistingForm = async (id) => {
  try {
    const fetchRes = await api({ local: true }).post("document/id", {
      ids: [id],
    });
    const existingDoc = fetchRes.data.documents[0];
    await api({ local: true }).put("document", {
      document: {
        data: existingDoc.data,
        status: "Supprimé(e)",
        active: true,
        template: { templateId: "40307eab-5d1b-4ae2-adae-bcd79c11fcd5" },
        documentID: id,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la desactivation du formulaire existant :",
      error,
    );
    throw error;
  }
};

const navigateBack = () => {
  const lastPage = localStorage.getItem("lastCustomPage");
  if (lastPage) {
    window.location.href = lastPage;
  } else {
    window.history.back();
  }
};

const main = async (docData) => {
  try {
    const currentRoles = store.moduleStore.user.roles;
    if (!currentRoles.includes("1. ADMIN")) {
      showWarningBanner(
        "Vous devez etre administrateur pour pouvoir modifier ce formulaire.",
      );
      return;
    }

    const status = docData.STATUS;

    if (status === "Actif") {
      showPopupLoading("Sauvegarde en cours...");
      await updateForm();
      hidePopupLoading();
      navigateBack();
      return;
    }

    // Draft
    showPopupLoading("Verification en cours...");
    const existingId = await checkIfFormExist();
    hidePopupLoading();

    if (!existingId) {
      showPopupLoading("Creation en cours...");
      await createForm();
      hidePopupLoading();
      navigateBack();
      return;
    }

    const confirmed = await showConfirmationPopup(
      "Un formulaire actif existe deja pour cette MCR. Voulez-vous le desactiver et enregistrer ce formulaire?",
    );
    if (!confirmed) return;

    showPopupLoading("Enregistrement en cours...");
    await deactivateExistingForm(existingId);
    await createForm();
    hidePopupLoading();
    navigateBack();
  } catch (error) {
    hidePopupLoading();
    showWarningBanner("Une erreur est survenue, veuillez reessayer.");
  }
};

window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);

if (!isValidDocument(t, docData)) {
  main(docData);
}
"
"const readonlyIfNotDraft = docData.STATUS !== "Draft" ? true : null;

return {
  Categorie_Nom: readonlyIfNotDraft,
};
"
"function ifExist(key, defaultValue) {
  return docData[key] ? docData[key] : defaultValue;
}

return {
  Categorie_Priorite: ifExist("Categorie_Priorite", "0"),
};
"
"console.log("Function 296", context);

const showErrorBanner = (errorMessage) => {
  const errorBanner = createOrUpdateElement(
    "errorBanner",
    "div",
    `
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
    `,
    `
      <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
      <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
    `,
  );
  let progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55); // La barre progresse sur 5 secondes
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

const getDocuments = async (apiFilters) => {
  const documentIDs = await getDocumentIDsByFilters(apiFilters);
  if (documentIDs.length === 0) {
    return [];
  }

  const documents = await getDocumentsByIDs(documentIDs);
  return documents.map((doc) => {
    doc.data = JSON.parse(doc.data);
    return doc;
  });
};

async function main() {
  const nomCategorie = docData.Categorie_Nom;
  const dateDebut = docData?.Categorie_DateDebut || "";
  const dateFin = docData?.Categorie_DateFin || "";

  if (!nomCategorie || !dateDebut || !dateFin) {
    return;
  }

  const overlapFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Catégorie",
      type: "TEXT",
    },
    {
      key: "Categorie_Nom",
      operator: "EQUALS",
      value: nomCategorie,
      type: "TEXT",
    },
    {
      key: "Categorie_DateDebut",
      operator: "LOWERTHAN",
      value: dateFin,
      type: "DATE",
    },
    {
      key: "Categorie_DateFin",
      operator: "GREATERTHAN",
      value: dateDebut,
      type: "DATE",
    },
  ];

  const documents = await getDocuments(overlapFilters);
  const currentDocId = docData.FORMID || null;

  const hasOverlap = documents.some((doc) => {
    const existingDocId = doc.FORMID || null;
    if (
      currentDocId &&
      existingDocId &&
      String(currentDocId) === String(existingDocId)
    ) {
      return false;
    }

    return true;
  });

  if (hasOverlap) {
    showErrorBanner(
      "Les dates de début et de fin chevauchent une autre période pour cette catégorie.",
    );
    callback({
      data: {
        Categorie_Nom: "",
      },
    });
  }
}

main();
"
"// console.log("Function search categories", context);

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post('document/id/filter', {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    // console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post('document/id', {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    // console.error("Failed to fetch documents:", error);
    return [];
  }
};

const getDocuments = async (apiFilters) => {
  const documentIDs = await getDocumentIDsByFilters(apiFilters);
  if (documentIDs.length === 0) {
    return [];
  }

  const documents = await getDocumentsByIDs(documentIDs);
  return documents.map((doc) => {
    doc.data = JSON.parse(doc.data);
    return doc;
  });
};

const buildSuggestions = (documents) => {
  if (!documents || documents.length === 0) {
    return [];
  }

  return documents.map((doc) => {
    // console.log("Document:", doc);
    const data = doc.data;
    const fields = [
      {
        key: 'Categorie_Number',
        value: doc.number || '',
        name: 'Numéro de la catégorie',
      },
      {
        key: 'Date de début',
        value: data.Categorie_DateDebut || '',
        name: 'Date de début',
      },
      {
        key: 'Date de fin',
        value: data.Categorie_DateFin || '',
        name: 'Date de fin',
      },
      {
        key: 'Categorie_StatMission',
        value: data.Categorie_StatMission || '',
        name: 'Catégorie statistique des missions',
      },
      ...(data.Categorie_StatMissionTPMR
        ? [
            {
              key: 'Categorie_StatMissionTPMR',
              value: data.Categorie_StatMissionTPMR,
              name: 'Catégorie statistique des missions TPMR (si différente)',
            },
          ]
        : []),
      {
        key: 'Categorie_StatFacture',
        value: data.Categorie_StatFacture || '',
        name: 'Catégorie statistique des factures',
      },
      {
        key: 'Categorie_Priorite',
        value: data.Categorie_Priorite || '',
        name: 'Niveau de priorité',
      },
    ];
    return { title: data.Categorie_Nom, fields };
  });
};

const sortSuggestionsByPriority = (suggestions) => {
  const priorityOrder = ['0', '1', '2', '3', '4', '5'];
  const priorityIndex = new Map(priorityOrder.map((priority, index) => [priority, index]));

  return [...suggestions].sort((a, b) => {
    const aPriority = String(
      a?.fields?.find((field) => field.key === 'Categorie_Priorite')?.value ?? ''
    );
    const bPriority = String(
      b?.fields?.find((field) => field.key === 'Categorie_Priorite')?.value ?? ''
    );

    const aRank = priorityIndex.has(aPriority)
      ? priorityIndex.get(aPriority)
      : Number.MAX_SAFE_INTEGER;
    const bRank = priorityIndex.has(bPriority)
      ? priorityIndex.get(bPriority)
      : Number.MAX_SAFE_INTEGER;

    return bRank - aRank;
  });
};

async function main() {
  const debutValidite = docData?.CE_DébutDeValidité;
  const finValidite = docData?.CE_FinDeValidité;
  const input = docData?.Catégorie || '';

  // console.log("Input value:", input);

  const filters = [
    {
      key: 'FORMLAYOUTNAME',
      operator: 'EQUALS',
      value: 'Catégorie',
      type: 'TEXT',
    },
    {
      key: 'Categorie_Nom',
      operator: 'CONTAINS',
      value: input,
      type: 'TEXT',
    },
    {
      key: 'STATUS',
      operator: 'EQUALS',
      value: 'Enregistré',
      type: 'TEXT',
    },
    ...(debutValidite
      ? [
          {
            key: 'Categorie_DateDebut',
            operator: 'BETWEEN',
            value: `2000-01-01|${debutValidite || new Date().toISOString().split('T')[0]}`,
            type: 'DATE',
          },
        ]
      : []),
    ...(finValidite
      ? [
          {
            key: 'Categorie_DateFin',
            operator: 'BETWEEN',
            value: `${finValidite || new Date().toISOString().split('T')[0]}|2199-12-31`,
            type: 'DATE',
          },
        ]
      : []),
  ];

  // console.log("Filters for fetching documents:", filters);
  const documents = await getDocuments(filters);
  // console.log("Fetched documents:", documents);
  const suggestions = sortSuggestionsByPriority(buildSuggestions(documents));

  // console.log("Suggestions:", suggestions);

  callback({
    suggestions: {
      Catégorie: suggestions,
    },
  });
}

main();
"
"// console.log("Function search tarifs", context);

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    // console.error("Failed to fetch document IDs:", error);
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
    // console.error("Failed to fetch documents:", error);
    return [];
  }
};

const getDocuments = async (apiFilters) => {
  const documentIDs = await getDocumentIDsByFilters(apiFilters);
  if (documentIDs.length === 0) {
    return [];
  }

  const documents = await getDocumentsByIDs(documentIDs);
  return documents.map((doc) => {
    doc.data = JSON.parse(doc.data);
    return doc;
  });
};

const buildSuggestions = (documents) => {
  if (!documents || documents.length === 0) {
    return [];
  }

  return documents.map((doc) => {
    // console.log("Document:", doc);
    const data = doc.data;
    const fields = [
      {
        key: "Tarif_Number",
        value: doc.number || "",
        name: "Numéro du tarif",
      },
      {
        key: "Tarif_Priorite",
        value: data.Tarif_Priorite || "",
        name: "Niveau de priorité",
      },
      {
        key: "Date de début",
        value: data.CE_DébutDeValidité || "",
        name: "Date de début",
      },
      {
        key: "Date de fin",
        value: data.CE_FinDeValidité || "",
        name: "Date de fin",
      },
      {
        key: "CalculPrix_PrixParKmEuro",
        value: data.CalculPrix_PrixParKmEuro || "",
        name: "Prix par km en euros",
      },
      {
        key: "CalculPrix_CalculKilomètrage",
        value: data.CalculPrix_CalculKilomètrage || "",
        name: "Calcul du kilométrage",
      },
      {
        key: "CalculPrix_PrixForfaitPriseEnChargeEuro",
        value: data.CalculPrix_PrixForfaitPriseEnChargeEuro || "",
        name: "Prix du forfait de prise en charge en euros",
      },
      {
        key: "CalculPrix_NbKMCouvertForfaitPriseEnCharge",
        value: data.CalculPrix_NbKMCouvertForfaitPriseEnCharge || "",
        name: "Nombre de km couverts par le forfait de prise en charge",
      },
      {
        key: "CalculPrix_PrixMiniEuro",
        value: data.CalculPrix_PrixMiniEuro || "",
        name: "Prix minimum en euros",
      },
    ];
    return { title: data.CE_CatégorieMission, fields };
  });
};

const sortSuggestionsByPriority = (suggestions) => {
  const priorityOrder = ["0", "1", "2", "3", "4", "5"];
  const priorityIndex = new Map(
    priorityOrder.map((priority, index) => [priority, index]),
  );

  return [...suggestions].sort((a, b) => {
    const aPriority = String(
      a?.fields?.find((field) => field.key === "Tarif_Priorite")?.value ?? "",
    );
    const bPriority = String(
      b?.fields?.find((field) => field.key === "Tarif_Priorite")?.value ?? "",
    );

    const aRank = priorityIndex.has(aPriority)
      ? priorityIndex.get(aPriority)
      : Number.MAX_SAFE_INTEGER;
    const bRank = priorityIndex.has(bPriority)
      ? priorityIndex.get(bPriority)
      : Number.MAX_SAFE_INTEGER;

    return bRank - aRank;
  });
};

async function main() {
  const debutValidite = docData?.Planification_Date;
  const finValidite = docData?.Planification_DateFin;
  const categorie = docData?.Catégorie;
  const input = docData?.[inputKey] || "";

  // console.log("Input value:", input);

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Tarif",
      type: "TEXT",
    },
    {
      key: "CE_CatégorieMission",
      operator: "CONTAINS",
      value: input,
      type: "TEXT",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Enregistré",
      type: "TEXT",
    },
    {
      key: "CE_DébutDeValidité",
      operator: "BETWEEN",
      value: `0001-01-01|${debutValidite}`,
      type: "DATE",
    },
    ...(categorie
      ? [
          {
            key: "Catégorie",
            operator: "EQUALS",
            value: `${categorie}`,
            type: "TEXT",
          },
        ]
      : []),
    ...(finValidite
      ? [
          {
            key: "CE_FinDeValidité",
            operator: "BETWEEN",
            value: `${finValidite}|9999-12-31`,
            type: "DATE",
          },
        ]
      : []),
  ];

  // console.log("Filters for fetching documents:", filters);
  const documents = await getDocuments(filters);
  // console.log("Fetched documents:", documents);
  const suggestions = sortSuggestionsByPriority(buildSuggestions(documents));

  // console.log("Suggestions:", suggestions);

  callback({
    suggestions: {
      [inputKey]: suggestions,
    },
  });
}

main();
"
"const saveDocument = async (document) => {
  const isUpdate = !!document.documentID;
  const method = isUpdate ? "put" : "post";

  try {
    const response = await api({ local: true })[method]("document", {
      document,
    });
    return response?.data?.document || response?.data;
  } catch (error) {
    console.error(
      `Failed to ${isUpdate ? "update" : "create"} document:`,
      error,
    );
    throw error;
  }
};

const main = async () => {
  const isNotValid = await isValidDocument(t, docData);
  if (!isNotValid) {
    try {
      const document = {
        data: JSON.stringify(docData),
        status: "Enregistré",
        active: true,
        template: { templateId: docData.FORMLAYOUTID },
        ...(docData.STATUS !== "Draft" && { documentID: docData.FORMID }),
      };

      const savedDocument = await saveDocument(document);
      //console.log("Document saved successfully:", savedDocument);
      const area = window.location.pathname.split("/").filter(Boolean)[0];
      //console.log(`Redirecting to /${area}/véhicules/${savedDocument.id}`);
      window.location.href = `/${area}/véhicules/${savedDocument.id}`;
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  }
};

main();
"
"const ARCHIVE_DATE_FIELD = "VehiculeArchivage";
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
"
"const defaultButtons = {
  BatchVehiculeReactiver: null,
  Batch_Véhicule_Archivé: null,
  Batch_Véhicule_Enregistré: null,
};

const statusButtons = {
  Draft: { Batch_Véhicule_Enregistré: true },
  Enregistré: {
    Batch_Véhicule_Archivé: true,
    Batch_Véhicule_Enregistré: true,
  },
  Archivé: { BatchVehiculeReactiver: true },
};

return {
  ...defaultButtons,
  ...(statusButtons[docData.STATUS] ?? {}),
};
