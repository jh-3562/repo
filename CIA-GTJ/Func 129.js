// Les deux regles ONLOAD doivent produire les memes valeurs depuis Securisees.
let lastPage = null;
try { lastPage = window.top?.localStorage?.getItem('lastCustomPage'); } catch (error) {}
if (window.location.pathname.startsWith('/demandes/new/') &&
    lastPage === '/demandes/Demandes_DonneesSecurisees') {
  return {Transport_TransportSecuritaire:true, Transport_PasJumelage:true};
}
if (docData.Transport_TransportSecuritaire == null) {
  return {Transport_TransportSecuritaire:false};
}
