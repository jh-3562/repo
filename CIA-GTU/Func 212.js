console.log("Fonction 212 - Readonly champs Utilisateur création", context);

    if (docData.STATUS !== "Draft") {
      return {
        Utilisateur_MethodeConnexion: true,
        Utilisateur_CodeWindows: true,
        Utilisateur_Courriel: true,
      };
    }
