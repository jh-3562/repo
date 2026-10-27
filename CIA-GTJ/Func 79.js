console.log("Function 79", context);

const checkIfUserExist = async (email) => {
  try {
    const res = await api({ local: true }).get(`appuser`);
    if (res.status === 200 && res.data.appUsers) {
      const userExists = res.data.appUsers.some(
        (user) => user.username.toUpperCase() === email?.toUpperCase(),
      );
      if (userExists) {
        console.log("User already exists:", email);
        return true; // User exists
      } else {
        console.log("User does not exist:", email);
        return false; // User does not exist
      }
    } else {
      console.error("Failed to fetch users:", res);
      return false; // Default to false if the request fails
    }
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
};

const createUserForm = async (data) => {
  try {
    try {
      const response = await api({ local: true }).post("document", {
        document: {
          data: formatDataAPI(data),
          status: "Actif",
          active: true,
          template: { templateId: "1f384f8f-2c25-49cd-bde8-86e7d19a5a8b" },
        },
      });
      //console.log("Réponse de l'API :", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
    }
  } catch (error) {
    console.error("Erreur lors de la création du formulaire :", error);
    throw error;
  }
};

const userTypeToRole = (userType) => {
  switch (userType) {
    case "Admin de consultation":
      return ["Consultation"];
    case "Gestion d'accès":
      return ["GestionAcces"];
    case "Urgence sociale":
      return ["UrgenceSociale"];
    default:
      return [`${userType}`];
  }
};

const main = async () => {
  const isValid = await isValidDocument(t, docData);
  if (isValid !== undefined) return;

  const email = docData.Utilisateur_CodeWindows;

  if (await checkIfUserExist(email)) {
    showErrorBanner("Le compte utilisateur existe déjà");
    return;
  }
  showPopupLoading("Enregistrement de l'utilisateur en cours...");

  try {
    // Créer L'utilisateur externe (webhook)

    const res = await fetch(
      N8N_CREATEUSER,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          roles: userTypeToRole(docData.Utilisateur_Type),
        }),
      },
    );
    console.log("Webhook response:", res);

    if (res.status !== 200) {
      throw new Error(
        `Webhook failed with response: ${res.status} - ${res.statusText}`,
      );
    } else if (!(await checkIfUserExist(email))) {
      throw new Error(`Erreur lors de la création de l'utilisateur.`);
    }

    // Créer le formulaire Utilisateur
    const resForm = await createUserForm(docData);
    console.log("User form created successfully:", resForm);

    hidePopupLoading();
    showSuccessBanner("Utilisateur enregistré avec succès");
    window.history.go(-1);
    return;
  } catch (e) {
    console.log("Erreur attrapée :", e.message);
    hidePopupLoading();
    showErrorBanner("Erreur lors de la création de l'utilisateur");
  }
};

main();
