console.log("Function 524", context);

const showInvoiceCustomPopup = ({ title, fields, buttons }) =>
    new Promise((resolve) => {
        const overlay = document.createElement("div");
        const popup = document.createElement("form");
        const style = document.createElement("style");

        style.textContent = `
      .invoice-popup-overlay {
        position: fixed; inset: 0; z-index: 9999; display: flex;
        align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.4);
      }
      .invoice-popup {
        width: min(500px, calc(100vw - 32px)); padding: 24px;
        border-radius: 6px; background: #fff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .invoice-popup h2 { margin: 0 0 20px; color: #202127; font-size: 1.25rem; }
      .invoice-popup-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
      .invoice-popup-field label { color: #202127; font-size: 12px; }
      .invoice-popup-field input, .invoice-popup-field select {
        box-sizing: border-box; width: 100%; padding: 8px 10px;
        border: 1px solid #ccc; border-radius: 6px; font-size: 1rem;
      }
      .invoice-popup-field.invalid input, .invoice-popup-field.invalid select {
        border: 2px solid #dc2626;
      }
      .invoice-popup-calendar {
        position: absolute; z-index: 2; display: none; width: 280px;
        padding: 10px; background: #fff; border: 1px solid #ccc;
        border-radius: 6px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      .invoice-popup-calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .invoice-popup-calendar-header button { border: 0; background: transparent; cursor: pointer; font-size: 1.1rem; }
      .invoice-popup-calendar-title { font-weight: 600; }
      .invoice-popup-calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
      .invoice-popup-calendar-grid button { padding: 6px 2px; border: 0; border-radius: 4px; background: #fff; cursor: pointer; }
      .invoice-popup-calendar-grid button:hover, .invoice-popup-calendar-grid button.selected { background: #3182ce; color: #fff; }
      .invoice-popup-calendar-grid button.in-range { background: #dbeafe; }
      .invoice-popup-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
      .invoice-popup-buttons button {
        padding: 7px 20px; border: 0; border-radius: 6px; cursor: pointer; font-weight: 600;
      }
    `;
        overlay.className = "invoice-popup-overlay";
        popup.className = "invoice-popup";
        popup.addEventListener("submit", (event) => event.preventDefault());
        popup.appendChild(style);

        const titleElement = document.createElement("h2");
        titleElement.textContent = title;
        popup.appendChild(titleElement);

        const fieldElements = {};
        const fieldWrappers = {};
        const getValues = () =>
            Object.fromEntries(
                Object.entries(fieldElements).map(([key, element]) => [
                    key,
                    element.dataset.rangeValue || element.value,
                ]),
            );

        for (const field of fields) {
            const wrapper = document.createElement("div");
            const label = document.createElement("label");
            const errorMessage = document.createElement("div");
            label.textContent = field.name;
            if (field.required) {
                const requiredMark = document.createElement("span");
                requiredMark.textContent = " *";
                requiredMark.style.color = "#dc2626";
                label.appendChild(requiredMark);
            }
            wrapper.className = "invoice-popup-field";
            fieldWrappers[field.key] = wrapper;
            errorMessage.className = "invoice-popup-error";
            errorMessage.textContent = `Veuillez sélectionner ${field.name.toLocaleLowerCase("fr")}.`;
            errorMessage.style.cssText = "display:none;color:#dc2626;font-size:12px;margin-top:2px";
            wrapper.appendChild(label);

            if (field.type.toLowerCase() === "select") {
                const select = document.createElement("select");
                select.name = field.key;
                select.required = Boolean(field.required);
                for (const option of field.options || []) {
                    const optionElement = document.createElement("option");
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    select.appendChild(optionElement);
                }
                fieldElements[field.key] = select;
                select.addEventListener("change", () => {
                    if (select.value.trim()) {
                        wrapper.classList.remove("invalid");
                        errorMessage.style.display = "none";
                    }
                });
                wrapper.appendChild(select);
            } else if (field.type.toLowerCase() === "search") {
                const input = document.createElement("input");
                input.type = "search";
                input.name = field.key;
                input.required = Boolean(field.required);
                const dropdown = document.createElement("div");
                dropdown.style.cssText =
                    "position:absolute;left:0;right:0;top:100%;z-index:1;max-height:150px;overflow:auto;background:#fff;border:1px solid #ccc";
                wrapper.style.position = "relative";

                const updateSuggestions = async () => {
                    if (!input.value.trim()) {
                        dropdown.replaceChildren();
                        return;
                    }
                    const suggestions = await field.options.fetchSuggestions(input.value);
                    dropdown.replaceChildren(
                        ...suggestions.map((suggestion) => {
                            const option = document.createElement("button");
                            option.type = "button";
                            option.textContent = suggestion;
                            option.style.cssText = "display:block;width:100%;padding:8px;text-align:left;border:0;background:#fff;cursor:pointer";
                            option.onclick = () => {
                                input.value = suggestion;
                                dropdown.replaceChildren();
                            };
                            return option;
                        }),
                    );
                };
                input.addEventListener("input", updateSuggestions);
                fieldElements[field.key] = input;
                wrapper.append(input, dropdown);
            } else if (field.type.toLowerCase() === "daterange") {
                const range = document.createElement("div");
                const visibleInput = document.createElement("input");
                const calendar = document.createElement("div");
                const calendarHeader = document.createElement("div");
                const previousMonth = document.createElement("button");
                const nextMonth = document.createElement("button");
                const monthTitle = document.createElement("span");
                const calendarGrid = document.createElement("div");
                let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                let startDate = null;
                let endDate = null;

                visibleInput.type = "text";
                visibleInput.readOnly = true;
                visibleInput.required = Boolean(field.required);
                visibleInput.placeholder = "Sélectionner une période";
                calendar.className = "invoice-popup-calendar";
                previousMonth.type = nextMonth.type = "button";
                previousMonth.textContent = "‹";
                nextMonth.textContent = "›";
                calendarHeader.className = "invoice-popup-calendar-header";
                monthTitle.className = "invoice-popup-calendar-title";
                calendarGrid.className = "invoice-popup-calendar-grid";
                calendarHeader.append(previousMonth, monthTitle, nextMonth);
                calendar.append(calendarHeader, calendarGrid);

                const toDateValue = (date) =>
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                const formatDate = (date) =>
                    date.toLocaleDateString("fr-CA", { day: "2-digit", month: "2-digit", year: "numeric" });
                const updateRange = () => {
                    if (!startDate || !endDate) {
                        visibleInput.value = startDate ? `${formatDate(startDate)} au ...` : "";
                        visibleInput.dataset.rangeValue = "";
                        return;
                    }
                    if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
                    visibleInput.value = `${formatDate(startDate)} au ${formatDate(endDate)}`;
                    visibleInput.dataset.rangeValue = `${toDateValue(startDate)}|${toDateValue(endDate)}`;
                    calendar.style.display = "none";
                    fieldWrappers[field.key].classList.remove("invalid");
                };
                const renderCalendar = () => {
                    monthTitle.textContent = calendarMonth.toLocaleDateString("fr-CA", {
                        month: "long",
                        year: "numeric",
                    });
                    calendarGrid.replaceChildren();
                    ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].forEach((day) => {
                        const dayLabel = document.createElement("span");
                        dayLabel.textContent = day;
                        dayLabel.style.cssText = "padding:4px 2px;text-align:center;font-size:11px;color:#666";
                        calendarGrid.appendChild(dayLabel);
                    });
                    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                    const offset = (firstDay.getDay() + 6) % 7;
                    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                    for (let index = 0; index < offset; index++) calendarGrid.appendChild(document.createElement("span"));
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                        const dayButton = document.createElement("button");
                        const dateValue = toDateValue(date);
                        dayButton.type = "button";
                        dayButton.textContent = day;
                        if (startDate && dateValue === toDateValue(startDate) || endDate && dateValue === toDateValue(endDate)) {
                            dayButton.classList.add("selected");
                        } else if (startDate && endDate && date > startDate && date < endDate) {
                            dayButton.classList.add("in-range");
                        }
                        dayButton.onclick = () => {
                            if (!startDate || endDate) {
                                startDate = date;
                                endDate = null;
                            } else {
                                endDate = date;
                            }
                            updateRange();
                            renderCalendar();
                        };
                        calendarGrid.appendChild(dayButton);
                    }
                };
                previousMonth.onclick = () => {
                    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
                    renderCalendar();
                };
                nextMonth.onclick = () => {
                    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
                    renderCalendar();
                };
                visibleInput.onclick = () => {
                    calendar.style.display = "block";
                };
                range.style.position = "relative";
                range.append(visibleInput, calendar);
                fieldElements[field.key] = visibleInput;
                wrapper.appendChild(range);
                renderCalendar();
            }
            if (field.required) wrapper.appendChild(errorMessage);
            popup.appendChild(wrapper);
        }

        const buttonRow = document.createElement("div");
        buttonRow.className = "invoice-popup-buttons";
        for (const button of buttons) {
            const buttonElement = document.createElement("button");
            buttonElement.type = "button";
            buttonElement.textContent = button.name;
            buttonElement.style.backgroundColor = button.preset === "cancel" ? "#f5f5f6" : "#3182ce";
            buttonElement.style.color = button.preset === "cancel" ? "#2c2d32" : "#fff";
            buttonElement.onclick = () => {
                if (button.key !== "cancel") {
                    let isValid = true;
                    Object.entries(fieldElements).forEach(([key, element]) => {
                        const wrapper = fieldWrappers[key];
                        const errorMessage = wrapper.querySelector(".invoice-popup-error");
                        const fieldIsValid = !element.required || Boolean(element.value.trim());
                        wrapper.classList.toggle("invalid", !fieldIsValid);
                        if (errorMessage) errorMessage.style.display = fieldIsValid ? "none" : "block";
                        if (!fieldIsValid) isValid = false;
                    });
                    if (!isValid) {
                        return;
                    }
                    popup.reportValidity();
                }
                const result = button.onClick(getValues());
                resolve(result);
                overlay.remove();
            };
            buttonRow.appendChild(buttonElement);
        }
        popup.appendChild(buttonRow);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    });

const strTransportFormLayoutID = "6d75ae79-ced2-4a83-a41e-da016f27e530";
const strTransportDeGroupeFormLayoutID = "de3bc87f-64fd-409b-a7bb-fcd9a505650c";

const FACTURES_ORGANISME = {
    SANS_CONTRIBUTION_USAGER: "FactureDeLOrganismeSansContributionUsager",
    AVEC_CONTRIBUTION_USAGER: "FactureDeLOrganisme",
};

const headerMap = {
    Dates_DateTransport: "Date",
    Prix_transport: "Organisme",
    "Contrainte|2|NomClient": "Client",
    Etablissement_Adresse: "Adresse de départ",
    EtablissementDest_Adresse: "Adresse destination",
    KM_THEORIQUE: "Km aller-retour (arrêt exclus)",
    Km_pour_calcul_de_la_totalite:
        "Km aller-retour (arrêt et domicile du chauffeur inclus)",
    KM_TH: "Km aller (arrêt exclus)",
    Client_paye: "Client paye ?",
    TauxChauffeur: "Formule de rémunération",
    Dons_client: "Contribution parts d'usager",
    Part_Organisme: "Part organisme",
    Prix_totalite: "Prix de la totalité",
    VoyageBlanc: "Voyage Blanc",
    NumeroDemande: "Numéro de demande",
};

const downloadXLSX = (url, filename = "Facture.pdf") => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const convertToPDF = async (tableData, title = "", totals = {}) => {
    const {
        //totalKmTheorique,
        totalKmCalcul,
        //totalKmAller,
        totalDonsClient,
        totalPartOrganisme,
        //totalPrixTotalite
    } = totals;

    const request = {
        sheets: [
            {
                name: "Feuil1",
                datas: [
                    JSON.stringify({
                        Title: title,
                        //totalKmTheorique,
                        totalKmCalcul,
                        //totalKmAller,
                        ...(totalDonsClient != -1 && { totalDonsClient }),
                        totalPartOrganisme,
                        //totalPrixTotalite
                    }),
                ],
                sheetNames: ["Tournée"],
                tableDatas: [[tableData]],
            },
        ],
    };

    const factureTemplate =
        totalDonsClient == -1
            ? FACTURES_ORGANISME.SANS_CONTRIBUTION_USAGER
            : FACTURES_ORGANISME.AVEC_CONTRIBUTION_USAGER;

    try {
        const res = await api({ local: true }).post(
            `/document/download/sheets/${factureTemplate}/pdf/Feuille`,
            request,
        );

        return res.data.fileUrl;
    } catch (error) {
        console.error(
            "Erreur lors de la création du PDF:",
            error.response?.data || error,
        );
    }
};

const formatToAPI = (tournees) => {
    //   console.log("Tournees: ", tournees);
    const headers = [
        "Dates_DateTransport",
        //"Prix_transport",
        "Contrainte|2|NomClient",
        "Etablissement_Adresse",
        "EtablissementDest_Adresse",
        //"KM_THEORIQUE",
        "Km_pour_calcul_de_la_totalite",
        //"KM_TH",
        //"Client_paye",
        //"TauxChauffeur",
        //"Dons_client", //Contribution parts d'usager
        "Part_Organisme",
        //"Prix_totalite",
        //"VoyageBlanc"
    ];
    if (Object.hasOwn(tournees[0], "Dons_client")) {
        headers.splice(5, 0, "Dons_client");
    }
    if (Object.hasOwn(tournees[0], "NumeroDemande")) {
        headers.push("NumeroDemande");
    }
    const replacer = (key, value) => value ?? "";
    const rows = tournees.map((docData) =>
        headers.map((fieldKey) => {
            return JSON.stringify(docData[fieldKey], replacer).replace(/"/g, "");
        }),
    );

    return {
        headers: headers.map((k) => headerMap[k]),
        rows,
    };
};

const getDocuments = async (arrApiFilters) => {
    const filterResponseData = await api({ local: true }).post(
        "document/id/filter",
        { filters: arrApiFilters },
    );

    if (filterResponseData.status !== 200) {
        throw new Error("Problem during document/id/filter api call");
    }

    const arrFormIds = filterResponseData.data.ids;

    const documentResponseData = await api({ local: true }).post("document/id", {
        ids: arrFormIds,
    });

    if (documentResponseData.status !== 200) {
        throw new Error("Problem during document/id api call");
    }

    return documentResponseData.data.documents.map((doc) => ({
        ...doc,
        data: JSON.parse(doc.data),
    }));
};

const ORGANISMES = [
    "Âge d'Or de Campbell's Bay",
    "Âge d'Or FC/ Mansfield",
    "Âge d'Or IGC",
    "Âge d'Or Ouest Pontiac +RDJ",
    "ALPHI",
    "Association loisir",
    "AUCUN",
    "Autohomme Pontiac",
    "CAVAC",
    "Centre interval",
    "CISSO",
    "CISSO CDJ",
    "CLE",
    "CNESST",
    "Crep",
    "CSHBO",
    "Curateur",
    "Curateur + les Collines",
    "DPJ",
    "La RessourSe",
    "Les amis du manoir",
    "Les Collines",
    "Maison de la famille",
    "Maison des Jeunes",
    "Répit centre Serge Belair",
    "RessourSe + Les collines",
    "SAAQ",
    "Sécurité du Revenu",
    "Sécurité du revenu + collines",
    "Table des ainés retraités",
    "WISB",
    "WQSB",
];

const getClientSuggestions = async () => {
    const clients = await getDocuments([
        {
            key: "FORMLAYOUTNAME",
            operator: "EQUALS",
            value: "Client",
            type: "TEXT",
        },
        {
            key: "STATUS",
            operator: "EQUALS",
            value: "ACTIF",
            type: "TEXT",
        },
    ]);

    return clients
        .map((client) => client.data?.["Contrainte|2|NomClient"])
        .filter(Boolean)
        .filter((client, index, clientsList) => clientsList.indexOf(client) === index)
        .sort((a, b) => a.localeCompare(b, "fr"));
};

const showInvoicePopup = (clientSuggestions) =>
    new Promise((resolve) => {
        showInvoiceCustomPopup({
            title: "Générer la facture",
            fields: [
                {
                    key: "client",
                    name: "Client",
                    type: "SEARCH",
                    options: {
                        suggestions: clientSuggestions,
                        fetchSuggestions: async (search) => {
                            const normalizedSearch = search.trim().toLocaleLowerCase("fr");
                            return clientSuggestions.filter((client) =>
                                client.toLocaleLowerCase("fr").includes(normalizedSearch),
                            );
                        },
                    },
                    required: false,
                },
                {
                    key: "organisme",
                    name: "Organisme",
                    type: "SELECT",
                    options: [
                        { value: "", label: "" },
                        ...ORGANISMES.map((organisme) => ({
                            value: organisme,
                            label: organisme,
                        })),
                    ],
                    required: true,
                },
                {
                    key: "dates",
                    name: "Période",
                    type: "DATERANGE",
                    required: true,
                },
                {
                    key: "transportAdapte",
                    name: "Transport adapté",
                    type: "SELECT",
                    options: [
                        { value: "", label: "" },
                        ...["Oui", "Non"].map((value) => ({ value, label: value })),
                    ],
                    required: false,
                },
            ],
            buttons: [
                {
                    name: "Annuler",
                    key: "cancel",
                    preset: "cancel",
                    onClick: () => resolve(null),
                },
                { name: "Confirmer", preset: "action", onClick: resolve },
            ],
        });
    });

const buildInvoiceFilters = ({ client, organisme, dates }) => [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Transport",
        type: "TEXT",
    },
    {
        key: "STATUS",
        operator: "EQUALS",
        value: "CONFIRMÉ",
        type: "TEXT",
    },
    { key: "Prix_transport", operator: "EQUALS", value: organisme, type: "TEXT" },
    { key: "Dates_DateTransport", operator: "BETWEEN", value: dates, type: "DATE" },
    ...(client
        ? [{
            key: "Contrainte|2|NomClient",
            operator: "EQUALS",
            value: client,
            type: "TEXT",
        }]
        : []),
];

const filterByTransportAdapte = (docs, transportAdapte) => {
    if (!transportAdapte) return docs;

    const valeursOui = new Set([
        "Oui - non transférable",
        "Oui - transférable",
        "Temporaire",
    ]);

    return docs.filter((doc) => {
        const valeur = doc.data?.["Adapte_check"];
        return transportAdapte === "Oui"
            ? valeursOui.has(valeur)
            : valeur === "Non";
    });
};

const buildRowsData = async (forms) => {
    const organisme = forms[0].data.Prix_transport;
    const rowsData = [];

    let totalKmTheorique = 0;
    let totalKmCalcul = 0;
    let totalKmAller = 0;
    let totalDonsClient = 0;
    let totalPartOrganisme = 0;
    let totalPrixTotalite = 0;

    let hasKmTheorique = false;
    let hasKmCalcul = false;
    let hasKmAller = false;
    let hasDonsClient = false;
    let hasPartOrganisme = false;
    let hasPrixTotalite = false;

    const isCISSO = organisme.toUpperCase().includes("CISSO");
    const isSecuriteRevenu = organisme
        .toUpperCase()
        .includes("Sécurité du Revenu".toUpperCase());

    const safeNumber = (value) => {
        if (value === undefined || value === null || value === "") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    for (const f of forms) {
        if (!f || !f.data) continue;

        const kmTheorique = safeNumber(f.data?.["KM_THEORIQUE"]);
        const kmCalcul = safeNumber(f.data?.["Km_pour_calcul_de_la_totalite"]);
        const kmAller = safeNumber(f.data?.["KM_TH"]);
        const donsClient = safeNumber(f.data?.["Dons_client"]);
        const partOrganisme = safeNumber(f.data?.["Part_Organisme"]);
        const prixTotalite = safeNumber(f.data?.["Prix_totalite"]);

        if (kmTheorique !== null) {
            totalKmTheorique += kmTheorique;
            hasKmTheorique = true;
        }

        if (kmCalcul !== null) {
            totalKmCalcul += kmCalcul;
            hasKmCalcul = true;
        }

        if (kmAller !== null) {
            totalKmAller += kmAller;
            hasKmAller = true;
        }

        if (!isCISSO && !isSecuriteRevenu && donsClient !== null) {
            totalDonsClient += donsClient;
            hasDonsClient = true;
        }

        if (partOrganisme !== null) {
            totalPartOrganisme += partOrganisme;
            hasPartOrganisme = true;
        }

        if (prixTotalite !== null) {
            totalPrixTotalite += prixTotalite;
            hasPrixTotalite = true;
        }
        const rowData = {
            Dates_DateTransport: f.data?.["Dates_DateTransport"] ?? "",
            //Prix_transport: f.data?.["Prix_transport"] ?? "",
            "Contrainte|2|NomClient": f.data?.["Contrainte|2|NomClient"] ?? "",
            Etablissement_Adresse: f.data?.["Etablissement_Adresse"] ?? "",
            EtablissementDest_Adresse: f.data?.["EtablissementDest_Adresse"] ?? "",
            //KM_THEORIQUE: f.data?.["KM_THEORIQUE"] ?? "",
            Km_pour_calcul_de_la_totalite:
                f.data?.["Km_pour_calcul_de_la_totalite"] ?? "",
            //KM_TH: f.data?.["KM_TH"] ?? "",
            //Client_paye: f.data?.["Client_paye"] ?? "",
            //TauxChauffeur: f.data?.["TauxChauffeur"] ?? "",
            //Dons_client: f.data?.["Dons_client"] ?? "",
            Part_Organisme: f.data?.["Part_Organisme"] ?? "",
            //Prix_totalite: f.data?.["Prix_totalite"] ?? "",
            //VoyageBlanc: f.data?.["VoyageBlanc"] ?? ""
        };

        if (!isCISSO && !isSecuriteRevenu) {
            rowData.Dons_client = f.data?.["Dons_client"] ?? "";
        }
        if (isCISSO) {
            rowData.NumeroDemande = f.data?.["NumeroDemande"] ?? "";
        }
        rowsData.push(rowData);
    }

    rowsData.sort(
        (a, b) => new Date(a.Dates_DateTransport) - new Date(b.Dates_DateTransport),
    );

    const totals = {
        //totalKmTheorique: hasKmTheorique ? Number(totalKmTheorique.toFixed(2)) : "",
        totalKmCalcul: hasKmCalcul ? Number(totalKmCalcul.toFixed(2)) : "",
        //totalKmAller: hasKmAller ? Number(totalKmAller.toFixed(2)) : "",
        totalDonsClient: hasDonsClient ? Number(totalDonsClient.toFixed(2)) : "",
        totalPartOrganisme: hasPartOrganisme
            ? Number(totalPartOrganisme.toFixed(2))
            : "",
        //totalPrixTotalite: hasPrixTotalite ? Number(totalPrixTotalite.toFixed(2)) : ""
    };

    // Accounts for cases when totalDonsClients == 0 but still needs to show the field
    if (isCISSO || isSecuriteRevenu) totals.totalDonsClient = -1;

    return { rowsData, totals };
};

const main = async () => {
    const clientSuggestions = await getClientSuggestions();
    const values = await showInvoicePopup(clientSuggestions);
    if (!values) return [];

    const docs = filterByTransportAdapte(
        await getDocuments(buildInvoiceFilters(values)),
        values.transportAdapte,
    );
    if (docs.length === 0) {
        console.warn("Aucun transport trouvé pour les critères sélectionnés.");
        return [];
    }

    const parOrganisme = Object.groupBy(
        docs,
        (doc) => doc.data["Prix_transport"] ?? "AUCUN",
    );

    const results = [];

    for (const [organismeNom, forms] of Object.entries(parOrganisme)) {
        const { rowsData, totals } = await buildRowsData(forms, organismeNom);

        const tablePayload = formatToAPI(rowsData);

        const pdfTitle = organismeNom ? `Facture pour ${organismeNom}` : "Facture";

        const pdfUrl = await convertToPDF(tablePayload, pdfTitle, totals);

        if (pdfUrl) {
            const filename = `Facture_${organismeNom}.pdf`;

            downloadXLSX(pdfUrl, filename);

            results.push({
                Organisme: organismeNom,
                type: "pdf",
                url: pdfUrl,
            });
        }
    }

    return results;
};

main();