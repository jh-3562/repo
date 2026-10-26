// Vehicle identifier from the mission
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
``