console.log("Function 97", context);

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

const getDisponibilitéById = async (id) => {
  try {
    const apiFilters = [
      { key: "FORMID", operator: "EQUALS", value: id, type: "TEXT" },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    return res?.data.document; // Retourne l'objet document existant ou null
  } catch (error) {
    console.error("Erreur lors de la vérification du bénéficiaire :", error);
    throw error;
  }
};

const getIdsDisponibilitéById = async (id) => {
  try {
    const apiFilters = [
      { key: "FORMID", operator: "EQUALS", value: id, type: "TEXT" },
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Disponibilité",
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

const updateDisponibilitésForms = async (
  ids,
  docData,
  formLayoutId_Disponibilite
) => {
  const documents = ids.map((id) => ({
    data: JSON.stringify(docData), // object of the keys from the Field DB and its new value
    status: "Enregistrée", // key from Status FormLayout
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

const createDisponibilitéForm = async (docData, formLayoutId) => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: JSON.stringify(docData),
        status: "Enregistrée",
        active: true,
        template: { templateId: formLayoutId },
      },
    });
    console.log("Formulaire créé avec succès :", response);
    return response;
  } catch (error) {
    console.error("Erreur lors de la création du formulaire :", error);
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

const haveChanged = (docData, data) => {
  if (
    docData.Planification_Date !== data.Planification_Date ||
    docData.Planification_HeureDébut !== data.Planification_HeureDébut ||
    docData.Planification_HeureFin !== data.Planification_HeureFin ||
    docData.Planification_Récurrence !== data.Planification_Récurrence
  ) {
    return true;
  }

  if (docData.Planification_Récurrence === "Par semaine") {
    if (
      docData.Planification_Répéter.split("|").sort().join("|") !==
        data.Planification_Répéter.split("|").sort().join("|") ||
      docData.Planification_DateFin !== data.Planification_DateFin
    ) {
      return true;
    }
  }

  if (docData.Planification_Récurrence === "Par jour spécifique") {
    if (
      docData.Planification_MultiDate.split("|").sort().join("|") !==
      data.Planification_MultiDate.split("|").sort().join("|")
    ) {
      return true;
    }
  }

  return false;
};

const modifyDocData = (docData) => {
  const {
    Planification_Répéter,
    Planification_MultiDate,
    Planification_DateFin,
    Planification_Récurrence,
    Planification_HeureFin,
    Planification_HeureDébut,
    Planification_Date,
    InformationsAdmin_DateHeureDébut,
    InformationsAdmin_DateHeureFin,
    IdentifiantFormulaireRécurrence,
    Exception_Récurrence,
    ...rest
  } = docData;
  return rest;
};

const main = async (docData) => {
  console.log("Début de l'exécution");

  const formLayoutId_Disponibilite = "cd81267c-4a6b-451b-846f-22999f0be1f5";

  if (!isValidDocument(t, docData)) {
    if (docData.STATUS === "Draft") {
      const res = await createDisponibilitéForm(
        docData,
        formLayoutId_Disponibilite
      );
      console.log("Résultat création :", res);
    } else {
      const data = await getDisponibilitéById(docData.FORMID);
      console.log("Données existantes :", data);

      if (!haveChanged(docData, JSON.parse(data.data))) {
        const newDocData = modifyDocData(docData);
        console.log("Données modifiées :", newDocData);
        const ids = await getDisponibilitéByFormReccurenceId(docData.FORMID);
        ids.push(docData.FORMID);

        console.log("ids : ", ids);

        await updateDisponibilitésForms(
          ids,
          newDocData,
          formLayoutId_Disponibilite
        );
      } else {
        const newDocData = { ...docData, Exception_Récurrence: "" };
        console.log("Données modifiées :", newDocData);
        const ids = await getDisponibilitéByFormReccurenceId(docData.FORMID);
        const id = [docData.FORMID];

        console.log("ids : ", ids);

        await updateDisponibilitésForms(
          id,
          newDocData,
          formLayoutId_Disponibilite
        );

        await deleteDisponibilitésForms(ids, formLayoutId_Disponibilite);
      }
    }
    navigateBack();
    //redirectToViewGroup()
  } else {
    console.log("Document invalide");
  }
};

// Exécuter la fonction principale
main(docData);
