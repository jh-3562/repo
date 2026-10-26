console.log("Function 131", context);

// TODO : À nettoyer -> Cette fonction créer toujours un formulaire au statut
// "Refusée", pas besoin de différencier le cas où le formulaire est draft ou non.

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
const reasonOfAnnulation =
  store.pageContentStore.processData[0].edits.RaisonAnnulationAffichage;
const askedBy =
  store.pageContentStore.processData[0].edits.AnnulationDemandéPar;
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

const updateMissionForm = async (formId, formData, formLayoutId) => {
  try {
    // prepares data to update
    const document = {
      // converts data in json
      data: formatDataAPI(formData),
      // set the status
      status: "Annulée",
      // set to active
      active: true,
      // id of template
      template: { templateId: formLayoutId },
      // id of existing form to update
      documentID: formId,
    };

    // put API to update form
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
    RaisonAnnulation: reasonOfAnnulation,
    AnnulationDemandéPar: askedBy,
  };
  try {
    console.log("Mise à jour du formulaire mission existant.");
    await updateMissionForm(
      newDocData.FORMID,
      newDocData,
      formLayoutId_Mission,
    );
    navigateBack();
    //redirectToViewGroup()
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);
    throw error;
  }
};

main();
