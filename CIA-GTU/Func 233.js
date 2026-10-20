console.log("Fonction 233", context);

// ---------- constantes ----------
const isRetour =
  String(docData?.DemandeTransportInformationsTransportRetour || "")
    .trim()
    .toLowerCase() === "true";

const LAT_ATERISSAGE = "TransportSysteme_LatitudeAtterissage";
const LNG_ATERISSAGE = "TransportSysteme_LongitudeAtterissage";

const LAT_DEST = isRetour
  ? "TransportSysteme_LatitudeDestinationRetour"
  : "TransportSysteme_LatitudeEtablissementReceveur";
const LNG_DEST = isRetour
  ? "TransportSysteme_LongitudeDestinationRetour"
  : "TransportSysteme_LongitudeEtablissementReceveur";

const DATE_ATERISSAGE = isRetour
  ? "Demande_TransportAerienRetourAtterrissage"
  : "TransportAerien_Dateatterrissage2";

const DATE_TRANSPORT = isRetour
  ? "Demande_TransportRotierDate"
  : "Demande_TransportTransportSimpleDateTransportArrivee";

const DUREE_ATERISSAGE = "TransportSysteme_DureeTrajetAtterissage";

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// ---------- google maps ----------
const getTravelDuration = async (origin, destination) => {
  return new Promise((resolve, reject) => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const legs = result.routes?.[0]?.legs || [];
          const total = legs.reduce(
            (s, leg) => s + Math.floor((leg?.duration?.value || 0) / 60),
            0,
          );
          resolve(total);
        } else {
          reject(new Error(`Google Maps API error: ${status}`));
        }
      },
    );
  });
};

// ---------- main ----------
(async () => {
  const latAtterissage = parseFloat(docData?.[LAT_ATERISSAGE]);
  const lngAtterissage = parseFloat(docData?.[LNG_ATERISSAGE]);
  const latDest = parseFloat(docData?.[LAT_DEST]);
  const lngDest = parseFloat(docData?.[LNG_DEST]);

  if (
    !Number.isFinite(latAtterissage) ||
    !Number.isFinite(lngAtterissage) ||
    !Number.isFinite(latDest) ||
    !Number.isFinite(lngDest)
  ) {
    console.warn("Coordonnées invalides ou champs vides — calcul annulé");
    return;
  }

  try {
    const duree = await getTravelDuration(
      new google.maps.LatLng(latAtterissage, lngAtterissage),
      new google.maps.LatLng(latDest, lngDest),
    );

    const dateAtterrissage = docData?.[DATE_ATERISSAGE];
    let dateTransport = dateAtterrissage ?? null;

    if (dateAtterrissage) {
      const dateStr = String(dateAtterrissage).split("T")[0];
      const heurePriseEnCharge = docData?.TransportAerien_Heureatterrissage2;
      const base =
        isRetour && heurePriseEnCharge
          ? new Date(`${dateStr}T${heurePriseEnCharge}:00`)
          : new Date(`${dateStr}T00:00:00`);
      const transport = new Date(base.getTime() + duree * 60 * 1000);
      dateTransport = fmtDate(transport);
    }

    callback({
      data: {
        [DUREE_ATERISSAGE]: duree,
        [DATE_TRANSPORT]: dateTransport,
      },
    });
  } catch (e) {
    console.error("Erreur Directions:", e);
  }
})();
