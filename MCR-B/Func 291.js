console.log("Function 291", context);

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

const redirectToViewGroup = () => {
  window.location.href = viewGroupUrl();
};

const formLayoutId_Vehicule = "56f6c94d-6706-4630-a0a6-3588cd954e06";

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
      data = {
        ...data,
        ...DataCollection(key, data[key]),
      };
    }
  });

  return JSON.stringify(excludeKeys(data, ["FORMID", "NUMBER"]));
};

const reactivateVehiculeForm = async (formId, formData, formLayoutId) => {
  try {
    const document = {
      data: formatDataAPI(formData),

      status: "Enregistré",

      active: true,

      template: {
        templateId: formLayoutId,
      },

      documentID: formId,
    };

    const res = await api({ local: true }).put("document", { document });

    console.log("Véhicule réactivé avec succès :", res);

    return res;
  } catch (error) {
    console.error("Erreur lors de la réactivation du véhicule :", error);

    throw error;
  }
};

const navigateBack = async () => {
  let viewGroup;

  const lastPage = localStorage.getItem("lastCustomPage");

  console.log("LAST PAGE ", lastPage);

  if (lastPage) {
    viewGroup = lastPage;
    window.location.href = viewGroup;
  } else {
    window.history.back();
  }
};

const main = async () => {
  const updatedDocData = {
    ...docData,

    VehiculeArchivage: null,

    STATUS: "Enregistré",
  };

  try {
    console.log("Réactivation du véhicule en cours...");

    await reactivateVehiculeForm(
      updatedDocData.FORMID,
      updatedDocData,
      formLayoutId_Vehicule,
    );

    navigateBack();
  } catch (error) {
    console.error("Erreur dans le processus principal :", error);

    throw error;
  }
};

main();
