console.log("Function 98", context);

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

const deleteDisponibilitésForms = async (ids, formLayoutId_Disponibilite) => {
  const documents = ids.map((id) => ({
    data: JSON.stringify({}), // object of the keys from the Field DB and its new value
    status: "Supprimé(e)", // key from Status FormLayout
    active: true,
    template: { templateId: formLayoutId_Disponibilite }, // id from DB FormLayout
    documentID: id, // FormID from DB Form
  }));

  console.log("documents", documents);
  api({ local: true })
    .put("document/Many", {
      documents: documents,
    })
    .then((res6) => {
      console.log("res6", res6);
    });
};

const getDisponibilitéByFormReccurenceId = async (id) => {
  try {
    const apiFilters = [
      {
        key: "IdentifiantFormulaireRécurrence",
        operator: "IN",
        value: id,
        type: "TEXT",
      },
      {
        key: "STATUS",
        operator: "EQUALS",
        value: "Enregistrée",
        type: "TEXT",
      },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res?.data.ids; // Retourne un tableau d'IDs ou null
  } catch (error) {
    console.error("Erreur lors de la vérification des disponibilités :", error);
    throw error;
  }
};

const main = async (docData) => {
  console.log("Début de l'exécution");

  const formLayoutId_Disponibilite = "cd81267c-4a6b-451b-846f-22999f0be1f5";

  const ids = await getDisponibilitéByFormReccurenceId(docData.FORMID);
  ids.push(docData.FORMID);

  console.log("ids : ", ids);

  await deleteDisponibilitésForms(ids, formLayoutId_Disponibilite);

  navigateBack();
  //redirectToViewGroup()
};

// Exécuter la fonction principale
main(docData);
