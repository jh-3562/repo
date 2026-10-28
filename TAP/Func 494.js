console.log("Fonction 494 - assignerChauffeurTransportsGroupe", context);

// ----- Constantes -----
const EDITS = store?.pageContentStore?.processData?.[0]?.edits;
// Récupération des/de l'id(s) sélectionné (EDIT, CHECKBOX ou DOCDATA)
const CHECKBOX_UUIDS = [
  "952eeabc-0948-4639-83a5-9771b33a0974", // VC "Grilles mission auj groupe"
  "9efc3f47-caf5-4792-8c85-e94ddf4763c7", // VC "GridTransportGroupeAValider"
];
const CHAUFFEURS_INFOS = {
  "Contrainte|1|Chauffeur": EDITS["Contrainte|1|Chauffeur"] || "",
  Chauffeur_Adresse: EDITS["Chauffeur_Adresse"] || "",
  Chauffeur_email: EDITS["Chauffeur_email"] || "",
  DestinationChauffeur: EDITS["DestinationChauffeur"] || "",
  TypeVehicule: EDITS["TypeVehicule"] || "",
  TypeVéhicule2: EDITS["TypeVéhicule2"] || "",
  LongitudeChauffeur: EDITS["LongitudeChauffeur"] || "",
  LatitudeChauffeur: EDITS["LatitudeChauffeur"] || "",
  ModeleRemuneration: EDITS["ModeleRemuneration"] || "",
};

let FORMIDS = new Set();

// 2. Ajoute tous les IDs dans `checked` pour chaque UUID
const checkedFormIds = CHECKBOX_UUIDS.flatMap(
  (uuid) => store?.pageContentStores?.[uuid]?.checked || [],
);
checkedFormIds.forEach((id) => FORMIDS.add(id));

// 1. Ajoute l'ID dans `active` s'il existe et qu'il n'y a aucun checked
if (store?.pageContentStore?.active?.[0] !== undefined && !checkedFormIds.length) {
  FORMIDS.add(store.pageContentStore.active[0]);
}

// 3. Ajoute l'ID dans `docData.FORMID` s'il existe
if (docData?.FORMID !== undefined) {
  FORMIDS.add(docData.FORMID);
}

// 4. Convertit le Set en tableau si nécessaire
const uniqueFORMIDS = Array.from(FORMIDS);

console.log("FORMIDS uniques :", uniqueFORMIDS);

// 4. Si aucun ID trouvé, FORMIDS sera vide
console.log("Tous les FORMIDS :", FORMIDS);

const PONTIAC_FORMLAYOUTID_TRANSPORT_GROUPE = "de3bc87f-64fd-409b-a7bb-fcd9a505650c";

// ----- Fonctions génériques -----
// Mise à jour de plusieurs documents
const updateManyDocuments = async (documents) => {
  try {
    console.log("DOCUMENTS ", documents);
    return await api({ local: true }).put("document/Many", {
      documents: documents,
    });
  } catch (error) {
    console.log("Erreur lors de la modification des documents.");
  }
};

// Création du corp de la mise à jour d'un document
const createUpdateDocument = (data, templateId, documentID, status) => {
  return {
    data: JSON.stringify(data),
    status: status,
    active: true,
    template: { templateId: templateId },
    documentID: documentID,
  };
};

// Récupération des ids filtrés et récupération des documents associés
const searchForms = async (filters, limit, onlyIds = false) => {
  try {
    const resIds = await api({ local: true }).post("document/id/filter", {
      filters,
    });

    const ids = resIds.data?.ids;

    if (!ids || ids.length === 0) {
      console.warn("Aucun ID trouvé avec les filtres :", filters);
      return [];
    }

    if (limit) ids.slice(0, limit);

    if (onlyIds)
      return ids.map((id) => {
        return {
          FORMID: id,
        };
      });

    const resDocs = await api({ local: true }).post("document/id", { ids });
    const documents = resDocs?.data?.documents;

    if (!documents) {
      throw new Error("Erreur lors de la récupération des documents");
    }

    return documents.map((doc, index) => {
      const parsedDoc = JSON.parse(doc.data);
      return {
        ...parsedDoc,
        FORMID: doc.metaData["FORMID"],
        STATUS: doc.metaData["STATUS"],
        FORMLAYOUTID: doc.metaData["FORMLAYOUTID"],
        NUMBER: doc.metaData["NUMBER"],
      };
    });
  } catch (error) {
    console.error("Erreur dans searchForms :", error);
    throw error;
  }
};

const getRecurrenceInfo = (documentData) => {
  let tarifDebut, tarifFin;
  let isJourOnly = false;
  let isJourSpecifique = false;
  let isParSemaine = false;

  // --- Une seule fois ---
  if (documentData.Dates_TypeRéc === "Une seule fois" || !documentData.Dates_TypeRéc) {
    tarifDebut = `0001-12-31|${documentData.Dates_DateTransport}`;
    tarifFin = `${documentData.Dates_DateTransport}|9999-12-31`;
    isJourOnly = true;
  }
  // --- Recurrence par jour spécifique ---
  else if (documentData.Dates_TypeRéc === "Par jour spécifique") {
    const dateSplit = documentData.Dates_Multidates.split("|").map(
      (date) => new Date(date.trim()),
    );

    const minDate = new Date(Math.min(...dateSplit));
    const maxDate = new Date(Math.max(...dateSplit));

    const minDatetoString = minDate.toISOString().split("T")[0];
    const maxDatetoString = maxDate.toISOString().split("T")[0];
    console.log("Date la plus ancienne :", minDatetoString);
    console.log("Date la plus récente :", maxDatetoString);
    tarifDebut = `0001-12-31|${minDatetoString}`;
    tarifFin = `${maxDatetoString}|9999-12-31`;
    isJourSpecifique = true;
  }
  // --- Recurrence par semaine ---
  else {
    const debut = documentData.Dates_DebutRec;
    const fin = documentData.Dates_FinRec;
    tarifDebut = `0001-12-31|${debut}`;
    tarifFin = `${fin}|9999-12-31`;
    isParSemaine = true;
  }
  return { tarifDebut, tarifFin, isJourOnly, isJourSpecifique, isParSemaine };
};
const getTauxInfo = async (documentData) => {
  const { tarifDebut, tarifFin } = getRecurrenceInfo(documentData);

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Formule de rémunération",
      type: "TEXT",
    },
    {
      key: "tauxChauffeurStartDate",
      operator: "BETWEEN",
      value: tarifDebut,
      type: "DATE",
    },
    {
      key: "tauxChauffeurEndDate",
      operator: "BETWEEN",
      value: tarifFin,
      type: "DATE",
    },
    {
      key: "STATUS",
      operator: "EQUALS",
      value: "Actif",
      type: "TEXT",
    },
  ];

  try {
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;
    const res2 = await api({ local: true }).post("document/id", { ids });
    const documents = res2?.data?.documents;
    return documents;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error.message);
    return [];
  }
};
const buildDocumentsUpdateTransportChauffeur = async (transportsDocuments, modele) => {
  const updates = [];

  for (const transportDocument of transportsDocuments) {
    let documents = [];

    if (modele) {
      const unfilteredDocs = await getTauxInfo(transportDocument);
      documents = unfilteredDocs.filter((doc) => {
        const parsed = JSON.parse(doc.data);
        return parsed.ModeleRemuneration === modele;
      });
    }

    if (documents.length === 1) {
      const data = JSON.parse(documents[0].data);
      CHAUFFEURS_INFOS["TauxChauffeur"] = data["Libellé"] || "";
      CHAUFFEURS_INFOS["CalculPrixTransportGroupe"] = data["CalculPrixTransportGroupe"] || "";
      CHAUFFEURS_INFOS["TAUX_KM_Chauffeur"] = data["TAUX_KM_Chauffeur"] || "";
      CHAUFFEURS_INFOS["MinimumPriceRenumeration"] = data["MinimumPriceRenumeration"] || "";
    }

    updates.push(
      createUpdateDocument(
        CHAUFFEURS_INFOS,
        PONTIAC_FORMLAYOUTID_TRANSPORT_GROUPE,
        transportDocument.FORMID,
        EDITS["Planifier_Statut"],
      ),
    );
  }

  return updates;
};

const geocodeWithBing = async (address) => {
  const result = {};
  try {
    const url = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
      address,
    )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`;
    const response = await fetch(url);
    const data = await response.json();
    const res = data.resourceSets?.[0]?.resources?.[0];
    if (res) {
      result.coordinates = res.geocodePoints?.[0]?.coordinates ?? [];
      result.municipality = res.address?.locality ?? "";
      result.country = res.address?.countryRegion ?? "";
      result.postalCode = res.address?.postalCode ?? "";
    }
  } catch (e) {
    console.log("Bing geocode error:", e?.message);
  }
  return result;
};
const geocodeWithGoogle = async (address) => {
  return new Promise((resolve) => {
    const out = {};
    if (!address) return resolve(out);
    new google.maps.Geocoder().geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        const loc = results[0].geometry.location;
        out.coordinates = [loc.lat(), loc.lng()];
        out.municipality = results[0].address_components.find((c) =>
          c.types.includes("locality"),
        )?.long_name;
        out.country = results[0].address_components.find((c) =>
          c.types.includes("country"),
        )?.long_name;
        out.postalCode = results[0].address_components.find((c) =>
          c.types.includes("postal_code"),
        )?.long_name;
      }
      resolve(out);
    });
  });
};
const calculateDistanceWithGoogle = async (origin, destination, waypoints) => {
  return new Promise((resolve) => {
    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const legs = result.routes?.[0]?.legs || [];
          let totalDistance = 0;
          let totalDuration = 0;
          const distances = [];
          const durations = [];
          for (const leg of legs) {
            totalDistance += leg.distance.value; // meters
            totalDuration += leg.duration.value; // seconds
            distances.push(leg.distance.value);
            durations.push(leg.duration.value);
          }
          // Keep compatibility fields from the old code
          const DureeLeg1 = durations[0] ?? 0;
          const DureeLeg2 = durations[1] ?? 0; // fix: use legs[1] when it exists
          resolve({
            totalDistance,
            totalDuration,
            distances,
            durations,
            DureeLeg1,
            DureeLeg2,
          });
        } else {
          resolve(null);
        }
      },
    );
  });
};
const deriveDateFilters = (doc) => {
  // Keep previous behavior; fall back if DateTime_* already present.
  if (doc.DateTime_Start && doc.DateTime_End) {
    return {
      DateTime_Start: doc.DateTime_Start,
      DateTime_End: doc.DateTime_End,
    };
  }
  const out = {};
  const t = doc["Dates_TypeRéc"];
  if (t === "Une seule fois" || t === "Occurrence") {
    const d = doc["Dates_DateTransport"];
    if (d) {
      out.DateTime_Start = `${d}T00:00:00`;
      out.DateTime_End = `${d}T23:59:59`;
    }
  } else if (t === "Par semaine" || t === "Par mois") {
    if (doc["Dates_DebutRec"]) out.DateTime_Start = `${doc["Dates_DebutRec"]}T00:00:00`;
    if (doc["Dates_FinRec"]) out.DateTime_End = `${doc["Dates_FinRec"]}T23:59:59`;
  } else if (t === "Par jour spécifique" && doc["Dates_Multidates"]) {
    const dates = doc["Dates_Multidates"].split("|").filter(Boolean);
    if (dates.length) {
      const min = dates.reduce((a, b) => (new Date(a) < new Date(b) ? a : b));
      const max = dates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
      out.DateTime_Start = `${min}T00:00:00`;
      out.DateTime_End = `${max}T23:59:59`;
    }
  }
  return out;
};
const buildDataToFill = async (doc) => {
  const useBingStart = doc["GeocodeBing1"] === "true";
  const useBingEnd = doc["GeocodeBing2"] === "true";

  // 1) Geocode START (Visiteurs_adresse)
  let start = { lat: 0, lng: 0 };
  if (doc["Visiteurs_adresse"]) {
    const geo = useBingStart
      ? await geocodeWithBing(doc["Visiteurs_adresse"])
      : await geocodeWithGoogle(doc["Visiteurs_adresse"]);
    if (geo?.coordinates?.length === 2) {
      start.lat = Number(geo.coordinates[0]);
      start.lng = Number(geo.coordinates[1]);
    }
  }

  // 2) Geocode STOPS (StopoverLocations array)
  const stops = Array.isArray(doc["StopoverLocations"]) ? doc["StopoverLocations"] : [];
  const enrichedStops = [];
  for (let i = 0; i < stops.length; i++) {
    const row = { ...stops[i] };
    // read embedded coords if present
    let lat = row["StopoverLocations|3000|Latitude"];
    let lng = row["StopoverLocations|2000|Longitude"];

    // If missing, try to geocode the address field
    if (lat == null || lat === "" || lng == null || lng === "") {
      const addr = row["StopoverLocations|100|Address"] || "";
      if (addr) {
        // You can choose Bing or Google for stops; we’ll default to Google here
        const g = await geocodeWithGoogle(addr);
        if (g?.coordinates?.length === 2) {
          lat = g.coordinates[0];
          lng = g.coordinates[1];
        }
      }
    }

    // Normalize & assign StopPos
    row["StopoverLocations|3000|Latitude"] = (lat ?? "").toString();
    row["StopoverLocations|2000|Longitude"] = (lng ?? "").toString();
    row["StopoverLocations|4000|StopPos"] = String(i + 1);

    enrichedStops.push(row);
  }

  // 3) Geocode END (Stop_Destination)
  let end = { lat: 0, lng: 0 };
  if (doc["Stop_Destination"]) {
    const geo = useBingEnd
      ? await geocodeWithBing(doc["Stop_Destination"])
      : await geocodeWithGoogle(doc["Stop_Destination"]);
    if (geo?.coordinates?.length === 2) {
      end.lat = Number(geo.coordinates[0]);
      end.lng = Number(geo.coordinates[1]);
    }
  }

  // 4) Build route points: Start -> stops... -> End -> Start (if ALLER/RETOUR)
  const startOK =
    Number.isFinite(start.lat) && Number.isFinite(start.lng) && (start.lat || start.lng);
  const endOK = Number.isFinite(end.lat) && Number.isFinite(end.lng) && (end.lat || end.lng);
  const stopPoints = enrichedStops
    .map((s) => {
      const slat = Number(s["StopoverLocations|3000|Latitude"]);
      const slng = Number(s["StopoverLocations|2000|Longitude"]);
      if (Number.isFinite(slat) && Number.isFinite(slng) && (slat || slng)) {
        return { lat: slat, lng: slng, raw: s };
      }
      return null;
    })
    .filter(Boolean);

  const typeTransport = (
    doc["CollectionClientsTA|4|TypeTransportTA"] ||
    doc["TypeTransport"] ||
    ""
  ).toUpperCase();
  const isRoundTrip = ["ALLER", "ALLER/RETOUR"].includes(typeTransport);

  const dataToFill = {};
  const waypoints = [];

  if (startOK && endOK) {
    // push all stops in order
    for (const p of stopPoints) {
      waypoints.push({ location: { lat: p.lat, lng: p.lng }, stopover: true });
    }
    // ensure END is last waypoint before returning to START
    waypoints.push({ location: { lat: end.lat, lng: end.lng }, stopover: true });

    const route = await calculateDistanceWithGoogle(
      { lat: start.lat, lng: start.lng },
      // destination: loop back to start if round trip; otherwise end
      isRoundTrip ? { lat: start.lat, lng: start.lng } : { lat: end.lat, lng: end.lng },
      isRoundTrip ? waypoints : [],
    );

    let start_chauffeur = { lat: 0, lng: 0 };
    let chauffeurAllerKm = 0;
    let chauffeurRetourKm = 0;

    if (doc["Chauffeur_Adresse"]) {
      const geo = useBingStart
        ? await geocodeWithBing(doc["Chauffeur_Adresse"])
        : await geocodeWithGoogle(doc["Chauffeur_Adresse"]);
      if (geo?.coordinates?.length === 2) {
        start_chauffeur.lat = Number(geo.coordinates[0]);
        start_chauffeur.lng = Number(geo.coordinates[1]);
      }

      const routeAllerChauffeur = await calculateDistanceWithGoogle(
        { lat: start_chauffeur.lat, lng: start_chauffeur.lng },
        { lat: start.lat, lng: start.lng },
        [],
      );
      const routeRetourChauffeur = await calculateDistanceWithGoogle(
        { lat: end.lat, lng: end.lng },
        { lat: start_chauffeur.lat, lng: start_chauffeur.lng },
        [],
      );

      chauffeurAllerKm = (routeAllerChauffeur?.totalDistance || 0) / 1000;
      chauffeurRetourKm = (routeRetourChauffeur?.totalDistance || 0) / 1000;
    }

    if (route) {
      const kmTotal = route.totalDistance / 1000 + chauffeurAllerKm + chauffeurRetourKm;
      const minTotal = Math.round(route.totalDuration / 60);
      dataToFill["NombreKm"] = kmTotal.toFixed(2);
      // Per-leg (meters & seconds) → produce arrays in km/min for convenience
      const legsKm = route.distances.map((m) => (m / 1000).toFixed(2));
      const legsMin = route.durations.map((s) => Math.round(s / 60));

      const totalMinutes =
        legsMin.length > 1 ? legsMin.slice(0, -1).reduce((sum, m) => sum + m, 0) : legsMin[0];

      const legsMinR = isRoundTrip ? legsMin[legsMin.length - 1] : legsMin[0];

      dataToFill["DureeTrajetAllerMinute"] = totalMinutes;
      dataToFill["DureeTrajetRetourMinute"] = legsMinR;

      const totalDistance =
        legsKm.length > 1
          ? legsKm.slice(0, -1).reduce((sum, m) => sum + Number(m), 0)
          : Number(legsKm[0]);

      const legsKmR = isRoundTrip ? legsKm[legsKm.length - 1] : legsKm[0];

      dataToFill["DistanceTrajet"] = totalDistance;
      dataToFill["DistanceTrajetRetour"] = legsKmR;

      // Compatibility fields with your previous payload
      /*dataToFill['KM_THEORIQUE'] = kmTotal.toString();              // total km for the whole built route
      dataToFill['KM_TH'] = (route.distances[0] / 1000).toFixed(2); // first leg km (as before)
      dataToFill['Dispatch_DuréeTransportTheo'] = String(minTotal); // total minutes

      // New: expose detailed legs
      dataToFill['Legs_KM_Array'] = JSON.stringify(legsKm);   // ["12.34","5.67",...]
      dataToFill['Legs_MIN_Array'] = JSON.stringify(legsMin); // [18,7,...]

      // Expose first two legs’ durations like before (seconds → minutes rounded)
      dataToFill['DureeLeg1'] = String(Math.round((route.DureeLeg1 || 0) / 60));
      dataToFill['DureeLeg2'] = String(Math.round((route.DureeLeg2 || 0) / 60));*/
    }
  }

  // 5) Write back coordinates for Start/End (string like before)
  if (startOK) {
    dataToFill["startLatitude"] = start.lat.toString();
    dataToFill["startLongitude"] = start.lng.toString();
  }
  if (endOK) {
    dataToFill["endLatitude"] = end.lat.toString();
    dataToFill["endLongitude"] = end.lng.toString();
  }

  // 6) Return the enriched StopoverLocations (with StopPos/Lat/Lng)
  //    NOTE: we mirror your nested naming back into the flat data payload
  dataToFill["LatitudeStopsCollec"] = "";
  dataToFill["LongitudeStopsCollec"] = "";
  dataToFill["StopPosStopsCollec"] = "";
  enrichedStops.forEach((row, idx) => {
    // Persist the three computed fields for each stop
    dataToFill[`StopoverLocations|2000|Longitude|${idx}`] =
      row["StopoverLocations|2000|Longitude"];
    dataToFill[`StopoverLocations|3000|Latitude|${idx}`] =
      row["StopoverLocations|3000|Latitude"];
    dataToFill[`StopoverLocations|4000|StopPos|${idx}`] =
      row["StopoverLocations|4000|StopPos"];
    dataToFill["LatitudeStopsCollec"] += row["StopoverLocations|3000|Latitude"] + "|";
    dataToFill["LongitudeStopsCollec"] += row["StopoverLocations|2000|Longitude"] + "|";
    dataToFill["StopPosStopsCollec"] += row["StopoverLocations|4000|StopPos"] + "|";
  });
  dataToFill["LatitudeStopsCollec"] = dataToFill["LatitudeStopsCollec"].slice(0, -1);
  dataToFill["LongitudeStopsCollec"] = dataToFill["LongitudeStopsCollec"].slice(0, -1);
  dataToFill["StopPosStopsCollec"] = dataToFill["StopPosStopsCollec"].slice(0, -1);
  dataToFill[`StopoverLocations`] = enrichedStops;

  // 7) Time filters (like before)
  Object.assign(dataToFill, deriveDateFilters(doc));

  return dataToFill;
};
const buildDocumentsUpdateTransportDistancePrix = async (transportsDocuments) => {
  const updates = [];

  for (const transportDocument of transportsDocuments) {
    const updatedTransportDocument = {
      ...transportDocument,
      ...CHAUFFEURS_INFOS,
    };

    const transportData = await buildDataToFill(updatedTransportDocument);

    const sanitizedData = {};
    for (const key in transportData) {
      const value = transportData[key];
      sanitizedData[key] =
        value !== null && typeof value === "object"
          ? JSON.stringify(value)
          : (value?.toString() ?? "");
    }

    // Calcul du prix
    const taux = parseFloat(updatedTransportDocument.TAUX_KM_Chauffeur) || 0;
    const nbKm = parseFloat(sanitizedData.NombreKm) || 0;
    let totalPrix = taux * nbKm;

    const minimumPriceRenumeration = parseFloat(sanitizedData.MinimumPriceRenumeration);
    if (!isNaN(minimumPriceRenumeration)) {
      totalPrix = Math.max(totalPrix, minimumPriceRenumeration);
    }

    const totalPrixFixed = totalPrix.toFixed(2);
    sanitizedData.PrixDuTransport = totalPrixFixed;

    updates.push(
      createUpdateDocument(
        sanitizedData,
        PONTIAC_FORMLAYOUTID_TRANSPORT_GROUPE,
        transportDocument.FORMID,
        EDITS["Planifier_Statut"],
      ),
    );
  }

  return updates;
};

const mergeDocumentsByKey = (documentsArray) => {
  const grouped = documentsArray.reduce((acc, doc) => {
    const key = `${doc.template.templateId}|${doc.documentID}|${doc.status}`;
    acc[key] = acc[key] || [];
    acc[key].push(doc);
    return acc;
  }, {});

  return Object.values(grouped).map((groupDocs) => {
    const { template, documentID, status } = groupDocs[0];
    const mergedData = Object.assign({}, ...groupDocs.map((doc) => JSON.parse(doc.data)));

    return {
      data: JSON.stringify(mergedData),
      status,
      active: true,
      template,
      documentID,
    };
  });
};

// ----- Fonction principale -----
const main = async () => {
  if (!FORMIDS || FORMIDS.size === 0) {
    showErrorBanner("Veuillez sélectionner au moins un transport");
    return;
  }

  try {
    showPopupLoading("Opération en cours");
    const uniqueFORMIDS = Array.from(FORMIDS);
    const addUsedVehicleToDocuments = (transportsDocuments, usedVehicle) => {
      for (const transportDocument of transportsDocuments) {
        const documentData = JSON.parse(transportDocument.data);
        documentData["TransportTypeDeVehiculeUtilise"] = usedVehicle;
        transportDocument.data = JSON.stringify(documentData);
      }
    };

    const transportsDocuments = await searchForms([
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Transport de groupe",
        type: "TEXT",
      },
      {
        key: "FORMID",
        operator: "IN",
        value: uniqueFORMIDS.join("|"),
        type: "TEXT",
      },
    ]);

    if (!transportsDocuments?.length) {
      showErrorBanner("Veuillez sélectionner au moins un transport");
      return;
    }

    const modele = EDITS["ModeleRemuneration"] || "";

    const documentsUpdate1 = await buildDocumentsUpdateTransportChauffeur(
      transportsDocuments,
      modele,
    );

    addUsedVehicleToDocuments(documentsUpdate1, EDITS["TransportTypeDeVehiculeUtilise"]);

    const documentsUpdate2 =
      await buildDocumentsUpdateTransportDistancePrix(transportsDocuments);

    const mergeDocuments = mergeDocumentsByKey([...documentsUpdate1, ...documentsUpdate2]);

    await updateManyDocuments(mergeDocuments);
  } catch (error) {
    showErrorBanner("Une erreur est survenue lors du processus de mise à jour");
    console.error(error);
  } finally {
    hidePopupLoading();
  }
};

main();
