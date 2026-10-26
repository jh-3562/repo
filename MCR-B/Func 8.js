console.log("Function 8", context);

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
  window.location.href = viewGroupUrl();
};

const formLayoutId_Mission = "0e44171d-1616-4a50-9b36-aff4d998c4a5";
// reason of refusal and date of refusal
const reasonOfRefusal = store.pageContentStore.processData[0].edits.RaisonRefus;
const dateMission =
  store.pageContentStore.processData[0].edits.Planification_Date;
// sync functions
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

const createMissionForm = async (formData, formLayoutId) => {
  try {
    const document = {
      // converts data in json
      data: formatDataAPI(formData),
      // set the status
      status: "Refusée",
      // set form as active
      active: true,
      // id of form template
      template: { templateId: formLayoutId },
    };

    // send data via API
    const res = await api({ local: true }).post("document", { document });

    return res;
  } catch (error) {
    console.error("Erreur lors de la création du formulaire mission :", error);
    throw error;
  }
};

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

// main
const main = async () => {
  const newDocData = {
    ...docData,
    RaisonRefus: reasonOfRefusal,
    Planification_Date: dateMission,
  };
  try {
    await createMissionForm(newDocData, formLayoutId_Mission);
    navigateBack();
    //redirectToViewGroup()
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    throw error;
  }
};

main();
