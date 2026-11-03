if (docData['Adresse']) {
	console.log(docData['Adresse']);
	console.log('adresse existe');
	new google.maps.Geocoder()
		.geocode({
			address: docData['Adresse']
		}, (result) => {
			console.log(result);
			const data = {};
			const firstPartsRequest = result[0].address_components;
			if (firstPartsRequest) {
				firstPartsRequest.forEach((part) => {
					if (part.types.includes("postal_code")) {
						data["CodePostal"] = part.long_name;
					}
					if (part.types.includes("locality")) {
						data["Ville"] = part.long_name;
					}
				})
			}
			console.log(data)
			callback({
				data
			});
		});
}
