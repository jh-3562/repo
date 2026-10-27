console.log("Function 144 - Recherche PIJ", context);

const numero = docData["Demande_IdentificationIdentficationUsagerNuméroDossierPIJ"];

if (numero && numero.length > 2) {

  const mapping = [
    { pijKey: "NO_PERSONNE", key: "Demande_IdentificationIdentficationUsagerNuméroDossierPIJ", name: "Numéro de dossier PIJ" },
    { pijKey: "PRENOM", key: "Demande_IdentificationIdentficationUsagerPrénom", name: "Prénom de l'usager" },
    { pijKey: "NOM", key: "Demande_IdentificationIdentficationUsagerNom", name: "Nom de l'usager" },
    { pijKey: "SEXE", key: "Demande_IdentificationIdentficationUsagerSexe", name: "Sexe" },
    { pijKey: "DATE_NAISSANCE", key: "Demande_IdentificationIdentficationUsagerDateNaissance", name: "Date de naissance" },
    { pijKey: "MILIEU_VIE", key: "Demande_IdentificationIdentficationUsagerMilieuVie", name: "Milieu de vie" },
    { pijKey: "CADRE_LEGAL", key: "Demande_IdentificationIdentficationUsagerCadreLégal", name: "Cadre légal" },
  ];

  const CONFIG = {
    N8N_URL: "https://n8n-cia-gtj-test.reg08.rtss.qc.ca/webhook/811a825f-1350-433d-a943-1495ac13070f",
  };

  api({ local: false }).get(`${CONFIG.N8N_URL}?numero=${encodeURIComponent(numero)}`)
    .then((res) => {

      if (!res || !res.data) {
        throw new Error("Aucune réponse");
      }

      const infos = res?.data;

      // Toujours travailler avec un tableau
      const liste = Array.isArray(infos) ? infos : [infos];

      const suggestions = liste.map((info) => {

        const dataResponse = {};

        mapping.forEach((field) => {
          dataResponse[field.key] = info?.[field.pijKey] ?? "";
        });

        return {
          title: `${info?.NO_PERSONNE ?? ""}`,
          fields: mapping.map((field) => ({
            name: field.name,
            key: field.key,
            value: dataResponse[field.key],
          })),
        };
      });

      console.log("suggestions", suggestions);

      callback({
        suggestions: {
          ["Demande_IdentificationIdentficationUsagerNuméroDossierPIJ"]:
            suggestions,
        },
      });

    })

    .catch((error) => {
      console.log("erreur", error);

      callback({
        suggestions: {
          ["Demande_IdentificationIdentficationUsagerNuméroDossierPIJ"]: [],
        },
      });
    });

} else {
  callback({
    suggestions: {
      ["Demande_IdentificationIdentficationUsagerNuméroDossierPIJ"]: [],
    },
  });
}
