console.log("Function 367", context);

const calculateAllPrices = (docData) => {
  const transportationCost = (
    distance,
    ratePerDistanceUnit,
    minimumPrice = null,
    maximumPrice = null,
  ) => {
    let transportationCost = distance * ratePerDistanceUnit;
    if (minimumPrice !== null) {
      transportationCost = Math.max(transportationCost, minimumPrice);
    }
    if (maximumPrice !== null) {
      transportationCost = Math.min(transportationCost, maximumPrice);
    }
    return transportationCost.toFixed(2);
  };
  const calculateTotalPrice = () => {
    const estimatedKMForTotalPriceCalculation = parseFloat(
      docData["Km_pour_calcul_de_la_totalite"],
    );
    const driverRatePerKM = parseFloat(docData["TAUX_KM_Chauffeur"]);
    return (estimatedKMForTotalPriceCalculation * driverRatePerKM).toFixed(2);
  };
  const calculateCustomerPrice = (totalityPrice) => {
    const calculatePriceWithoutTravelCompanion = (totalityPrice) => {
      const customerPricingType = docData["customerPricingType"];
      let priceWithoutTravelCompanion;
      switch (customerPricingType) {
        case "Manuel":
          priceWithoutTravelCompanion = parseFloat(docData["Dons_client"]);
          break;
        case "Paie la totalité":
          priceWithoutTravelCompanion = totalityPrice;
          break;
        case "Prix fixe":
          const customerPricingPrix = parseFloat(
            docData["customerPricingPrix"],
          );
          priceWithoutTravelCompanion = customerPricingPrix;
          break;
        case "Tarification par taux":
          const customerPricingTaux = parseFloat(
            docData["customerPricingTaux"],
          );
          const customerMinimumPrice = parseFloat(docData["MinimumPrice"]);
          const customerMaximumPrice = parseFloat(docData["MaximumPrice"]);
          const estimatedKMForCustomerPriceCalculation = parseFloat(
            docData["KM_THEORIQUE"],
          );

          priceWithoutTravelCompanion = transportationCost(
            estimatedKMForCustomerPriceCalculation,
            customerPricingTaux,
            Number.isNaN(customerMinimumPrice) ? null : customerMinimumPrice,
            Number.isNaN(customerMaximumPrice) ? null : customerMaximumPrice,
          );

          break;
      }
      return Math.round(priceWithoutTravelCompanion);
    };

    const calculateTravelCompanionPrice = () => {
      const estimatedKMForTravelCompanionPriceCalculation = parseFloat(
        docData["KM_THEORIQUE"],
      );
      const travelCompanionRatePerKM = parseFloat(
        docData["Taux km accompagnateur"],
      );
      const travelCompanionMinimumPrice = parseFloat(
        docData["Accompagnateur_paye_raison"],
      );

      const hasATravelCompanion = docData["Accompagné"] === "Oui";
      const travelCompanionPays =
        docData["Accompagnateur_paye"] === "L'accompagnateur paye";
      let travelCompanionPrice = 0;
      if (hasATravelCompanion && travelCompanionPays) {
        travelCompanionPrice = transportationCost(
          estimatedKMForTravelCompanionPriceCalculation,
          travelCompanionRatePerKM,
          travelCompanionMinimumPrice,
        );
      }
      return travelCompanionPrice;
    };

    const priceWithoutTravelCompanion =
      calculatePriceWithoutTravelCompanion(totalityPrice);
    const travelCompanionPrice = calculateTravelCompanionPrice();

    return Math.round(
      priceWithoutTravelCompanion + Number(travelCompanionPrice)
    );
  };
  const calculateOrganismPrice = (totalityPrice, customerPrice) => {
    const organismPricingType = docData["organismPricingType"];
    let result;
    switch (organismPricingType) {
      case "Manuel":
        result = parseFloat(docData["Part_Organisme"]);
        break;
      case "Paie la totalité après déduction de la part usager":
        result = (totalityPrice - customerPrice).toFixed(2);
        break;
      case "Prix fixe":
        const organismPrincingPrix = parseFloat(
          docData["organismPrincingPrix"],
        );
        result = organismPrincingPrix;
        break;
      case "Tarification par taux":
        const organismPricingTaux = parseFloat(docData["organismPricingTaux"]);
        const organismMinimumPrice = parseFloat(
          docData["MinimumPriceOrganism"],
        );
        const organismMaximumPrice = parseFloat(
          docData["MaximumPriceOrganism"],
        );
        const estimatedKMForOrganismPriceCalculation = parseFloat(
          docData["Km_pour_calcul_de_la_totalite"],
        );
        result = transportationCost(
          estimatedKMForOrganismPriceCalculation,
          organismPricingTaux,
          Number.isNaN(organismMinimumPrice) ? null : organismMinimumPrice,
          Number.isNaN(organismMaximumPrice) ? null : organismMaximumPrice,
        );
        break;
    }
    return result;
  };
  const calculateBalancePrice = (totalPrice, customerPrice, organismPrice) => {
    const balance = totalPrice - customerPrice - organismPrice;
    return parseFloat(balance.toFixed(2));
  };

  const result = {};
  let totalPrice = undefined;
  const minimumPriceRenumeration = parseFloat(
    docData["MinimumPriceRenumeration"],
  );
  if (docData.CalculPrixTransportGroupe === "Prix au km") {
    totalPrice = calculateTotalPrice();

    if (!isNaN(minimumPriceRenumeration)) {
      totalPrice = Math.max(totalPrice, minimumPriceRenumeration);
    }

    result.Prix_totalite = totalPrice;
  } else if (docData.CalculPrixTransportGroupe === "Manuel") {
    totalPrice = parseFloat(docData["Prix_totalite"]);
  }
  const customerPrice = calculateCustomerPrice(totalPrice);
  console.log("CUSTOMER PRICE : ", customerPrice);
  if (docData["customerPricingType"] !== "Manuel") {
    result.Dons_client = String(customerPrice);
  }
  const organismPrice = calculateOrganismPrice(totalPrice, customerPrice);
  result.Part_Organisme = String(organismPrice);
  const balancePrice = calculateBalancePrice(
    totalPrice,
    customerPrice,
    organismPrice,
  );
  result.Balance_a_payer = String(balancePrice);

  return result;
};

const result = calculateAllPrices(docData);

return result;
