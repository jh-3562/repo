console.log("Fonction 252", context);

function isDateInPast(yyyyMmDd) {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false; // date invalide

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return d < today;
}

const isAdminOrRepartiteur = context.store.moduleStore.user.roles.some((role) =>
  ["ADMIN", "RÉPARTITEUR"].includes(role),
);

const inputValue = docData[inputKey];

if (inputValue === null || inputValue === undefined || inputValue === "") {
  return null;
}
if (inputKey === 'Demande_TransportInformationTransportJourneesFixes' && !isAdminOrRepartiteur) {
  const someDatesInPast = inputValue.split('|').some((date) => isDateInPast(date));
  if (someDatesInPast) {
    showErrorBanner('Impossible de mettre une date dans le passé.');
    callback({
      data: {
        [inputKey]: '2000-01-01',
      },
    });

    setTimeout(() => {
      callback({
        data: {
          [inputKey]: '',
        },
      });
    }, 0);
    return;
  }
} else if (isDateInPast(inputValue) && !isAdminOrRepartiteur) {
  showErrorBanner('Impossible de mettre une date dans le passé.');
  callback({
    data: {
      [inputKey]: '2000-01-01',
    },
  });

  setTimeout(() => {
    callback({
      data: {
        [inputKey]: '',
      },
    });
  }, 0);
  return;
}
