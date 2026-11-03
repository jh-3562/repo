if (docData['AdresseUsager']) {
    new google.maps.places.AutocompleteService()
        .getQueryPredictions({
            input: docData['AdresseUsager'],
            types: ["address"]
        }, result => !console.log(result) && callback({
            suggestions: {
                'AdresseUsager': result.map(item => ({
                    title: item.description
                }))
            }
        }));
} else {
    callback([]);
};