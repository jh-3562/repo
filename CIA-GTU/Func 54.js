console.log("Fonction 54 ", context);

const result = {};

const roleUser = store.moduleStore.user.roles;
const rolesAutorises = roleUser.some((role) =>
  ["RÉPARTITEUR", "ADMIN"].includes(role),
);
const today = new Date().toISOString().split("T")[0];

const keysToClearByCallback = [];

// ----- Validation date antérieure -----
if (true /*!rolesAutorises*/) {
  console.log("HEY!");
  const dateSimpleDepart =
    docData["Demande_TransportTransportSimpleDateTransportDepart"];
  const dateSimpleArrivee =
    docData["Demande_TransportTransportSimpleDateTransportArrivee"];
  const dateRetourDepart =
    docData["Demande_TransportTransportRetourDateTransportDepart"];
  const dateRetourArrivee =
    docData["Demande_TransportTransportRetourDateTransportArrivee"];

  if (dateSimpleDepart && dateSimpleDepart < today) {
    keysToClearByCallback.push(
      "Demande_TransportTransportSimpleDateTransportDepart",
      "Demande_TransportTransportSimpleDateTransportArrivee",
    );
    showErrorBanner("La date de transport ne peut pas être dans le passé.");
  } else if (dateSimpleArrivee && dateSimpleArrivee < today) {
    keysToClearByCallback.push(
      "Demande_TransportTransportSimpleDateTransportArrivee",
    );
    showErrorBanner("La date de transport ne peut pas être dans le passé.");
  } else if (dateRetourDepart && dateRetourDepart < today) {
    keysToClearByCallback.push(
      "Demande_TransportTransportRetourDateTransportDepart",
      "Demande_TransportTransportRetourDateTransportArrivee",
    );
    showErrorBanner("La date de transport ne peut pas être dans le passé.");
  } else if (dateRetourArrivee && dateRetourArrivee < today) {
    keysToClearByCallback.push(
      "Demande_TransportTransportRetourDateTransportArrivee",
    );
    showErrorBanner("La date de transport ne peut pas être dans le passé.");
  }

  if (keysToClearByCallback.length > 0) {
    const uniqueKeys = [...new Set(keysToClearByCallback)];
    const { tempData, emptyData } = uniqueKeys.reduce(
      (acc, key) => ({
        tempData: {
          ...acc.tempData,
          ...(typeof key === "string" && key.length > 0
            ? { [key]: "2000-01-01T00:00:00" }
            : {}),
        },
        emptyData: {
          ...acc.emptyData,
          ...(typeof key === "string" && key.length > 0 ? { [key]: "" } : {}),
        },
      }),
      { tempData: {}, emptyData: {} },
    );

    if (Object.keys(tempData).length === 0) {
      return result;
    }

    callback({
      data: tempData,
    });

    setTimeout(() => {
      callback({
        data: emptyData,
      });
    }, 0);
    return;
  }
}
// ----- Adresse -----
const departSimple =
  docData["Demande_TransportTransportSimpleDateTransportDepart"];
if (departSimple && (departSimple >= today || rolesAutorises)) {
  result["Demande_TransportTransportSimpleDateTransportArrivee"] = departSimple;
}

// ----- Retour -----
const departRetour =
  docData["Demande_TransportTransportRetourDateTransportDepart"];
if (departRetour && (departRetour >= today || rolesAutorises)) {
  result["Demande_TransportTransportRetourDateTransportArrivee"] = departRetour;
}

return result;
