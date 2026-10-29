console.log("75", context);

const ERROR_MSG = "Il n'est pas possible de sélectionner une date de fin antérieure à la date de départ";

const popupError = (msg) => alert(msg);

const startRaw = context.docData?.Demande_TransportTransportSimpleDateTransportDepart;
const endRaw   = context.docData?.Demande_TransportTransportRetourDateTransportDepart;

const debut = startRaw ? new Date(String(startRaw)) : null;
const fin   = endRaw   ? new Date(String(endRaw))   : null;

// Dates manquantes ou invalides → on ne fait rien
if (!debut || !fin || isNaN(debut) || isNaN(fin)) {
  return;
}

// Fin < Début → erreur + reset du champ via double callback
if (fin < debut) {
  popupError(ERROR_MSG);

  // 1) applique une valeur quelconque pour forcer le refresh
  if (typeof callback === "function") {
    callback({
      data: { Demande_TransportTransportRetourDateTransportDepart: "2000-01-01T00:00:00" }
    });

    // 2) puis vide la valeur (prochain tick)
    setTimeout(() => {
      callback({
        data: { Demande_TransportTransportRetourDateTransportDepart: "" }
      });
    }, 0);
  }

  return;
}

