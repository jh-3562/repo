console.log("Function 290", context);

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
 */
const viewGroupUrl = () => {
  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");
  for (let i = 0; i < 3; i++) {
    const lastpart = parts[parts.length - 1];
    if (isUUID(lastpart) || lastpart === "new") {
      parts.pop();
    }
  }
  return parts.join("/");
};

//const redirectToViewGroup = () => {
//  window.location.href = viewGroupUrl();
//};

const formLayoutId_Mission = "0e44171d-1616-4a50-9b36-aff4d998c4a5";

// Sync functions
const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((k) => {
      let newKey = `${k}|${index + 1}`;
      result[newKey] = obj[k];
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
  let formattedData = { ...data };
  Object.keys(formattedData).forEach((key) => {
    if (Array.isArray(formattedData[key])) {
      formattedData = {
        ...formattedData,
        ...DataCollection(key, formattedData[key]),
      };
    }
  });
  return JSON.stringify(excludeKeys(formattedData, ["FORMID", "NUMBER"]));
};

const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    const document = {
      data: formatDataAPI(formData),
      status: "Acceptée",
      active: true,
      template: { templateId: formLayoutId },
      documentID: formId,
    };
    console.log(document);

    const res = await api({ local: true }).put("document", { document });
    console.log("Mise à jour réussie (Statut: Acceptée) :", res);
    return res;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du formulaire :", error);
    throw error;
  }
};

const navigateBack = async () => {
  const lastPage = localStorage.getItem("lastCustomPage");
  if (lastPage) {
    window.location.href = lastPage;
  } else {
    window.history.back();
  }
};

// Main execution logic
const main = async () => {
  // Check if the current status is "Annulée" before proceeding
  // Using docData or store data depending on your environment availability
  if (docData.status === "Annulée" || docData.STATUS === "Annulée") {
    const newDocData = {
      ...docData,
    };

    try {
      console.log("Passage du statut Annulée à Acceptée...");
      await updateMissionForm(
        newDocData.FORMID,
        newDocData,
        formLayoutId_Mission,
      );
      navigateBack();
    } catch (error) {
      console.error("Erreur dans le processus principal :", error);
    }
  } else {
    console.log("Le statut n'est pas 'Annulée', aucune action requise.");
  }
};

main();
