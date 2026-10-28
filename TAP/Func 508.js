console.log("Function 508", context);

// VARIABLE
const {
  Dates_DebutRec,
  Dates_FinRec,
  recurrenceExceptionDays,
  FORMID,
  FORMLAYOUTID,
  STATUS,
} = docData;

const newRecurrenceDate =
  store.pageContentStore.processData[0].edits["modifyRecurrenceDate"];

const apifilters = [
  {
    key: "FormIDRecurrence",
    operator: "EQUALS",
    value: FORMID,
    type: "TEXT",
  },
  {
    key: "STATUS",
    operator: "NOTEQUALS",
    value: "SUPPRIMÉ",
    type: "DATE",
  },
];

// SYNCH FUNCTION
const addOneDay = (dateString) => {
  const parts = dateString.split("-");
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  date.setUTCDate(date.getUTCDate() + 1);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const datesAreInOrder = (date1, date2) => {
  // convert strings to Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // check that both dates are valid
  if (isNaN(d1) || isNaN(d2)) {
    throw new Error("One or both dates are invalid!");
  }

  // return true if date1 is before date2
  return d1 <= d2;
};

const filterDatesBeforeOrEqual = (datesString, referenceDate) => {
  const ref = new Date(referenceDate);
  console.log("ref", ref);
  return datesString
    .split("|")
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d) && d <= ref)
    .map((d) => d.toISOString().split("T")[0])
    .join("|");
};

const getOccurrenceDocumentsToSuppress = (occurrences) => {
  return occurrences.map((occurrence) => {
    return {
      data: JSON.stringify({}),
      status: "SUPPRIMÉ",
      active: true,
      template: { templateId: FORMLAYOUTID },
      documentID: occurrence.documentID,
    };
  });
};

// ASYNC FUNCTION
const { getDocuments, updateDocuments } = fasterApi(api({ local: true })); // API defined in a static file

// MAIN
const main = async () => {
  showPopupLoading("Mettre une date de fin à la récurrence");
  try {
    if (datesAreInOrder(Dates_DebutRec, newRecurrenceDate)) {
      const documentsToUpdate = [];
      if (datesAreInOrder(Dates_FinRec, newRecurrenceDate)) {
        // if the new date is after the existing date, we update directly
        documentsToUpdate.push({
          data: JSON.stringify({ Dates_FinRec: newRecurrenceDate }),
          status: STATUS,
          active: true,
          template: { templateId: FORMLAYOUTID },
          documentID: FORMID,
        });
      } else {
        // otherwise, we retrieve the occurrences to remove
        const occurrences = await getDocuments([
          ...apifilters,
          {
            key: "Dates_DateTransport",
            operator: "BETWEEN",
            value: addOneDay(newRecurrenceDate) + "|" + Dates_FinRec,
            type: "DATE",
          },
        ]);
        const canDelete = !occurrences.some(
          (obj) => obj.status === "EXPORTÉ(E)"
        );

        if (canDelete) {
          // remove occurrences that are after the newRecurrenceDate
          const occurencesToSuppress = await getOccurrenceDocumentsToSuppress(
            occurrences
          );
          documentsToUpdate.push(...occurencesToSuppress);

          // update recurrence
          const newRecurrenceExceptionDays = filterDatesBeforeOrEqual(
            recurrenceExceptionDays,
            newRecurrenceDate
          );
          documentsToUpdate.push({
            data: JSON.stringify({
              Dates_FinRec: newRecurrenceDate,
              recurrenceExceptionDays: newRecurrenceExceptionDays,
              DateTime_End: newRecurrenceDate + "T" + "23:59:59",
            }),
            status: STATUS,
            active: true,
            template: { templateId: FORMLAYOUTID },
            documentID: FORMID,
          });
        } else {
          showErrorBanner(
            "Mise à jour de la date de fin impossible, contient des occurrences exportées"
          );
        }
      }
      console.log("documentsToUpdate", documentsToUpdate);
      await updateDocuments(documentsToUpdate);

      // redirect
      redirectToViewGroup();
    } else {
      showErrorBanner(
        "Mise à jour de la date impossible car la nouvelle date de fin est avant la date de début"
      );
    }
    hidePopupLoading();
  } catch (error) {
    console.log("Error during function 508 :", error);
  }
};
main();
