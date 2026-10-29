console.log('72', context);

// ==== Clés directes dans docData ====
const KEY_DATE_MODIF = 'Reccurence_Datemodification';
const KEY_REC_START  = 'Demande_TransportInformationTransportDateDebutReccurence';
const KEY_REC_END    = 'Demande_TransportInformationTransportDateFinReccurence';
const KEY_DT_START   = 'TransportSysteme_DateDebut';
const KEY_DT_END     = 'TransportSysteme_DateFin';
const KEY_LAYOUT_TMP = 'FORMLAYOUT_temp';
const KEY_FORMID     = 'FORMID';
const KEY_ID_REC     = 'TransportSysteme_IdReccurence';
const KEY_STATUS_TMP = 'TempStatus';

// >>> JOURS FIXES <<<
const KEY_JOURS_FIXES = 'Demande_TransportInformationTransportJourneesFixes';

// ==== Helpers ====
const ymd = (iso) => String(iso || '').slice(0, 10); // YYYY-MM-DD
const hhmm = (iso) => {
  const s = String(iso || '');
  const t = s.includes('T') ? s.split('T')[1] : '';
  return t ? t.slice(0,5) : '00:00';
};
const sameDayISO = (day, hhmmStr='00:01') => `${day}T${hhmmStr}:00`;

const formatDataAPI = (data) => {
  const dataCollection = (key, arr = []) => {
    const out = {};
    (arr || []).forEach((o, i) => Object.keys(o).forEach(k => out[`${k}|${i + 1}`] = o[k]));
    out[key] = String((arr || []).length || 0);
    return out;
  };
  let out = { ...data };
  Object.keys(out).forEach(k => {
    if (Array.isArray(out[k])) out = { ...out, ...dataCollection(k, out[k]) };
  });
  return JSON.stringify(out);
};

const redirectTo = (newId) => {
  const url = new URL(window.location.href);
  const section = (url.pathname.split('/')[1] || '');
  url.pathname = `/${section}/${newId}`;
  console.log('[redirect] ->', url.toString());
  window.location.href = url.toString();
};

// Parse JoursFixes: "YYYY-MM-DD|YYYY-MM-DD|..." -> tableau trié unique de YMD
const parseFixedDays = (val) => {
  const raw = String(val || '').split('|').map(s => s.trim()).filter(Boolean);
  const out = [...new Set(raw.map(ymd))].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  out.sort(); // ordre croissant
  return out;
};

// ==== Résolution robuste du templateId & status ====
async function resolveTemplateAndStatus() {
  const tryKeys = [
    () => String(docData[KEY_LAYOUT_TMP] || '').trim(),
    () => String(docData.FORMLAYOUTID || '').trim(),
    () => String(docData.FormLayoutId || '').trim(),
    () => String(docData.TemplateId || '').trim(),
    () => String(store?.pageContentStore?.templateId || '').trim(),
    () => String(store?.pageContentStore?.formLayoutId || '').trim(),
    () => String(store?.pageContentStore?.form?.templateId || '').trim(),
  ];
  let templateId = '';
  for (const f of tryKeys) {
    try { templateId = f(); } catch {}
    if (templateId) break;
  }

  if (!templateId) {
    const curId = String(docData[KEY_FORMID] || '').trim();
    if (curId) {
      try {
        console.log('[resolveTemplate] loading current doc to fetch templateId…');
        const r = await api({ local: true }).post('document/id', { ids: [curId] });
        templateId = String(r?.data?.documents?.[0]?.template?.templateId || '').trim();
      } catch (e) {
        console.warn('[resolveTemplate] api document/id failed', e?.message || e);
      }
    }
  }

  const status = String(docData[KEY_STATUS_TMP] || docData.STATUS || 'Draft').trim();
  console.log('[resolveTemplate] templateId =', templateId, 'status =', status);
  if (!templateId) throw new Error('FORMLAYOUT_temp introuvable (templateId)');
  if (!status) throw new Error('TempStatus introuvable (status)');
  return { templateId, status };
}

// ==== Création du NOUVEAU parent (gère aussi les JOURS FIXES après DateModification) ====
async function createNewParentFrom(dateModif, templateId, status, fixedAfterList) {
  const curDtStartISO = String(docData[KEY_DT_START] || '');
  const startHHMM = hhmm(curDtStartISO);

  const payloadData = {
    ...docData,
    [KEY_REC_START]: dateModif,
    [KEY_DT_START]:  sameDayISO(dateModif, startHHMM),
    [KEY_REC_END]:   docData[KEY_REC_END] || ymd(docData[KEY_DT_END]),
    [KEY_JOURS_FIXES]: (fixedAfterList || []).join('|'), // <= les dates >= dateModif
  };
  delete payloadData[KEY_ID_REC]; // NOUVELLE série

  const document = {
    data:     formatDataAPI(payloadData),
    status:   status,
    active:   true,
    template: { templateId }
  };

  let res;
  try {
    console.log('[create] POST document');
    res = await api({ local: true }).post('document', { document });
  } catch (e1) {
    console.warn('[create] POST document failed, retry "document/"');
    res = await api({ local: true }).post('document/', { document });
  }

  const newId = res?.data?.id || '';
  if (!newId) throw new Error('Échec création nouveau formulaire');

  // Poser le NOUVEL id de récurrence = NOUVEAU FORMID
  const setRecIdDoc = {
    data:       formatDataAPI({ [KEY_ID_REC]: newId }),
    status:     status,
    active:     true,
    template:   { templateId },
    documentID: newId
  };
  try {
    await api({ local: true }).put('document/Many', { documents: [setRecIdDoc] });
  } catch (e3) {
    console.warn('[create] PUT document/Many failed, retry "document/Many/"');
    await api({ local: true }).put('document/Many/', { documents: [setRecIdDoc] });
  }

  return newId;
}

// ==== MAIN ====
(async () => {
  const dateModif =
    docData[KEY_DATE_MODIF] ||
    store?.pageContentStore?.processData?.[0]?.edits?.[KEY_DATE_MODIF] ||
    null;

  console.log('[splitRecurrence] DateModification =', dateModif);
  if (!dateModif) { console.error('DateModification manquante'); return; }

  const curDtStartISO = String(docData[KEY_DT_START] || '');
  const curDtEndISO   = String(docData[KEY_DT_END]   || '');
  const curStartDay   = ymd(curDtStartISO);
  const curEndDay     = ymd(curDtEndISO);

  if (!curStartDay || !curEndDay) { console.error('TransportSysteme_DateDebut/Fin manquantes'); return; }
  if (dateModif > curEndDay) { console.error('DateModification après la fin actuelle → refusée'); return; }

  // ——— Split des JOURS FIXES ———
  const allFixed = parseFixedDays(docData[KEY_JOURS_FIXES]); // array YMD
  const fixedBefore = allFixed.filter(d => d <  dateModif);
  const fixedAfter  = allFixed.filter(d => d >= dateModif);
  console.log('[fixed-days] total=', allFixed.length, 'before=', fixedBefore.length, 'after=', fixedAfter.length);

  // Résoudre templateId + status
  let templateId, status;
  try {
    ({ templateId, status } = await resolveTemplateAndStatus());
  } catch (e) {
    console.error(e.message || e);
    return;
  }

  // 1) Créer le NOUVEAU parent avec les jours fixes >= dateModif
  let newId = '';
  try {
    newId = await createNewParentFrom(dateModif, templateId, status, fixedAfter);
    console.log('[splitRecurrence] newId =', newId);
  } catch (e) {
    console.error(e.message || e);
    return;
  }

  // 2) Clôturer l’ACTUEL (DateModification - 1) ET remettre les jours fixes < dateModif
  const d = new Date(dateModif);
  d.setDate(d.getDate() - 1);
  const stopDay = d.toISOString().split('T')[0];

  const patchCurrentBase = {
    [KEY_JOURS_FIXES]: fixedBefore.join('|') // <= ne garde que l'avant dans l'ancien
  };

  if (stopDay >= curStartDay) {
    const patchCurrent = {
      ...patchCurrentBase,
      [KEY_DT_END]: `${stopDay}T23:59:00`,
      [KEY_REC_END]: stopDay
    };
    try {
      await api({ local: true }).put('document/Many', {
        documents: [{
          data:       formatDataAPI(patchCurrent),
          status:     status,
          active:     true,
          template:   { templateId },
          documentID: docData[KEY_FORMID]
        }]
      });
    } catch (e) {
      console.error('[closeCurrent] put failed', e?.message || e);
      return;
    }
  } else {
    // Si DateModification < DateDébut : on annule l’actuel mais on remet quand même les jours fixes "avant" (souvent vide).
    try {
      await api({ local: true }).put('document/Many', {
        documents: [{
          data:       formatDataAPI(patchCurrentBase),
          status:     'Annulée',
          active:     true,
          template:   { templateId },
          documentID: docData[KEY_FORMID]
        }]
      });
    } catch (e) {
      console.error('[cancelCurrent] put failed', e?.message || e);
      return;
    }
  }

  // 3) Redirection vers le nouveau form
  redirectTo(newId);
  console.log('[splitRecurrence] DONE');
})();

