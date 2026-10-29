console.log('fonction 132 - Recurrence script', context);

const DEMANDE_TEMPLATE_ID = '5d7b4e39-c50a-428c-87ec-e9b68ac45e39';
const TRANSPORT_TEMPLATE_ID = '017d9a14-b828-4cc5-8a9a-8906c1fcab59';
const STATUS_KEY = 'En traitement';

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

      case "date":
        input = document.createElement("input");
        input.type = "date";
        input.name = key;
        input.id = key;

        if (style) input.style = style;
        if (defaultValue) input.value = defaultValue; // format: YYYY-MM-DD
        if (required) input.required = true;
        if (min) input.min = min;
        if (max) input.max = max;

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
          if (el.type === "checkbox") {
            values[el.name] = el.checked;
            continue;
          }

          values[el.name] = el.value;
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

// ======================= Helper Functions ===============================

const fieldIsEmpty = (value) => {
  return value === undefined || value === '';
};

/**
 * Convertit les jours de la semaine en français (pipe-separated) en indices JS (0=Dimanche ... 6=Samedi).
 * @param {string} multiselectFieldValue ex: "Lundi|Mercredi|Vendredi"
 * @returns {number[]}
 */
const getFrenchWeekDayIndices = (multiselectFieldValue) => {
  const frenchDayIndexMapping = {
    Dimanche: 0,
    Lundi: 1,
    Mardi: 2,
    Mercredi: 3,
    Jeudi: 4,
    Vendredi: 5,
    Samedi: 6,
  };
  const result = [];
  const frenchDays = multiselectFieldValue.split('|');
  for (const frenchDay of frenchDays) {
    const trimmed = frenchDay.trim();
    if (trimmed in frenchDayIndexMapping) {
      result.push(frenchDayIndexMapping[trimmed]);
    } else {
      console.error(`"${trimmed}" est inconnu dans frenchDayIndexMapping`);
    }
  }
  return result;
};

const toNumber = (v) => {
  const n = parseFloat(String(v || '0').replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

const getDistanceTotale = (data) => {
  return (
    toNumber(data?.Demande_TrajetAller) + toNumber(data?.Demande_TrajetRetour)
  );
};

const buildDateTime = (date, heure) => {
  const d = String(date || '').trim();
  const h = String(heure || '').trim();
  if (!d || !h) return null;
  const [hh = '00', mm = '00'] = h.split(':');
  return `${d}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`;
};

// ======================= API Wrappers ==================================

const getDocumentsByIds = async (ids) => {
  const response = await api({ local: true }).post('document/id', { ids });
  if (response.status !== 200) {
    throw new Error('Erreur lors de document/id');
  }
  return response.data.documents;
};

const getDocuments = async (filters) => {
  const filterResponse = await api({ local: true }).post('document/id/filter', {
    filters,
  });
  if (filterResponse.status !== 200) {
    throw new Error('Erreur lors de document/id/filter');
  }
  return getDocumentsByIds(filterResponse.data.ids);
};

const getFormData = (document) => {
  if (typeof document.data === 'string') {
    return JSON.parse(document.data);
  }
  return document.data;
};

const getFormID = (document) => {
  return document.documentID;
};

const createDocument = async (templateId, dataObj, statusOverride) => {
  const response = await api({ local: true }).post('document', {
    document: {
      data: JSON.stringify(dataObj),
      status: statusOverride || STATUS_KEY,
      active: true,
      template: { templateId },
    },
    preventNotify: 'FULL',
  });
  const id = response?.data?.id;
  const number = response?.data?.number ?? '';
  const status =
    response?.data?.status ??
    response?.data?.document?.status ??
    statusOverride ??
    STATUS_KEY;
  if (!id) throw new Error('Création échouée : id manquant.');
  return { id, number, status, raw: response?.data };
};

const updateDocumentMany = async (documents) => {
  await api({ local: true }).put('document/Many', { documents });
};

// ======================= Transport Payload Builders ====================

const buildUsagerComplet = (data) => {
  const nom = String(
    data?.Demande_IdentificationIdentficationUsagerNom || '',
  ).trim();
  const prenom = String(
    data?.Demande_IdentificationIdentficationUsagerPrénom || '',
  ).trim();
  const age = String(
    data?.Demande_IdentificationIdentficationUsagerÂge || '',
  ).trim();
  const dossier = String(
    data?.Demande_IdentificationIdentficationUsagerNuméroDossierPIJ || '',
  ).trim();

  if (nom && prenom && age && dossier)
    return `${nom}, ${prenom} (${age}), #${dossier}`;
  if (nom && prenom && age) return `${nom}, ${prenom} (${age})`;
  if (nom && prenom) return `${nom}, ${prenom}`;
  return nom || prenom || '';
};

const buildAdresseComplet = (nomLieu, adresse, ville, telephone) => {
  nomLieu = String(nomLieu || '').trim();
  adresse = String(adresse || '').trim();
  ville = String(ville || '').trim();
  telephone = String(telephone || '').trim();

  if (nomLieu && adresse && ville && telephone)
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  if (nomLieu && adresse && ville) return `${nomLieu}, ${adresse} ${ville}`;
  if (nomLieu && adresse) return `${nomLieu}, ${adresse}`;
  return nomLieu || '';
};

const buildDepartAller = (d) =>
  buildAdresseComplet(
    d?.DemandeAllerD_NomDuLieu,
    d?.DemandeAllerD_Adresse,
    d?.DemandeAllerD_Ville,
    d?.DemandeAllerD_Telephone,
  );

const buildDestinationAller = (d) =>
  buildAdresseComplet(
    d?.DemandeAllerA_NomDuLieu,
    d?.DemandeAllerA_Adresse,
    d?.DemandeAllerA_Ville,
    d?.DemandeAllerA_Telephone,
  );

const buildDepartRetour = (d) =>
  buildAdresseComplet(
    d?.DemandeRetourD_NomDuLieu,
    d?.DemandeRetourD_Adresse,
    d?.DemandeRetourD_Ville,
    d?.DemandeRetourD_Telephone,
  );

const buildDestinationRetour = (d) =>
  buildAdresseComplet(
    d?.DemandeRetourA_NomDuLieu,
    d?.DemandeRetourA_Adresse,
    d?.DemandeRetourA_Ville,
    d?.DemandeRetourA_Telephone,
  );

const buildTransportPayload = (localDocData, kind) => {
  const intervenant = [
    localDocData?.Demande_IdentificationIdentificationPrénomIntervenant || '',
    localDocData?.Demande_IdentificationIdentificationNomIntervenant || '',
  ]
    .map((v) => String(v).trim())
    .filter(Boolean)
    .join(' ');

  const usagerComplet = buildUsagerComplet(localDocData);
  const isAller = kind === 'Aller';
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
      SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetAller || '',
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
      Transport_DepartLatitude: localDocData?.Transport_Latitude || '',
      Transport_DepartLongitude: localDocData?.Transport_Longitude || '',
      Transport_DestinationLatitude:
        localDocData?.Transport_LatitudeAllerA || '',
      Transport_DestinationLongitude:
        localDocData?.Transport_LongitudeAllerA || '',
      FeuilleRoute_Depart: depart,
      FeuilleRoute_Destination: destination,
      FeuilleRoute_DepartAller: depart,
      FeuilleRoute_DestinationAller: destination,
    };
  }

  return {
    ...base,
    SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetRetour || '',
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
    Transport_DepartLatitude: localDocData?.Transport_LatitudeRetourD || '',
    Transport_DepartLongitude: localDocData?.Transport_LongitudeRetourD || '',
    Transport_DestinationLatitude:
      localDocData?.Transport_LatitudeRetourA || '',
    Transport_DestinationLongitude:
      localDocData?.Transport_LongitudeRetourA || '',
    FeuilleRoute_Depart: depart,
    FeuilleRoute_Destination: destination,
    FeuilleRoute_DepartRetour: depart,
    FeuilleRoute_DestinationRetour: destination,
  };
};

// ======================= Recurrence Functions ===========================

/**
 * Calcule les dates d'occurrence pour une récurrence mère dans une fenêtre de dates.
 * @param {object} demandeData - Les données de la récurrence mère
 * @param {string[]} dateWindow - [dateDebut, dateFin] en format ISO (ex: ["2026-06-01", "2026-06-30"])
 * @returns {string[]} Tableau de dates ISO
 */
const getOccurrenceDates = (demandeData, dateWindow) => {
  const frequence = String(
    demandeData?.Demande_Transport_FréquenceRécurrence || '',
  ).trim();
  const result = [];

  switch (frequence) {
    case 'Variable': {
      const allDates = String(demandeData?.Demande_DatesRecurrences || '')
        .split('|')
        .map((d) => d.trim())
        .filter(Boolean);

      for (const date of allDates) {
        if (dateWindow[0] <= date && date <= dateWindow[1]) {
          result.push(date);
        }
      }
      break;
    }

    case 'Hebdomadaire': {
      const recurrenceStartDate = fieldIsEmpty(
        demandeData?.Demande_DateDebutRecurrences,
      )
        ? '0001-01-01'
        : demandeData.Demande_DateDebutRecurrences;

      const recurrenceEndDate = fieldIsEmpty(
        demandeData?.Demande_DateFinRecurrences,
      )
        ? '9999-01-01'
        : demandeData.Demande_DateFinRecurrences;

      if (fieldIsEmpty(demandeData?.Demande_JourneesApplicables)) {
        console.error(
          'Demande_JourneesApplicables est vide pour une récurrence hebdomadaire',
        );
        break;
      }

      const validWeekDays = getFrenchWeekDayIndices(
        demandeData.Demande_JourneesApplicables,
      );

      // Fenêtre effective = intersection de [recurrenceStart, recurrenceEnd] et dateWindow
      const effectiveStart =
        recurrenceStartDate > dateWindow[0]
          ? recurrenceStartDate
          : dateWindow[0];
      const effectiveEnd =
        recurrenceEndDate < dateWindow[1] ? recurrenceEndDate : dateWindow[1];

      let currentDate = new Date(effectiveStart + 'T00:00:00Z');
      const endDate = new Date(effectiveEnd + 'T00:00:00Z');

      while (currentDate <= endDate) {
        if (validWeekDays.includes(currentDate.getUTCDay())) {
          result.push(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      break;
    }

    default:
      console.error(
        `Fréquence "${frequence}" inconnue pour le calcul des occurrences`,
      );
  }

  return result;
};

/**
 * Filtre les dates en excluant celles déjà présentes dans le champ d'exceptions.
 * @param {string[]} dates - Tableau de dates ISO
 * @param {string} exceptionsField - Valeur du champ Demande_Transport_Exception (pipe-separated)
 * @returns {string[]}
 */
const filterExceptions = (dates, exceptionsField) => {
  if (fieldIsEmpty(exceptionsField)) return dates;

  const exceptions = exceptionsField
    .split('|')
    .map((d) => d.trim())
    .filter(Boolean);

  return dates.filter((date) => !exceptions.includes(date));
};

/**
 * Formate les données d'une occurrence-demande à partir de la récurrence mère et d'une date.
 * @param {object} recurrenceMereData - Données de la récurrence mère
 * @param {string} recurrenceMereId - documentID de la récurrence mère
 * @param {string} occurrenceDate - Date ISO de l'occurrence (ex: "2026-06-15")
 * @returns {object} Données formatées pour la nouvelle demande-occurrence
 */
const formatOccurrenceData = (
  recurrenceMereData,
  recurrenceMereId,
  occurrenceDate,
) => {
  const type = String(recurrenceMereData?.Transport_TypeTransport || '').trim();
  const occurrenceData = { ...recurrenceMereData };

  // Assigner les dates selon le type de transport
  if (type === 'Aller' || type === 'Aller/Retour') {
    occurrenceData.DemandeAllerD_Date = occurrenceDate;
    occurrenceData.DemandeAllerA_Date = occurrenceDate;
  }
  if (type === 'Retour' || type === 'Aller/Retour') {
    occurrenceData.DemandeRetourD_Date = occurrenceDate;
    occurrenceData.DemandeRetourA_Date = occurrenceDate;
  }

  // Calculer Demande_DateHeureDebut et Demande_DateHeureFin
  let heureDebut = null;
  let heureFin = null;

  if (type === 'Aller') {
    heureDebut = recurrenceMereData?.DemandeAllerD_Heure;
    heureFin = recurrenceMereData?.DemandeAllerA_Heure;
  } else if (type === 'Retour') {
    heureDebut = recurrenceMereData?.DemandeRetourD_Heure;
    heureFin = recurrenceMereData?.DemandeRetourA_Heure;
  } else if (type === 'Aller/Retour') {
    heureDebut = recurrenceMereData?.DemandeAllerD_Heure;
    heureFin = recurrenceMereData?.DemandeRetourA_Heure;
  }

  occurrenceData.Demande_DateHeureDebut = buildDateTime(
    occurrenceDate,
    heureDebut,
  );
  occurrenceData.Demande_DateHeureFin = buildDateTime(occurrenceDate, heureFin);

  // Lier à la récurrence mère
  occurrenceData.Demande_Transport_IdRecurrence = recurrenceMereId;

  // Désactiver le mode récurrence sur l'occurrence
  occurrenceData.Transport_AvecRecurrence = '';
  occurrenceData.Demande_Transport_FréquenceRécurrence = '';
  occurrenceData.Demande_DatesRecurrences = '';
  occurrenceData.Demande_JourneesApplicables = '';
  occurrenceData.Demande_DateDebutRecurrences = '';
  occurrenceData.Demande_DateFinRecurrences = '';
  occurrenceData.Demande_Transport_Exception = '';

  // Réinitialiser les IDs de transport (seront assignés à la création)
  occurrenceData.Demande_IDTransportAller = '';
  occurrenceData.Demande_IDTransportRetour = '';
  occurrenceData.Demande_StatutTransportAller = '';
  occurrenceData.Demande_StatutTransportRetour = '';

  // Metadata
  occurrenceData.Demande_DateDeCreation = new Date()
    .toISOString()
    .split('.')[0];
  occurrenceData.Demande_DistanceTotale = getDistanceTotale(occurrenceData);

  return occurrenceData;
};

/**
 * Interprète une récurrence mère et retourne les occurrences à créer dans la dateWindow.
 * @param {object} recurrenceMere - Document FasterWeb de la récurrence mère
 * @param {string[]} dateWindow - [dateDebut, dateFin] en format ISO
 * @returns {object[]} Tableau d'objets { occurrenceDate, occurrenceData }
 */
const interpretRecurrence = (recurrenceMere, dateWindow) => {
  const data = getFormData(recurrenceMere);
  const recurrenceMereId = getFormID(recurrenceMere);

  // Calculer les dates d'occurrence
  const allDates = getOccurrenceDates(data, dateWindow);

  // Filtrer les exceptions (dates déjà générées)
  const datesToCreate = filterExceptions(
    allDates,
    data.Demande_Transport_Exception,
  );

  // Formater chaque occurrence
  const result = [];
  for (const occurrenceDate of datesToCreate) {
    const occurrenceData = formatOccurrenceData(
      data,
      recurrenceMereId,
      occurrenceDate,
    );
    result.push({ occurrenceDate, occurrenceData });
  }

  return result;
};

/**
 * Crée une demande-occurrence et ses transports (déjà liés à la demande).
 * @param {string} type - Transport_TypeTransport de la récurrence mère
 * @param {object} occurrence - { occurrenceDate, occurrenceData }
 * @returns {object} { occurrenceDate, idDemande, demandeUpdate } — demandeUpdate est envoyé plus tard en lot
 */
const createOccurrence = async (type, { occurrenceDate, occurrenceData }) => {
  const demandeResult = await createDocument(
    DEMANDE_TEMPLATE_ID,
    occurrenceData,
    STATUS_KEY,
  );
  const idDemande = demandeResult.id;

  const lienDemande = {
    Transport_IDDemande: idDemande,
    Transport_Nombre: demandeResult.number,
  };

  const createTransport = async (kind) => {
    const payload = buildTransportPayload(occurrenceData, kind);
    const result = await createDocument(TRANSPORT_TEMPLATE_ID, {
      ...payload,
      ...lienDemande,
    });
    return result.id;
  };

  const [idTransportAller, idTransportRetour] = await Promise.all([
    type === 'Aller' || type === 'Aller/Retour' ? createTransport('Aller') : '',
    type === 'Retour' || type === 'Aller/Retour' ? createTransport('Retour') : '',
  ]);

  const demandeUpdate = {
    data: JSON.stringify({
      ...occurrenceData,
      Demande_IDTransportAller: idTransportAller,
      Demande_IDTransportRetour: idTransportRetour,
      Demande_StatutTransportAller: idTransportAller ? 'Soumis' : '',
      Demande_StatutTransportRetour: idTransportRetour ? 'Soumis' : '',
    }),
    status: STATUS_KEY,
    active: true,
    template: { templateId: DEMANDE_TEMPLATE_ID },
    documentID: idDemande,
  };

  console.log(
    `[Récurrence] Occurrence créée pour ${occurrenceDate} — demande: ${idDemande}`,
  );
  return { occurrenceDate, idDemande, demandeUpdate };
};

/**
 * Crée les occurrences (demandes + transports) en parallèle, puis met à jour en un seul appel
 * les demandes et la récurrence mère.
 * @param {object} recurrenceMere - Document FasterWeb de la récurrence mère
 * @param {object[]} occurrences - Résultat de interpretRecurrence()
 * @returns {object[]} Tableau des IDs des demandes créées
 */
const createOccurrences = async (recurrenceMere, occurrences) => {
  if (occurrences.length === 0) return [];

  const recurrenceMereId = getFormID(recurrenceMere);
  const recurrenceMereData = getFormData(recurrenceMere);
  const type = String(recurrenceMereData?.Transport_TypeTransport || '').trim();

  const results = await Promise.allSettled(
    occurrences.map((occurrence) => createOccurrence(type, occurrence)),
  );
  const created = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  const createdDates = created.map(({ occurrenceDate }) => occurrenceDate);

  // Les dates créées vont dans les exceptions même si une autre a échoué, pour éviter les doublons au prochain clic.
  const existingExceptions =
    recurrenceMereData.Demande_Transport_Exception || '';
  const allExceptions = existingExceptions
    ? existingExceptions.split('|').concat(createdDates).join('|')
    : createdDates.join('|');

  console.log(`[Récurrence] Mise à jour exceptions mère: "${allExceptions}"`);

  await updateDocumentMany([
    ...created.map(({ demandeUpdate }) => demandeUpdate),
    {
      data: JSON.stringify({
        ...recurrenceMereData,
        Demande_Transport_Exception: allExceptions,
      }),
      status: 'Principal',
      active: true,
      template: { templateId: DEMANDE_TEMPLATE_ID },
      documentID: recurrenceMereId,
    },
  ]);

  console.log(
    `[Récurrence] Récurrence mère ${recurrenceMereId} mise à jour — ${createdDates.length} occurrence(s) ajoutée(s)`,
  );

  const failed = results.find((result) => result.status === 'rejected');
  if (failed) throw failed.reason;

  return created.map(({ idDemande }) => idDemande);
};

// ======================= Entry Points ===================================

/**
 * Retourne les occurrences "virtuelles" (non encore créées) pour une liste de récurrences mères.
 * Utilisé par le mask pour afficher les lignes sans créer les documents.
 * @param {object[]} recurrencesMeres - Documents FasterWeb des récurrences mères
 * @param {string[]} dateWindow - [dateDebut, dateFin] en format ISO
 * @returns {object[]} Tableau d'objets { recurrenceMereId, occurrenceDate, occurrenceData }
 */
const getVirtualOccurrences = (recurrencesMeres, dateWindow) => {
  const result = [];
  for (const recurrenceMere of recurrencesMeres) {
    const occurrences = interpretRecurrence(recurrenceMere, dateWindow);
    for (const occ of occurrences) {
      result.push({
        recurrenceMereId: getFormID(recurrenceMere),
        ...occ,
      });
    }
  }
  return result;
};

/**
 * Récupère toutes les récurrences mères actives depuis l'API.
 * @returns {object[]} Documents FasterWeb
 */
const fetchRecurrencesMeres = async () => {
  const filters = [
    {
      key: 'FORMLAYOUTNAME',
      operator: 'EQUALS',
      value: 'Demande',
      type: 'TEXT',
    },
    {
      key: 'STATUS',
      operator: 'IN',
      value: 'Principal',
      type: 'TEXT',
    },
  ];
  return getDocuments(filters);
};

/**
 * Génère les occurrences pour une fenêtre de dates donnée.
 * Point d'entrée principal pour le bouton du mask.
 * @param {string[]} dateWindow - [dateDebut, dateFin] en format ISO
 */
const generateOccurrencesForDateWindow = async (dateWindow) => {
  console.log('[Récurrence] Début de la génération pour:', dateWindow);

  // 1. Récupérer les récurrences mères
  const recurrencesMeres = await fetchRecurrencesMeres();
  console.log(
    `[Récurrence] ${recurrencesMeres.length} récurrence(s) mère(s) trouvée(s)`,
  );

  let totalCreated = 0;

  // 2. Pour chaque récurrence mère, interpréter et créer
  for (const recurrenceMere of recurrencesMeres) {
    const occurrences = interpretRecurrence(recurrenceMere, dateWindow);
    console.log(
      `[Récurrence] Récurrence ${getFormID(recurrenceMere)} — ${occurrences.length} occurrence(s) à créer`,
    );

    if (occurrences.length > 0) {
      const createdIds = await createOccurrences(recurrenceMere, occurrences);
      totalCreated += createdIds.length;
    }
  }

  console.log(
    `[Récurrence] Fin — ${totalCreated} occurrence(s) créée(s) au total`,
  );
  return totalCreated;
};

// ======================= Date Window ===================================

const MAX_JOURS_GENERATION = 15;

const addDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-CA');
};

const askDateFin = (today, dateMax) =>
  new Promise((resolve) => {
    showCustomPopup({
      title: 'Générer les occurrences',
      commentHTML: `Générer les occurrences à partir d'aujourd'hui jusqu'au (${MAX_JOURS_GENERATION} jours maximum) :`,
      fields: [
        {
          key: 'dateFin',
          name: "Jusqu'au",
          type: 'date',
          required: true,
          defaultValue: dateMax,
          min: today,
          max: dateMax,
        },
      ],
      buttons: [
        {
          key: 'cancel',
          name: 'Annuler',
          preset: 'cancel',
          onClick: () => resolve(null),
        },
        {
          key: 'ok',
          name: 'Générer',
          preset: 'action',
          onClick: (values) => resolve(values.dateFin),
        },
      ],
    });

    bloquerDateAuClavier(document.getElementById('dateFin'), today, dateMax);
  });

// min/max ne bloquent que le calendrier : une date tapée au clavier est ramenée dans la plage.
const bloquerDateAuClavier = (input, dateMin, dateMax) => {
  input.addEventListener('blur', () => {
    if (!input.value || input.value > dateMax) input.value = dateMax;
    if (input.value < dateMin) input.value = dateMin;
  });
};

// ======================= Main ==========================================

const main = async () => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const dateMax = addDays(today, MAX_JOURS_GENERATION);

    const dateFin = await askDateFin(today, dateMax);
    if (!dateFin) return;

    showPopupLoading('Génération des occurrences…');
    const totalCreated = await generateOccurrencesForDateWindow([today, dateFin]);

    showSuccessBanner(
      `${totalCreated} occurrence(s) créée(s) du ${today} au ${dateFin}.`,
    );
  } catch (err) {
    console.error('[Récurrence] Erreur:', err);
    showErrorBanner(
      err?.message || 'Erreur lors de la génération des occurrences.',
    );
  } finally {
    hidePopupLoading();
  }
};

main();
