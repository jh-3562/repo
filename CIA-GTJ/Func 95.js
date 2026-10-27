console.log("Function 95", context);

const { username: emailUser, roles } = store.moduleStore.user;

const fetchUserDoc = async (email, isIntervenant) => {
  try {
    const { data: { ids = [] } = {} } = await api({ local: true }).post(
      "document/id/filter",
      {
        filters: [
          {
            key: "FORMLAYOUTNAME",
            operator: "EQUALS",
            value: "Utilisateur",
            type: "TEXT",
          },
          {
            key: `Utilisateur_Courriel${isIntervenant ? "Intervenant" : ""}`,
            operator: "EQUALS",
            value: email,
            type: "TEXT",
          },
        ],
      },
    );

    if (!ids.length) return null;

    const { data: { documents = [] } = {} } = await api({ local: true }).post(
      "document/id",
      { ids },
    );

    const doc = documents[0];
    if (!doc) return null;

    return { ...doc, data: JSON.parse(doc.data) };
  } catch (e) {
    console.error("Fetch user failed:", e);
    return null;
  }
};

const mapIntervenantData = (d = {}) => ({
  ["Nom complet de l'usager"]:
    d.Utilisateur_PrenomIntervenant + " " + d.Utilisateur_NomIntervenant,
  Demande_IdentificationIdentificationPrénomIntervenant:
    d.Utilisateur_PrenomIntervenant || "",
  Demande_IdentificationIdentificationNomIntervenant:
    d.Utilisateur_NomIntervenant || "",
  Demande_IdentificationIdentificationTelephoneIntervenant:
    d.Utilisateur_TelephoneIntervenant || "",
  Demande_IdentificationIdentificationPosteIntervenant:
    d.Utilisateur_PosteIntervenant || "",
  Demande_IdentificationIdentificationCourrielIntervenant:
    d.Utilisateur_CourrielIntervenant || "",
  Demande_IdentificationIdentificationProgrammeIntervenant:
    d.Utilisateur_ProgrmmeIntervenant || "",
  Demande_IdentificationIdentificationSecteurIntervenant:
    d.Utilisateur_SecteurIntervenant || "",
  Demande_IdentificationChefServicePrenomChef: d.Utilisateur_PrenomChef || "",
  Demande_IdentificationChefServiceNomChef: d.Utilisateur_NomChef || "",
  Demande_IdentificationChefServiceTelephoneChef:
    d.Utilisateur_TelephoneChef || "",
  Demande_IdentificationChefServicePosteChef: d.Utilisateur_PosteChef || "",
  Demande_IdentificationChefServiceCourrielChef:
    d.Utilisateur_CourrielChef || "",
});

const main = async () => {
  let data = {};

  if (
    roles.includes("INTERVENANT") &&
    (eventType === "ONLOAD" ||
      (eventType === "ONCHANGE" &&
        docData.Demande_IdentificationIdentificationCocherIntervenant ===
          "false"))
  ) {
    const user = await fetchUserDoc(emailUser, true);
    if (!user) return;

    //console.log("user info", user);
    data = mapIntervenantData(user.data);
  } else if (
    eventType === "ONCHANGE" &&
    docData.Demande_IdentificationIdentificationCocherIntervenant === "true"
  ) {
    const user =
      (await fetchUserDoc(emailUser, false)) ||
      (await fetchUserDoc(emailUser, true));
    if (!user) return;

    //console.log("user info", user);

    data = {
      ...Object.fromEntries(
        Object.keys(mapIntervenantData()).map((k) => [k, ""]),
      ),
      DemandeIdentificationIntervenant_CheckBoxPrénom:
        user.data?.Utilisateur_Prenom ||
        user.data?.Utilisateur_PrenomIntervenant,
      DemandeIdentificationIntervenant_CheckBoxNom:
        user.data?.Utilisateur_Nom || user.data?.Utilisateur_NomIntervenant,
      DemandeIdentificationIntervenant_CheckBoxCourriel:
        user.data?.Utilisateur_Courriel ||
        user.data?.Utilisateur_CourrielIntervenant,
    };
  }
  callback({ data });
};

main();
