console.log("Function 124", context);

/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get the viewGroup Url
 * This can be usefull in order to redirect the users
 * @returns
 */
const viewGroupUrl = () => {
  // Step 1: Get the current Url
  const currentUrl = window.location.href;
  // Step 2 : Remove the unecessary segments
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  const viewGroupUrl = parts.join("/");
  return viewGroupUrl;
};

/**
 * Redirect the user to the last viewgroup
 */
const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;

  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0];

  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found");
    return;
  }

  window.location.replace(`${origin}/${tenant}/transports`);
};

const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((key) => {
      let newKey = `${key}|${index + 1}`;
      result[newKey] = obj[key];
    });
  });
  result[key] = itemCount.toString();
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});

const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(excludeKeys(data, ["FORMID", "NUMBER"]));
};

const createForm = async (formData, status, formLayoutId) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: formatDataAPI(formData),
        status: status,
        active: true,
        template: { templateId: formLayoutId },
      },
    });
    console.log("Réponse de l'API :", response);
    return response;
  } catch (error) {
    console.error("Erreur lors de l'appel API :", error);
    throw error;
  }
};

const updateForm = async (formId, formData, formLayoutId, status) => {
  try {
    // Prépare les données à mettre à jour
    const document = {
      // Convertit les données en JSON
      data: formatDataAPI(formData),
      // Définit le statut du formulaire
      status: status,
      // Définit le formulaire comme actif
      active: true,
      // ID du modèle de formulaire
      template: { templateId: formLayoutId },
      // ID du formulaire existant à mettre à jour
      documentID: formId,
    };

    // Effectue la requête PUT pour mettre à jour le formulaire
    const res = await api({ local: true }).put("document", { document });

    console.log("Mise à jour réussie du formulaire mission :", res);
    return res;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du formulaire mission :",
      error,
    );
    throw error;
  }
};

const getOccurences = async (formId) => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "MISSION",
        type: "TEXT",
      },
      {
        key: "IdentifiantFormulaireRécurrence",
        operator: "EQUALS",
        value: formId,
        type: "TEXT",
      },
    ];

    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res?.data?.ids;
    return ids;
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

const getMissions = async (ids) => {
  console.log("ids", ids);
  try {
    const res = await api({ local: true }).post("document/id", {
      ids: ids,
    });
    const missions = res?.data.documents;
    console.log("Résultat de la vérification des missions :", missions);
    return missions;
  } catch (error) {
    console.error("Erreur lors de la vérification des missions :", error);
    throw error;
  }
};

function showErrorBanner(errorMessage) {
  let errorBanner = document.getElementById("errorBanner");

  if (!errorBanner) {
    errorBanner = document.createElement("div");
    errorBanner.id = "errorBanner";
    errorBanner.style = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(errorBanner);
  }

  errorBanner.innerHTML = `
    <div style="margin-right: 10px; color: red;">&#x26A0;</div><div>${errorMessage}</div>
    <div id="errorBannerProgress" style="position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;"></div>
  `;
  errorBanner.style.display = "flex";

  const progressElement = document.getElementById("errorBannerProgress");
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      errorBanner.style.display = "none";
      return;
    }
    width++;
    progressElement.style.width = width + "%";
  }, 55);
}

const navigateBack = async () => {
  let viewGroup;
  const lastPage = localStorage.getItem("lastCustomPage");
  console.log("LAST PAGE ", lastPage);
  if (lastPage) {
    // Extraire le premier segment (le viewgroup)
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back(); // fallback si rien n’est trouvé
  }
};

const main = async () => {
  const startModificationDate =
    store.pageContentStore.processData[0].edits.APartirDeBatchstep;
  console.log("context", context);

  // The previous recurrence still covers the days before this source starts: modifying earlier would create duplicates
  if (startModificationDate < docData.Planification_Date) {
    showErrorBanner(
      "La date « À partir de » ne peut pas être avant la date de début de la récurrence.",
    );
    return;
  }

  let createData = docData;
  const updateID = docData.FORMID;

  const formLayoutId = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
  const status = docData.STATUS;

  const d = new Date(startModificationDate);
  d.setDate(d.getDate() - 1);
  const Planification_DateFin = d.toISOString().split("T")[0];
  let updateData = {};
  if (docData.Planification_Récurrence === "Par semaine") {
    createData = {
      ...createData,
      Planification_Date: startModificationDate,
      Exception_Récurrence: "",
      InformationsAdmin_DateHeureDébut:
        startModificationDate +
        "T" +
        docData.InformationsAdmin_DateHeureDébut.split("T")[1],
    };

    // we lose InformationsAdmin_DateHeureFin on update because an ONCHANGE value update is triggered
    // the previous time must be saved in a constant field (InformationsAdmin_LastKnownDateHeureFin)
    // using this field instead ensures we correctly update the current mission and keep the same end time
    updateData = {
      Planification_DateFin: Planification_DateFin,
      InformationsAdmin_DateHeureFin:
        Planification_DateFin +
        "T" +
        docData.InformationsAdmin_LastKnownDateHeureFin.split("T")[1],
    };
  } else if (docData.Planification_Récurrence === "Par jour spécifique") {
    const multiDate = docData.Planification_MultiDate;
    const dateArray = multiDate.split("|");

    const newRecurrenceDates = dateArray.filter(
      (d) => new Date(d) >= new Date(startModificationDate),
    );

    console.log("filteredDates", newRecurrenceDates);

    createData = {
      ...createData,
      Planification_MultiDate: newRecurrenceDates.join("|"),
      Exception_Récurrence: "",
    };

    const otherDates = dateArray.filter((d) => !newRecurrenceDates.includes(d));

    updateData = {
      Planification_MultiDate: otherDates.join("|"),
      Planification_DateFin: Planification_DateFin,
      InformationsAdmin_DateHeureFin:
        Planification_DateFin +
        "T" +
        docData.InformationsAdmin_LastKnownDateHeureFin.split("T")[1],
    };
  }

  console.log("createData", createData);
  console.log("updateData", updateData);

  //modify occurence

  const occurences = await getOccurences(updateID);
  console.log("occurences", occurences);

  const missions = await getMissions(occurences);
  console.log("missions", missions);

  const newMissions = missions.filter((mission) => {
    const data = JSON.parse(mission.data);
    const isAfter = data.Planification_Date >= startModificationDate;

    if (mission.status === "Facturée") {
      createData = {
        ...createData,
        Exception_Récurrence: createData.Exception_Récurrence
          ? createData.Exception_Récurrence + "|" + data.Planification_Date
          : data.Planification_Date,
      };
    }
    return isAfter && mission.status !== "Facturée";
  });

  const updateResponse = await updateForm(
    updateID,
    updateData,
    formLayoutId,
    status,
  );

  const documents = newMissions.map((mission) => ({
    data: mission.data,
    status: "Supprimé(e)",
    active: mission.active,
    template: { templateId: mission.template.templateId },
    documentID: mission.documentID,
  }));

  console.log("updateResponse", updateResponse);
  const createResponse = await createForm(createData, status, formLayoutId);
  console.log("createResponse", createResponse);

  console.log("documents", documents);

  // Wait for the old occurrences to be deleted before redirecting, otherwise the request can be cancelled
  await api({ local: true })
    .put("document/Many", {
      documents: documents,
    })
    .then((res6) => {
      console.log("res6", res6);
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour des documents :", error);
    });

  const rawDate =
    docData.Planification_Date || docData.InformationsAdmin_DateHeureDébut;

  let timelineDate = null;

  if (rawDate) {
    const d =
      rawDate.length === 10
        ? new Date(`${rawDate}T00:00:00`)
        : new Date(rawDate);

    if (!isNaN(d)) {
      const offsetMin = d.getTimezoneOffset();
      const sign = offsetMin <= 0 ? "+" : "-";
      const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
      const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");

      timelineDate =
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` +
        `T00:00:00${sign}${hh}:${mm}`;
    }
  }

  // store for next page (timeline restoration)
  sessionStorage.removeItem("TRANSPORTS_TIMELINE_DATE");

  if (timelineDate) {
    sessionStorage.setItem("TRANSPORTS_TIMELINE_DATE", timelineDate);
  }

  // navigateBack();
  redirectToViewGroup();
};

if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  main();
}
