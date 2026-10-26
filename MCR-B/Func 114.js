console.log("Function 114", context);

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
// to update the facture form
const updateFactureForms = async (formData) => {
  const document = {
    data: formatDataAPI(formData), // object of the keys from the Field DB and its new value
    status: "Supprimé(e)", // key from Status FormLayout
    active: true,
    template: { templateId: "81e43068-2f10-426b-b78b-dfd855136bd5" }, // id from DB FormLayout
    documentID: docData.FORMID, // FormID from DB Form
  };

  // update the form
  const res1 = api({ local: true }).put("document", {
    document,
  });
};

// main
const main = async () => {
  await updateFactureForms(docData);
  navigateBack();
  //redirectToViewGroup()
};

// Exécuter la fonction principale
main();
