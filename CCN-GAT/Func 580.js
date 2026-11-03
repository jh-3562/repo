if (docData['AdresseUsager']) {
	console.log('adresse existe');
	new google.maps.Geocoder()
		.geocode({
			address: docData['AdresseUsager']
		}, (result) => {
			console.log(result);
			const data = {};
			const firstPartsRequest = result[0].address_components;
			if (firstPartsRequest) {
				firstPartsRequest.forEach((part) => {
					if (part.types.includes("postal_code")) {
						data["CPUsager"] = part.long_name;
					}
					if (part.types.includes("locality")) {
						data["VilleUsager"] = part.long_name;
					}
				})
			}
			console.log(data)
			callback({
				data
			});
		});
}
