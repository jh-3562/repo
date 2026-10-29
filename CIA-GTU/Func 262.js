const heurePriseEnCharge =
  docData?.Demande_TransportTransportRetourHeurePriseEnCharge;

if (!heurePriseEnCharge) {
  return;
} else {
  const dureeTrajet = Number(docData?.TransportSysteme_DureeTrajetRetour);

  const matchHeure = String(heurePriseEnCharge).match(/^(\d{1,2}):(\d{2})/);
  if (!matchHeure || !Number.isFinite(dureeTrajet) || dureeTrajet < 0) {
    return;
  }

  const heureEnMinutes = Number(matchHeure[1]) * 60 + Number(matchHeure[2]);
  const toHeure = (minutes) => {
    const minutesNormalisees = ((minutes % 1440) + 1440) % 1440;
    const heures = Math.floor(minutesNormalisees / 60);
    const minutesRestantes = minutesNormalisees % 60;

    return `${String(heures).padStart(2, "0")}:${String(
      minutesRestantes,
    ).padStart(2, "0")}`;
  };

  const heureDepart = heureEnMinutes + 15;
  const heureArrivee = heureDepart + dureeTrajet;

  return {
    Demande_TransportTransportRetourHeureDepartSouhaitee: toHeure(heureDepart),
    Demande_TransportTransportRetourHeureArriveeSouhaite: toHeure(heureArrivee),
  };
}

