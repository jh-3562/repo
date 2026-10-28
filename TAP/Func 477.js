console.log("Function 477", context);

const headerMap = {
   Dates_DateTransport: "Date",
   "CollectionClientsTA|4|TypeTransportTA": "Type de transport",
   "Contrainte|2|NomClient": "Client",
   Telephones: "Téléphone(s)",
   EtablissementDest_HeureRDV: "RDV",
   Etablissement_Adresse: "Adresse origine",
   AdresseDestination2: "Adresse de l'arrêt",
   EtablissementDest_Adresse: "Adresse destination",
   Appareil_liste: "Appareil(s)",
   NombreAccompagnant: "Nb accomp.",
   Dons_client: "Parts d'usager",
   InfosSup_Feuille: "Feuille",
   CommentaireTransport: "Commentaires transport",
};

// Triggers the download of the XLSX file
const downloadXLSX = (url, filename = "FeuilleDeRoute.pdf") => {
   const link = document.createElement("a");
   link.href = url;
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
};

const convertToExcel = async (tableData, title = "") => {
   const request = {
      sheets: [
         {
            name: "Feuil1",
            datas: [`{'Title': '${title}'}`],
            sheetNames: ["Dispo"],
            tableDatas: [[tableData]],
         },
      ],
   };

   try {
      console.log(request);
      const res = await api({ local: true }).post(
         `/document/download/sheets/FeuilleDeRoute/pdf/Feuille_${title.trim().split(/\s+/).join("_")}`,
         request,
      );
      console.log("API RESPONSE: ", res);
      const url = res.data.fileUrl;
      //downloadXLSX(url);
      return url;
   } catch (error) {
      console.error("Erreur lors de la création du fichier: ", error);
   }
};

const formatToAPI = (documents) => {
   const headers = [
      "Dates_DateTransport",
      "CollectionClientsTA|4|TypeTransportTA",
      "Contrainte|2|NomClient",
      "Telephones",
      "EtablissementDest_HeureRDV",
      "Etablissement_Adresse",
      "AdresseDestination2",
      "EtablissementDest_Adresse",
      "Appareil_liste",
      "NombreAccompagnant",
      "Dons_client",
      "InfosSup_Feuille",
      "CommentaireTransport",
   ];

   const replacer = (key, value) => value ?? "";
   const contents = documents.map((doc) =>
      headers.map((fieldKey) => {
         if (fieldKey === "Telephones") {
            const t1 = doc["Telephone1"];
            const t2 = doc["Telephone2"];
            return [t1, t2].filter(Boolean).join("\n");
         }
         return JSON.stringify(doc[fieldKey], replacer).replace(/"/g, "");
      }),
   );

   return {
      headers: headers.map((key) => headerMap[key]),
      rows: contents,
   };
};

const getDocuments = async (arrApiFilters) => {
   const filterResponseData = await api({ local: true }).post("document/id/filter", {
      filters: arrApiFilters,
   });
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

   return documentResponseData.data.documents.map((doc) => ({
      ...doc,
      data: JSON.parse(doc.data),
   }));
};

const date = store.pageContentStore.processData[0].edits.IntervalleDate;

const apiFilters = [
   {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: "Transport de groupe",
      type: "TEXT",
   },
   { key: "STATUS", operator: "NOTIN", value: "SUPPRIMÉ", type: "TEXT" },
   {
      key: "Dates_DateTransport",
      operator: "BETWEEN",
      value: date,
      type: "DATE",
   },
];

const main = async () => {
   console.log("FDR", context);
   const docs = await getDocuments(apiFilters);
   console.log("Transports", docs);

   // ► Determine max number of stops across ALL docs
   let maxStops = 0;
   for (const d of docs) {
      const data = d.data || {};
      const declared = parseInt(data.StopoverLocations, 10);
      // Also scan actual keys to be safe
      const highestKeyIdx = Object.keys(data).reduce((acc, k) => {
         const m = k.match(/^StopoverLocations\|100\|Address\|(\d+)$/);
         return m ? Math.max(acc, Number(m[1])) : acc;
      }, 0);
      const n = isNaN(declared) ? highestKeyIdx : Math.max(declared, highestKeyIdx);
      if (n > maxStops) maxStops = n;
   }

   // ► Add only that many stop columns to headerMap
   for (let i = 1; i <= maxStops; i++) {
      headerMap[`StopoverLocations|100|Address|${i}`] = `Adresse arrêt ${i}`;
   }

   const byRoute = Object.groupBy(docs, (doc) => doc.data["Contrainte|1|Chauffeur"]);
   const mapList = [];
   console.log("Par chauffeur", byRoute);

   for (const [key, value] of Object.entries(byRoute)) {
      const chauffeurFilter = [
         {
            key: "FORMLAYOUTNAME",
            operator: "EQUALS",
            value: "Chauffeur",
            type: "TEXT",
         },
         {
            key: "Contrainte|1|Chauffeur",
            operator: "EQUALS",
            value: key,
            type: "TEXT",
         },
      ];

      if (value[0].data["TypeTransport"] === "ALLER" || value[0].data["TypeTransport"] === "RETOUR") {
         value[0].data["Distance"] = value[0].data["KM_TH"];
      } else {
         value[0].data["Distance"] = value[0].data["KM_THEORIQUE"];
      }

      const chauffeur = await getDocuments(chauffeurFilter);
      console.log("Chauffeur", chauffeur);
      const add = { Chauffeur: key };
      if (chauffeur.length)
         add.mail = chauffeur[0].data["Chauffeur_email"] || "firas.argoubi@fastercom.app";

      const url = await convertToExcel(formatToAPI(value.map((doc) => doc.data)), key);
      add.url = url;
      console.log(url);
      mapList.push(add);
   }

   api()
      .post(N8N_LINK_ENVOYER_FEUILLE + `?date=${date}&type=fdr`, mapList)
      .then(() => console.log("Demande d'envoi des feuilles de routes envoyée"));
};

main();
