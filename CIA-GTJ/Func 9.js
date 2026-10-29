console.log("function 9", context);

const DEMANDE_TEMPLATE_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
const TRANSPORT_TEMPLATE_ID = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";
const STATUS_KEY = "En traitement";

/* helpers */

//SORRY FOR THAT
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
    label.htmlFor = key;

    const labelText = document.createElement("span");
    labelText.textContent = name || key;

    label.appendChild(labelText);

    if (required) {
      const asterisk = document.createElement("span");
      asterisk.textContent = " *";
      asterisk.className = "required-asterisk";
      label.appendChild(asterisk);
    }

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
        if (defaultValue !== undefined) input.value = defaultValue;
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

  .popup-input label .required-asterisk {
    color: red;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .popup-input input,
    .popup-input select {
        width: 100%;
    }
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

const buildJSDate = (date, heure) => {
  const d = String(date || "").trim();
  const h = String(heure || "").trim();

  if (!d) return null;

  const [year, month, day] = d.split("-").map(Number);
  const [hh = "00", mm = "00"] = h.split(":");

  const result = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    Number(hh),
    Number(mm),
    0,
    0,
  );

  return isNaN(result.getTime()) ? null : result;
};

const toNumber = (v) => {
  const n = parseFloat(String(v || "0").replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const getDistanceTotale = (data) => {
  return (
    toNumber(data?.Demande_TrajetAller) + toNumber(data?.Demande_TrajetRetour)
  );
};

const buildUsagerComplet = (localDocData) => {
  const nom = String(
    localDocData?.Demande_IdentificationIdentficationUsagerNom || "",
  ).trim();
  const prenom = String(
    localDocData?.Demande_IdentificationIdentficationUsagerPrénom || "",
  ).trim();
  const age = String(
    localDocData?.Demande_IdentificationIdentficationUsagerÂge || "",
  ).trim();
  const dossier = String(
    localDocData?.Demande_IdentificationIdentficationUsagerNuméroDossierPIJ ||
      "",
  ).trim();

  if (nom && prenom && age && dossier) {
    return `${nom}, ${prenom} (${age}), #${dossier}`;
  }
  if (nom && prenom && age) {
    return `${nom}, ${prenom} (${age})`;
  }
  if (nom && prenom) {
    return `${nom}, ${prenom}`;
  }
  return nom || prenom || "";
};

const buildDepartAller = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeAllerD_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeAllerD_Adresse || "").trim();
  const ville = String(localDocData?.DemandeAllerD_Ville || "").trim();
  const telephone = String(localDocData?.DemandeAllerD_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const buildDestinationAller = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeAllerA_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeAllerA_Adresse || "").trim();
  const ville = String(localDocData?.DemandeAllerA_Ville || "").trim();
  const telephone = String(localDocData?.DemandeAllerA_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const buildDepartRetour = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeRetourD_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeRetourD_Adresse || "").trim();
  const ville = String(localDocData?.DemandeRetourD_Ville || "").trim();
  const telephone = String(localDocData?.DemandeRetourD_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const buildDestinationRetour = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeRetourA_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeRetourA_Adresse || "").trim();
  const ville = String(localDocData?.DemandeRetourA_Ville || "").trim();
  const telephone = String(localDocData?.DemandeRetourA_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }
  return nomLieu || "";
};

const isSameDay = (date) => {
  if (!date) return false;

  const [year, month, day] = String(date).split("-").map(Number);
  const d = new Date(year, (month || 1) - 1, day || 1);
  const now = new Date();

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const isWithinNext72Hours = (date, heure) => {
  if (isSameDay(date)) return true;

  const target = buildJSDate(date, heure);
  if (!target) return false;

  const diffHours = (target.getTime() - Date.now()) / 36e5;
  return diffHours >= 0 && diffHours <= 72;
};

const askRaisonHorsDelai = () =>
  new Promise((resolve, reject) => {
    showCustomPopup({
      title: "Demande hors délai",
      commentHTML: `
        La date de départ est dans 72 heures ou moins.
        <br/>Veuillez remplir le champ <b>Raison du hors délai</b>
        <br/>et communiquer avec le service de transport pour continuer.
      `,
      fields: [
        {
          key: "Transport_RaisonHorsDelai",
          name: "Raison du hors délai",
          type: "textarea",
          style: "width: 100%; min-height: 90px;",
          defaultValue: "",
          required: "true",
        },
      ],
      buttons: [
        {
          name: "Annuler",
          backgroundColor: "#f1f1f1",
          color: "#1e1e1e",
          onClick: () => reject(new Error("Action annulée.")),
        },
        {
          name: "Continuer",
          backgroundColor: "#1C5420",
          color: "#f1f1f1",
          onClick: (values) => {
            const reason = String(
              values?.Transport_RaisonHorsDelai || "",
            ).trim();

            if (!reason) {
              return reject(new Error("Transport_RaisonHorsDelai est requis."));
            }

            resolve(reason);
          },
        },
      ],
    });
  });

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const createDocument = async (templateId, dataObj, statusOverride) => {
  const response = await api({ local: true }).post("document", {
    document: {
      data: JSON.stringify(dataObj),
      status: statusOverride || STATUS_KEY,
      active: true,
      template: { templateId },
    },
    preventNotify: "FULL",
  });

  const id = response?.data?.id;
  const number = response?.data?.number ?? "";
  const status =
    response?.data?.status ??
    response?.data?.document?.status ??
    statusOverride ??
    STATUS_KEY;

  if (!id) throw new Error("Création échouée : id manquant.");
  return { id, number, status, raw: response?.data };
};

const updateDocumentMany = async (
  documentId,
  templateId,
  statusKey,
  dataObj,
) => {
  const documents = [
    {
      data: JSON.stringify(dataObj),
      status: statusKey,
      active: true,
      template: { templateId },
      documentID: documentId,
    },
  ];

  await api({ local: true }).put("document/Many", { documents });
};

const getDocumentData = async (documentId) => {
  const res = await api({ local: true }).get(`document/${documentId}`);
  const raw = res?.data?.data ?? res?.data?.document?.data ?? "{}";
  return safeParse(raw);
};

const buildDateTime = (date, heure) => {
  const d = String(date || "").trim();
  const h = String(heure || "").trim();
  if (!d || !h) return null;

  const [hh = "00", mm = "00"] = h.split(":");
  return `${d}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
};

const buildTransportPayload = (localDocData, kind) => {
  const intervenant = [
    localDocData?.Demande_IdentificationIdentificationPrénomIntervenant || "",
    localDocData?.Demande_IdentificationIdentificationNomIntervenant || "",
  ]
    .map((v) => String(v).trim())
    .filter(Boolean)
    .join(" ");

  const usagerComplet = buildUsagerComplet(localDocData);
  const isAller = kind === "Aller";
  const depart = isAller
    ? buildDepartAller(localDocData)
    : buildDepartRetour(localDocData);
  const destination = isAller
    ? buildDestinationAller(localDocData)
    : buildDestinationRetour(localDocData);

  const base = {
    ...localDocData,
    Transport_TypeTransport: kind,
    SectionCache_Intervenant: intervenant,
    Usager_Complet: usagerComplet,
  };

  if (isAller) {
    return {
      ...base,
      SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetAller || "",
      SectionCache_AdresseDepart: depart,
      SectionCache_AdresseDestination: destination,
      Demande_DateHeureDebut: buildDateTime(
        localDocData?.DemandeAllerD_Date,
        localDocData?.DemandeAllerD_Heure,
      ),
      Demande_DateHeureFin: buildDateTime(
        localDocData?.DemandeAllerA_Date,
        localDocData?.DemandeAllerA_Heure,
      ),
      Transport_DepartLatitude: localDocData?.Transport_Latitude || "",
      Transport_DepartLongitude: localDocData?.Transport_Longitude || "",
      Transport_DestinationLatitude:
        localDocData?.Transport_LatitudeAllerA || "",
      Transport_DestinationLongitude:
        localDocData?.Transport_LongitudeAllerA || "",
      FeuilleRoute_Depart: depart,
      FeuilleRoute_Destination: destination,
      FeuilleRoute_DepartAller: depart,
      FeuilleRoute_DestinationAller: destination,
    };
  }

  return {
    ...base,
    SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetRetour || "",
    SectionCache_AdresseDepart: depart,
    SectionCache_AdresseDestination: destination,
    Demande_DateHeureDebut: buildDateTime(
      localDocData?.DemandeRetourD_Date,
      localDocData?.DemandeRetourD_Heure,
    ),
    Demande_DateHeureFin: buildDateTime(
      localDocData?.DemandeRetourA_Date,
      localDocData?.DemandeRetourA_Heure,
    ),
    Transport_DepartLatitude: localDocData?.Transport_LatitudeRetourD || "",
    Transport_DepartLongitude: localDocData?.Transport_LongitudeRetourD || "",
    Transport_DestinationLatitude:
      localDocData?.Transport_LatitudeRetourA || "",
    Transport_DestinationLongitude:
      localDocData?.Transport_LongitudeRetourA || "",
    FeuilleRoute_Depart: depart,
    FeuilleRoute_Destination: destination,
    FeuilleRoute_DepartRetour: depart,
    FeuilleRoute_DestinationRetour: destination,
  };
};

const getErreurRecurrence = (localDocData) => {
  const frequence = String(
    localDocData?.Demande_Transport_FréquenceRécurrence || "",
  ).trim();

  if (frequence === "Hebdomadaire") {
    const jours = String(localDocData?.Demande_JourneesApplicables || "").trim();
    const dateDebut = String(
      localDocData?.Demande_DateDebutRecurrences || "",
    ).trim();
    const dateFin = String(localDocData?.Demande_DateFinRecurrences || "").trim();

    if (!jours) return "Choisissez au moins un jour pour la récurrence.";
    if (!dateDebut || !dateFin) {
      return "Indiquez la date de début et la date de fin de la récurrence.";
    }
    if (dateFin < dateDebut) {
      return "La date de fin de la récurrence doit être après la date de début.";
    }
    return null;
  }

  if (frequence === "Variable") {
    const dates = String(localDocData?.Demande_DatesRecurrences || "")
      .split("|")
      .filter(Boolean);

    if (dates.length === 0) return "Choisissez au moins une date pour la récurrence.";
    return null;
  }

  return "Choisissez la fréquence de la récurrence.";
};

/* main */

const createDemandeAndTransport = async () => {
  try {
    showPopupLoading("Création…");

    const avecRecurrence =
      String(docData?.Transport_AvecRecurrence || "")
        .trim()
        .toLowerCase() === "true";

    if (avecRecurrence) {
      const heuresParType = {
        Aller: ["DemandeAllerD_Heure", "DemandeAllerA_Heure"],
        Retour: ["DemandeRetourD_Heure", "DemandeRetourA_Heure"],
        "Aller/Retour": [
          "DemandeAllerD_Heure",
          "DemandeAllerA_Heure",
          "DemandeRetourD_Heure",
          "DemandeRetourA_Heure",
        ],
      };

      const heuresAVerifier =
        heuresParType[String(docData?.Transport_TypeTransport || "").trim()];

      if (!heuresAVerifier) {
        hidePopupLoading();
        showErrorBanner("Type de transport invalide.");
        return;
      }

      if (
        heuresAVerifier.some(
          (key) => docData?.[key] === undefined || docData?.[key] === "",
        )
      ) {
        hidePopupLoading();
        showErrorBanner("Heure de départ/arrivée incomplète.");
        return;
      }

      const erreurRecurrence = getErreurRecurrence(docData);

      if (erreurRecurrence) {
        hidePopupLoading();
        showErrorBanner(erreurRecurrence);
        return;
      }
    } else {
      const typeTransport = String(
        docData?.Transport_TypeTransport || "",
      ).trim();

      const champsParType = {
        Aller: [
          "DemandeAllerD_Date",
          "DemandeAllerD_Heure",
          "DemandeAllerA_Date",
          "DemandeAllerA_Heure",
        ],
        Retour: [
          "DemandeRetourD_Date",
          "DemandeRetourD_Heure",
          "DemandeRetourA_Date",
          "DemandeRetourA_Heure",
        ],
        "Aller/Retour": [
          "DemandeAllerD_Date",
          "DemandeAllerD_Heure",
          "DemandeAllerA_Date",
          "DemandeAllerA_Heure",
          "DemandeRetourD_Date",
          "DemandeRetourD_Heure",
          "DemandeRetourA_Date",
          "DemandeRetourA_Heure",
        ],
      };

      const nomsChampsUtilisateur = {
        DemandeAllerD_Date: "Date de départ de l'aller",
        DemandeAllerD_Heure: "Heure de départ de l'aller",
        DemandeAllerA_Date: "Date d'arrivée de l'aller",
        DemandeAllerA_Heure: "Heure d'arrivée de l'aller",

        DemandeRetourD_Date: "Date de départ du retour",
        DemandeRetourD_Heure: "Heure de départ du retour",
        DemandeRetourA_Date: "Date d'arrivée du retour",
        DemandeRetourA_Heure: "Heure d'arrivée du retour",
      };

      const champsAVerifier = champsParType[typeTransport];

      if (!champsAVerifier) {
        hidePopupLoading();
        showErrorBanner("Type de transport invalide.");
        return;
      }

      const champsVides = champsAVerifier.filter((key) => {
        const value = docData?.[key];
        return value === undefined || value === "";
      });

      const champsVidesLisibles = champsVides.map(
        (key) => nomsChampsUtilisateur[key] || key,
      );

      if (champsVides.length > 0) {
        console.log("Champs techniques vides :", champsVides);
        console.log("Champs utilisateur vides :", champsVidesLisibles);

        hidePopupLoading();
        showErrorBanner(
          `Champs manquants : ${champsVidesLisibles.join(", ")}.`,
        );
        return;
      }
    }

    const localDocData = {
      ...docData,
      Demande_DateHeureDebut:
        !avecRecurrence &&
        docData.DemandeAllerD_Date &&
        docData.DemandeAllerD_Heure
          ? docData.DemandeAllerD_Date + "T" + docData.DemandeAllerD_Heure
          : "",

      Demande_DateHeureFin:
        !avecRecurrence &&
        docData.DemandeAllerA_Date &&
        docData.DemandeAllerA_Heure
          ? docData.DemandeAllerA_Date + "T" + docData.DemandeAllerA_Heure
          : "",

      Demande_DistanceTotale: getDistanceTotale(docData),
    };

    if (avecRecurrence) {
      console.log("[Récurrence] Début du mode récurrence");

      const type = String(localDocData?.Transport_TypeTransport || "").trim();
      const frequence = String(
        localDocData?.Demande_Transport_FréquenceRécurrence || "",
      ).trim();
      console.log("[Récurrence] type:", type);
      console.log("[Récurrence] fréquence:", frequence);

      let dateDebut = null;
      let dateFin = null;

      if (frequence === "Variable") {
        const dates = String(localDocData?.Demande_DatesRecurrences || "")
          .split("|")
          .filter(Boolean)
          .sort();

        console.log("[Récurrence] Dates variables:", dates);

        if (dates.length > 0) {
          dateDebut = dates[0];
          dateFin = dates[dates.length - 1];
        }
      } else if (frequence === "Hebdomadaire") {
        dateDebut = String(
          localDocData?.Demande_DateDebutRecurrences || "",
        ).trim();
        dateFin = String(localDocData?.Demande_DateFinRecurrences || "").trim();

        console.log(
          "[Récurrence] Jours applicables:",
          localDocData?.Demande_JourneesApplicables,
        );
      }

      console.log("[Récurrence] dateDebut:", dateDebut, "dateFin:", dateFin);

      let heureDebut = null;
      let heureFin = null;

      if (type === "Aller") {
        heureDebut = localDocData?.DemandeAllerD_Heure;
        heureFin = localDocData?.DemandeAllerA_Heure;
      } else if (type === "Retour") {
        heureDebut = localDocData?.DemandeRetourD_Heure;
        heureFin = localDocData?.DemandeRetourA_Heure;
      } else if (type === "Aller/Retour") {
        heureDebut = localDocData?.DemandeAllerD_Heure;
        heureFin = localDocData?.DemandeRetourA_Heure;
      }

      console.log(
        "[Récurrence] heureDebut:",
        heureDebut,
        "heureFin:",
        heureFin,
      );

      const dateHeureDebut = buildDateTime(dateDebut, heureDebut);
      const dateHeureFin = buildDateTime(dateFin, heureFin);

      console.log("[Récurrence] dateHeureDebut:", dateHeureDebut);
      console.log("[Récurrence] dateHeureFin:", dateHeureFin);

      const demandeResult = await createDocument(
        DEMANDE_TEMPLATE_ID,
        {
          ...localDocData,
          Demande_IDTransportAller: "",
          Demande_IDTransportRetour: "",
          Demande_StatutTransportAller: "",
          Demande_StatutTransportRetour: "",
          Demande_DateDeCreation: new Date().toISOString().split(".")[0],
          Demande_DateHeureDebut: dateHeureDebut,
          Demande_DateHeureFin: dateHeureFin,
          Demande_Transport_Exception: "",
          Demande_DistanceTotale: getDistanceTotale(localDocData),
        },
        "Principal",
      );
      console.log("[Récurrence] Demande créée:", demandeResult);

      const idDemande = demandeResult.id;
      console.log("[Récurrence] idDemande:", idDemande);

      await updateDocumentMany(idDemande, DEMANDE_TEMPLATE_ID, "Principal", {
        ...localDocData,
        Demande_DateHeureDebut: dateHeureDebut,
        Demande_DateHeureFin: dateHeureFin,
        Demande_Transport_Exception: "",
        Demande_DistanceTotale: getDistanceTotale(localDocData),
      });

      console.log(
        "[Récurrence] updateDocumentMany terminé pour idDemande:",
        idDemande,
      );

      hidePopupLoading();
      console.log("[Récurrence] Fin du mode récurrence — succès");
      showSuccessBanner(`Récurrence #${demandeResult.number} créée avec succès.`);

      // Comme CIA-GTU : laisser le temps de lire le message avant de quitter la page.
      setTimeout(() => {
        window.location.href = "/demandes/Demandes_DonneesPrincipales";
      }, 2000);
      return;
    }

    let demandeStatus = STATUS_KEY;

    const type = String(localDocData?.Transport_TypeTransport || "").trim();

    let isHorsDelai = false;

    if (type === "Aller") {
      isHorsDelai = isWithinNext72Hours(
        localDocData?.DemandeAllerD_Date,
        localDocData?.DemandeAllerD_Heure,
      );
    } else if (type === "Retour") {
      isHorsDelai = isWithinNext72Hours(
        localDocData?.DemandeRetourD_Date,
        localDocData?.DemandeRetourD_Heure,
      );
    } else if (type === "Aller/Retour") {
      isHorsDelai =
        isWithinNext72Hours(
          localDocData?.DemandeAllerD_Date,
          localDocData?.DemandeAllerD_Heure,
        ) ||
        isWithinNext72Hours(
          localDocData?.DemandeRetourD_Date,
          localDocData?.DemandeRetourD_Heure,
        );
    } else {
      throw new Error("Transport_TypeTransport invalide");
    }

    const hasRaisonHorsDelai = !!String(
      docData?.Transport_RaisonHorsDelai ??
        localDocData?.Transport_RaisonHorsDelai ??
        "",
    ).trim();

    if (isHorsDelai) {
      if (hasRaisonHorsDelai) {
        console.log(
          "func9 trigger inside: on a deja un raison hors delai pas beosin ask",
        );
        demandeStatus = "En attente d'approbation";
        localDocData.Transport_RaisonHorsDelai =
          docData.Transport_RaisonHorsDelai;
      } else {
        localDocData.Transport_RaisonHorsDelai = await askRaisonHorsDelai();
        demandeStatus = "En attente d'approbation";
      }
    }

    let idTransportAller = "";
    let idTransportRetour = "";

    let payloadAller = null;
    let payloadRetour = null;

    // Hors délai : les transports sont créés à l'approbation (Func 102).
    const typeTransportACreer = isHorsDelai ? "" : type;

    if (typeTransportACreer === "Aller") {
      payloadAller = buildTransportPayload(localDocData, "Aller");
      const resAller = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadAller,
      );
      idTransportAller = resAller.id;
    } else if (typeTransportACreer === "Retour") {
      payloadRetour = buildTransportPayload(localDocData, "Retour");
      const resRetour = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadRetour,
      );
      idTransportRetour = resRetour.id;
    } else if (typeTransportACreer === "Aller/Retour") {
      payloadAller = buildTransportPayload(localDocData, "Aller");
      const resAller = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadAller,
      );
      idTransportAller = resAller.id;

      payloadRetour = buildTransportPayload(localDocData, "Retour");
      const resRetour = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadRetour,
      );
      idTransportRetour = resRetour.id;
    }

    const demandeResult = await createDocument(
      DEMANDE_TEMPLATE_ID,
      {
        ...localDocData,
        Demande_IDTransportAller: idTransportAller,
        Demande_IDTransportRetour: idTransportRetour,
        Demande_StatutTransportAller: idTransportAller ? "Soumis" : "",
        Demande_StatutTransportRetour: idTransportRetour ? "Soumis" : "",
        Demande_DateDeCreation: new Date().toISOString().split(".")[0],
        Demande_DistanceTotale: getDistanceTotale(localDocData),
      },
      demandeStatus,
    );

    const idDemande = demandeResult.id;
    const demandeNumber = demandeResult.number;

    if (!demandeNumber) {
      throw new Error(
        "Le NUMBER de la demande n'est pas renvoyé par l'API à la création.",
      );
    }

    if (idTransportAller) {
      const base = payloadAller || buildTransportPayload(localDocData, "Aller");
      await updateDocumentMany(
        idTransportAller,
        TRANSPORT_TEMPLATE_ID,
        STATUS_KEY,
        {
          ...base,
          Transport_IDDemande: idDemande,
          Transport_Nombre: demandeNumber,
        },
      );
    }

    if (idTransportRetour) {
      const base =
        payloadRetour || buildTransportPayload(localDocData, "Retour");
      await updateDocumentMany(
        idTransportRetour,
        TRANSPORT_TEMPLATE_ID,
        STATUS_KEY,
        {
          ...base,
          Transport_IDDemande: idDemande,
          Transport_Nombre: demandeNumber,
        },
      );
    }

    hidePopupLoading();
    if (demandeResult?.id) {
      showSuccessBanner("Création réussie.");

      const isTransportSecuritaire =
        String(localDocData?.Transport_TransportSecuritaire || "")
          .trim()
          .toLowerCase() === "true";

      window.location.href = isTransportSecuritaire
        ? "/demandes/Demandes_DonneesSecurisees"
        : "/demandes";
    } else {
      throw new Error("Création échouée : id manquant.");
    }
  } catch (err) {
    hidePopupLoading();
    showErrorBanner(err?.message || "Erreur lors de la création.");
  }
};

return createDemandeAndTransport();
