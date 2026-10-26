console.log("TPMR vehicle status popup started");

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
``