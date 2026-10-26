console.log('Function 106', context);

const formatApiFilter = async (apiFilters, dateWindow) => {
    const rangeDateDebut = '0001-01-01|' + dateWindow[1];
    const rangeDateFin = dateWindow[0] + '|9999-12-31';

    return [...apiFilters, {
        key: "InformationsAdmin_DateHeureDébut",
        operator: "BETWEEN",
        value: rangeDateDebut,
        type: "DATE",
    }, {
        key: "InformationsAdmin_DateHeureFin",
        operator: "BETWEEN",
        value: rangeDateFin,
        type: "DATE",
    }];
};

const apiFilters = [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Disponibilité",
        type: "TEXT",
    },
    {
        key: "Planification_Disponiblité",
        operator: "IN",
        value: "Disponible|Indisponible",
        type: "TEXT",
    }
];

const isBetweenDates = (date, start, end) => {
    return date >= start && date <= end
};

const getDayIndex = (day) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return days.indexOf(day);
};

const getWeekday = (dateStr) => {
    // Split the input and parse integers
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create a Date object (note: month is 0-indexed in JS)
    const date = new Date(year, month - 1, day);

    // Days of the week
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // Return corresponding day
    return days[date.getDay()];
};

const formatReccurenceObject = (documents, dateWindow) => {
    const formatedDocuments = [];
    documents.forEach((doc) => {
        console.log(formatedDocuments);
        const data = typeof doc.data === 'string' ? JSON.parse(doc.data) : doc.data;
        console.log("data", data);

        const exceptions = data.Exception_Récurrence
            ? data.Exception_Récurrence.split('|').map(date => new Date(date).toISOString().split('T')[0])
            : [];

        if (data.IdentifiantFormulaireRécurrence || data.Planification_Récurrence === 'Une seule fois') {
            console.log("test1");
            if (isBetweenDates(data.Planification_Date, dateWindow[0], dateWindow[1])) {
                const occurrenceDateStr = data.Planification_Date.split('T')[0];
                const dateavecHeureDebut = occurrenceDateStr + 'T' + data.Planification_HeureDébut + ':00';
                const dateavecHeureFin = occurrenceDateStr + 'T' + data.Planification_HeureFin + ':00';
                const newData = {
                    ...data,
                    InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                    InformationsAdmin_DateHeureFin: dateavecHeureFin,
                };
                formatedDocuments.push({
                    ...doc,
                    doesExist: true,
                    data: JSON.stringify(newData),
                });
            }
        } else if (data.Planification_Récurrence === 'Par semaine') {
            if (dateWindow[0] === dateWindow[1]) {
                console.log("test2");
                const date = dateWindow[0];
                const day = getWeekday(date);
                const days = data.Planification_Répéter.split('|');

                const occurrenceDateStr = date.split('T')[0];
                const dateavecHeureDebut = occurrenceDateStr + 'T' + data.Planification_HeureDébut + ':00';
                const dateavecHeureFin = occurrenceDateStr + 'T' + data.Planification_HeureFin + ':00';
                if (days.includes(day)) {
                    const newData = {
                        ...data,
                        InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                        InformationsAdmin_DateHeureFin: dateavecHeureFin,
                    };

                    formatedDocuments.push({
                        ...doc,
                        data: JSON.stringify(newData),
                        doesExist: false,
                    });
                }
            } else {
                console.log("test3");
                const touteLesCombienDeSemaine = 1;
                const dateFin = new Date(data.InformationsAdmin_DateHeureFin.split('T')[0]);
                const dateCourante = new Date(data.Planification_Date);
                const repeterLe = data.Planification_Répéter.split('|');

                // La date limite est soit dateFin soit maxDate (le plus petit des deux)
                const limite = dateFin < dateWindow[1] ? dateFin : dateWindow[1];
                console.log("condition while", dateCourante <= limite);
                console.log("dateCourante", dateCourante);
                console.log("limite", limite);
                while (dateCourante.toISOString().split('T')[0] <= limite) {
                    // Vérifier si la date courante est dans la fenêtre de dates
                    const dateCouranteStr = dateCourante.toISOString().split('T')[0];
                    console.log("Condition if", dateCouranteStr >= dateWindow[0]);
                    if (dateCouranteStr >= dateWindow[0]) {
                        repeterLe.forEach((jour) => {
                            const jourIndex = getDayIndex(jour);
                            const occurrenceDate = new Date(dateCourante);
                            occurrenceDate.setDate(dateCourante.getDate() + ((jourIndex - dateCourante.getDay() + 7) % 7));
                            // Declare occurrenceDateStr first:
                            const occurrenceDateStr = occurrenceDate.toISOString().split('T')[0];
                            const dateavecHeureDebut = occurrenceDateStr + 'T' + data.Planification_HeureDébut + ':00';
                            const dateavecHeureFin = occurrenceDateStr + 'T' + data.Planification_HeureFin + ':00';
                            console.log(occurrenceDate <= limite && !exceptions.includes(occurrenceDateStr));
                            console.log("occurrenceDate", occurrenceDate);

                            if (occurrenceDateStr <= limite && !exceptions.includes(occurrenceDateStr)) {
                                const newData = {
                                    ...data,
                                    InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                                    InformationsAdmin_DateHeureFin: dateavecHeureFin,
                                };
                                formatedDocuments.push({
                                    ...doc,
                                    data: JSON.stringify(newData),
                                    doesExist: false,
                                });
                            }
                        });
                    }
                    // Advance the date by the set number of weeks
                    dateCourante.setDate(dateCourante.getDate() + 7 * touteLesCombienDeSemaine);
                }
            }

        } else if (data.Planification_Récurrence === 'Par jour spécifique') {
            console.log("test4");
            const multiDate = data.Planification_MultiDate.split('|');

            multiDate.forEach((date) => {
                if (isBetweenDates(date, dateWindow[0], dateWindow[1])) {
                    const dateStr = new Date(date).toISOString().split('T')[0];
                    const dateavecHeureDebut = dateStr + 'T' + data.Planification_HeureDébut + ':00';
                    const dateavecHeureFin = dateStr + 'T' + data.Planification_HeureFin + ':00';
                    if (!exceptions.includes(dateStr)) {
                        const newData = {
                            ...data,
                            InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
                            InformationsAdmin_DateHeureFin: dateavecHeureFin,
                        };
                        formatedDocuments.push({
                            ...doc,
                            data: JSON.stringify(newData),
                            doesExist: false,
                        });
                    }
                }
            });
        }
    });

    return {

        documents: formatedDocuments,

    };


};

const REC_api_document_id = async (filters, dateWindow) => {

    let apiFilters = filters;
    if (dateWindow !== null) {
        apiFilters = await formatApiFilter(filters, dateWindow);
    }

    // Step 2 : Get the document with the document/id/filter api
    const res = await api({ local: true }).post("document/id/filter", {
        filters: apiFilters,
    });
    const ids = res.data.ids;

    // Step 3 : Get the documents data with the "document/id" api
    const objects = await api({ local: true }).post("document/id", { ids: ids });

	console.log("ids", ids);
    // Step 4 : Interpret the documents thanks to the dateWindow
    return formatReccurenceObject(objects.data.documents, dateWindow);
    // returns a list of documents.
    // one document = {
    // data,
    // documentID, -> real documentID if doesExist, recurrence documentID if not.
    // ...
    // doesExist : bool
    // }
};

const main = async () => {
    const date = ['2025-03-26', '2025-03-26'];
    const dateWindow = ['2025-03-01', '2025-03-31'];
    const filters = apiFilters;
    console.log("=============== TEST 1 ===============");
    const res = await REC_api_document_id(filters, date);
    console.log(res);
    console.log("=============== TEST 2 ===============");
    const res2 = await REC_api_document_id(filters, dateWindow);
    console.log(res2);

}

main();