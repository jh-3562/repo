console.log("Function 363", context);

const strTransportFormLayoutID = "6d75ae79-ced2-4a83-a41e-da016f27e530";
const strTransportDeGroupeFormLayoutID = "de3bc87f-64fd-409b-a7bb-fcd9a505650c";
const strTourneeFormLayoutID = "94e653b0-9a07-4be6-ad9b-6efaa44d9982";
const strDriverFormLayoutID = "1e027006-cfd7-447b-ba7f-a41f244051b3";
const strInputPeriod =
    store.pageContentStore.processData[0].edits["IntervalleDate"];

const getDocuments = async (arrApiFilters) => {
    const filterResponseData = await api({ local: true }).post(
        "document/id/filter",
        {
            filters: arrApiFilters,
        }
    );

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

    return documentResponseData.data.documents;
};

const createDocuments = async (arrDocumentsToCreate) => {
    try {
        const responseData = await api({ local: true }).post("document/Many", {
            documents: arrDocumentsToCreate,
        });

        return responseData?.data?.documents || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

const updateDocuments = async (arrDocumentsToUpdate) => {
    try {
        const responseData = await api({ local: true }).put("document/Many", {
            documents: arrDocumentsToUpdate,
        });

        return responseData?.data?.documents || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

/**
 * Check if the fieldValue obtained thanks to data[fieldKey]
 * represent an empty field.
 * @param {string} fieldValue
 * @returns {bool}
 */
const fieldIsEmpty = (fieldValue) => {
    return [undefined, ""].includes(fieldValue);
};

const getTransportationsDocuments = async () => {
    const arrApiFilters = [
        {
            key: "FORMLAYOUTID", // key from DB Field
            operator: "IN", // operatorNK from DB Operator
            value:
                strTransportFormLayoutID + "|" + strTransportDeGroupeFormLayoutID,
            type: "TEXT", // FieldTypeNk from DB FieldType
        },
        {
            key: "STATUS", // key from DB Field
            operator: "IN", // operatorNK from DB Operator
            value: "SOUMIS|PLANIFIÉ|CONFIRMÉ|VOYAGE BLANC",
            type: "TEXT", // FieldTypeNk from DB FieldType
        },
        {
            key: "Dates_DateTransport",
            operator: "BETWEEN",
            value: strInputPeriod,
            type: "DATE",
        },
    ];
    return await getDocuments(arrApiFilters);
};
const getTourneeDocuments = async () => {
    const arrApiFilters = [
        {
            key: "FORMLAYOUTID", // key from DB Field
            operator: "IN", // operatorNK from DB Operator
            value: strTourneeFormLayoutID,
            type: "TEXT", // FieldTypeNk from DB FieldType
        },
        {
            key: "STATUS", // key from DB Field
            operator: "NOTIN", // operatorNK from DB Operator
            value: "SUPPRIMÉE",
            type: "TEXT", // FieldTypeNk from DB FieldType
        },
        {
            key: "Dates_DateTransport",
            operator: "BETWEEN",
            value: strInputPeriod,
            type: "DATE",
        },
    ];
    return await getDocuments(arrApiFilters);
};
const getDriversDates = (documents, driverFieldKey, dateFieldKey) => {
    const arrDocumentsDatas = documents.map((document) =>
        JSON.parse(document.data)
    );
    const arrDriversDates = [];
    for (const data of arrDocumentsDatas) {
        const driverName = data[driverFieldKey];
        const transportationDate = data[dateFieldKey];
        if (!fieldIsEmpty(driverName) && !fieldIsEmpty(transportationDate)) {
            const arrDriverDateToAdd = [driverName, transportationDate];
            const isAlreadyListed = arrDriversDates.find(
                (arrDriverDate) =>
                    JSON.stringify(arrDriverDateToAdd) ===
                    JSON.stringify(arrDriverDate)
            );
            if (!isAlreadyListed) {
                arrDriversDates.push(arrDriverDateToAdd);
            }
        }
    }
    return arrDriversDates;
};

const getTourneeDriverDatesToCreate = async (arrTransportationDocuments, arrTourneeDocuments) => {
    const neededDriverDates = getDriversDates(
        arrTransportationDocuments,
        "Contrainte|1|Chauffeur",
        "Dates_DateTransport"
    );

    console.log("neededDriverDates", neededDriverDates);

    const actualDriverDates = getDriversDates(
        arrTourneeDocuments,
        "Contrainte|1|Chauffeur",
        "Dates_DateTransport"
    );

    // Keep only the tuple [driver, date] when there is no tournee
    // matching in order to create the tournee form.
    const result = neededDriverDates.filter(
        (neededDriverDate) =>
            !actualDriverDates.some(
                (actualDriverDate) =>
                    JSON.stringify(actualDriverDate) ===
                    JSON.stringify(neededDriverDate)
            )
    );
    return result;
};

const showCustomPopup = (message) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.4)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    const popup = document.createElement("div");
    popup.style.backgroundColor = "white";
    popup.style.padding = "25px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    popup.style.width = "400px";
    popup.style.maxWidth = "90%";
    popup.style.fontFamily = "Arial";

    popup.innerHTML = `
        <div style="
            font-size:18px;
            font-weight:bold;
            color:#e74c3c;
            margin-bottom:15px;
        ">
            Erreur :
        </div>

        <div style="
            margin-bottom:20px;
            font-size:15px;
            line-height:1.4;
        ">
            ${message}
        </div>

        <div style="
            display:flex;
            justify-content:flex-end;
        ">
            <button id="popupCloseBtn" style="
                padding:8px 14px;
                background:#e74c3c;
                color:white;
                border:none;
                border-radius:5px;
                cursor:pointer;
                font-weight:bold;
            ">
                Fermer
            </button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document
        .getElementById("popupCloseBtn")
        .addEventListener("click", () => {
            overlay.remove();
        });
};

const formatTourneeDocumentsToCreate = async (tourneeDriverDatesToCreate) => {
    const getDriversDocuments = async (arrDriversNames) => {
        const arrApiFilters = [
            {
                key: "FORMLAYOUTID", // key from DB Field
                operator: "IN", // operatorNK from DB Operator
                value: strDriverFormLayoutID,
                type: "TEXT", // FieldTypeNk from DB FieldType
            },
            {
                key: "Contrainte|1|Chauffeur",
                operator: "IN",
                value: arrDriversNames.join("|"),
                type: "TEXT",
            },
        ];
        return await getDocuments(arrApiFilters);
    };
    const tourneeDriversNames = [];
    for (const tourneeDriverDateToCreate of tourneeDriverDatesToCreate) {
        const driverNameToList = tourneeDriverDateToCreate[0];
        const driverNameAlreadyListed = tourneeDriversNames.some(
            (listedDriverName) => listedDriverName === driverNameToList
        );
        if (!driverNameAlreadyListed) {
            tourneeDriversNames.push(driverNameToList);
        }
    }
    const driversDocuments = await getDriversDocuments(tourneeDriversNames);
    const driversDocumentsDatas = driversDocuments.map((document) =>
        JSON.parse(document.data)
    );
    const result = [];
    for (const tourneeDriverDate of tourneeDriverDatesToCreate) {
        const tourneeDriverName = tourneeDriverDate[0];
        const tourneeDate = tourneeDriverDate[1];
        const driverData = driversDocumentsDatas.find(
            (documentData) =>
                tourneeDriverName === documentData["Contrainte|1|Chauffeur"]
        );
        if (driverData === undefined) {
            //const message = `Nom du chauffeur introuvable : ${tourneeDriverName}`;
            //alert(message);
            const message = `
            <div>
                Chauffeur introuvable : <strong>${tourneeDriverName}</strong><br>
                Date du transport : <strong>${tourneeDate}</strong>
            </div>
            `;
            showCustomPopup(message);
            throw new Error("Nom du chauffeur introuvable");
        }
        
        const tourneeDocumentData = {
            Dates_DateTransport: tourneeDate,
            "Contrainte|1|Chauffeur": tourneeDriverName,
            LatitudeChauffeur: driverData["LatitudeChauffeur"],
            LongitudeChauffeur: driverData["LongitudeChauffeur"],
            Chauffeur_Adresse: driverData["Chauffeur_Adresse"],
            ModeleRemuneration: driverData["ModeleRemuneration"],
        };
        const tourneeDocument = {
            data: JSON.stringify(tourneeDocumentData), // object of the keys from the Field DB and its new value
            status: "ACTIF", // key from Status FormLayout
            active: true,
            template: { templateId: strTourneeFormLayoutID },
        };
        result.push(tourneeDocument);
    }
    return result;
};

const processTourneeCreation = async (arrTransportationDocuments, arrTourneeDocuments) => {
    const tourneeDriverDatesToCreate = await getTourneeDriverDatesToCreate(arrTransportationDocuments, arrTourneeDocuments);
    console.log("tourneeDriverDatesToCreate", tourneeDriverDatesToCreate);

    const documentsToCreate = await formatTourneeDocumentsToCreate(
        tourneeDriverDatesToCreate
    );

    if (documentsToCreate.length) {
        await createDocuments(documentsToCreate);
    }
};

const getTourneesToDelete = (arrTourneeDocuments, transportationDriverDates) => {
    // Find tournees that no longer have corresponding transports
    return arrTourneeDocuments.filter(tourneeDoc => {
        const tourneeData = JSON.parse(tourneeDoc.data);
        const tourneeDriverName = tourneeData["Contrainte|1|Chauffeur"];
        const tourneeDate = tourneeData["Dates_DateTransport"];

        // Check if this tournee has a corresponding transport
        const hasCorrespondingTransport = transportationDriverDates.some(
            ([driverName, date]) => driverName === tourneeDriverName && date === tourneeDate
        );

        return !hasCorrespondingTransport;
    });
}

const formatTourneeDocumentsToDelete = (tourneesToDelete) => {
    return tourneesToDelete.map(tourneeDoc => ({
        data: JSON.stringify({}), // object of the keys from the Field DB and its new value
        status: "SUPPRIMÉE", // key from Status FormLayout
        active: true,
        template: { templateId: strTourneeFormLayoutID }, // id from DB FormLayout
        documentID: tourneeDoc.documentID, // FormID from DB Form
    }));
}

const processTourneeDeletion = async (arrTransportationDocuments, arrTourneeDocuments) => {
    const transportationDriverDates = getDriversDates(
        arrTransportationDocuments,
        "Contrainte|1|Chauffeur",
        "Dates_DateTransport"
    );

    const tourneesToDelete = getTourneesToDelete(arrTourneeDocuments, transportationDriverDates);

    console.log("tourneesToDelete", tourneesToDelete.length);

    if (tourneesToDelete.length > 0) {
        const documentsToUpdate = formatTourneeDocumentsToDelete(tourneesToDelete);
        
        await updateDocuments(documentsToUpdate);
    }
};

const main = async () => {
    const arrTransportationDocuments = await getTransportationsDocuments();
    const arrTourneeDocuments = await getTourneeDocuments();

    // Add tournees with transports for driver/date if not exist
    await processTourneeCreation(arrTransportationDocuments, arrTourneeDocuments);

    // Update tournees to status "SUPPRIMÉE" for tournees with driver/date without corresponding transports
    await processTourneeDeletion(arrTransportationDocuments, arrTourneeDocuments);
};

main();
