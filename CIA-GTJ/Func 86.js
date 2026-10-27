console.log("Function 86", context);

const updateUserForm = async (data) => {
  try {
    try {
      const response = await api({ local: true }).put("document", {
        document: {
          data: formatDataAPI(data),
          status: "Inactif",
          active: true,
          template: { templateId: "1f384f8f-2c25-49cd-bde8-86e7d19a5a8b" },
          documentID: data.FORMID,
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
  showPopupLoading("Enregistrement de l'utilisateur en cours...");

  try {
    // Mettre à jour l'utilisateur externe (webhook)
    const res = await fetch(
      N8N_UPDATEUSER,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: docData.Utilisateur_Courriel,
          id: docData.Utilisateur_CodeWindows,
          roles: userTypeToRole(docData.Utilisateur_Type),
        }),
      },
    );
    console.log("Webhook response:", res);

    if (res.status !== 200) {
      throw new Error(
        `Webhook failed with response: ${res.status} - ${res.statusText}`,
      );
    }

    // Modifier le formulaire Utilisateur
    await updateUserForm(docData);
    hidePopupLoading();
    showSuccessBanner("Utilisateur désactivé avec succès");
    window.history.go(-1);
    return;
  } catch (e) {
    console.log("Erreur attrapée :", e.message);
    hidePopupLoading();
    showErrorBanner("Erreur lors de la désactivation de l'utilisateur");
  }
};

main();
