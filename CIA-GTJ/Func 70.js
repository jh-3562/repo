console.log("Function 70", context);

const showPopupMessage = (message, color = "#2ecc71", duration = 3000) => {
  let popup = document.getElementById("messagePopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "messagePopup";
    document.body.appendChild(popup);
  }
  popup.innerText = message;
  popup.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${color};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-size: 16px;
    transition: opacity 0.5s ease;
    opacity: 1;
  `;
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, duration);
};

const DataCollection = (key, array) => {
  let result = {};
  let itemCount = array?.length || 0;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((k) => {
      result[`${k}|${index + 1}`] = obj[k];
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

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const rendreInactif = async () => {
  const invalidKey = isValidDocument(t, docData);
  if (invalidKey) {
    console.warn(`Champ requis manquant : ${invalidKey}`);
    return;
  }

  const formID = docData.FORMID;
  if (!formID) {
    console.error("Erreur : FORMID manquant.");
    showPopupMessage("Erreur : formulaire introuvable", "#e74c3c");
    return;
  }

  const apiFilters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Transport",
      type: "TEXT",
    },
    {
      key: "Operation_NomDuTransporteur",
      operator: "EQUALS",
      value: `${docData.Transporteur_NomPrenom} - ${docData.Transporteur_Type}`,
      type: "TEXT",
    },
    /* {
      key: "DemandeAllerD_Date",
      operator: "BETWEEN",
      value: `${Date.now()}|2222-01-01`,
      type: "DATE",
    }, */
  ];

  const res = await getDocumentIDsByFilters(apiFilters);
  console.log("res", res);

  if (res.length > 0) {
    const docs = await getDocumentsByIDs(res);

    docs.forEach((doc) => {
      doc.data = JSON.parse(doc.data);
    });
    //console.log("docs", docs);

    showCustomPopup({
      title: "Rendre inactif",
      commentHTML:
        "Vous êtes sur le point de rendre ce transporteur inactif.\n Ce transporteur possède encore des transports planifiées dans le futur.\nLorsque vous rendez un transporteur inactif, les transports à venir seront automatiquement désassociés.",
      fields: [],
      buttons: [
        {
          name: "Annuler",
          backgroundColor: "#f1f1f1",
          color: "#000000",
          onClick: () => {
            console.log("Désactivation annulée par l'utilisateur.");
          },
          preset: "cancel",
        },
        {
          name: "Continuer",
          backgroundColor: "#1c5420",
          color: "#ffffff",
          onClick: (values) => {
            console.log("Désactivation confirmée.");

            const updatedDoc = [
              {
                data: formatDataAPI({ ...docData }),
                status: "Inactif",
                active: true,
                template: {
                  templateId: "90737127-32da-4bb9-8d95-54b986c978eb",
                },
                documentID: docData.FORMID,
              },
            ];

            docs.forEach((doc) => {
              updatedDoc.push({
                data: formatDataAPI({
                  ...doc.data,
                  Operation_NomDuTransporteur: null,
                }),
                status: "Soumis",
                active: true,
                template: {
                  templateId: doc.template.templateId,
                },
                documentID: doc.documentID,
              });
            });

            console.log(updatedDoc);

            api({ local: true })
              .put("document/Many", {
                documents: updatedDoc,
                preventNotify: "FULL",
              })
              .then(() => {
                showPopupMessage("Désactivée avec succès.", "#2ecc71");
                window.location.href = "/donnees/Donnees_Transporteur";
              })
              .catch((err) => {
                console.error("Erreur lors de la désactivation :", err);
                showPopupMessage("Erreur lors de la désactivation", "#e74c3c");
              });
          },
          preset: "action",
        },
      ],
    });
  } else {
    console.log("Désactivation confirmée.");

    const updatedDoc = {
      data: formatDataAPI({ ...docData }),
      status: "Inactif",
      active: true,
      template: { templateId: "90737127-32da-4bb9-8d95-54b986c978eb" },
      documentID: docData.FORMID,
    };

    api({ local: true })
      .put("document", { document: updatedDoc, preventNotify: "FULL" })
      .then(() => {
        showPopupMessage("Désactivée avec succès.", "#2ecc71");
        window.location.href = "/donnees/Donnees_Transporteur";
      })
      .catch((err) => {
        console.error("Erreur lors de la désactivation :", err);
        showPopupMessage("Erreur lors de la désactivation", "#e74c3c");
      });
  }
};

rendreInactif();
