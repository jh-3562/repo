console.log("Function 366", context);

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

const main = async () => {
  const getPricingDate = () => {
    const recurrenceType = docData["Dates_TypeRéc"];
    let result;
    switch (recurrenceType) {
      case "Par jour spécifique":
        const dates = docData["Dates_Multidates"].split("|");
        const minimumDate = dates.reduce((min, current) =>
          current < min ? current : min
        );
        result = minimumDate;
        break;
      case "Par semaine":
        result = docData["Dates_DebutRec"];
        break;
      case "Par mois":
        result = docData["Dates_DebutRec"];
        break;
      default:
        result = docData["Dates_DateTransport"];
    }
    return result;
  };
  const getPricingSuggestions = async () => {
    const getPricingDocuments = async () => {
      const pricingDate = getPricingDate();
      console.log("pricingDate", pricingDate);
      const princingApiFilter = [
        {
          key: "FORMLAYOUTNAME",
          operator: "EQUALS",
          value: "Tarif",
          type: "TEXT",
        },
        {
          key: "STATUS",
          operator: "EQUALS",
          value: "ACTIF",
          type: "TEXT",
        },
        {
          key: "PricingEligibilityAccessibleTransportation",
          operator: "OR",
          value: docData["Adapte_check"],
          type: "TEXT",
        },
      ];

      if (pricingDate !== undefined) {
        princingApiFilter.push(
          ...[
            {
              key: "startDate",
              operator: "BETWEEN",
              value: "0001-01-01" + "|" + pricingDate,
              type: "DATE",
            },
            {
              key: "endDate",
              operator: "BETWEEN",
              value: pricingDate + "|" + "9999-12-31",
              type: "DATE",
            },
          ]
        );
      }

      const result = await getDocuments(princingApiFilter);
      console.log("princingApiFilter", princingApiFilter);
      console.log("result", result);
      return result;
    };

    const formatSuggestions = (pricingDocuments) => {
      const suggestions = [];
      
      for (const pricingDocument of pricingDocuments) {
        const pricingData = JSON.parse(pricingDocument.data);
        
        const customerPricingTypeToComplete = {
          key: "customerPricingType",
          value: pricingData["customerPricingType"],
          name: "Type de tarification - Usager",
        };
        const customerTauxToComplete = {
          key: "customerPricingTaux",
          value: "",
          name: "Taux Client ($/km)",
        };
        const customerMinimumPriceToComplete = {
          key: "MinimumPrice",
          value: "",
          name: "Prix minimum ($)",
        };
        const customerMaximumPriceToComplete = {
          key: "MaximumPrice",
          value: "",
          name: "Prix maximum ($)",
        };
        const customerPrixToComplete = {
          key: "customerPricingPrix",
          value: "",
          name: "Prix fixe - Usager",
        };
        const organismPricingTypeToComplete = {
          key: "organismPricingType",
          value: pricingData["organismPricingType"],
          name: "Type de tarification - Organisme",
        };
        const organismTauxToComplete = {
          key: "organismPricingTaux",
          value: "",
          name: "Taux Organisme ($/km)",
        };
        const organismMinimumPriceToComplete = {
          key: "MinimumPriceOrganism",
          value: "",
          name: "Prix Organisme Minimum ($)",
        };
        const organismMaximumPriceToComplete = {
          key: "MaximumPriceOrganism",
          value: "",
          name: "Prix Organisme Maximum ($)",
        };
        const organismPrixToComplete = {
          key: "organismPrincingPrix",
          value: "",
          name: "Prix fixe - Organisme",
        };

        const travelCompanionTauxToComplete = {
          key: "Taux km accompagnateur",
          value: pricingData["Taux km accompagnateur"],
          name: "Taux Accompagnateur ($/km)",
        };

        const travelCompanionMinimumPriceToComplete = {
          key: "Accompagnateur_paye_raison",
          value: pricingData["Accompagnateur_paye_raison"],
          name: "Prix accompagnateur minimum",
        };

        const fieldsToComplete = [
          customerPricingTypeToComplete,
          customerTauxToComplete,
          customerMinimumPriceToComplete,
          customerMaximumPriceToComplete,
          customerPrixToComplete,
          organismPricingTypeToComplete,
          organismTauxToComplete,
          organismMinimumPriceToComplete,
          organismMaximumPriceToComplete,
          organismPrixToComplete,
          travelCompanionTauxToComplete,
          travelCompanionMinimumPriceToComplete,
        ];

        switch (pricingData["customerPricingType"]) {
          case "Paie la totalité":
            break;
          case "Prix fixe":
            customerPrixToComplete.value = pricingData["customerPricingPrix"];
            break;
          case "Tarification par taux":
            customerTauxToComplete.value = pricingData["customerPricingTaux"];
            customerMinimumPriceToComplete.value = pricingData["MinimumPrice"];
            customerMaximumPriceToComplete.value = pricingData["MaximumPrice"];
            break;
        }
        switch (pricingData["organismPricingType"]) {
          case "Paie la totalité après déduction de la part usager":
            break;
          case "Prix fixe":
            organismPrixToComplete.value = pricingData["organismPrincingPrix"];
            break;
          case "Tarification par taux":
            organismTauxToComplete.value = pricingData["organismPricingTaux"];
            organismMinimumPriceToComplete.value = pricingData["MinimumPriceOrganism"];
            organismMaximumPriceToComplete.value = pricingData["MaximumPriceOrganism"];
            break;
        }

        const suggestion = {
          title: pricingData["Libellé"],
          fields: fieldsToComplete,
        };
        suggestions.push(suggestion);
      }

      const sortedSuggestions = suggestions.sort((suggA, suggB) =>
        suggA.title.localeCompare(suggB.title)
      );

      return sortedSuggestions;
    };

    const pricingDocuments = await getPricingDocuments();
    console.log("pricingDocuments", pricingDocuments);
    const suggestions = formatSuggestions(pricingDocuments);
    console.log("suggestions", suggestions);

    const searchValue = docData["Client_paye"];
    console.log("searchValue", searchValue);

    if (searchValue != undefined) {
        const filteredSuggestions = suggestions.filter(suggestions => 
                                    suggestions.title?.toLowerCase().includes(searchValue.toLowerCase()));
        return filteredSuggestions
    } else {
        return suggestions;
    }
  };
  const getDataForTauxChauffeur = async () => {
    const getTauxChauffeurDocuments = async () => {
      const pricingDate = getPricingDate();
      const tauxChauffeurAPIFilters = [
        {
          key: "FORMLAYOUTNAME",
          operator: "EQUALS",
          value: "Formule de rémunération",
          type: "TEXT",
        },
        {
          key: "STATUS",
          operator: "EQUALS",
          value: "ACTIF",
          type: "TEXT",
        },
        {
          key: "tauxChauffeurEndDate",
          operator: "BETWEEN",
          value: pricingDate + "|" + "9999-12-31",
          type: "DATE",
        },
        {
          key: "tauxChauffeurStartDate",
          operator: "BETWEEN",
          value: "0001-01-01" + "|" + pricingDate,
          type: "DATE",
        },
      ];
      const chauffeurDocuments = await getDocuments(tauxChauffeurAPIFilters);
      return chauffeurDocuments;
    };
    const formatDataForTauxChauffeur = (tauxDocuments) => {
      result = { TAUX_KM_Chauffeur: "", TotalChauffeur: "" };
      try {
        const firstTauxChauffeur = tauxDocuments[0];
        const tauxChauffeurData = JSON.parse(firstTauxChauffeur.data);
        const tauxChauffeur = tauxChauffeurData["TAUX_KM_Chauffeur"];
        if (docData["Total distance"])
          result["TotalChauffeur"] = tauxChauffeur * docData["Total distance"];
        result["TAUX_KM_Chauffeur"] = tauxChauffeur;
      } catch (error) {
        console.log("Erreur lors de la sélection du taux chauffeur :", error);
      }
      return result;
    };
    const tauxChauffeurDocuments = await getTauxChauffeurDocuments();
    return formatDataForTauxChauffeur(tauxChauffeurDocuments);
  };
  const pricingSuggestions = await getPricingSuggestions();
  //const dataForTauxChauffeur = await getDataForTauxChauffeur()

  callback({
    suggestions: {
      Client_paye: pricingSuggestions,
    },
    //data: dataForTauxChauffeur
  });
};

main();
