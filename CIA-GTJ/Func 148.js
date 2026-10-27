console.log("Function 148", context);

const showCustomPopup = (params) => {
  const { title, commentHTML, fields, buttons } = params;
  const fieldElements = {};
  const customFieldControllers = {};

  const pad2 = (value) => String(value).padStart(2, "0");
  const toISODate = (date) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  const toDisplayDate = (date) =>
    `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  const parseISODate = (value) => {
    if (!value || typeof value !== "string") return null;
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };
  const parseDateValue = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    const iso = parseISODate(trimmed);
    if (iso) return iso;
    const frMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!frMatch) return null;
    const day = Number(frMatch[1]);
    const month = Number(frMatch[2]);
    const year = Number(frMatch[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };
  const monthLabelFormatter = new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  });
  const monthOnlyFormatter = new Intl.DateTimeFormat("fr-FR", {
    month: "short",
  });
  const weekdayTokenToIndex = {
    dimanche: 0,
    dim: 0,
    lun: 1,
    lundi: 1,
    mar: 2,
    mardi: 2,
    mer: 3,
    mercredi: 3,
    jeu: 4,
    jeudi: 4,
    ven: 5,
    vendredi: 5,
    sam: 6,
    samedi: 6,
  };

  const normalizeWeekdayToken = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\./g, "")
      .trim();

  const resolveAllowedWeekdays = (restrictedDays) => {
    if (
      restrictedDays === void 0 ||
      restrictedDays === null ||
      restrictedDays === ""
    ) {
      return null;
    }
    const rawValues = Array.isArray(restrictedDays)
      ? restrictedDays
      : [restrictedDays];
    const resolved = rawValues
      .map((value) => {
        if (typeof value === "number" && value >= 0 && value <= 6) {
          return value;
        }
        const normalized = normalizeWeekdayToken(value);
        return weekdayTokenToIndex[normalized];
      })
      .filter((value) => Number.isInteger(value));
    if (!resolved.length) return null;
    return new Set(resolved);
  };

  const yearBlockSize = 12;
  const weekdayLabels = [
    "lun.",
    "mar.",
    "mer.",
    "jeu.",
    "ven.",
    "sam.",
    "dim.",
  ];

  const setValue = (targetKey, newValue, notify = false) => {
    const customController = customFieldControllers[targetKey];
    if (customController) {
      customController.setValue(newValue, notify);
      return;
    }
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
        wrapper.classList.add("popup-date-wrapper");

        const dateControl = document.createElement("div");
        dateControl.className = "popup-date-control";

        const displayInput = document.createElement("input");
        displayInput.type = "text";
        displayInput.className = "popup-date-display";
        displayInput.placeholder = "JJ/MM/AAAA";
        displayInput.readOnly = true;

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "popup-date-toggle";
        toggleBtn.setAttribute("aria-label", "Ouvrir le calendrier");
        toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H5V10h14v9zm0-11H5V6h14v2z" />
          </svg>
        `;

        inputEl = document.createElement("input");
        inputEl.type = "date";
        inputEl.name = key;
        inputEl.id = key;
        inputEl.className = "popup-date-proxy";
        inputEl.tabIndex = -1;
        inputEl.setAttribute("aria-hidden", "true");

        if (style2) dateControl.style = style2;
        if (required) inputEl.required = true;
        if (min) inputEl.min = min;
        if (max) inputEl.max = max;

        const calendarPanel = document.createElement("div");
        calendarPanel.className = "popup-calendar";

        const calendarHeader = document.createElement("div");
        calendarHeader.className = "popup-calendar-header";

        const prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "popup-calendar-nav";
        prevBtn.setAttribute("aria-label", "Mois précédent");
        prevBtn.textContent = "‹";

        const titleBtn = document.createElement("button");
        titleBtn.type = "button";
        titleBtn.className = "popup-calendar-title";

        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "popup-calendar-nav";
        nextBtn.setAttribute("aria-label", "Mois suivant");
        nextBtn.textContent = "›";

        calendarHeader.append(prevBtn, titleBtn, nextBtn);

        const weekRow = document.createElement("div");
        weekRow.className = "popup-calendar-weekdays";
        weekdayLabels.forEach((label) => {
          const day = document.createElement("span");
          day.textContent = label;
          weekRow.appendChild(day);
        });

        const calendarBody = document.createElement("div");
        calendarBody.className = "popup-calendar-body";

        calendarPanel.append(calendarHeader, weekRow, calendarBody);
        dateControl.append(displayInput, toggleBtn, inputEl);
        wrapper.append(fieldTitle, dateControl, calendarPanel);

        let selectedDate = parseDateValue(defaultValue);
        let viewDate = selectedDate
          ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        let calendarMode = "day";
        let yearBlockStart =
          Math.floor(viewDate.getFullYear() / yearBlockSize) * yearBlockSize;
        const minDate = parseISODate(min);
        const maxDate = parseISODate(max);
        const allowedWeekdays = resolveAllowedWeekdays(options?.restrictedDays);
        const todayIso = toISODate(new Date());
        const todayYear = new Date().getFullYear();
        const todayMonth = new Date().getMonth();

        const isDisabledDate = (date) => {
          const iso = toISODate(date);
          if (minDate && iso < toISODate(minDate)) return true;
          if (maxDate && iso > toISODate(maxDate)) return true;
          if (allowedWeekdays && !allowedWeekdays.has(date.getDay()))
            return true;
          return false;
        };

        const hasSelectableDateInMonth = (year, month) => {
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          for (let day = 1; day <= daysInMonth; day += 1) {
            const candidate = new Date(year, month, day);
            if (!isDisabledDate(candidate)) {
              return true;
            }
          }
          return false;
        };

        const isDisabledMonth = (year, month) =>
          !hasSelectableDateInMonth(year, month);

        const isDisabledYear = (year) => {
          for (let month = 0; month < 12; month += 1) {
            if (!isDisabledMonth(year, month)) {
              return false;
            }
          }
          return true;
        };

        const setPanelVisible = (visible) => {
          if (visible) {
            calendarPanel.classList.add("visible");
            wrapper.classList.add("calendar-open");
          } else {
            calendarPanel.classList.remove("visible");
            wrapper.classList.remove("calendar-open");
          }
        };

        const openCalendar = () => {
          calendarMode = "day";
          renderCalendar();
          setPanelVisible(true);
        };

        const syncDateValue = () => {
          const isoValue = selectedDate ? toISODate(selectedDate) : "";
          inputEl.value = isoValue;
          displayInput.value = selectedDate ? toDisplayDate(selectedDate) : "";
          if (required && !isoValue) {
            inputEl.setCustomValidity("Veuillez sélectionner une date.");
          } else {
            inputEl.setCustomValidity("");
          }
          if (isoValue) {
            wrapper.classList.remove("invalid");
          }
        };

        const renderDayView = () => {
          const month = viewDate.getMonth();
          const year = viewDate.getFullYear();
          titleBtn.textContent = monthLabelFormatter
            .format(viewDate)
            .toLowerCase();

          weekRow.classList.remove("hidden");
          calendarBody.className = "popup-calendar-body popup-calendar-days";
          calendarBody.innerHTML = "";
          const firstOfMonth = new Date(year, month, 1);
          const firstDay = (firstOfMonth.getDay() + 6) % 7;
          const gridStart = new Date(year, month, 1 - firstDay);

          for (let index = 0; index < 42; index += 1) {
            const cellDate = new Date(
              gridStart.getFullYear(),
              gridStart.getMonth(),
              gridStart.getDate() + index,
            );
            const cellIso = toISODate(cellDate);
            const dayBtn = document.createElement("button");
            dayBtn.type = "button";
            dayBtn.className = "popup-calendar-day";
            dayBtn.textContent = String(cellDate.getDate());
            dayBtn.setAttribute("data-date", cellIso);

            if (cellDate.getMonth() !== month) {
              dayBtn.classList.add("is-outside-month");
            }
            if (cellIso === todayIso) {
              dayBtn.classList.add("is-today");
            }
            if (selectedDate && cellIso === toISODate(selectedDate)) {
              dayBtn.classList.add("is-selected");
            }
            if (isDisabledDate(cellDate)) {
              dayBtn.classList.add("is-disabled");
              dayBtn.disabled = true;
            }

            dayBtn.addEventListener("click", () => {
              if (dayBtn.disabled) return;
              selectedDate = cellDate;
              viewDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1,
              );
              syncDateValue();
              renderCalendar();
              setPanelVisible(false);
              inputEl.dispatchEvent(new Event("change", { bubbles: true }));
            });

            calendarBody.appendChild(dayBtn);
          }
        };

        const renderMonthView = () => {
          const year = viewDate.getFullYear();
          titleBtn.textContent = String(year);

          weekRow.classList.add("hidden");
          calendarBody.className = "popup-calendar-body popup-calendar-months";
          calendarBody.innerHTML = "";

          for (let month = 0; month < 12; month += 1) {
            const monthBtn = document.createElement("button");
            monthBtn.type = "button";
            monthBtn.className = "popup-calendar-month-item";
            monthBtn.textContent = monthOnlyFormatter
              .format(new Date(year, month, 1))
              .toLowerCase();

            if (month === viewDate.getMonth()) {
              monthBtn.classList.add("is-active");
            }
            if (
              selectedDate &&
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() === month
            ) {
              monthBtn.classList.add("is-selected");
            }
            if (todayYear === year && todayMonth === month) {
              monthBtn.classList.add("is-today");
            }
            if (isDisabledMonth(year, month)) {
              monthBtn.classList.add("is-disabled");
              monthBtn.disabled = true;
            }

            monthBtn.addEventListener("click", () => {
              if (monthBtn.disabled) return;
              viewDate = new Date(viewDate.getFullYear(), month, 1);
              calendarMode = "day";
              renderDayView();
            });

            calendarBody.appendChild(monthBtn);
          }
        };

        const renderYearView = () => {
          const blockEnd = yearBlockStart + yearBlockSize - 1;
          titleBtn.textContent = `${yearBlockStart} - ${blockEnd}`;

          weekRow.classList.add("hidden");
          calendarBody.className = "popup-calendar-body popup-calendar-years";
          calendarBody.innerHTML = "";

          for (let year = yearBlockStart; year <= blockEnd; year += 1) {
            const yearBtn = document.createElement("button");
            yearBtn.type = "button";
            yearBtn.className = "popup-calendar-year-item";
            yearBtn.textContent = String(year);

            if (year === viewDate.getFullYear()) {
              yearBtn.classList.add("is-active");
            }
            if (selectedDate && selectedDate.getFullYear() === year) {
              yearBtn.classList.add("is-selected");
            }
            if (todayYear === year) {
              yearBtn.classList.add("is-today");
            }
            if (isDisabledYear(year)) {
              yearBtn.classList.add("is-disabled");
              yearBtn.disabled = true;
            }

            yearBtn.addEventListener("click", () => {
              if (yearBtn.disabled) return;
              viewDate = new Date(year, viewDate.getMonth(), 1);
              calendarMode = "month";
              renderMonthView();
            });

            calendarBody.appendChild(yearBtn);
          }
        };

        const renderCalendar = () => {
          if (calendarMode === "month") {
            renderMonthView();
            return;
          }
          if (calendarMode === "year") {
            renderYearView();
            return;
          }
          renderDayView();
        };

        const onPrevious = () => {
          if (calendarMode === "year") {
            yearBlockStart -= yearBlockSize;
          } else if (calendarMode === "month") {
            viewDate = new Date(
              viewDate.getFullYear() - 1,
              viewDate.getMonth(),
              1,
            );
          } else {
            viewDate = new Date(
              viewDate.getFullYear(),
              viewDate.getMonth() - 1,
              1,
            );
          }
          renderCalendar();
        };

        const onNext = () => {
          if (calendarMode === "year") {
            yearBlockStart += yearBlockSize;
          } else if (calendarMode === "month") {
            viewDate = new Date(
              viewDate.getFullYear() + 1,
              viewDate.getMonth(),
              1,
            );
          } else {
            viewDate = new Date(
              viewDate.getFullYear(),
              viewDate.getMonth() + 1,
              1,
            );
          }
          renderCalendar();
        };

        const setDateValue = (value, notify = false) => {
          const parsedDate = parseDateValue(value);
          if (parsedDate && !isDisabledDate(parsedDate)) {
            selectedDate = parsedDate;
            viewDate = new Date(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              1,
            );
            yearBlockStart =
              Math.floor(viewDate.getFullYear() / yearBlockSize) *
              yearBlockSize;
          } else if (!value) {
            selectedDate = null;
          }
          calendarMode = "day";
          syncDateValue();
          renderCalendar();
          if (notify) {
            inputEl.dispatchEvent(new Event("change", { bubbles: true }));
          }
        };

        prevBtn.addEventListener("click", onPrevious);
        nextBtn.addEventListener("click", onNext);
        titleBtn.addEventListener("click", () => {
          if (calendarMode === "day") {
            calendarMode = "month";
          } else if (calendarMode === "month") {
            calendarMode = "year";
            yearBlockStart =
              Math.floor(viewDate.getFullYear() / yearBlockSize) *
              yearBlockSize;
          } else {
            calendarMode = "month";
          }
          renderCalendar();
        });
        toggleBtn.addEventListener("click", () => {
          if (calendarPanel.classList.contains("visible")) {
            setPanelVisible(false);
            return;
          }
          openCalendar();
        });
        displayInput.addEventListener("click", () => {
          openCalendar();
        });

        document.addEventListener("click", (event) => {
          const path =
            typeof event.composedPath === "function"
              ? event.composedPath()
              : [];
          if (path.includes(wrapper)) {
            return;
          }
          if (wrapper.contains(event.target)) {
            return;
          }
          setPanelVisible(false);
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            setPanelVisible(false);
          }
        });

        customFieldControllers[key] = { setValue: setDateValue };
        setDateValue(defaultValue || "", false);
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

    .popup-date-wrapper {
      position: relative;
    }

    .popup-date-control {
      position: relative;
      display: flex;
      align-items: center;
    }

    .popup-date-display {
      width: 100%;
      background: #ffffff;
      cursor: pointer;
      padding-right: 38px;
    }

    .popup-date-toggle {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      width: 24px;
      height: 24px;
      padding: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #9aa0a6;
    }

    .popup-date-toggle svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .popup-date-control:focus-within .popup-date-display,
    .popup-date-wrapper.calendar-open .popup-date-display {
      border-color: #8db6e2;
      box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.15);
    }

    .popup-date-proxy {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
      border: 0;
      padding: 0;
      margin: 0;
    }

    .popup-calendar {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 280px;
      background: #ffffff;
      border: 1px solid #d2d2d2;
      border-radius: 0.375rem;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
      padding: 8px;
      z-index: 1100;
      display: none;
    }

    .popup-calendar.visible {
      display: block;
    }

    .popup-calendar-header {
      display: grid;
      grid-template-columns: 28px 1fr 28px;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .popup-calendar-title {
      border: none;
      cursor: pointer;
      text-align: center;
      background: #f1f2f4;
      border-radius: 0.35rem;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 6px 4px;
      text-transform: lowercase;
      color: #2f3136;
    }

    .popup-calendar-title:hover {
      background: #e8eaed;
    }

    .popup-calendar-nav {
      border: none;
      background: transparent;
      color: #2f3136;
      font-size: 1.3rem;
      line-height: 1;
      cursor: pointer;
      border-radius: 0.35rem;
      height: 28px;
    }

    .popup-calendar-nav:hover {
      background: #f3f4f6;
    }

    .popup-calendar-weekdays,
    .popup-calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }

    .popup-calendar-weekdays.hidden {
      display: none;
    }

    .popup-calendar-body {
      display: grid;
      gap: 4px;
    }

    .popup-calendar-weekdays {
      margin-bottom: 4px;
    }

    .popup-calendar-weekdays span {
      text-align: center;
      font-size: 0.95rem;
      color: #2f3136;
      padding: 4px 0;
    }

    .popup-calendar-day {
      border: none;
      background: transparent;
      border-radius: 0.35rem;
      min-height: 34px;
      cursor: pointer;
      font-size: 1rem;
      color: #1f2937;
    }

    .popup-calendar-day:hover {
      background: #eff3f8;
    }

    .popup-calendar-day.is-selected {
      background: #2f6fb3;
      color: #ffffff;
    }

    .popup-calendar-day.is-today:not(.is-selected) {
      box-shadow: inset 0 0 0 1px #2f6fb3;
    }

    .popup-calendar-day.is-outside-month {
      color: #c9c9c9;
    }

    .popup-calendar-day.is-disabled {
      color: #d5d5d5;
      cursor: not-allowed;
      background: transparent;
    }

    .popup-calendar-months,
    .popup-calendar-years {
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      padding: 6px 0;
    }

    .popup-calendar-month-item,
    .popup-calendar-year-item {
      border: none;
      background: transparent;
      border-radius: 0.35rem;
      min-height: 30px;
      cursor: pointer;
      color: #2f3136;
      font-size: 1.05rem;
      text-transform: lowercase;
    }

    .popup-calendar-month-item:hover,
    .popup-calendar-year-item:hover {
      background: #eff3f8;
    }

    .popup-calendar-month-item.is-active,
    .popup-calendar-year-item.is-active {
      box-shadow: inset 0 0 0 1px #2f6fb3;
    }

    .popup-calendar-month-item.is-selected,
    .popup-calendar-year-item.is-selected {
      background: #2f6fb3;
      color: #ffffff;
    }

    .popup-calendar-month-item.is-disabled,
    .popup-calendar-year-item.is-disabled {
      color: #d5d5d5;
      cursor: not-allowed;
      background: transparent;
      box-shadow: none;
    }

    .popup-input.invalid .popup-date-display {
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
        if (button.preset !== "cancel" && !popup.reportValidity()) {
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

async function appeln8n(payload) {
  const response = await fetch("http://localhost:5678/webhook/FeuilleDeRoute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `L'appel n8n a échoué (${response.status}): ${errorBody || "réponse vide"}`,
    );
  }

  return response;
}

async function main() {
  const shouldContinue = await new Promise((resolve) => {
    showCustomPopup({
      commentHTML: "Voulez-vous vraiment envoyer les feuilles de route?",
      buttons: [
        {
          name: "Annuler",
          preset: "cancel",
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

  if (!shouldContinue) return;

  const payload = [
    {
      daterange: store.pageStore.filterData.Demande_DateHeureDebut,
      transporteur: store.pageStore.filterData.Operation_NomDuTransporteur,
      action: "Envoyer",
    },
  ];

  console.log("Payload:", payload);

  try {
    const res = await appeln8n(payload);
    const n8nResponse = await res.json();
    console.log("Réponse n8n:", n8nResponse);
    if (!n8nResponse) {
      throw new Error("Réponse n8n invalide");
    }
    const files = Array.isArray(n8nResponse) ? n8nResponse : [n8nResponse];
    const fileUrls = files.map((item) => item.fileUrl).filter(Boolean);

    console.log("File URLs:", fileUrls);

    fileUrls.forEach((fileUrl) => {
      const fileName = decodeURIComponent(
        fileUrl.split("/").pop().split("?")[0],
      );
      const downloadLink = document.createElement("a");

      downloadLink.href = fileUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  } catch (error) {
    console.error("Erreur lors de l'appel n8n:", error);
  }
}

main();
