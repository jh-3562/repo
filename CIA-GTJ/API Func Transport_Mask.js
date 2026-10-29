console.log('prepareData mask récurrences', context);
updatePageContentStore((pageContentStore) => {
  pageContentStore.loading = true;
  pageContentStore.prepareDataRows = [];
});
const NB_JOURS_AFFICHES = 15;
const fieldIsEmpty = (value) => value === undefined || value === '';
const addDays = (isoDate, days) => {
  const date = new Date(isoDate + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-CA');
};
const getFrenchWeekDayIndices = (multiselectFieldValue) => {
  const mapping = { Dimanche: 0, Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5, Samedi: 6 };
  return multiselectFieldValue.split('|').map((d) => d.trim()).filter((d) => d in mapping).map((d) => mapping[d]);
};
const getOccurrenceDates = (data, dateWindow) => {
  const frequence = String(data?.Demande_Transport_FréquenceRécurrence || '').trim();
  const result = [];
  if (frequence === 'Variable') {
    const allDates = String(data?.Demande_DatesRecurrences || '').split('|').map((d) => d.trim()).filter(Boolean);
    for (const date of allDates) {
      if (dateWindow[0] <= date && date <= dateWindow[1]) result.push(date);
    }
  } else if (frequence === 'Hebdomadaire') {
    const startDate = fieldIsEmpty(data?.Demande_DateDebutRecurrences) ? '0001-01-01' : data.Demande_DateDebutRecurrences;
    const endDate = fieldIsEmpty(data?.Demande_DateFinRecurrences) ? '9999-01-01' : data.Demande_DateFinRecurrences;
    if (!fieldIsEmpty(data?.Demande_JourneesApplicables)) {
      const validWeekDays = getFrenchWeekDayIndices(data.Demande_JourneesApplicables);
      const effectiveStart = startDate > dateWindow[0] ? startDate : dateWindow[0];
      const effectiveEnd = endDate < dateWindow[1] ? endDate : dateWindow[1];
      let current = new Date(effectiveStart + 'T00:00:00Z');
      const end = new Date(effectiveEnd + 'T00:00:00Z');
      while (current <= end) {
        if (validWeekDays.includes(current.getUTCDay())) result.push(current.toISOString().split('T')[0]);
        current.setUTCDate(current.getUTCDate() + 1);
      }
    }
  }
  return result;
};
const filterExceptions = (dates, exceptionsField) => {
  if (fieldIsEmpty(exceptionsField)) return dates;
  const exceptions = exceptionsField.split('|').map((d) => d.trim()).filter(Boolean);
  return dates.filter((date) => !exceptions.includes(date));
};
const main = async () => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const dateWindow = [today, addDays(today, NB_JOURS_AFFICHES)];
    const filtersResponse = await api({ local: true }).post('document/id/filter', {
      filters: [
        { key: 'FORMLAYOUTNAME', operator: 'EQUALS', value: 'Demande', type: 'TEXT' },
        { key: 'STATUS', operator: 'IN', value: 'Principal', type: 'TEXT' }
      ]
    });
    const ids = filtersResponse?.data?.ids ?? [];
    if (ids.length === 0) {
      updatePageContentStore((pcs) => { pcs.prepareDataRows = []; pcs.loading = false; });
      return;
    }
    const docsResponse = await api({ local: true }).post('document/id', { ids });
    const recurrencesMeres = docsResponse?.data?.documents ?? [];
    const virtualRows = [];
    for (const recurrenceMere of recurrencesMeres) {
      const data = typeof recurrenceMere.data === 'string' ? JSON.parse(recurrenceMere.data) : recurrenceMere.data;
      const allDates = getOccurrenceDates(data, dateWindow);
      const datesToShow = filterExceptions(allDates, data.Demande_Transport_Exception);
      for (const occurrenceDate of datesToShow) {
        const nom = String(data?.Demande_IdentificationIdentficationUsagerNom || '').trim();
        const prenom = String(data?.Demande_IdentificationIdentficationUsagerPrénom || '').trim();
        const usager = [nom, prenom].filter(Boolean).join(', ');
        const type = String(data?.Transport_TypeTransport || '').trim();
        let heureDepart = '';
        let heureArrivee = '';
        let adresseDepart = '';
        let adresseDestination = '';
        if (type === 'Aller' || type === 'Aller/Retour') {
          heureDepart = data?.DemandeAllerD_Heure || '';
          heureArrivee = data?.DemandeAllerA_Heure || '';
          adresseDepart = [data?.DemandeAllerD_NomDuLieu, data?.DemandeAllerD_Adresse, data?.DemandeAllerD_Ville].filter(Boolean).join(', ');
          adresseDestination = [data?.DemandeAllerA_NomDuLieu, data?.DemandeAllerA_Adresse, data?.DemandeAllerA_Ville].filter(Boolean).join(', ');
        } else if (type === 'Retour') {
          heureDepart = data?.DemandeRetourD_Heure || '';
          heureArrivee = data?.DemandeRetourA_Heure || '';
          adresseDepart = [data?.DemandeRetourD_NomDuLieu, data?.DemandeRetourD_Adresse, data?.DemandeRetourD_Ville].filter(Boolean).join(', ');
          adresseDestination = [data?.DemandeRetourA_NomDuLieu, data?.DemandeRetourA_Adresse, data?.DemandeRetourA_Ville].filter(Boolean).join(', ');
        }
        virtualRows.push({
          key: recurrenceMere.documentID + '_' + occurrenceDate,
          data: {
            'Usager': usager,
            'Date': occurrenceDate,
            'Heure départ': heureDepart,
            'Heure arrivée': heureArrivee,
            'Type': type,
            'Adresse départ': adresseDepart,
            'Adresse destination': adresseDestination,
            'Récurrence mère': recurrenceMere.number || recurrenceMere.documentID
          }
        });
      }
    }
    virtualRows.sort((a, b) => a.data['Date'].localeCompare(b.data['Date']));
    console.log('[Mask Récurrences] ' + virtualRows.length + ' occurrence(s) virtuelle(s) du ' + dateWindow[0] + ' au ' + dateWindow[1]);
    updatePageContentStore((pcs) => { pcs.prepareDataRows = virtualRows; pcs.loading = false; });
  } catch (error) {
    console.error('[Mask Récurrences] Erreur:', error);
    updatePageContentStore((pcs) => { pcs.prepareDataRows = []; pcs.loading = false; });
  }
};
main();
