console.log("Fonction 532", context);
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
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
                <div>${message}</div>
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
  }, 55);
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
  }, 55);
};
const hideExpirationWarningPopup = () => {
  const popup = document.getElementById("expirationWarningPopup");
  if (popup) popup.style.display = "none";
};
const showExpirationWarningPopup = (message) => {
  createOrUpdateElement(
    "expirationWarningPopup",
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
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: flex-start; max-width: 400px;">
        <div style="font-weight: bold;">Attention</div>
        <div style="margin-top: 10px; text-align: left;">${message}</div>
        <button id="expirationWarningPopupClose" style="margin-top: 20px; align-self: flex-end; padding: 8px 16px; border: none; border-radius: 4px; background-color: #1A73E8; color: white; cursor: pointer;">Confirmer</button>
      </div>
    `,
  );
  document
    .getElementById("expirationWarningPopupClose")
    .addEventListener("click", hideExpirationWarningPopup);
};
const formatDate = (date) => date.toLocaleDateString("fr-CA");

// Evite le décalage d'un jour causé par l'interprétation UTC des dates "YYYY-MM-DD"
const parseLocalDate = (value) => {
  if (!value) return new Date(NaN);
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(value);
};

const checkDateExpiration = (docData) => {
  const expiration = parseLocalDate(docData?.Date_expiration);
  if (isNaN(expiration)) return false;

  const typeRec = docData?.Dates_TypeRéc;

  if (typeRec === "Une seule fois" || typeRec === "Occurence") {
    const dateTransport = parseLocalDate(docData?.Dates_DateTransport);
    if (!isNaN(dateTransport) && dateTransport > expiration) {
      showExpirationWarningPopup(
        `La date de transport dépasse la date d'expiration.<br>Date de transport : <b>${formatDate(dateTransport)}</b><br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }
    return false;
  }

  if (typeRec === "Par jour spécifique") {
    // Dates_Multidates est une chaîne "YYYY-MM-DD|YYYY-MM-DD|..." et non un tableau
    const multidates = Array.isArray(docData?.Dates_Multidates)
      ? docData.Dates_Multidates
      : typeof docData?.Dates_Multidates === "string"
        ? docData.Dates_Multidates.split("|").filter(Boolean)
        : [];
    const expiredMultidates = multidates
      .map((date) => parseLocalDate(date))
      .filter((multidate) => !isNaN(multidate) && multidate > expiration);
    if (expiredMultidates.length === 1) {
      showExpirationWarningPopup(
        `Une date sélectionnée dépasse la date d'expiration.<br>Date sélectionnée : <b>${formatDate(expiredMultidates[0])}</b><br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }
    if (expiredMultidates.length === 2) {
      showExpirationWarningPopup(
        `Deux dates sélectionnées dépassent la date d'expiration.<br>Dates sélectionnées : <b>${formatDate(expiredMultidates[0])}</b> et <b>${formatDate(expiredMultidates[1])}</b><br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }
    if (expiredMultidates.length >= 3) {
      showExpirationWarningPopup(
        `${expiredMultidates.length} dates sélectionnées dépassent la date d'expiration.<br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }
    return false;
  }

  if (typeRec === "Par semaine" || typeRec === "Par mois") {
    const debutRec = parseLocalDate(docData?.Dates_DebutRec);
    const finRec = parseLocalDate(docData?.Dates_FinRec);
    const debutExpired = !isNaN(debutRec) && debutRec > expiration;
    const finExpired = !isNaN(finRec) && finRec > expiration;

    if (debutExpired && finExpired) {
      showExpirationWarningPopup(
        `Les dates de début et de fin de récurrence dépassent la date d'expiration.<br>Date de début de récurrence : <b>${formatDate(debutRec)}</b><br>Date de fin de récurrence : <b>${formatDate(finRec)}</b><br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }

    if (debutExpired) {
      showExpirationWarningPopup(
        `La date de début de récurrence dépasse la date d'expiration.<br>Date de début de récurrence : <b>${formatDate(debutRec)}</b><br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }

    if (finExpired) {
      showExpirationWarningPopup(
        `La date de fin de récurrence dépasse la date d'expiration.<br>Date de fin de récurrence : <b>${formatDate(finRec)}</b><br>Date d'expiration : <b>${formatDate(expiration)}</b>`,
      );
      return true;
    }

    return false;
  }

  return false;
};

checkDateExpiration(docData);
