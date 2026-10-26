console.log("Fonction 274", context);

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
 
validateDates();