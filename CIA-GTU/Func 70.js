console.log('70', context);

const {
  Demande_TransportInformationTransportAvecReccurence,   // "true"/"false", bool, "oui/non", etc.
  TransportSysteme_IdReccurence                           // UUID du parent de récurrence
} = (typeof docData === 'object' && docData) ? docData : {};

/* ===== Helpers ===== */
const isUUID = (s) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));

const normBool = (v) => {
  const s = String(v ?? '').trim().toLowerCase();
  if (['true', '1', 'oui', 'yes', 'vrai'].includes(s))  return true;
  if (['false', '0', 'non', 'no', 'faux'].includes(s))  return false;
  // si c'est un bool direct
  if (typeof v === 'boolean') return v;
  return false;
};

const viewGroupUrl = () => {
  const parts = window.location.href.split('/');
  // enlève jusqu’à 3 segments finaux si ID/new
  for (let i = 0; i < 3; i++) {
    const last = parts[parts.length - 1];
    if (isUUID(last) || last === 'new' || last === '') parts.pop();
  }
  return parts.join('/');
};

/* ===== Log debug ===== */
const hasId   = isUUID(TransportSysteme_IdReccurence);
const isRecur = normBool(Demande_TransportInformationTransportAvecReccurence);
console.log('[occ-flag]', { hasId, isRecur, TransportSysteme_IdReccurence, Demande_TransportInformationTransportAvecReccurence });

/* ===== Règle métier demandée ===== */
if (hasId && isRecur === false) {
  // C'est une occurrence
  const url = viewGroupUrl() + '/' + TransportSysteme_IdReccurence;
  return {
    Markdown_Occurence: `Vous modifiez **une occurrence**. [Aller à la récurrence parente](${url})`
  };
}

if (hasId && isRecur === true) {
  // C'est le gabarit récurrent
  return {
    Markdown_Occurence: `Vous modifiez **la récurrence** (gabarit).`
  };
}

// Ni occurrence ni gabarit
return { Markdown_Occurence: '' };

