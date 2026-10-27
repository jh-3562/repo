const normalize = value => String(value || '').normalize('NFD')
  .replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
const type = normalize(docData?.Transporteur_Type);
const prefix = type === 'benevole' || type === 'benevoles' ? 'Transporteur_Benevole'
  : type === 'agent centre' ? 'Transporteur_Agent'
  : type === 'garda' ? 'Transporteur_Garda' : null;
if (!prefix) return {};
const fullName = [docData[prefix + 'Prenom'], docData[prefix + 'Nom']]
  .map(value => String(value || '').trim()).filter(Boolean).join(' ');
return { Transporteur_NomPrenom: fullName };
