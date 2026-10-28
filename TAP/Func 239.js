console.log("Function 239", context);

const getFileAtUrl = async (url) => {
  const response = await fetch(url);
  const jsonResponse = await response.json();
  return jsonResponse;
};

const getTerritoriesGeoJSON = async () => {
  const pontiacGeoJSONUrl =
    window.location.origin + "/Project/mrc_geojson/mrc_s_Pontiac.geojson";
  const lesCollinesGeoJSONUrl =
    window.location.origin +
    "/Project/mrc_geojson/mrc_s_Les%20Collines-de-l'Outaouais.geojson";

  const pontiacGeoJSON = await getFileAtUrl(pontiacGeoJSONUrl);
  const lesCollinesGeoJSON = await getFileAtUrl(lesCollinesGeoJSONUrl);
  return {
    MRCPontiacGeoJSON: pontiacGeoJSON,
    MRCLesCollinesGeoJSON: lesCollinesGeoJSON,
  };
};

const getTerritoriesData = (
  coordinates,
  turfMRCPontiacPolygon,
  turfMRCLesCollinesPolygon,
) => {
  const point = turf.point(coordinates);
  const isInMRCPontiac = turf.booleanPointInPolygon(
    point,
    turfMRCPontiacPolygon,
  );
  const isInMRCLesCollines = turf.booleanPointInPolygon(
    point,
    turfMRCLesCollinesPolygon,
  );
  return {
    isInMRCPontiac: isInMRCPontiac,
    isInMRCLesCollines: isInMRCLesCollines,
  };
};

const getAddressComponent = (addressComponents, type) =>
  addressComponents.find((component) => component.types.includes(type))
    ?.long_name;

const parseStreetFromAddressLine = (addressLine = "") => {
  const trimmedAddressLine = addressLine.trim();
  if (!trimmedAddressLine) {
    return { streetNumber: "", street: "" };
  }

  const match = trimmedAddressLine.match(/^([0-9A-Za-z\-\/]+)\s+(.*)$/);
  if (!match) {
    return { streetNumber: "", street: trimmedAddressLine };
  }

  return {
    streetNumber: match[1],
    street: match[2],
  };
};

// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};
// function to show the popup loading
const showPopupLoading = (loadingMessage) => {
  // function to create the popup loading element
  const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement(tag);
      element.id = id;
      document.body.appendChild(element);
    }
    element.style = style;
    element.innerHTML = innerHTML;
    return element;
  };
  createOrUpdateElement(
    "loadingPopup",
    "div",
    `
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
            `,
    `
              <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
                <div>${loadingMessage}</div>
                <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
              </div>
            `,
  );
  if (!document.getElementById("spinnerStyle")) {
    let style = document.createElement("style");
    style.id = "spinnerStyle";
    style.innerHTML = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `;
    document.head.appendChild(style);
  }
};

const main = async () => {
  showPopupLoading("Calcul en cours");
  try {
    const geocodeWithBing = async (address) => {
      const result = {};
      try {
        const url = `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
          address,
        )}&key=AvihTqwCOGN7oVnBO4U6ulCxs4g_B7MbiBi1GieSiY5dqo4zFBvTSqNvJda0MY9a`;
        const response = await fetch(url);
        const data = await response.json();
        result["coordinates"] =
          data.resourceSets[0].resources[0].geocodePoints[0].coordinates;
        const bingAddress = data.resourceSets[0].resources[0].address;
        const parsedStreet = parseStreetFromAddressLine(
          bingAddress.addressLine,
        );
        result["municipality"] = bingAddress.locality;
        result["country"] = bingAddress.countryRegion;
        result["postalCode"] = bingAddress.postalCode;
        result["streetNumber"] = parsedStreet.streetNumber;
        result["street"] = parsedStreet.street;
      } catch (error) {
        console.log("Error while geocoding with Bing:", error.message);
      }
      return result;
    };

    const geocodeWithGoogle = async (address) => {
      return new Promise((resolve) => {
        new google.maps.Geocoder().geocode({ address }, (results, status) => {
          const result = {};
          if (status === google.maps.GeocoderStatus.OK) {
            const location = results[0]?.geometry.location;
            const addressComponents = results[0].address_components;
            result["coordinates"] = [location.lat(), location.lng()];
            result["municipality"] = getAddressComponent(
              addressComponents,
              "locality",
            );
            result["country"] = getAddressComponent(
              addressComponents,
              "country",
            );
            result["postalCode"] = getAddressComponent(
              addressComponents,
              "postal_code",
            );
            result["streetNumber"] = getAddressComponent(
              addressComponents,
              "street_number",
            );
            result["street"] = getAddressComponent(addressComponents, "route");
          }
          resolve(result);
        });
      });
    };
    const calculateDistanceWithGoogle = async (
      origin,
      destination,
      waypoints,
    ) => {
      return new Promise((resolve) => {
        new google.maps.DirectionsService().route(
          {
            origin,
            destination,
            waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              let totalDistance = 0;
              let totalDuration = 0;
              let DistanceAller = 0;
              let DistanceRetour = 0;
              let DureeLeg1 = 0;
              let DureeLeg2 = 0;
              const distances = [];
              const durations = [];
              const legs = result.routes[0]?.legs;
              if (legs) {
                for (const leg of legs) {
                  totalDistance += leg.distance.value;
                  totalDuration += leg.duration.value;
                  distances.push(leg.distance.value);
                  durations.push(leg.duration.value);
                }
                DureeLeg1 = legs[0]?.duration.value || 0;
                DureeLeg2 = legs[1]?.duration.value || 0;
                DistanceRetour = legs[legs.length - 1].distance.value;
                DistanceAller = totalDistance - DistanceRetour;
              }

              resolve({
                totalDistance,
                distances,
                durations,
                totalDuration,
                DistanceAller,
                DistanceRetour,
                DureeLeg1,
                DureeLeg2,
              });
            } else {
              resolve(null);
            }
          },
        );
      });
    };

    const calculateTransportData = async (docData) => {
      const resultData = {};
      const getFiltersDatetimes = () => {
        const result = {};
        const recurrenceType = docData["Dates_TypeRéc"];

        let startDate = undefined;
        let endDate = undefined;
        switch (recurrenceType) {
          case "Une seule fois":
            startDate = docData["Dates_DateTransport"];
            endDate = docData["Dates_DateTransport"];
            break;
          case "Par mois":
            startDate = docData["Dates_DebutRec"];
            endDate = docData["Dates_FinRec"];
            break;
          case "Par semaine":
            startDate = docData["Dates_DebutRec"];
            endDate = docData["Dates_FinRec"];
            break;
          case "Par jour spécifique":
            const allDates = docData["Dates_Multidates"].split("|");
            startDate = allDates.reduce((date1, date2) =>
              new Date(date1) < new Date(date2) ? date1 : date2,
            );
            endDate = allDates.reduce((date1, date2) =>
              new Date(date1) < new Date(date2) ? date2 : date1,
            );
            break;
        }

        if (startDate != undefined) {
          result["DateTime_Start"] = startDate + "T00:00:00";
        }
        if (endDate != undefined) {
          result["DateTime_End"] = endDate + "T23:59:59";
        }
        return result;
      };

      const convertMinutesToHHMM = (totalMinutes) => {
        const totalMinutes24H = totalMinutes % (24 * 60);

        const hours = Math.floor(totalMinutes24H / 60);
        const minutes = Math.floor(totalMinutes24H % 60);

        const formattedTime =
          String(hours).padStart(2, "0") +
          ":" +
          String(minutes).padStart(2, "0");
        return formattedTime;
      };

      const geocodeAddress = async (address, useBing) => {
        let geocodeResult = null;
        if (useBing) {
          geocodeResult = await geocodeWithBing(address);
        } else {
          geocodeResult = await geocodeWithGoogle(address);
        }
        return geocodeResult;
      };
      let startLatitude = 0.0;
      let startLongitude = 0.0;
      let endLatitude = 0.0;
      let endLongitude = 0.0;
      let stopoverLatitude = 0.0;
      let stopoverLongitude = 0.0;
      let kmForTotalPrice = 0;
      let kmForCustomerPrice = 0;
      let kmForCompanionPrice = 0;
      let dureeLeg1 = 0;
      let dureeLeg2 = 0;
      let dispatchDureeTransportTheo = 0;
      const isStopoverAtFirstTrip =
        docData["Transport_PositionArret"] === "À l'aller";
      const driverLatitude = docData["LatitudeChauffeur"];
      const driverLongitude = docData["LongitudeChauffeur"];
      const typeTransport = docData["TypeTransport"] || "ALLER";

      let distanceAllerKm = 0.0;
      let distanceRetourKm = 0.0;
      let durationAllerMin = 0.0;
      let durationRetourMin = 0.0;

      // Geocode the departure address
      let startLocationGeocodeResult = {
        coordinates: ["", ""],
        municipality: "",
        country: "",
        postalCode: "",
      };
      if (docData["Etablissement_Adresse"]) {
        if (docData["GeocodeBing1"] === "true") {
          startLocationGeocodeResult = await geocodeWithBing(
            docData["Etablissement_Adresse"],
          );
        } else {
          startLocationGeocodeResult = await geocodeWithGoogle(
            docData["Etablissement_Adresse"],
          );
        }
        if (
          startLocationGeocodeResult &&
          startLocationGeocodeResult.coordinates.length > 0
        ) {
          startLatitude = startLocationGeocodeResult.coordinates[0];
          startLongitude = startLocationGeocodeResult.coordinates[1];
        }
      }
      Object.assign(resultData, {
        startLatitude: startLocationGeocodeResult.coordinates[0].toString(),
        startLongitude: startLocationGeocodeResult.coordinates[1].toString(),
        Etablissement_Ville: startLocationGeocodeResult.municipality,
        Etablissement_Numero: startLocationGeocodeResult.streetNumber,
        Etablissement_Rue: startLocationGeocodeResult.street,
        Etablissement_Pays: startLocationGeocodeResult.country,
        Etablissement_CodePostal: startLocationGeocodeResult.postalCode,
      });
      // Geocode the destination address
      let endLocationGeocodeResult = {
        coordinates: ["", ""],
        municipality: "",
        country: "",
        postalCode: "",
      };
      if (docData["EtablissementDest_Adresse"]) {
        if (docData["GeocodeBing2"] === "true") {
          endLocationGeocodeResult = await geocodeWithBing(
            docData["EtablissementDest_Adresse"],
          );
        } else {
          endLocationGeocodeResult = await geocodeWithGoogle(
            docData["EtablissementDest_Adresse"],
          );
        }
        if (
          endLocationGeocodeResult &&
          endLocationGeocodeResult.coordinates.length > 0
        ) {
          endLatitude = endLocationGeocodeResult.coordinates[0];
          endLongitude = endLocationGeocodeResult.coordinates[1];
        }
      }
      Object.assign(resultData, {
        endLatitude: endLocationGeocodeResult.coordinates[0].toString(),
        endLongitude: endLocationGeocodeResult.coordinates[1].toString(),
        EtablissementDest_Ville: endLocationGeocodeResult.municipality,
        EtablissementDest_Numero: endLocationGeocodeResult.streetNumber,
        EtablissementDest_Rue: endLocationGeocodeResult.street,
        EtablissementDest_Pays: endLocationGeocodeResult.country,
        EtablissementDest_CodePostal: endLocationGeocodeResult.postalCode,
      });

      // Geocode the stopover address
      let stopOverLocationGeocodeResult = {
        coordinates: ["", ""],
        municipality: "",
        country: "",
        postalCode: "",
      };
      if (docData["AdresseDestination2"]) {
        if (docData["GeocodeBing3"] === "true") {
          stopOverLocationGeocodeResult = await geocodeWithBing(
            docData["AdresseDestination2"],
          );
        } else {
          stopOverLocationGeocodeResult = await geocodeWithGoogle(
            docData["AdresseDestination2"],
          );
        }
        if (
          stopOverLocationGeocodeResult &&
          stopOverLocationGeocodeResult.coordinates.length > 0
        ) {
          stopoverLatitude = stopOverLocationGeocodeResult.coordinates[0];
          stopoverLongitude = stopOverLocationGeocodeResult.coordinates[1];
        }
      }

      Object.assign(resultData, {
        Lat2Dest: stopOverLocationGeocodeResult.coordinates[0].toString(),
        Lgt2Dest: stopOverLocationGeocodeResult.coordinates[1].toString(),
      });

      const driverLocation =
        driverLatitude !== undefined && driverLongitude !== undefined
          ? { lat: Number(driverLatitude), lng: Number(driverLongitude) }
          : null;
      const startLocation =
        startLatitude !== 0.0 && startLongitude !== 0.0
          ? { lat: startLatitude, lng: startLongitude }
          : null;
      const endLocation =
        endLatitude !== 0.0 && endLongitude !== 0.0
          ? { lat: endLatitude, lng: endLongitude }
          : null;
      const stopoverLocation =
        stopoverLatitude !== 0.0 && stopoverLongitude !== 0.0
          ? { lat: stopoverLatitude, lng: stopoverLongitude }
          : null;
      // Ask distances to Google
      let map = [];
      if (endLocation && startLocation) {
        // Calculate distance for customer price
        const {
          totalDistance,
          distances,
          durations,
          totalDuration,
          DureeLeg1,
          DureeLeg2,
          DistanceAller,
          DistanceRetour,
        } = await calculateDistanceWithGoogle(startLocation, startLocation, [
          { location: endLocation, stopover: true },
        ]);
        // KM_THEORIQUE uses the round-trip distance regardless of TypeTransport.
        kmForCustomerPrice = Math.ceil(totalDistance / 1000);
        kmForCompanionPrice = Math.ceil(distances[0] / 1000);
        dureeLeg1 = (DureeLeg1 / 60).toFixed(0);
        dureeLeg2 = (DureeLeg2 / 60).toFixed(0);
        dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0);

        distanceAllerKm = Math.ceil(distances[0] / 1000);
        distanceRetourKm = Math.ceil(distances[1] / 1000);
        durationAllerMin = (durations[0] / 60).toFixed(0);
        durationRetourMin = (durations[1] / 60).toFixed(0);

        // Calculate distance for total price
        const effectiveStartLocation =
          driverLocation &&
          Number(driverLocation.lat) !== 0 &&
          Number(driverLocation.lng) !== 0
            ? driverLocation
            : startLocation;
        if (driverLocation) {
          if (stopoverLocation) {
            let stopoversForGoogle;
            if (isStopoverAtFirstTrip) {
              stopoversForGoogle =
                typeTransport === "ALLER/RETOUR"
                  ? [
                      { location: startLocation, stopover: true },
                      { location: stopoverLocation, stopover: true },
                      { location: endLocation, stopover: true },
                      { location: startLocation, stopover: true },
                    ]
                  : [
                      { location: startLocation, stopover: true },
                      { location: stopoverLocation, stopover: true },
                      { location: endLocation, stopover: true },
                    ];
            } else {
              stopoversForGoogle =
                typeTransport === "ALLER/RETOUR"
                  ? [
                      { location: startLocation, stopover: true },
                      { location: endLocation, stopover: true },
                      { location: stopoverLocation, stopover: true },
                      { location: startLocation, stopover: true },
                    ]
                  : [
                      { location: startLocation, stopover: true },
                      { location: endLocation, stopover: true },
                      { location: stopoverLocation, stopover: true },
                    ];
            }
            const {
              totalDistance,
              distances,
              durations,
              totalDuration,
              DureeLeg1,
              DureeLeg2,
            } = await calculateDistanceWithGoogle(
              effectiveStartLocation,
              effectiveStartLocation,
              stopoversForGoogle,
            );
            kmForTotalPrice = Math.ceil(totalDistance / 1000);
            dureeLeg1 = (DureeLeg1 / 60).toFixed(0);
            dureeLeg2 = (DureeLeg2 / 60).toFixed(0);
            dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0);

            distanceAllerKm = Math.ceil((distances[1] + distances[2]) / 1000);
            distanceRetourKm = Math.ceil(distances[3] / 1000);
            durationAllerMin = ((durations[1] + durations[2]) / 60).toFixed(0);
            durationRetourMin = (durations[3] / 60).toFixed(0);
          } else {
            const {
              totalDistance,
              distances,
              durations,
              totalDuration,
              DureeLeg1,
              DureeLeg2,
            } = await calculateDistanceWithGoogle(
              effectiveStartLocation,
              effectiveStartLocation,
              typeTransport === "ALLER/RETOUR"
                ? [
                    { location: startLocation, stopover: true },
                    { location: endLocation, stopover: true },
                    { location: startLocation, stopover: true },
                  ]
                : [
                    { location: startLocation, stopover: true },
                    { location: endLocation, stopover: true },
                  ],
            );
            kmForTotalPrice = Math.ceil(totalDistance / 1000);
            dureeLeg1 = (DureeLeg1 / 60).toFixed(0);
            dureeLeg2 = (DureeLeg2 / 60).toFixed(0);
            dispatchDureeTransportTheo = (totalDuration / 60).toFixed(0);
          }
        }
      }

      const transportationDate = docData["Dates_DateTransport"];
      let heureRdv = "00:00";
      let heurePriseEnCharge = "00:00";
      let heureRetour = "00:00";
      let dureeEmbarquement = 5;
      let dureeDebarquement = 5;
      let dureeTransport = dureeLeg1 + dureeLeg2 || 30;

      let dureeAttente = 0;
      let prioriteRdv = true;

      if (docData["EtablissementDest_HeureRDV"]) {
        heureRdv = docData["EtablissementDest_HeureRDV"];
        prioriteRdv = true;
      } else if (docData["Depart_HeurePEC"]) {
        heurePriseEnCharge = docData["Depart_HeurePEC"];
        prioriteRdv = false;
      }

      if (docData["DétailTransport_HeureRetour"]) {
        heureRetour = docData["DétailTransport_HeureRetour"];
      }

      if (docData["Etablissement_DureePEC"]) {
        dureeEmbarquement =
          parseInt(docData["Etablissement_DureePEC"]) || dureeEmbarquement;
      }

      if (docData["EtablissementDest_DureeDebarq"]) {
        dureeDebarquement =
          parseInt(docData["EtablissementDest_DureeDebarq"]) ||
          dureeDebarquement;
      }

      if (docData["Attente_Prevue"]) {
        let heureAttente = docData["Attente_Prevue"];
        let a = heureAttente.split(":");
        dureeAttente = +a[0] * 60 + +a[1];
      }

      let minutesRdv = 0;
      let minutesPec = 0;
      if (prioriteRdv === true) {
        let a = heureRdv.split(":");
        minutesRdv = +a[0] * 60 + +a[1];
        minutesPec =
          minutesRdv - (dureeEmbarquement + dureeTransport + dureeDebarquement);
      } else {
        let a = heurePriseEnCharge.split(":");
        minutesPec = +a[0] * 60 + +a[1];
        minutesRdv =
          minutesPec + dureeEmbarquement + dureeTransport + dureeDebarquement;
      }

      heurePriseEnCharge = convertMinutesToHHMM(minutesPec);
      heureRdv = convertMinutesToHHMM(minutesRdv);

      Object.assign(resultData, {
        KM_THEORIQUE: kmForCustomerPrice.toString(),
        Km_pour_calcul_de_la_totalite: kmForTotalPrice.toString(),
        KM_TH: kmForCompanionPrice.toString(),
        Dispatch_DuréeTransportTheo: dispatchDureeTransportTheo.toString(),
        //EtablissementDest_HeureRDV: heureRdv
      });

      if (typeTransport === "ALLER/RETOUR") {
        const minutesRetour = minutesRdv + dureeAttente;
        resultData["DétailTransport_HeureRetour"] =
          convertMinutesToHHMM(minutesRetour);
      } else {
        resultData["DétailTransport_HeureRetour"] = "";
      }

      Object.assign(resultData, getFiltersDatetimes());

      Object.assign(resultData, {
        DureeTrajetAllerMinute: durationAllerMin.toString(),
        DureeTrajetRetourMinute: durationRetourMin.toString(),
        DistanceTrajet: distanceAllerKm.toString(),
        DistanceTrajetRetour: distanceRetourKm.toString(),
      });

      return resultData;
    };

    const getTerritoriesDataToFill = async (upToDateDocData) => {
      const territoriesGeoJSON = await getTerritoriesGeoJSON();
      const MRCPontiacPolygonCoords =
        territoriesGeoJSON.MRCPontiacGeoJSON.features[0].geometry.coordinates;
      const MRCLesCollinesPolygonCoords =
        territoriesGeoJSON.MRCLesCollinesGeoJSON.features[0].geometry
          .coordinates;
      const turfMRCPontiacPolygon = turf.polygon(MRCPontiacPolygonCoords);
      const turfMRCLesCollinesPolygon = turf.polygon(
        MRCLesCollinesPolygonCoords,
      );

      const destinationCoordinates = [
        upToDateDocData["endLongitude"],
        upToDateDocData["endLatitude"],
      ];

      const territoriesData = getTerritoriesData(
        destinationCoordinates,
        turfMRCPontiacPolygon,
        turfMRCLesCollinesPolygon,
      );

      const result = {};
      result["inMRCPontiac"] = territoriesData.isInMRCPontiac
        ? "En territoire"
        : "Hors territoire";
      result["inMRCLesCollines"] = territoriesData.isInMRCLesCollines
        ? "En territoire"
        : "Hors territoire";
      return result;
    };
    const dataToFill = {};
    const upToDateDocData = structuredClone(docData);
    const distancesData = await calculateTransportData(docData);
    Object.assign(dataToFill, distancesData);
    Object.assign(upToDateDocData, distancesData);
    const territoriesDataToFill =
      await getTerritoriesDataToFill(upToDateDocData);
    Object.assign(dataToFill, territoriesDataToFill);
    Object.assign(upToDateDocData, territoriesDataToFill);

    console.log("dataToFill", dataToFill);

    callback({
      data: dataToFill,
    });
  } catch (error) {
    console.log("Error during function 239 :", error);
    callback({
      data: { CalculateDuration: "false" },
    });
  }
  hidePopupLoading();
};

main();
