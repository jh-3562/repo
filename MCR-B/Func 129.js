console.log("Function 129", context);

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
