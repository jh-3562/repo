console.log("Function 122", context);

const recurrence = {
  formatApiFilter(apiFilters, dateWindow) {
    const rangeDateDebut = "0001-01-01|" + dateWindow[1];
    const rangeDateFin = dateWindow[0] + "|9999-12-31";

    return [
      ...apiFilters,
      {
        key: "InformationsAdmin_DateHeureDébut",
        operator: "BETWEEN",
        value: rangeDateDebut,
        type: "DATETIME",
      },
      {
        key: "InformationsAdmin_DateHeureFin",
        operator: "BETWEEN",
        value: rangeDateFin,
        type: "DATETIME",
      },
    ];
  },

  /**
   * Check if the fieldValue obtained thanks to data[fieldKey]
   * represent an empty field.
   * @param {string} fieldValue
   * @returns {bool}
   */
  fieldIsEmpty(fieldValue) {
    return [undefined, ""].includes(fieldValue);
  },

  /**
   * This function check if a form is a row or a document in order to treat it correctly
   * Example 1: The formID is kept with the key 'key' in a row but in a document
   * it is the key 'documentID'
   * Example 2: document data is exhaustive but row data only contains the data of the grid.
   * @param {object} form
   * @returns {string}
   */
  isDocumentOrRow(form) {
    let result = undefined;
    if ("rowID" in form) {
      result = "row";
    } else if ("documentID" in form) {
      result = "document";
    }
    return result;
  },

  /**
   * Returns the maximum of the 2 strings that are in input.
   * @param {string} str_1
   * @param {string} str_2
   * @returns {string}
   */
  maxDateString(str_1, str_2) {
    let result;
    result = str_1;
    if (str_1 <= str_2) {
      result = str_2;
    }
    return result;
  },

  /**
   * Returns the minimum of the 2 strings that are in input.
   * @param {string} str_1
   * @param {string} str_2
   * @returns {string}
   */
  minString(str_1, str_2) {
    let result = str_1;
    if (str_2 <= str_1) {
      result = str_2;
    }
    return result;
  },

  /**
   * This function takes french week days as a parameter and returns their indices
   * @param {string} multiselectFieldValue
   * @returns {array}
   */
  getFrenchWeekDayIndices(multiselectFieldValue) {
    let result = []; // FIX: ajout de let
    // FIX: validation du type
    if (typeof multiselectFieldValue !== "string") {
      console.warn(
        "Valeur invalide pour Planification_Répéter :",
        multiselectFieldValue
      );
      return result;
    }
    let frenchDays = multiselectFieldValue.split("|"); // FIX: ajout de let
    const frenchDayIndexMapping = {
      Dimanche: 0,
      Lundi: 1,
      Mardi: 2,
      Mercredi: 3,
      Jeudi: 4,
      Vendredi: 5,
      Samedi: 6,
    };
    for (const frenchDay of frenchDays) {
      if (frenchDay in frenchDayIndexMapping) {
        result.push(frenchDayIndexMapping[frenchDay]);
      } else {
        console.error(`${frenchDay} is unknown from frenchDayIndexMapping`); // FIX: template literal
      }
    }
    return result;
  },

  /**
   * Returns whether or not, the specified document needs to be interpreted in order to extract occurences
   * @param {*} data
   */
  needsInterpretation(data) {
    const isGeneratedOccurrence = !this.fieldIsEmpty(
      data["IdentifiantFormulaireRécurrence"]
    );
    const isSingleForm =
      this.fieldIsEmpty(data["Planification_Récurrence"]) ||
      data["Planification_Récurrence"] === "Une seule fois";
    return !(isGeneratedOccurrence || isSingleForm);
  },

  /**
   * Returns a list with the occurrence documents
   * @param {object} formToInterpret - The document that needs to be interpreted
   * @param {array} stringDates - The dates on which we want to create an occurrence
   * @returns {array}
   */
  formatOccurrenceForms(formToInterpret, stringDates) {
    let sourceFormId;
    switch (this.isDocumentOrRow(formToInterpret)) {
      case "row":
        sourceFormId = formToInterpret.key;
        break;
      case "document":
        sourceFormId = formToInterpret.documentID;
        break;
      default:
        console.error(
          "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
          formatedForm
        );
    }

    const data =
      typeof formToInterpret.data === "string"
        ? JSON.parse(formToInterpret.data)
        : formToInterpret.data;
    const result = [];
    const exceptions = data.Exception_Récurrence
      ? data.Exception_Récurrence.split("|").map(
          (date) => new Date(date).toISOString().split("T")[0]
        )
      : [];

    const heureDebut =
      data.Planification_HeureDébut ||
      data.InformationsAdmin_DateHeureDébut.split("T")[1].slice(0, 5);
    const heureFin =
      data.Planification_HeureFin ||
      data.InformationsAdmin_DateHeureFin.split("T")[1].slice(0, 5);

    for (const stringDate of stringDates) {
      const dateavecHeureDebut = stringDate + "T" + heureDebut + ":00";
      const dateavecHeureFin = stringDate + "T" + heureFin + ":00";
      if (!exceptions.includes(stringDate)) {
        const newData = {
          ...data,
          IdentifiantFormulaireRécurrence: sourceFormId,
          Planification_Récurrence: "Une seule fois",
          Planification_Date: stringDate,
          InformationsAdmin_DateHeureDébut: dateavecHeureDebut, // For display on timeline/agenda
          InformationsAdmin_DateHeureFin: dateavecHeureFin, // For display on timeline/agenda
        };
        result.push({
          ...formToInterpret,
          data: JSON.stringify(newData),
          doesExist: false,
          occurrenceDate: stringDate, // To identify the occurrence
          sourceForm: formToInterpret,
        });
      }
    }
    return result;
  },

  /**
   * Interpret documents that can be recurrences in order to get all the occurrences
   * @param {array} documents
   * @param {array} dateWindow
   * @returns
   */
  interpretForms(documents, dateWindow) {
    const formatedDocuments = [];
    // Loop over all documents in order to interpret them
    documents.forEach((document, index) => {
      const data =
        typeof document.data === "string"
          ? JSON.parse(document.data)
          : document.data;

      // Vérification : si les deux sources pour l'heure de début ou pour l'heure de fin sont absentes, on passe au document suivant.
      if (
        (data.Planification_HeureDébut ||
          data.InformationsAdmin_DateHeureDébut) &&
        (data.Planification_HeureFin || data.InformationsAdmin_DateHeureFin)
      ) {
        if (!this.needsInterpretation(data)) {
          console.log(
            "data of document that do not need interpretation:",
            data
          );
          formatedDocuments.push({
            ...document,
            data: JSON.stringify(data),
            doesExist: true,
          });
        } else {
          if (data.Planification_Récurrence === "Par jour spécifique") {
            const occurrenceDates = data.Planification_MultiDate.split("|");
            const validOccurrencesDates = occurrenceDates.filter(
              (date) => dateWindow[0] <= date && date <= dateWindow[1]
            );

            formatedDocuments.push(
              ...this.formatOccurrenceForms(document, validOccurrencesDates)
            );
          } else if (data.Planification_Récurrence === "Par semaine") {
            const occurrenceDates = [];
            const recurrenceStartDate = this.fieldIsEmpty(
              data.Planification_Date
            )
              ? "0001-01-01"
              : data.Planification_Date;
            const recurrenceEndDate = this.fieldIsEmpty(
              data.Planification_DateFin
            )
              ? "9999-01-01"
              : data.Planification_DateFin;
            const occurrencesToGenerateDateWindow = [
              new Date(this.maxDateString(recurrenceStartDate, dateWindow[0])),
              new Date(this.minString(recurrenceEndDate, dateWindow[1])),
            ];
            let currentDate = new Date(occurrencesToGenerateDateWindow[0]); // Copy the date window start
            // Find the dates where an occurrence should be generated
            while (currentDate <= occurrencesToGenerateDateWindow[1]) {
              // Test if the date day match the recurrence days in order to
              // know if we need to create a occurence at this date
              if (
                this.getFrenchWeekDayIndices(
                  data.Planification_Répéter
                ).includes(currentDate.getUTCDay())
              ) {
                occurrenceDates.push(currentDate.toISOString().split("T")[0]);
              }
              // condition to pass to the next day
              currentDate.setDate(currentDate.getDate() + 1);
            }
            formatedDocuments.push(
              ...this.formatOccurrenceForms(document, occurrenceDates)
            );
          } else {
            console.error(
              `${data.Planification_Récurrence} is not known as a recurrence rule` // FIX: template literal
            );
          }
        }
      }
    });

    return {
      documents: formatedDocuments,
    };
  },

  /**
   * Gather documents that can be recurrences and interpret them in order to return the occurences
   * @param {*} filters
   * @param {*} dateWindow
   * @returns
   */
  async getDocuments(filters, dateWindow, api) {
    let apiFilters = filters;
    if (dateWindow !== null) {
      apiFilters = this.formatApiFilter(filters, dateWindow);
    }

    // Step 2 : Get the document with the document/id/filter api
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res.data.ids;

    console.log("documentsID to interpret", res);

    // Step 3 : Get the documents data with the document/id api
    const documentsToInterpret = (
      await api({ local: true }).post("document/id", { ids: ids })
    ).data.documents;

    console.log("document to interpret", documentsToInterpret);

    console.log(
      "datas of documents that needs to be interpreted",
      documentsToInterpret.map((document) => JSON.parse(document.data))
    );

    // Step 4 : Interpret the documents thanks to the dateWindow
    return { data: this.interpretForms(documentsToInterpret, dateWindow) };
    // returns a list of documents.
    // one document = {
    // data,
    // documentID, -> real documentID if doesExist, recurrence documentID if not.
    // ...
    // doesExist : bool
    // }
  },

  /**
   * Takes interpreted forms as input and make sure every form exists in the database.
   * Indeed, if the form doesn't exist in the database, this function creates it.
   * This is a usefull operation to do before any manipulation on forms that need to exist in the database.
   * @param {objects[]} interpretedForms
   * @returns {objects[]} existing forms
   */
  async createFormsIfNeeded(interpretedForms, api) {
    const createInterpretedDocuments = async (interpretedDocuments) => {
      const documentsToCreateWithAPI = interpretedDocuments.map(
        (interpretedDocument) => {
          const parsedData =
            typeof interpretedDocument.data === "string"
              ? JSON.parse(interpretedDocument.data)
              : interpretedDocument.data;
          const dataWithOccurrenceFlag = {
            ...parsedData,
            isOccurence: true,
          };
          return {
            data: JSON.stringify(dataWithOccurrenceFlag),
            status: "Draft", // Set the status to Draft first. Thus it has no incidence until we set the status to the good one.
            active: true,
            template: interpretedDocument.template,
          };
        }
      );
      return await api({ local: true }).post("document/Many", {
        documents: documentsToCreateWithAPI,
      });
    };

    const result = [];

    const interpretedDocumentsToCreate = [];

    const prepareDataRows = [];
    // Step 1: Sort forms into different lists in order to process them differently depending of their category
    for (const formatedForm of interpretedForms) {
      if (formatedForm.doesExist) {
        result.push(formatedForm);
      } else {
        switch (this.isDocumentOrRow(formatedForm)) {
          case "row":
            prepareDataRows.push(formatedForm);
            break;
          case "document":
            interpretedDocumentsToCreate.push(formatedForm);
            break;
          default:
            console.error(
              "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
              formatedForm
            );
        }
      }
    }
    // Step 2 : Special step for prepareData rows only :
    // Gather documents data for prepareData rows because rows don't contain all
    // the documents data but only what is specified in the grid columns.
    if (prepareDataRows.length > 0) {
      const formIdsToGather = prepareDataRows.map(
        (formatedRowToProcess) => formatedRowToProcess.sourceForm.key
      );
      const prepareDataRowsSourceDocuments = (
        await api({ local: true }).post(`document/id`, { ids: formIdsToGather })
      ).data.documents;

      console.log(
        "formatedRowsTopProcessDocuments :",
        prepareDataRowsSourceDocuments
      );

      for (const prepareDataRowSourceDocument of prepareDataRowsSourceDocuments) {
        const prepareDataRow = prepareDataRows.find(
          (formatedRowToProcess) =>
            formatedRowToProcess.key === prepareDataRowSourceDocument.documentID
        );
        console.log("found formatedRowToProcess", prepareDataRow);
        console.log("occurrenceDate", prepareDataRow.occurrenceDate);

        // Interpret a second time the row even if prepareData did it one time in order to get the
        // data of the row interpreted in the recurrence context and not especially in the prepareData
        // context of the viewcontent.
        // Example : prepareData can change the row after the interpretation of the source form as
        // the start and end datetimes, duplicating the row etc...
        const interpretedDocument = this.interpretForms(
          [prepareDataRowSourceDocument],
          [prepareDataRow.occurrenceDate, prepareDataRow.occurrenceDate]
        ).documents[0];
        console.log("interpretedDocument", interpretedDocument);
        interpretedDocumentsToCreate.push(interpretedDocument);
      }
    }

    // Step 3 : Create the occurence forms if needed

    if (interpretedDocumentsToCreate.length > 0) {
      const documentCreationAPIAnswer = await createInterpretedDocuments(
        interpretedDocumentsToCreate
      );

      console.log("createdDocuments", documentCreationAPIAnswer);

      // Step 3.1 : Update the known documents in order to add them to the list of documents
      const createdDocuments = interpretedDocumentsToCreate;
      for (const [
        index,
        createdDocument,
      ] of documentCreationAPIAnswer.data.docs.entries()) {
        createdDocuments[index].documentID = createdDocument.docID;
        createdDocuments[index].number = createdDocument.number;
        createdDocuments[index].doesExist = true;
      }
      result.push(...createdDocuments);

      // Step 3.2 : Update the occurence forms to the good status and the 'Exception' field of
      // the recurrence form
      const documentsToUpdate = [];
      for (const createdDocument of createdDocuments) {
        // Update the recurrence form Exception field in order to interpret
        // them correctly in futur interpretations
        const recurrenceDocumentToUpdateId =
          createdDocument.sourceForm.documentID;
        let recurrenceDocumentToUpdate = documentsToUpdate.find(
          (doc) => doc.documentID === recurrenceDocumentToUpdateId
        );
        if (recurrenceDocumentToUpdate === undefined) {
          console.log("createdDocument", createdDocument);
          const sourceFormData = JSON.parse(createdDocument.sourceForm.data);
          const oldExceptionValue =
            "Exception_Récurrence" in sourceFormData
              ? sourceFormData["Exception_Récurrence"]
              : "";
          console.log("oldExceptionValue", oldExceptionValue);
          recurrenceDocumentToUpdate = {
            data: JSON.stringify({ Exception_Récurrence: oldExceptionValue }), // object of the keys from the Field DB and its new value
            status: createdDocument.sourceForm.status, // key from Status FormLayout
            active: true,
            template: createdDocument.sourceForm.template, // id from DB FormLayout
            documentID: createdDocument.sourceForm.documentID, // FormID from DB Form
          };
          documentsToUpdate.push(recurrenceDocumentToUpdate);
        }
        let recurrenceDocumentToUpdateData = JSON.parse(
          recurrenceDocumentToUpdate.data
        );
        if (
          this.fieldIsEmpty(
            recurrenceDocumentToUpdateData["Exception_Récurrence"]
          )
        ) {
          recurrenceDocumentToUpdateData["Exception_Récurrence"] =
            createdDocument.occurrenceDate;
        } else {
          recurrenceDocumentToUpdateData["Exception_Récurrence"] +=
            "|" + createdDocument.occurrenceDate;
        }
        recurrenceDocumentToUpdate.data = JSON.stringify(
          recurrenceDocumentToUpdateData
        );

        console.log(
          "createdDocument.occurrenceDate :",
          createdDocument.occurrenceDate
        );
        console.log("recurrenceDocumentToUpdate", recurrenceDocumentToUpdate);

        // Update the occurrence form to the good status instead of Draft at the same time in order
        // to make sure that even if this update fails, the users are not impact. Indeed, the created forms will stay
        // at draft status.
        const occurrenceDocumentToUpdate = {
          status: createdDocument.status,
          active: true,
          template: createdDocument.template,
          documentID: createdDocument.documentID,
        };
        documentsToUpdate.push(occurrenceDocumentToUpdate);
      }
      console.log("documentsToUpdate :", documentsToUpdate);

      try {
        const updateResponse = await api({ local: true })
          .put("document/Many", {
            documents: documentsToUpdate,
          })
          .catch((error) =>
            console.error(
              "An error has occured during updating the forms :",
              error
            )
          );
        console.log("updateResponse", updateResponse);
      } catch (error) {
        console.error(
          "An error has occured during updating the forms :",
          error
        );
      }
    }

    return result;
  },
};



// Copy past the folowing code in a function to start using apis with recurrence

// Note:
// 1. Use these functions with prepareData only if the grid autorefresh

const main = async () => {
  console.log("context :", context);
  const clickedFormId = store.pageContentStore?.active[0];
  const interpretedForm = store.pageContentStore.prepareDataRows.find(
    (row) => row.rowID === clickedFormId,
  );

  console.log("clicked on form :", interpretedForm);
  if (!interpretedForm) {
    console.error("Aucune donnée trouvée pour l'ID :", clickedFormId);
    return;
  }

  // Make sure the form exists in order to be able to redirect the user to its web page.
  const existingForm = (
    await recurrence.createFormsIfNeeded([interpretedForm], api)
  )[0];

  console.log("existingForm :", existingForm);
  let url_id;
  switch (recurrence.isDocumentOrRow(existingForm)) {
    case "document":
      url_id = existingForm.documentID;
      break;
    case "row":
      url_id = existingForm.key;
      break;
    default:
      console.error(
        "The folowing formated form is neither recognised as a row nor a document and therefore cannot be processed",
        formatedForm,
      );
  }

  const url = new URL(window.location.href);

  // On récupère les segments de chemin (ex: ["", "mcr.arlon", "tableaudebord", "abc", "def"])
  const segments = url.pathname.split("/");

  // Cherche l'index du segment MCR (ex: "mcr.arlon")
  const mcrIndex = segments.findIndex((seg) => seg.startsWith("mcr."));

  if (mcrIndex !== -1) {
    const mcrSegment = segments[mcrIndex];
    const section = segments[mcrIndex + 1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base : /mcr.arlon/volontaires ou /mcr.arlon/tableaudebord
    const newPath = `/${mcrSegment}/${section}/${url_id}`;
    url.pathname = newPath;

    window.open(url.toString(), "_blank");
  } else {
    const section = segments[1]; // ex: "volontaires" ou "tableaudebord"

    // Nouvelle base sans MCR : /volontaires ou /tableaudebord
    const newPath = `/${section}/${url_id}`;
    url.pathname = newPath;

    window.open(url.toString(), "_blank");
  }
};

main();
