console.log("Function 201", context);
const fieldIdNomTransporteur = "24b4400c-6631-46b9-8ab6-457837159b6c";
const fieldKeyNomTransporteur = "NomTransporteurSearch";

const dataCollection = (key, array) => {
  const result = {};
  (array || []).forEach((obj, index) => {
    Object.keys(obj || {}).forEach((currentKey) => {
      result[`${currentKey}|${index + 1}`] = obj[currentKey];
    });
  });
  result[key] = String(array?.length || 0);
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});

const formatDataAPI = (data) => {
  let normalizedData = { ...(data || {}) };
  Object.keys(normalizedData).forEach((key) => {
    if (Array.isArray(normalizedData[key])) {
      normalizedData = {
        ...normalizedData,
        ...dataCollection(key, normalizedData[key]),
      };
    }
  });
  return JSON.stringify(excludeKeys(normalizedData, ["FORMID", "NUMBER"]));
};

const updateDocument = async (documentToUpdate) => {
  try {
    const response = await api({ local: true }).put("document", {
      document: documentToUpdate,
      preventNotify: "DOCUMENT",
    });
    if (response?.status === 204) return true;
    return response?.data?.document || null;
  } catch (error) {
    return null;
  }
};

const updateUser = async (username, role) => {
  try {
    const res = await fetch(N8N_UPDATE_USER, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({
      //   username,
      //   role: role.toUpperCase(),
      // }),
      body: JSON.stringify({
        identity: {
          username,
          roles: [role.toUpperCase()],
          token: "",
        },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`UpdateUser failed ${res.status}: ${errorBody}`);
    }

    return res;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const getUser = async (email) => {
  try {
    const res = await api({ local: true }).get(`appuser/${encodeURIComponent(email)}`);

    if (res.status === 200) {
      return res.data.appUser;
    } else {
      console.error("Failed to fetch user ID:", res);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
};

const deleteUserFilter = async (fieldID, userID) => {
  try {
    const res = await api({ local: true }).delete(`userfilter/${fieldID}/${userID}`);

    if (res.status === 204) {
      console.log("User filter successfully deleted.");
    } else {
      console.error("Failed to delete user filter:", res);
    }
  } catch (error) {
    console.error("Error deleting user filter:", error);
    throw error;
  }
};

const setUserFilter = async (userID, key, value) => {
  try {
    const userFilter = {
      userFilter: {
        dtoName: "UserFilter",
        userID: userID,
        key: key,
        value: value,
        operator: "EQUALS",
        editable: "false",
      },
    };

    const res = await api({ local: true }).post("userfilter", userFilter);

    if (res.status === 201) {
      console.log("User filter successfully set.");
    } else {
      console.error("Failed to set user filter:", res);
    }
  } catch (error) {
    console.error("Error setting user filter:", error);
    throw error;
  }
};

const main = async () => {
  try {
    if (isValidDocument(t, docData)) return;

    showPopupLoading("Enregistrement en cours...");
     docData.Usager_NomComplet = `${docData["Utilisateur_Prenom"]} ${docData["Utilisateur_Nom"]}`.trim();

    const shouldDeleteUserFilter =
      docData["Utilisateur_Role"] !== "Transporteur" &&
      docData["Utilisateur_Role"] !== "Chauffeur" &&
      docData["NomTransporteurSearch"];

    if (shouldDeleteUserFilter) {
      docData["NomTransporteurSearch"] = "";
    }

    const formattedData = formatDataAPI(docData);

    const documentToUpdate = {
      data: formattedData,
      status: docData.STATUS,
      active: true,
      template: { templateId: "a9eaa665-43df-418c-91ce-c35d78992807" },
      documentID: docData.FORMID,
    };

    const updated = await updateDocument(documentToUpdate);
    if (!updated) throw new Error("Échec de l’enregistrement du profil.");
    const newRole = docData.Utilisateur_Role;
    const username =
      docData.Utilisateur_MethodeConnexion === "EntraID"
        ? docData.Utilisateur_CodeWindows
        : docData.Utilisateur_Courriel;
    await updateUser(username, newRole);

    const user = await getUser(username);
    if (!user?.id) {
      throw new Error("User not found");
    }

    const userFilters = Array.isArray(user.filters) ? user.filters : [];
    const existingChauffeurFilter = userFilters.find(filter => filter?.key === "Répartition_ChauffeurId");
    if (String(newRole || "").toUpperCase() === "CHAUFFEUR") {
      if (existingChauffeurFilter && (existingChauffeurFilter.value !== user.id || existingChauffeurFilter.operator !== "EQUALS" || existingChauffeurFilter.editable !== false)) {
        await deleteUserFilter(existingChauffeurFilter.fieldID, user.id);
        await setUserFilter(user.id, "Répartition_ChauffeurId", user.id);
      } else if (!existingChauffeurFilter) {
        await setUserFilter(user.id, "Répartition_ChauffeurId", user.id);
      }
    } else if (existingChauffeurFilter) {
      await deleteUserFilter(existingChauffeurFilter.fieldID, user.id);
    }

    const existingTransporteurFilter = userFilters.find(
      (filter) => filter?.key === fieldKeyNomTransporteur,
    );

    if (shouldDeleteUserFilter) {
      await deleteUserFilter(fieldIdNomTransporteur, user.id);
    } else if (docData["NomTransporteurSearch"]) {
      if (!existingTransporteurFilter) {
        await setUserFilter(user.id, fieldKeyNomTransporteur, docData["NomTransporteurSearch"]);
      } else if ((existingTransporteurFilter.value ?? "") !== docData["NomTransporteurSearch"]) {
        await deleteUserFilter(fieldIdNomTransporteur, user.id);
        await setUserFilter(user.id, fieldKeyNomTransporteur, docData["NomTransporteurSearch"]);
      }
    }

    hidePopupLoading();

    if (updated) {
      showSuccessBanner("Utilisateur enregistré.");
      setTimeout(() => {
        window.location.href = "/donnees/Utilisateurs_Chauffeurs";
      }, 700);
    } else {
      showErrorBanner("Erreur lors de l'enregistrement.");
    }
  } catch (e) {
    hidePopupLoading();
    showErrorBanner("Erreur lors de l'enregistrement.");
  }
};

main();
