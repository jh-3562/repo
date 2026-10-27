console.log("Function 120", context);

const documentId = store?.pageContentStore?.active?.[0];

console.log("Selected document ID:", documentId);

const rows =
    store?.moduleStore?.tableDatas?.["Facturation_ÀFacturer"]?.rows || [];

const match = rows.find((row) => row.rowID === documentId);

if (!match) {

    console.log("No match found for documentId:", documentId);
    return;
}

console.log("Found matching row:", match);
console.log("Current status:", match.status);

const factureData = match?.data || {};

// ======================================================
// API FILTERS
// ======================================================

const transporteurApiFilters = [
    {
        key: "documentID",
        operator: "EQUALS",
        value: documentId,
        type: "TEXT",
    },
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Transporteur",
        type: "TEXT",
    },
];

// ======================================================
// FUNCTIONS
// ======================================================

const getValueOrOne = (value) =>
    value === "" || value === undefined ? "1" : value;

const getDocumentIDsByFilters = async (filters) => {

    try {

        console.log("Searching documents with filters:", filters);

        const response = await api({ local: true }).post(
            "document/id/filter",
            { filters }
        );

        console.log("Search response:", response?.data);

        return response?.data?.ids || [];

    } catch (error) {

        console.error("Failed to fetch document IDs:", error);
        return [];
    }
};

const createUpdateDocument = (data, templateId, status, docID) => ({
    data: JSON.stringify(data),
    status,
    active: true,
    template: { templateId },
    documentID: docID,
});

const updateDocument = async (documentToUpdate) => {

    try {

        const response = await api({ local: true }).put("document", {
            document: documentToUpdate,
        });

        console.log("FULL RESPONSE:", response);
        console.log("UPDATED DOCUMENT:", response?.data?.document);

        return response?.data?.document || null;

    } catch (error) {

        console.error("Failed to update document:", error);
        return null;
    }
};

const buildFacturationData = () => {

    const kmTauxPaves = getValueOrOne(factureData.Operation_Facture_KmTauxPaves);
    const kmTauxGravier = getValueOrOne(factureData.Operation_Facture_KmTauxGravier);
    const tauxHoraire = getValueOrOne(factureData.Operation_Facture_TauxHoraire);

    const kmParcourusPaves =
        Number(document.getElementById("kmPaves").value || 0);

    const kmParcourusGravier =
        Number(document.getElementById("kmGravier").value || 0);

    const tempsAttente =
        Number(document.getElementById("tempsAttente").value || 0);

    const stationnement =
        Number(document.getElementById("stationnement").value || 0);

    const hebergement =
        Number(document.getElementById("hebergement").value || 0);

    const autresDepenses =
        Number(document.getElementById("autresDepenses").value || 0);

    const repasTransporteur =
        Number(document.getElementById("repasTransporteur").value || 0);

    const repasUsager =
        Number(document.getElementById("repasUsager").value || 0);

    const kmCoutTotalPaves =
        Number(kmTauxPaves) * kmParcourusPaves;

    const kmCoutTotalGravier =
        Number(kmTauxGravier) * kmParcourusGravier;

    const coutAttenteTotal =
        Number(tauxHoraire) * tempsAttente;

    const diversTotal =
        stationnement +
        hebergement +
        autresDepenses +
        repasTransporteur +
        repasUsager;

    const grandTotal =
        kmCoutTotalPaves +
        kmCoutTotalGravier +
        coutAttenteTotal +
        diversTotal;

    return {

        Operation_Facture_KmParcourusPaves: document.getElementById("kmPaves").value,
        Operation_Facture_KmParcourusGravier: document.getElementById("kmGravier").value,
        Operation_Facture_TempsAttente: document.getElementById("tempsAttente").value,
        Operation_Facture_Stationnement: document.getElementById("stationnement").value,
        Operation_Facture_Hebergement: document.getElementById("hebergement").value,
        Operation_Facture_RepasUsager: document.getElementById("repasUsager").value,
        Operation_Facture_RepasTransporteur: document.getElementById("repasTransporteur").value,
        Operation_Facture_TypeRepas: document.getElementById("typeRepas").value,
        Operation_Facture_AutresDepenses: document.getElementById("autresDepenses").value,
        Operation_Facture_DepensePrecision: document.getElementById("precisionDepenses").value,

        Operation_Facture_KmCoutTotalPaves: kmCoutTotalPaves.toString(),
        Operation_Facture_KmCoutTotalGravier: kmCoutTotalGravier.toString(),
        Operation_Facture_CoutAttenteTotal: coutAttenteTotal.toString(),
        Operation_Facture_DiversTotal: diversTotal.toString(),
        Operation_Facture_GrandTotal: grandTotal.toString(),

        FraisRenseignes: true,
    };
};

const showSuccessBanner = (successMessage) => {
  const successBanner = createOrUpdateElement(
    "successBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 320px;
      height: 50px;
      background-color: white;
      color: #1e1e1e;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 6px;
      padding: 0 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: sans-serif;
    `,
    `
      <div style="margin-right: 10px; color: #2f9e44; font-size: 18px;">
        &#10003;
      </div>

      <div style="font-size: 14px;">
        ${successMessage}
      </div>

      <div id="successBannerProgress"
        style="position: absolute; bottom: 0; left: 0; height: 4px; width: 0%; background-color: #2f9e44;">
      </div>
    `
  );

  let progressElement = document.getElementById("successBannerProgress");
  let width = 0;

  let interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      successBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 50);
};

// ======================================================
// MAIN
// ======================================================

getDocumentIDsByFilters(transporteurApiFilters)

    .then((foundDocumentIDs) => {

        console.log("Found document IDs:", foundDocumentIDs);

        showCustomPopup({

            title: "Confirmer les détails de la facturation",

            commentHTML: `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; font-family: sans-serif;">

                    <div>
                        <label>Km pavés parcourus (Km)</label>
                        <input id="kmPaves" type="number"
                            value="${docData["Operation_Facture_KmParcourusPaves"] || ""}" />
                    </div>

                    <div>
                        <label>Km gravier parcourus (Km)</label>
                        <input id="kmGravier" type="number"
                            value="${docData["Operation_Facture_KmParcourusGravier"] || ""}" />
                    </div>

                    <div>
                        <label>Temps d'attente (h)</label>
                        <input id="tempsAttente" type="number"
                            value="${docData["Operation_Facture_TempsAttente"] || ""}" />
                    </div>

                    <div>
                        <label>Stationnement ($)</label>
                        <input id="stationnement" type="number"
                            value="${docData["Operation_Facture_Stationnement"] || ""}" />
                    </div>

                    <div>
                        <label>Hébergement ($)</label>
                        <input id="hebergement" type="number"
                            value="${docData["Operation_Facture_Hebergement"] || ""}" />
                    </div>

                    <div>
                        <label>Repas pour usager ($)</label>
                        <input id="repasUsager" type="number"
                            value="${docData["Operation_Facture_RepasUsager"] || ""}" />
                    </div>

                    <div>
                        <label>Repas pour transporteur ($)</label>
                        <input id="repasTransporteur" type="number"
                            value="${docData["Operation_Facture_RepasTransporteur"] || ""}" />
                    </div>

                    <div>
                        <label>Type de repas</label>

                        <select id="typeRepas">
                            <option value="">Sélectionner</option>

                            <option value="Déjeuner"
                                ${docData["Operation_Facture_TypeRepas"] === "Déjeuner" ? "selected" : ""}>
                                Déjeuner
                            </option>

                            <option value="Diner"
                                ${docData["Operation_Facture_TypeRepas"] === "Diner" ? "selected" : ""}>
                                Diner
                            </option>

                            <option value="Souper"
                                ${docData["Operation_Facture_TypeRepas"] === "Souper" ? "selected" : ""}>
                                Souper
                            </option>
                        </select>
                    </div>

                    <div>
                        <label>Autres dépenses (précisez)</label>
                        <input id="autresDepenses" type="number"
                            value="${docData["Operation_Facture_AutresDepenses"] || ""}" />
                    </div>

                    <div>
                        <label>Précision des autres dépenses</label>
                        <input id="precisionDepenses" type="text"
                            value="${docData["Operation_Facture_DepensePrecision"] || ""}" />
                    </div>

                </div>

                <style>
                    label {
                        display: block;
                        margin-bottom: 4px;
                        font-size: 13px;
                    }

                    input {
                        width: 100%;
                        padding: 6px 8px;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        outline: none;
                    }

                    input:focus {
                        border-color: #4dabf7;
                    }

                    input,
                    select {
                        width: 100%;
                        padding: 6px 8px;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        outline: none;
                    }

                    input:focus,
                    select:focus {
                        border-color: #4dabf7;
                    }
                </style>
            `,

            buttons: [

                {
                    name: "Retour",
                    backgroundColor: "#e9ecef",
                    color: "#1e1e1e",
                    onClick: () => {},
                },

                {
                    name: "Confirmer",
                    backgroundColor: "#2f9e44",
                    color: "white",

                    onClick: async () => {

                        try {

                            const data = buildFacturationData();

                            console.log("Collected form data:", data);

                            const documentToUpdate = createUpdateDocument(
                                data,
                                "017d9a14-b828-4cc5-8a9a-8906c1fcab59",
                                match.status,
                                documentId
                            );

                            const response = await updateDocument(documentToUpdate);

                            showSuccessBanner("Saisie des frais enregistrée avec succès");

                            console.log("Update completed:", response);

                        } catch (error) {

                            console.error("Confirmation/update failed:", error);
                        }
                    },
                },
            ],
        });

    })

    .catch((error) => {

        console.error("Search failed:", error);

    });
