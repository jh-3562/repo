console.log("Function 116 context:", context);

const INDISPONIBILITES_FORMLAYOUTID = "7d19c79c-8a4a-418c-8d1a-89d0139ecb00";

const isEmpty = (v) =>
  v === null || v === undefined || String(v).trim() === "";

const normalizeHHMM = (time) => {
  if (isEmpty(time)) return null;

  const normalizedTime = String(time).trim();

  if (/^\d{2}:\d{2}$/.test(normalizedTime)) {
    return normalizedTime;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(normalizedTime)) {
    return normalizedTime.slice(0, 5);
  }

  return null;
};

const buildIsoDateTime = (date, time) => {
  if (isEmpty(date) || isEmpty(time)) return null;

  const normalizedTime = normalizeHHMM(time);

  if (!normalizedTime) return null;

  return `${String(date).slice(0, 10)}T${normalizedTime}:00`;
};

const createCreateDocument = (data, templateId) => {
  return {
    data: JSON.stringify(data),
    status: "Actif",
    active: true,
    template: { templateId },
  };
};

const createDocument = async (documentToCreate) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: documentToCreate,
    });

    console.log(response);

    return response?.data || null;
  } catch (error) {
    console.error("Failed to create document:", error);
    return null;
  }
};

const getDocumentById = async (documentID) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: [documentID],
    });

    return response?.data?.documents?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return null;
  }
};

const handleTransporteurClick = async () => {
  try {
    const formId = store?.pageContentStore?.active?.[0];

    if (!formId) {
      console.log("No active selection found");
      return;
    }

    const rawDateFilter = store?.pageStore?.filterData?.Demande_DateHeureDebut;
    const dateFilter = rawDateFilter?.split("|")?.[0];

    if (!dateFilter) {
      console.log("No date filter found");
      return;
    }

    console.log("Timeline dateFilter:", dateFilter);

    let startTime = null;
    let endTime = null;

    let startDateTime = null;
    let endDateTime = null;

    const date = new Date(dateFilter);
    const dateStr = String(dateFilter).slice(0, 10);

    console.log("date", date);
    console.log("dateStr", dateStr);

    const jours = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];

    console.log("CURRENT DAY ACC TO DATE:", date.getDay());

    const jourFrancais = jours[date.getDay()];
    const key = `Horaire_${jourFrancais}`;

    console.log("Jour:", jourFrancais);
    console.log("Searching key:", key);

    const document = await getDocumentById(formId);

    if (!document) {
      console.log("No document returned");
      return;
    }

    const form = JSON.parse(document.data);
    const transporteurID = formId;

    console.log("transporteurID", transporteurID);
    console.log("116 form", form);
    console.log("FormIDlist", formId);

    const horaire = form?.[key];

    console.log("Horaire trouvé:", horaire);

    if (horaire && horaire.includes("|")) {
      const [rawStartTime, rawEndTime] = horaire.split("|");

      startTime = normalizeHHMM(rawStartTime);
      endTime = normalizeHHMM(rawEndTime);

      startDateTime = buildIsoDateTime(dateStr, startTime);
      endDateTime = buildIsoDateTime(dateStr, endTime);

      if (!startDateTime || !endDateTime) {
        console.log("Invalid schedule time format:", {
          rawStartTime,
          rawEndTime,
          startTime,
          endTime,
          startDateTime,
          endDateTime,
        });
        return;
      }

      console.log("Start time:", startTime);
      console.log("End time:", endTime);

      console.log("Start datetime:", startDateTime);
      console.log("End datetime:", endDateTime);
    } else {
      console.log("No schedule for this day");
      return;
    }

    const raison =
      store?.pageContentStore?.processData?.[0]?.edits
        ?.Transporteur_Indisponibilites_Raison;

    console.log("Raison:", raison);

    const nomTransporteur = form.Transporteur_NomPrenom;

    const data = {
      Transporteur_Indisponibilites_Date: dateStr,
      Transporteur_Indisponibilites_HeureDebut: startTime,
      Transporteur_Indisponibilites_HeureFin: endTime,
      Transporteur_Indisponibilites_TransporteurID: transporteurID,
      Transporteur_NomPrenom: nomTransporteur,
      Demande_DateHeureDebut: startDateTime,
      Demande_DateHeureFin: endDateTime,
      Transporteur_Indisponibilites_Raison: raison,
    };

    const documentToCreate = createCreateDocument(
      data,
      INDISPONIBILITES_FORMLAYOUTID,
    );

    console.log("Document to create:", documentToCreate);

    const res = await createDocument(documentToCreate);

    console.log("Created document:", res);
  } catch (err) {
    console.error(err);
  }
};

handleTransporteurClick();
