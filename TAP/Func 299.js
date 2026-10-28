console.log("Function 299", context);

const headerMap = {
    Dates_DateTransport: "Date",
    TypeTransport: "Type de transport",
    "Contrainte|2|NomClient": "Client",
    Telephones: "Téléphone(s)",
    EtablissementDest_HeureRDV: "RDV",
    Attente_Prevue: "Attente",
    Etablissement_Adresse: "Adresse origine",
    EtablissementDest_Adresse: "Adresse destination",
    AdresseDestination2: "Adresse de l'arrêt",
    Appareil_liste: "Appareil(s)",
    NombreAccompagnant: "Nb accomp.",
    Dons_client: "Parts d'usager",
    InfosSup_Feuille: "Feuille",
    CommentaireTransport: "Commentaires transport",
};

// Triggers the download of the XLSX file
const downloadXLSX = (url, filename = "FeuilleDeRoute.pdf") => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename; // Filename to save as
    document.body.appendChild(link); // Append the link to the DOM
    link.click(); // Trigger the download
    document.body.removeChild(link); // Remove the link after clicking
};
const convertToExcel = async (tableData, title = "") => {
    const request = {
        sheets: [
            {
                name: "Feuil1",
                datas: [`{'Title': '${title}'}`],
                sheetNames: ["Dispo"],
                tableDatas: [[tableData]],
            },
        ],
    };

    try {
        console.log(request);
        const res = await api({ local: true }).post(
            `/document/download/sheets/FeuilleDeRoute/pdf/Feuille_${title.trim().split(/\s+/).join("_")}`,
            request,
        );
        console.log("API RESPONSE: ", res);
        const url = res.data.fileUrl;
        //downloadXLSX(url);
        return url;
    } catch (error) {
        console.error("Erreur lors de la création du fichier: ", error);
    }
};

const formatToAPI = (documents) => {
    const headers = [
        "Dates_DateTransport",
        "TypeTransport",
        "Contrainte|2|NomClient",
        "Telephones",
        "EtablissementDest_HeureRDV",
        "Attente_Prevue",
        "Etablissement_Adresse",
        "EtablissementDest_Adresse",
        "AdresseDestination2",
        "Appareil_liste",
        "NombreAccompagnant",
        "Dons_client",
        "InfosSup_Feuille",
        "CommentaireTransport",
    ];

    const replacer = (key, value) => value ?? "";
    const contents = documents.map((doc) =>
        headers.map((fieldKey) => {
            if (fieldKey === "Telephones") {
                const t1 = doc["Telephone1"];
                const t2 = doc["Telephone2"];
                return [t1, t2].filter(Boolean).join("\n");
            }
            if (fieldKey === "Etablissement_Adresse") {
                const debut1 = doc["Etablissement_NomLieu"];
                const debut2 = doc["Etablissement_Adresse"];
                return [debut1, debut2].filter(Boolean).join("\n");
            }
            if (fieldKey === "EtablissementDest_Adresse") {
                const dest1 = doc["EtablissementDest_NomLieu"];
                const dest2 = doc["EtablissementDest_Adresse"];
                return [dest1, dest2].filter(Boolean).join("\n");
            }
            if (fieldKey === "AdresseDestination2") {
                const stop1 = doc["Nomdulieu22"];
                const stop2 = doc["AdresseDestination2"];
                return [stop1, stop2].filter(Boolean).join("\n");
            }
            return JSON.stringify(doc[fieldKey], replacer).replace(/"/g, "");
        }),
    );

    return {
        headers: headers.map((key) => headerMap[key]),
        rows: contents,
    };
};

const getDocuments = async (arrApiFilters) => {
    const filterResponseData = await api({ local: true }).post("document/id/filter", {
        filters: arrApiFilters,
    });

    if (filterResponseData.status !== 200) {
        throw new Error("Problem during document/id/filter api call");
    }

    const arrFormIds = filterResponseData.data.ids;

    const documentResponseData = await api({ local: true }).post(`document/id`, {
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

const generateDateRangeList = (dateRange) => {
    const currentDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const dateList = [];

    while (currentDate <= endDate) {
        dateList.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateList;
};

const date = store.pageContentStore.processData[0].edits.IntervalleDate;

const apiFilters = [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Transport",
        type: "TEXT",
    },
    {
        key: "STATUS",
        operator: "IN",
        value: "CONFIRMÉ|EXPORTÉ(E)",
        type: "TEXT",
    },
    {
        key: "Dates_DateTransport",
        operator: "BETWEEN",
        value: date,
        type: "DATE",
    },
];

// Generates the list of dates between the dates selected in the DATERANGE
const dateList = generateDateRangeList(date.split("|"));
console.log("Date List: ", dateList);
// const dateList = date.split("|"); // Sépare les dates

const main = async () => {
    const allMapList = [];

    for (const singleDate of dateList) {
        const apiFilters = [
            {
                key: "FORMLAYOUTNAME",
                operator: "EQUALS",
                value: "Transport",
                type: "TEXT",
            },
            {
                key: "STATUS",
                operator: "IN",
                value: "CONFIRMÉ|EXPORTÉ(E)",
                type: "TEXT",
            },
            {
                key: "Dates_DateTransport",
                operator: "EQUALS",
                value: singleDate,
                type: "DATE",
            },
        ];

        const allDocs = await getDocuments(apiFilters);
        const docs = allDocs.filter((doc) => (doc.data["EnvoieFeuilleDeRoute"] ?? "") !== "NON");
        const byRoute = Object.groupBy(docs, (doc) => doc.data["Contrainte|1|Chauffeur"]);
        for (const [key, value] of Object.entries(byRoute)) {
            const chauffeurFilter = [
                {
                    key: "FORMLAYOUTNAME",
                    operator: "EQUALS",
                    value: "Chauffeur",
                    type: "TEXT",
                },
                {
                    key: "Contrainte|1|Chauffeur",
                    operator: "EQUALS",
                    value: key,
                    type: "TEXT",
                },
            ];

            if (
                value[0].data["TypeTransport"] === "ALLER" ||
                value[0].data["TypeTransport"] === "RETOUR"
            ) {
                value[0].data["Distance"] = value[0].data["KM_TH"];
            } else {
                value[0].data["Distance"] = value[0].data["KM_THEORIQUE"];
            }
            const chauffeur = await getDocuments(chauffeurFilter);
            const add = {
                Chauffeur: key,
                date: singleDate,
            };
            console.log("TEST6");

            if (chauffeur.length)
                add.mail = chauffeur[0].data["Chauffeur_email"] || "william.de-santis@fastercom.app";

            value.sort((a, b) => {
                const h1 = a.data["EtablissementDest_HeureRDV"] ?? "";
                const h2 = b.data["EtablissementDest_HeureRDV"] ?? "";

                const toMinutes = (h) => {
                    if (!h || !h.includes(":")) return Number.MAX_SAFE_INTEGER;
                    const [H, M] = h.split(":").map(Number);
                    return H * 60 + M;
                };

                return toMinutes(h1) - toMinutes(h2);
            });

            const url = await convertToExcel(formatToAPI(value.map((doc) => doc.data)), key);
            add.url = url;
            allMapList.push(add);
            console.log("ALLMAPLIST ", allMapList);
        }
    }
    //const datejoined = dateList.join("-");
    // here is the normal webhook
    /*
   await api().post(
     N8N_LINK_ENVOYER_FEUILLE + `?date=${date}&type=fdr`,
     allMapList
   );
   */
    // here is the test webhook
    await api().post(N8N_LINK_ENVOYER_FEUILLE_TEST + `?date=${date}&type=fdr`, allMapList);
    console.log("Demande d'envoi des feuilles de routes envoyée");
};

main();