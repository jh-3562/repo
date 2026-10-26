console.log("Function141", context);
const FORM_LAYOUT_ID_MISSION = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
const TABLES_STORAGE_KEY = "tables";
const TIMELINE_DATE_KEY = "TRANSPORTS_TIMELINE_DATE";
const TIMELINE_DATE_REDIRECT_KEY = "TRANSPORTS_TIMELINE_DATE_REDIRECT";

// sync functions
const dataCollection = (key, array) => {
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

const formatDataAPI = (data) => {
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...dataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(data);
};

/**
 * Redirect explicitly to the Transports viewgroup
 * This avoids accidental navigation to other modules
 */
const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;

  // pathname example:
  // /mcr.arlon/transports/mission/new/UUID
  const segments = pathname.split("/").filter(Boolean);

  // The tenant is always the first segment (e.g. "mcr.arlon")
  const tenant = segments[0];

  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found in URL");
    return;
  }

  const targetUrl = `${origin}/${tenant}/transports`;

  window.location.href = targetUrl;
};

const getTimelineDate = (rawDate) => {
  if (!rawDate || typeof rawDate !== "string") return null;

  const date =
    rawDate.length === 10 ? new Date(`${rawDate}T00:00:00`) : new Date(rawDate);

  if (Number.isNaN(date.getTime())) return null;

  const offsetMin = date.getTimezoneOffset();
  const sign = offsetMin <= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
  const mm = String(Math.abs(offsetMin) % 60).padStart(2, "0");

  return (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` +
    `T00:00:00${sign}${hh}:${mm}`
  );
};

const updateTimelineStorage = (timelineDate) => {
  sessionStorage.removeItem(TIMELINE_DATE_KEY);

  if (!timelineDate) return;

  sessionStorage.setItem(TIMELINE_DATE_REDIRECT_KEY, timelineDate);

  const timelineDay = timelineDate.split("T")[0];
  const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || "{}");

  if (!tables.TimeLineChauffeur) {
    tables.TimeLineChauffeur = {};
  }

  if (!tables.TimeLineChauffeur.filters) {
    tables.TimeLineChauffeur.filters = {};
  }

  if (!tables.TimeLineChauffeur.mask) {
    tables.TimeLineChauffeur.mask = {};
  }

  if (!tables.TimeLineChauffeur.mask.TIMELINE) {
    tables.TimeLineChauffeur.mask.TIMELINE = {};
  }

  tables.TimeLineChauffeur.mask.TIMELINE.date = `${timelineDay}|${timelineDay}`;
  tables.TimeLineChauffeur.mask.TIMELINE.type = "DAY";

  localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
  console.log("[TIMELINE] Updated localStorage tables:", tables);
};

const save_form = async () => {
  try {
    const document = {
      data: formatDataAPI(docData),
      status: docData.STATUS,
      active: true,
      template: { templateId: FORM_LAYOUT_ID_MISSION },
      documentID: docData["FORMID"],
    };
    await api({ local: true }).put("document", {
      document: document,
      PreventNotify: "FULL",
    });
  } catch (error) {
    console.warn("Erreur lors de l`enregistrement du formulaire", error);
  }
};

// main function
const main = async () => {
  await save_form();

  const rawDate =
    docData.Planification_Date || docData.InformationsAdmin_DateHeureDébut;
  const timelineDate = getTimelineDate(rawDate);

  updateTimelineStorage(timelineDate);

  redirectToViewGroup();
};

if (!isValidDocument(t, docData)) {
  console.log(isValidDocument(t, docData));
  main();
}
