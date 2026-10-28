console.log("Function 370", context);

// CONSTANT
const YEARS_TO_ADD = 100;

// VARAIBLE
const {
  DateTime_Start,
  DateTime_End,
  Dates_DebutRec,
  Dates_FinRec,
  Dates_Multidates,
  Dates_TypeRéc,
  recurrenceExceptionDays,
  FORMID,
  FORMLAYOUTID,
  STATUS,
} = docData;

const newRecurrenceDate =
  store.pageContentStore.processData[0].edits["modifyRecurrenceDate"];

// SYNC FUNCTION
// returns true if the first date is on or before the second date
const datesAreInOrder = (date1, date2) => {
  // convert strings to Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // check that both dates are valid
  if (isNaN(d1) || isNaN(d2)) {
    console.log("date1", date1);
    console.log("date2", date2);
    throw new Error("One or both dates are invalid!");
  }

  // return true if date1 is before date2
  return d1 <= d2;
};

const datesIsEqual = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Vérification validité
  if (isNaN(d1) || isNaN(d2)) {
    console.log("date1", date1);
    console.log("date2", date2);
    throw new Error("One or both dates are invalid! 2");
  }

  return d1.getTime() === d2.getTime();
};

const addYears = (dateStr, yearsToAdd) => {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + yearsToAdd);
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
};

const getOccurrencesToDeleteAfterTheDate = async (date) => {
  const getOccurrenceDocumentsToSuppress = async (date) => {
    const apiFilters = [
      {
        key: "FormIDRecurrence",
        operator: "EQUALS",
        value: FORMID,
        type: "TEXT",
      },
      {
        key: "Dates_DateTransport",
        operator: "BETWEEN",
        value: `${date}|${addYears(date, YEARS_TO_ADD)}`,
        type: "DATE",
      },
      {
        key: "STATUS",
        operator: "NOTEQUALS",
        value: "SUPPRIMÉ",
        type: "TEXT",
      },
    ];
    const result = await getDocuments(apiFilters);
    return result;
  };
  const prepareDocumentsToDelete = (documents) => {
    const documentsToUpdate = [];
    for (const document of documents) {
      const documentToUpdate = {
        status: "SUPPRIMÉ",
        documentID: document.documentID,
        template: { templateId: FORMLAYOUTID },
      };
      documentsToUpdate.push(documentToUpdate);
    }
    return documentsToUpdate;
  };
  const occurrenceDocuments = await getOccurrenceDocumentsToSuppress(date);
  console.log("occurrenceDocuments", occurrenceDocuments);
  console.log("date", date);
  return prepareDocumentsToDelete(occurrenceDocuments);
};

const formatdocDataToDocumentData = (data) => {
  const DataCollection = (key, array) => {
    let result = {};
    let itemCount = array?.length;
    array.forEach((obj, index) => {
      Object.keys(obj).forEach((key) => {
        let newKey = `${key}|${index + 1}`;
        result[newKey] = obj[key];
      });
    });
    result[key] = itemCount.toString();
    return result;
  };

  const excludeKeys = (obj, keys) =>
    Object.keys(obj).reduce((result, key) => {
      if (!keys.includes(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data = { ...data, ...DataCollection(key, data[key]) };
    }
  });
  return JSON.stringify(excludeKeys(data, ["FORMID", "NUMBER"]));
};

const getNewRecurrenceValues = (newRecurrenceDate, splitRecurrenceData) => {
  switch (Dates_TypeRéc) {
    case "Par jour spécifique":
      const specificDays = Dates_Multidates.split("|");
      const actualRecurrenceSpecificDays = [];
      const newRecurrenceSpecificDays = [];
      for (const specificDay of specificDays) {
        if (specificDay < newRecurrenceDate) {
          actualRecurrenceSpecificDays.push(specificDay);
        } else {
          newRecurrenceSpecificDays.push(specificDay);
        }
      }
      splitRecurrenceData.actualRecurrenceDataToUpdate["Dates_Multidates"] =
        actualRecurrenceSpecificDays.join("|");
      splitRecurrenceData.newRecurrenceData["Dates_Multidates"] =
        newRecurrenceSpecificDays.join("|");
      break;
    case "Par semaine":
      const getPreviousDate = (dateString) => {
        const [year, month, day] = dateString.split("-").map(Number);
        const date = new Date(year, month - 1, day - 1);
        const YYYY = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, "0");
        const DD = String(date.getDate()).padStart(2, "0");
        return YYYY + "-" + MM + "-" + DD;
      };
        splitRecurrenceData.newRecurrenceData["IntervalleMensuel"] = null;
      splitRecurrenceData.newRecurrenceData["Dates_DebutRec"] =
        newRecurrenceDate;
      if (newRecurrenceDate === Dates_DebutRec)
        splitRecurrenceData.actualRecurrenceDataToUpdate["Dates_FinRec"] =
          Dates_FinRec;
      else
        splitRecurrenceData.actualRecurrenceDataToUpdate["Dates_FinRec"] =
          getPreviousDate(newRecurrenceDate);
      break;
    case "Par mois": {
        const getPreviousMonthEnd = (dateString) => {
            const [year, month] = dateString.split("-").map(Number);
            const date = new Date(Date.UTC(year, month - 1, 0)); // dernier jour du mois précédent
            const YYYY = date.getUTCFullYear();
            const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
            const DD = String(date.getUTCDate()).padStart(2, "0");
            return `${YYYY}-${MM}-${DD}`;
        };
        splitRecurrenceData.newRecurrenceData["IntervalleHebdomadaire"] = null;
        splitRecurrenceData.newRecurrenceData["Dates_DebutRec"] = newRecurrenceDate;
        if (newRecurrenceDate === Dates_DebutRec) {
            splitRecurrenceData.actualRecurrenceDataToUpdate["Dates_FinRec"] = Dates_FinRec;
        } else {
            splitRecurrenceData.actualRecurrenceDataToUpdate["Dates_FinRec"] =
            getPreviousMonthEnd(newRecurrenceDate);
        }
        break;
    }
  }
  return splitRecurrenceData;
};

const getSplitRecurrenceDocuments = (newRecurrenceDate) => {
  const splitRecurrenceData = {
    actualRecurrenceDataToUpdate: {},
    newRecurrenceData: structuredClone(docData),
  };
  const getNewExceptionValue = (newRecurrenceDate, splitRecurrenceData) => {
    const actualValue = recurrenceExceptionDays;
    const actualOccurrenceDays = actualValue.split("|");
    const upToDateOccurrenceDays = [];
    for (exceptionDay of actualOccurrenceDays) {
      if (exceptionDay < newRecurrenceDate) {
        upToDateOccurrenceDays.push(exceptionDay);
      }
    }
    splitRecurrenceData.newRecurrenceData["recurrenceExceptionDays"] = "";
    splitRecurrenceData.actualRecurrenceDataToUpdate[
      "recurrenceExceptionDays"
    ] = upToDateOccurrenceDays.join("|");
  };
  getNewRecurrenceValues(newRecurrenceDate, splitRecurrenceData);
  getNewExceptionValue(newRecurrenceDate, splitRecurrenceData);
  const recurrenceDocumentToUpdate = {
    data: formatdocDataToDocumentData(
      splitRecurrenceData.actualRecurrenceDataToUpdate
    ),
    status: STATUS,
    active: true,
    template: { templateId: FORMLAYOUTID },
    documentID: FORMID,
  };
  const newRecurrenceDocumentToCreate = {
    data: formatdocDataToDocumentData(splitRecurrenceData.newRecurrenceData), // object of the keys from the Field DB and its new value
    status: STATUS, // key from Status FormLayout
    active: true,
    template: { templateId: FORMLAYOUTID }, // id from DB FormLayout
  };
  return {
    recurrenceDocumentToUpdate: recurrenceDocumentToUpdate,
    newRecurrenceDocumentToCreate: newRecurrenceDocumentToCreate,
  };
};

const getCurrentDocument = (newRecurrenceDate) => {
  const splitRecurrenceData = {
    actualRecurrenceDataToUpdate: {},
    newRecurrenceData: structuredClone(docData),
  };
  getNewRecurrenceValues(newRecurrenceDate, splitRecurrenceData);

  return {
    data: formatdocDataToDocumentData({
      ...splitRecurrenceData.newRecurrenceData,
      recurrenceExceptionDays: "",
    }),
    status: STATUS,
    active: true,
    template: { templateId: FORMLAYOUTID },
    documentID: FORMID,
  };
};

// ASYNC FUNCTION
const { createDocuments, getDocuments, updateDocuments } = fasterApi(
  api({ local: true })
); // API defined in a static file

// MAIN
const main = async () => {
  showPopupLoading("Modification de la récurrence");
  try {
    const startDate = DateTime_Start.split("T")[0];

    if (datesAreInOrder(startDate, newRecurrenceDate)) {
      const documentsToUpdate = [];
      const documentsToCreate = [];
      // Step 1 : get all the occurrence to suppress after this date
      documentsToUpdate.push(
        ...(await getOccurrencesToDeleteAfterTheDate(newRecurrenceDate))
      );

      if (datesIsEqual(startDate, newRecurrenceDate)) {
        // Step 2 (a) : modify current recurrence document
        const currentDocument = getCurrentDocument(newRecurrenceDate);
        documentsToUpdate.push(currentDocument);
      } else {
        // Step 2 (b) : split recurence document
        const splitRecurrenceDocument =
          getSplitRecurrenceDocuments(newRecurrenceDate);

        if (
          Dates_TypeRéc !== "Par semaine" ||
          newRecurrenceDate !== Dates_DebutRec
        )
          documentsToCreate.push(
            splitRecurrenceDocument.newRecurrenceDocumentToCreate
          );
        documentsToUpdate.push(
          splitRecurrenceDocument.recurrenceDocumentToUpdate
        );
      }

      for (const doc of documentsToUpdate) {
        //const data = JSON.parse(doc.data)
        console.log(doc);
        if (
          doc.status === "RECURRENCE" &&
          !JSON.parse(doc.data)["Dates_Multidates"] &&
          !JSON.parse(doc.data)["Dates_FinRec"] &&
          !JSON.parse(doc.data)["Dates_DebutRec"]
        ) {
          console.log(doc);
          doc.status = "SUPPRIMÉ";
        }
      }
      // Step 3 : create a new recurrence document
      console.log("after update", documentsToUpdate);
      console.log("documentsToCreate", documentsToCreate);
      if (documentsToCreate.length > 0)
        await createDocuments(documentsToCreate);
      await updateDocuments(documentsToUpdate);

      //   // Step 4 : Redirect
      redirectToViewGroup();
    } else {
      showErrorBanner(
        "Mise à jour de la date impossible car la nouvelle date de réinitialisation est avant la date de début"
      );
    }
  } catch (error) {
    console.log("Error during function 370 :", error);
  }
  hidePopupLoading();
};

main();
