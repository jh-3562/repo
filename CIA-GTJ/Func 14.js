const result = {};
let lastCustomPage = null;
try {
  lastCustomPage = window.top?.localStorage?.getItem('lastCustomPage');
} catch (error) {}
// En creation, STATUS est parfois dans les metadonnees, absent de docData.
const isDraft = docData.STATUS === 'Draft' ||
  (docData.STATUS == null && window.location.pathname.startsWith('/demandes/new/'));
if (isDraft && lastCustomPage === '/demandes/Demandes_DonneesSecurisees') {
  result.Transport_TransportSecuritaire = 'true';
  result.Transport_PasJumelage = 'true';
}
return result;
