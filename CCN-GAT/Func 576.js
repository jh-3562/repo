if (docData['Adresse']) {
    new google.maps.places.AutocompleteService()
        .getQueryPredictions({
            input: docData['Adresse'],
            types: ["address"]
        }, result => !console.log(result) && callback({
            suggestions: {
                'Adresse': result.map(item => ({
                    title: item.description
                }))
            }
        }));
} else {
    callback([]);
};