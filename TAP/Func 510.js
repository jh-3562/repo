console.log("Function 510", context);

const formID = store?.pageContentStore.active[0]

const fields = {
    keyFieldOnchange: inputKey,
    dataFieldOnchange: docData[inputKey],
    targetSearchField: "Contrainte|1|Chauffeur",
};

const apiFilters = [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Chauffeur",
        type: "TEXT",
    },
    {
        key: "STATUS",
        operator: "EQUALS",
        value: "Actif",
        type: "DATE",
    },
    {
        key: fields.targetSearchField,
        operator: "CONTAINS",
        value: fields.dataFieldOnchange,
        type: "TEXT",
    },
];

const FIELDS_CONFIG = [
    { key: "Chauffeur_Adresse", name: "Adresse chauffeur" },
    { key: "Chauffeur_email", name: "Courriel Chauffeur" },
    { key: "DestinationChauffeur", name: "Destinations" },
    { key: "TypeVehicule", name: "document de véhicule" },
    { key: "TypeVéhicule2", name: "Type de véhicule 2" },
    { key: "LongitudeChauffeur", name: "Longitude du chauffeur" },
    { key: "LatitudeChauffeur", name: "Latitude du chauffeur" },
    { key: "ModeleRemuneration", name: "Modèle de rémunération" }
];

// Async functions to get the Chauffeurs infos
const getChauffeurInfo = async () => {
    try {
        // Fetches IDs
        const idsRes = await api({ local: true }).post("document/id/filter", {
        filters: apiFilters,
        });
        const ids = idsRes?.data?.ids || [];

        // Fetches documents using IDs
        const res = await api({ local: true }).post("document/id", { ids });

        const documents = res?.data?.documents.map((doc) => {
            return JSON.parse(doc.data);
        });
        return documents;
    } catch (error) {
        console.error("Erreur lors de la récupération des documents :", error);
        throw error;
    }
};

// Fetch documents by IDs
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

// Build suggestions from fetched documents
const buildSuggestions = (docs, client) => {
    const result = docs.map((doc) => {

        const contraintesCha = contraintesChauffeur(doc);
        // Exclude chauffeurs who have the current client in their contraintes
        if (contraintesCha.includes(client)) {
            return null;
        }

        const suggestion = {
            title: doc[fields.targetSearchField]
        };

        suggestion.fields = FIELDS_CONFIG.map(({ key, name }) => ({
            key,
            name,
            value: doc[key] ?? ""
        }));

        return suggestion;
    });
    return result.filter(Boolean);
}

// Remove suggestions that already exist in Contrainte
const removeExistingConstraints = (suggestions, contraintes) => {
    return suggestions.filter( suggestion => !contraintes.includes(suggestion.title) );
}

// Extract contraintes for Client
const contraintesClient = (dataParsed) => {
    const count = Number(dataParsed["Contrainte"]) || 0;
    const contraintes = []; 
    for (let i = 1; i <= count; i++) {
        contraintes.push(dataParsed[`Contrainte|1|Chauffeur|${i}`]);
    }
    return contraintes;
}

// Extract contraintes for Chauffeur
const contraintesChauffeur = (dataParsed) => {
    const count = Number(dataParsed["Contrainte"]) || 0;
    const contraintes = []; 
    console.log('Client for contraintesChauffeur:', dataParsed);
    for (let i = 1; i <= count; i++) {
        contraintes.push(dataParsed[`Contrainte|2|NomClient|${i}`]);
    }
    return contraintes;
}

// Main
const main = async () => {
    const documents = await getChauffeurInfo();

    const formData  = await getDocumentsByIDs([formID]);
    const dataParsed = JSON.parse(formData[0].data);

    const client = dataParsed["Contrainte|2|NomClient"]
    const contraintesCli = contraintesClient(dataParsed);

    let suggestions = buildSuggestions(documents, client);
    suggestions = removeExistingConstraints(suggestions, contraintesCli).slice(0, 10);

    callback({
    suggestions: {
        [fields.targetSearchField] : suggestions,
    },
    });
    console.log(suggestions);
};

main();
