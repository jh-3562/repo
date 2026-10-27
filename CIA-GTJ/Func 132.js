console.log('Recurrence script', context);

const DEMANDE_TEMPLATE_ID = '5d7b4e39-c50a-428c-87ec-e9b68ac45e39';
const TRANSPORT_TEMPLATE_ID = '017d9a14-b828-4cc5-8a9a-8906c1fcab59';
const STATUS_KEY = 'En traitement';

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
 * Crée les occurrences (demandes + transports) dans FasterWeb et met à jour la récurrence mère.
 * @param {object} recurrenceMere - Document FasterWeb de la récurrence mère
 * @param {object[]} occurrences - Résultat de interpretRecurrence()
 * @returns {object[]} Tableau des IDs des demandes créées
 */
const createOccurrences = async (recurrenceMere, occurrences) => {
  if (occurrences.length === 0) return [];

  const recurrenceMereId = getFormID(recurrenceMere);
  const recurrenceMereData = getFormData(recurrenceMere);
  const type = String(recurrenceMereData?.Transport_TypeTransport || '').trim();
  const createdDemandeIds = [];
  const createdDates = [];

  for (const occurrence of occurrences) {
    const { occurrenceDate, occurrenceData } = occurrence;

    // 1. Créer la demande-occurrence
    const demandeResult = await createDocument(
      DEMANDE_TEMPLATE_ID,
      occurrenceData,
      STATUS_KEY,
    );
    const idDemande = demandeResult.id;
    const demandeNumber = demandeResult.number;

    // 2. Créer les transports selon le type
    let idTransportAller = '';
    let idTransportRetour = '';

    if (type === 'Aller' || type === 'Aller/Retour') {
      const payloadAller = buildTransportPayload(occurrenceData, 'Aller');
      const resAller = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadAller,
      );
      idTransportAller = resAller.id;

      // Lier le transport à la demande
      await updateDocumentMany([
        {
          data: JSON.stringify({
            ...payloadAller,
            Transport_IDDemande: idDemande,
            Transport_Nombre: demandeNumber,
          }),
          status: STATUS_KEY,
          active: true,
          template: { templateId: TRANSPORT_TEMPLATE_ID },
          documentID: idTransportAller,
        },
      ]);
    }

    if (type === 'Retour' || type === 'Aller/Retour') {
      const payloadRetour = buildTransportPayload(occurrenceData, 'Retour');
      const resRetour = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadRetour,
      );
      idTransportRetour = resRetour.id;

      await updateDocumentMany([
        {
          data: JSON.stringify({
            ...payloadRetour,
            Transport_IDDemande: idDemande,
            Transport_Nombre: demandeNumber,
          }),
          status: STATUS_KEY,
          active: true,
          template: { templateId: TRANSPORT_TEMPLATE_ID },
          documentID: idTransportRetour,
        },
      ]);
    }

    // 3. Mettre à jour la demande avec les IDs de transport
    await updateDocumentMany([
      {
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
      },
    ]);

    createdDemandeIds.push(idDemande);
    createdDates.push(occurrenceDate);
    console.log(
      `[Récurrence] Occurrence créée pour ${occurrenceDate} — demande: ${idDemande}`,
    );
  }

  // 4. Mettre à jour Demande_Transport_Exception sur la récurrence mère
  const existingExceptions =
    recurrenceMereData.Demande_Transport_Exception || '';
  const allExceptions = existingExceptions
    ? existingExceptions.split('|').concat(createdDates).join('|')
    : createdDates.join('|');

  console.log(`[Récurrence] Mise à jour exceptions mère: "${allExceptions}"`);

  await updateDocumentMany([
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

  return createdDemandeIds;
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

// ======================= Main ==========================================

const main = async () => {
  try {
    showPopupLoading('Génération des occurrences…');

    const today = new Date().toISOString().split('T')[0];
    const dateWindow = [today, today];

    const totalCreated = await generateOccurrencesForDateWindow(dateWindow);

    hidePopupLoading();
    showSuccessBanner(
      `${totalCreated} occurrence(s) créée(s) pour le ${today}.`,
    );
  } catch (err) {
    hidePopupLoading();
    console.error('[Récurrence] Erreur:', err);
    showErrorBanner(
      err?.message || 'Erreur lors de la génération des occurrences.',
    );
  }
};

main();
