/* ======================================================================
   299 - Ouvrir dans un nouvel onglet (projet Transport)
   RÈGLES EXPLICITES (SEULES AUTORISÉES) :
   - RÉCURRENCE (PARENT)    : isRecurrence = 'true'  ET idRecurrence existe
   - OCCURRENCE (ENFANT)    : isRecurrence = 'false' ET idRecurrence existe
   - TOUT AUTRE TYPE        : PAS de création, on ouvre juste le document
   ====================================================================== */

const DEBUG = true;
const logKV = (title, obj) => { try { console.log(title, JSON.parse(JSON.stringify(obj))); } catch { console.log(title, obj); } };

console.log('299 - Ouvrir dans un nouvel onglet (projet Transport) — START', { context });

/* ======================= 1) MAPPING DES CHAMPS ======================= */
const fieldMap = {
  // Flags / Liens
  isRecurrence: 'Demande_TransportInformationTransportAvecReccurence',
  idRecurrence: 'TransportSysteme_IdReccurence',
  exceptions:   'TransportSysteme_Exception',

  // Règles & fenêtres (à PURGER sur l’occurrence)
  dateDebutRecurrence: 'Demande_TransportInformationTransportDateDebutReccurence',
  dateFinRecurrence:   'Demande_TransportInformationTransportDateFinReccurence',
  joursRecurrence:     'Demande_TransportInformationTransportJourneesApplicables',
  frequence:           'Demande_TransportInformationTransportFrequence',
  datesFixes:          'Demande_TransportInformationTransportJourneesFixes',

  // Datetimes pour timeline
  dateHeureDebut: 'TransportSysteme_DateDebut',
  dateHeureFin:   'TransportSysteme_DateFin',

  // Heures souhaitées (fallback pour timeline)
  heureDebut: 'Demande_TransportTransportSimpleHeureDepartSouhaitee',
  heureFin:   'Demande_TransportTransportSimpleHeureArriveeSouhaite',

  // Dates “formulaire normal” (à renseigner sur l’occurrence)
  simpleDateDepart:   'Demande_TransportTransportSimpleDateTransportDepart',
  simpleDateArrivee:  'Demande_TransportTransportSimpleDateTransportArrivee',
  retourDateDepart:   'Demande_TransportTransportRetourDateTransportDepart',
  retourDateArrivee:  'Demande_TransportTransportRetourDateTransportArrivee',

  // Divers
  date: 'CommandDate'
};

/* ======================= 2) HELPERS GÉNÉRIQUES ======================= */
const isDoc  = (x) => !!(x && ('documentID' in x || 'documentId' in x));
const getDoc = (x) => (x?.documentID ?? x?.documentId ?? null);

const toObj = (maybeJSON) =>
  (typeof maybeJSON === 'string'
    ? (()=>{ try{ return JSON.parse(maybeJSON); } catch(e){ console.error('[toObj] JSON.parse error', e, { maybeJSON }); return {}; } })()
    : (maybeJSON || {}));

const pad2 = (n) => String(n).padStart(2,'0');

const toYYYYMMDD = (v) => {
  if (!v) return '';
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return s.slice(0,10);
};

const normTime = (t) => {
  if (t==null || t==='') return '';
  let s = String(t).replace(/\u00A0/g,' ').trim().toLowerCase();
  let m = s.match(/^(\d{1,2})\s*h\s*(\d{1,2})$/); if (m) return `${pad2(+m[1])}:${pad2(+m[2])}:00`;
  m = s.match(/^(\d{1,2})\s*h$/);                  if (m) return `${pad2(+m[1])}:00:00`;
  m = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/); if (m) return `${pad2(+m[1])}:${pad2(+m[2])}:${pad2(m[3]?+m[3]:0)}`;
  m = s.match(/^(\d{1,2})h(\d{1,2})$/);            if (m) return `${pad2(+m[1])}:${pad2(+m[2])}:00`;
  m = s.match(/^(\d{1,2})h$/);                     if (m) return `${pad2(+m[1])}:00:00`;
  return '';
};

const fieldIsEmpty = (v) => v===undefined || v==='';

const resolveParentIdFromRow = (r) =>
  (r?.sourceForm?.key ??
   r?.metaData?.REFERENCEKEY ??
   r?.metaData?.FORMID ??
   r?.key ?? null);

const resolveOccurrenceDate = (row) => {
  const src = toObj(row?.sourceForm?.data);
  const rd  = toObj(row?.data);
  const resolved = toYYYYMMDD(row?.occurrenceDate || src[fieldMap.date] || rd[fieldMap.dateHeureDebut]);
  if (DEBUG) console.log('[resolveOccurrenceDate]', { rowID: row?.rowID, occurrenceDate: row?.occurrenceDate, srcCommandDate: src[fieldMap.date], rdStart: rd[fieldMap.dateHeureDebut], resolved });
  return resolved;
};

/* ======================= 3) TAXONOMIE EXPLICITE ======================= */
/** RÉCURRENCE (PARENT) : isRecurrence = 'true' ET idRecurrence existe */
const isRecurrenceParentDoc = (data) => {
  if (!data) return false;
  const flag = String(data[fieldMap.isRecurrence] ?? '').toLowerCase();
  const isRec = flag === 'true';
  const idRec = data[fieldMap.idRecurrence];
  const hasId = !fieldIsEmpty(idRec);
  if (DEBUG) logKV('[isRecurrenceParentDoc] inputs', { flagValue: flag, idRecurrence: idRec, hasId, result: (isRec && hasId) });
  return isRec && hasId;
};

/** OCCURRENCE (ENFANT) : isRecurrence = 'false' ET idRecurrence existe */
const isOccurrenceDoc = (data) => {
  if (!data) return false;
  const flag = String(data[fieldMap.isRecurrence] ?? '').toLowerCase();
  const isFalse = flag === 'false';
  const idRec = data[fieldMap.idRecurrence];
  const hasId   = !fieldIsEmpty(idRec);
  if (DEBUG) logKV('[isOccurrenceDoc] inputs', { flagValue: flag, idRecurrence: idRec, hasId, result: (isFalse && hasId) });
  return isFalse && hasId;
};

/** AUTRE TYPE (transport simple, etc.) : tout le reste */
const isOtherType = (data) => {
  const res = !(isRecurrenceParentDoc(data) || isOccurrenceDoc(data));
  if (DEBUG) logKV('[isOtherType] result', { result: res });
  return res;
};

/* ============ 4) GÉNÉRATION D’OCCURRENCE (UNIQUEMENT POUR PARENT RÉCURRENCE) ============ */
const recurrence = {
  formatOccurrenceForms(formParent, stringDates) {
    console.group('[formatOccurrenceForms]');
    const parentId = getDoc(formParent);
    if (!parentId) { console.error('[formatOccurrenceForms] parentId introuvable'); console.groupEnd(); return []; }

    const dataBase =
      typeof formParent.data === 'string'
        ? toObj(formParent.data)
        : (formParent.data || {});
    
    const exceptions = dataBase[fieldMap.exceptions]
      ? String(dataBase[fieldMap.exceptions]).split('|').map(toYYYYMMDD)
      : [];

    const hDeb = dataBase[fieldMap.heureDebut] || (dataBase[fieldMap.dateHeureDebut] || '').split('T')[1]?.slice(0,5) || '00:00';
    const hFin = dataBase[fieldMap.heureFin]   || (dataBase[fieldMap.dateHeureFin]   || '').split(0,5) || '23:59';
    if (DEBUG) logKV('[formatOccurrenceForms] base', { parentId, exceptions, hDeb, hFin, stringDates });

    const out = [];
    for (const stringDate of stringDates) {
      const dd = toYYYYMMDD(stringDate);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dd)) { console.warn('[formatOccurrenceForms] invalid date => skip', stringDate); continue; }
      if (exceptions.includes(dd))         { console.log('[formatOccurrenceForms] skip (already in exceptions)', dd); continue; }

      const dateDeb = `${dd}T${normTime(hDeb) || '00:00:00'}`;
      const dateFin = `${dd}T${normTime(hFin) || '23:59:59'}`;

      const dataOcc = {
        ...dataBase,
        [fieldMap.idRecurrence]: dataBase[fieldMap.idRecurrence],
        [fieldMap.isRecurrence]: 'false',
        [fieldMap.dateDebutRecurrence]: '',
        [fieldMap.dateFinRecurrence]:   '',
        [fieldMap.joursRecurrence]:     '',
        [fieldMap.frequence]:           '',
        [fieldMap.datesFixes]:          '',
        [fieldMap.exceptions]:          '',
        [fieldMap.simpleDateDepart]:    dd,
        [fieldMap.simpleDateArrivee]:   dd,
        [fieldMap.retourDateDepart]:    dd,
        [fieldMap.retourDateArrivee]:   dd,
        [fieldMap.date]:                dd,
        [fieldMap.dateHeureDebut]:      dateDeb,
        [fieldMap.dateHeureFin]:        dateFin
      };

      const occ = {
        ...formParent,
        data: JSON.stringify(dataOcc),
        doesExist: false,
        occurrenceDate: dd,
        sourceForm: formParent
      };

      if (DEBUG) logKV('[formatOccurrenceForms] PUSH occ', { occurrenceDate: dd, dateDeb, dateFin, idRecurrence: dataOcc[fieldMap.idRecurrence] });
      out.push(occ);
    }
    console.groupEnd();
    return out;
  },

  async createFormsIfNeeded(rows){
    console.group('[createFormsIfNeeded]');
    if (!rows?.length){ console.warn('[createFormsIfNeeded] no rows'); console.groupEnd(); return []; }

    const parentIds = Array.from(new Set(rows.map(resolveParentIdFromRow).filter(Boolean)));
    if (DEBUG) logKV('[createFormsIfNeeded] parentIds', parentIds);

    let srcDocs;
    try {
      const res = await api({ local:true }).post('document/id', { ids: parentIds });
      srcDocs = res?.data?.documents || [];
      if (DEBUG) logKV('[createFormsIfNeeded] srcDocs count', { count: srcDocs.length });
    } catch(e) {
      console.error('[createFormsIfNeeded] failed to load parents', e);
      console.groupEnd();
      return [];
    }

    const toCreate = [];

    for (const row of rows){
      console.group(`[row loop] rowID=${row?.rowID}`);
      const occDate  = resolveOccurrenceDate(row);
      const parentId = resolveParentIdFromRow(row);
      const src      = srcDocs.find(d => getDoc(d)===parentId);

      if (!src){ 
        console.warn('[createFormsIfNeeded] parent not found for row', { rowID: row?.rowID, parentId });
        console.groupEnd(); 
        continue; 
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(occDate)){ 
        console.warn('[createFormsIfNeeded] invalid occDate', { rowID: row?.rowID, occDate });
        console.groupEnd();
        continue; 
      }

      const srcData = toObj(src.data);
      const rowData = toObj(row?.data);

      if (DEBUG) {
        logKV('[createFormsIfNeeded] rowData flags', {
          row_isRecurrence: rowData[fieldMap.isRecurrence],
          row_idRecurrence: rowData[fieldMap.idRecurrence],
        });
        logKV('[createFormsIfNeeded] srcData flags', {
          parent_isRecurrence: srcData[fieldMap.isRecurrence],
          parent_idRecurrence: srcData[fieldMap.idRecurrence],
          parent_exceptions: srcData[fieldMap.exceptions]
        });
      }

    // --- RÈGLE 1 : si la ligne représente déjà une OCCURRENCE *et* que ce n'est pas le parent -> NE RIEN CRÉER
const rowIsOcc = isOccurrenceDoc(rowData);
const rowIsParentRow = (row?.key && row?.key === parentId); // même id => c'est le parent dans la vue
if (rowIsOcc && !rowIsParentRow) {
  console.log('[createFormsIfNeeded] skip: row is a REAL existing occurrence (different from parent)', {
    rowID: row?.rowID, rowKey: row?.key, parentId
  });
  console.groupEnd();
  continue;
}

      // --- RÈGLE 2 : créer UNIQUEMENT si le PARENT est une RÉCURRENCE selon tes critères
      const parentIsRec = isRecurrenceParentDoc(srcData);
      if (parentIsRec) {
        console.log('[createFormsIfNeeded] parent IS recurrence -> will create occurrence', { parentId, occDate });
        const occs = this.formatOccurrenceForms(src, [occDate]);
        if (occs.length) {
          toCreate.push(occs[0]);
          logKV('[createFormsIfNeeded] toCreate +1', { total: toCreate.length, lastOccDate: occs[0].occurrenceDate });
        } else {
          console.warn('[createFormsIfNeeded] formatOccurrenceForms returned empty -> no creation', { parentId, occDate });
        }
      } else {
        // --- RÈGLE 3 : tout autre type -> NE RIEN CRÉER
        console.log('[createFormsIfNeeded] skip: parent is NOT a recurrence (transport simple, etc.)', { parentId, occDate });
        console.groupEnd();
        continue;
      }
      console.groupEnd();
    }

    if (!toCreate.length) { console.log('[createFormsIfNeeded] nothing to create'); console.groupEnd(); return []; }

    // créer
    const payload = toCreate.map(d=>({
      data: d.data,
      status: 'Draft',
      active: true,
      template: d.template || d.formLayoutId || d.formLayoutID
    }));
    if (DEBUG) logKV('[createFormsIfNeeded] POST /document/Many payload', payload);

    let resp;
    try{
      resp = await api({ local:true }).post('document/Many', { documents: payload });
      if (DEBUG) logKV('[createFormsIfNeeded] POST response', resp);
    }catch(e){
      console.error('[createFormsIfNeeded] creation error', e);
      console.groupEnd();
      return [];
    }

    (resp?.data?.docs || []).forEach((meta, i)=>{
      toCreate[i].documentID = meta.docID;
      toCreate[i].number     = meta.number;
      toCreate[i].doesExist  = true;
    });

    // MAJ Exceptions du parent + publier l’occurrence (même statut que le parent)
    const updates = [];
    for (const created of toCreate){
      console.group(`[updates build] occ=${created.documentID} date=${created.occurrenceDate}`);
      const parent   = created.sourceForm;
      const parentId = getDoc(parent);
      const srcData  = toObj(parent?.data);
      const occDate  = created.occurrenceDate;

      if (!parentId || !occDate) { console.warn('[updates build] missing parentId/occDate', { parentId, occDate }); console.groupEnd(); continue; }

      let parentUpd = updates.find(u => u.documentID===parentId);
      if (!parentUpd){
        parentUpd = {
          data: JSON.stringify({ [fieldMap.exceptions]: srcData[fieldMap.exceptions] || '' }),
          status: parent?.status,
          active: true,
          template: parent?.template,
          documentID: parentId
        };
        updates.push(parentUpd);
      }

      const pdata = toObj(parentUpd.data);
      const list  = String(pdata[fieldMap.exceptions]||'').split('|').filter(Boolean);
      if (!list.includes(occDate)) list.push(occDate);
      pdata[fieldMap.exceptions] = list.join('|');
      parentUpd.data = JSON.stringify(pdata);

      updates.push({
        status: parent?.status,
        active: true,
        template: created.template,
        documentID: created.documentID
      });

      if (DEBUG) logKV('[updates build] parentUpd + publish occ', { parentId, exceptions: pdata[fieldMap.exceptions], publishDocId: created.documentID });
      console.groupEnd();
    }

    if (DEBUG) logKV('[createFormsIfNeeded] PUT /document/Many payload (updates)', updates);
    try{
      const put = await api({ local:true }).put('document/Many', { documents: updates });
      if (DEBUG) logKV('[createFormsIfNeeded] PUT response', put);
    }catch(e){
      console.error('[createFormsIfNeeded] update error (parent exceptions / publish)', e);
    }

    console.groupEnd();
    return toCreate;
  }
};

/* ======================= 5) MAIN : OUVERTURE ONGLET ======================= */
const main = async () => {
  console.group('[MAIN]');
  try{
    const clickedFormId = store.pageContentStore?.active?.[0];
    const rows = store.pageContentStore?.prepareDataRows || [];
    if (DEBUG) logKV('[MAIN] store snapshot', { clickedFormId, rowsCount: rows.length });

    const row = rows.find(r => r.rowID === clickedFormId);
    if (!row){ console.error('[MAIN] row not found for clicked id', clickedFormId); console.groupEnd(); return; }
    if (DEBUG) logKV('[MAIN] row selected', { rowID: row.rowID, key: row?.key, parentGuess: resolveParentIdFromRow(row) });

    const rd = toObj(row?.data);
    const parentId = resolveParentIdFromRow(row);

    // Debug flags visibles au clic
    if (DEBUG) {
      console.group('[MAIN] FLAGS at click');
      logKV('ROW flags', { isRecurrence: rd[fieldMap.isRecurrence], idRecurrence: rd[fieldMap.idRecurrence] });
      const src = row?.sourceForm;
      const sd  = toObj(src?.data);
      logKV('PARENT flags', { isRecurrence: sd[fieldMap.isRecurrence], idRecurrence: sd[fieldMap.idRecurrence], exceptions: sd[fieldMap.exceptions] });
      console.groupEnd();
    }

    // 1) Assurer l’occurrence UNIQUEMENT si le parent est une récurrence (cas 1)
    const ensured = await recurrence.createFormsIfNeeded([row]);
    if (DEBUG) logKV('[MAIN] ensured occurrences', ensured);

    // 2) Décider quoi ouvrir
    let url_id = null;

    if (ensured && ensured[0] && ensured[0].documentID) {
      console.log('[MAIN] Case: created occurrence -> open it');
      url_id = ensured[0].documentID;
    } else if (isOccurrenceDoc(rd)) {
      console.log('[MAIN] Case: row is occurrence -> open row');
      url_id = row?.key || parentId;
    } else {
      console.log('[MAIN] Case: non-recurrence -> open parent');
      url_id = parentId;
    }

    if (!url_id){ 
      console.error('[MAIN] no url_id to open'); 
      console.groupEnd();
      return; 
    }

    // ouvrir dans un nouvel onglet
    const url = new URL(window.location.href);
    const section = (url.pathname.split('/')[1] || '');
    url.pathname  = `/${section}/${url_id}`;
    console.log('[MAIN] opening new tab ->', url.toString());
    setTimeout(()=> window.open(url.toString(), '_blank'), 150);

  }catch(e){
    console.error('[MAIN] fatal error', e);
  }
  console.groupEnd();
};

main();

