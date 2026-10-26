console.log('Function 119', context);

const main = async () => {
    const id = store.pageContentStore?.active[0];
    const form = store.pageContentStore.prepareDataRows.find((row) => row.rowID === id);

    if (!form) {
        console.error("Aucune donnée trouvée pour l'ID :", id);
        return;
    }
    
    try {
        const url_id = form.key;
        const url = new URL(window.location.href);
        
        // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
        const segments = url.pathname.split("/");
        
        // Cherche l'index du segment MCR (ex: "mcr.arlon")
        const mcrIndex = segments.findIndex(seg => seg.startsWith("mcr."));
        
        if (mcrIndex !== -1) {
            const mcrSegment = segments[mcrIndex];
            const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

            // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
            const newPath = `/${mcrSegment}/${section}/${url_id}`;
            url.pathname = newPath;

            window.open(url.toString(), "_blank");
        } else {
            console.error("Segment MCR introuvable dans l’URL.");
        }

    } catch (error) {
        console.error("Erreur lors de la création du formulaire :", error);
    }
};

main();
