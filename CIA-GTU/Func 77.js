console.log("77", context);

const KEYS = {
  debut: 'Demande_TransportInformationTransportDateDebutReccurence',
  fin:   'Demande_TransportInformationTransportDateFinReccurence',
};

const ERROR_MSG = "Il n'est pas possible de sélectionner une date de fin antérieure à la date de départ";

// popup identique à la première fonction
const popupError = (msg) => alert(msg);

const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

(() => {
  const debut = parseDate(context.docData?.[KEYS.debut]);
  const fin   = parseDate(context.docData?.[KEYS.fin]);

  if (!debut || !fin) return;

  if (fin < debut) {
    popupError(ERROR_MSG);

    if (typeof callback === "function") {
      // Forcer un changement, puis vider
      callback({ data: { [KEYS.fin]: "2000-01-01T00:00:00" } });
      setTimeout(() => {
        callback({ data: { [KEYS.fin]: "" } });
      }, 0);
    }
  }
})();

