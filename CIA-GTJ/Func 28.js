console.log('Fonction 27', context);

// Returns route duration (minutes) and distance (km)
const getRouteInfo = async (origin, destination) => {
  const { Route } = await google.maps.importLibrary('routes');

  const request = {
    origin,
    destination,
    travelMode: 'DRIVING',

    // Required by computeRoutes: only ask for what we need.
    fields: ['durationMillis', 'distanceMeters'],
  };

  const { routes } = await Route.computeRoutes(request);

  if (!routes || !routes.length) {
    throw new Error('Aucun trajet trouvé.');
  }

  const route = routes[0];

  const minutes = Math.round((route.durationMillis || 0) / 1000 / 60);
  const km = Math.round(((route.distanceMeters || 0) / 1000) * 100) / 100;

  return { minutes, km };
};

const pad2 = (value) => String(value).padStart(2, '0');

const formatDateYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());

  return `${year}-${month}-${day}`;
};

const formatTimeHHMM = (date) => {
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());

  return `${hour}:${minute}`;
};

const main = async () => {
  const data = {};

  const avecRecurrence =
    String(docData?.Transport_AvecRecurrence || '')
      .trim()
      .toLowerCase() === 'true';

  const heureDepart = String(docData?.DemandeRetourD_Heure || '').trim();

  // En mode récurrence, les champs date sont cachés — on utilise aujourd'hui comme placeholder pour le calcul du temps
  let dateDepart;
  if (avecRecurrence) {
    const today = new Date();
    dateDepart = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  } else {
    dateDepart = String(docData?.DemandeRetourD_Date || '').trim();
  }

  //const [hour, min] = heureArrivee.split(":").map(Number);
  //const [year, month, day] = dateArrivee.split("-").map(Number);

  const [hour, min] = heureDepart.split(':').map(Number);
  const [year, month, day] = dateDepart.split('-').map(Number);

  const latDep = parseFloat(docData?.Transport_LatitudeRetourD);
  const lngDep = parseFloat(docData?.Transport_LongitudeRetourD);
  const latDest = parseFloat(docData?.Transport_LatitudeRetourA);
  const lngDest = parseFloat(docData?.Transport_LongitudeRetourA);

  const isTimeValid = Number.isFinite(hour) && Number.isFinite(min);
  const isDateValid =
    Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day);

  const areCoordinatesValid = [latDep, lngDep, latDest, lngDest].every(
    Number.isFinite,
  );

  if (isTimeValid && isDateValid && areCoordinatesValid) {
    try {
      const origin = {
        lat: latDep,
        lng: lngDep,
      };

      const destination = {
        lat: latDest,
        lng: lngDest,
      };

      const { minutes, km } = await getRouteInfo(origin, destination);

      // Build arrival datetime from arrival date + arrival time.
      // month - 1 because JS months are 0-based.
      const departureDateTime = new Date(year, month - 1, day, hour, min, 0);

      // Arrival time= departure datetime + route duration
      // This automatically handles going to the previous day if needed.
      const arrivalDateTime = new Date(
        departureDateTime.getTime() + minutes * 60 * 1000,
      );
      console.log(
        'departureDateTime:',
        departureDateTime,
        'arrivalDateTime:',
        arrivalDateTime,
      );

      const dateArriveeCalculee = formatDateYYYYMMDD(arrivalDateTime);
      const heureArriveeCalculee = formatTimeHHMM(arrivalDateTime);
      const heureArriveeFormattee = formatTimeHHMM(arrivalDateTime);

      //const dateDepartCalculee = formatDateYYYYMMDD(departureDateTime);
      //const heureDepartCalculee = formatTimeHHMMSS(departureDateTime);
      //const heureArriveeFormattee = formatTimeHHMMSS(arrivalDateTime);

      data.DemandeRetourA_Heure = heureArriveeCalculee;
      data.Demande_TrajetRetour = km;

      if (avecRecurrence) {
        // En mode récurrence, on ne touche pas aux dates Retour (cachées)
        // On calcule DateHeureDebut/Fin avec les dates de récurrence
        const frequence = String(
          docData?.Demande_Transport_FréquenceRécurrence || '',
        ).trim();
        let recDateDebut = '';
        let recDateFin = '';

        if (frequence === 'Variable') {
          const dates = String(docData?.Demande_DatesRecurrences || '')
            .split('|')
            .filter(Boolean)
            .sort();
          if (dates.length > 0) {
            recDateDebut = dates[0];
            recDateFin = dates[dates.length - 1];
          }
        } else if (frequence === 'Hebdomadaire') {
          recDateDebut = String(
            docData?.Demande_DateDebutRecurrences || '',
          ).trim();
          recDateFin = String(docData?.Demande_DateFinRecurrences || '').trim();
        }

        const heureDepartFormattee = formatTimeHHMMSS(departureDateTime);
        if (recDateDebut) {
          data.Demande_DateHeureDebut = `${recDateDebut}T${heureDepartFormattee}`;
        }
        if (recDateFin) {
          data.Demande_DateHeureFin = `${recDateFin}T${heureArriveeFormattee}`;
        }
      } else {
        data.DemandeRetourA_Date = dateArriveeCalculee;
        data.Demande_DateHeureDebut = `${dateDepart}T${heureArriveeFormattee}`;
        data.Demande_DateHeureFin = `${dateArriveeCalculee}T${heureArriveeCalculee}`;
      }

      //data.DemandeAllerD_Date = dateDepartCalculee;
      //data.DemandeAllerD_Heure = heureDepartCalculee;
      //data.Demande_TrajetAller = km;
      //data.Demande_DateHeureDebut = `${dateDepartCalculee}T${heureDepartCalculee}`;
      //data.Demande_DateHeureFin = `${dateArrivee}T${heureArriveeFormattee}`;
    } catch (error) {
      console.error('Erreur calcul trajet Fonction 28:', error);
    }
  } else {
    console.log('Fonction 28 - données invalides', {
      heureDepart,
      dateDepart,
      hour,
      min,
      year,
      month,
      day,
      latDep,
      lngDep,
      latDest,
      lngDest,
      isTimeValid,
      isDateValid,
      areCoordinatesValid,
    });
  }

  if (Object.keys(data).length > 0) {
    callback({
      data,
    });
  }

  return data;
};

main();
