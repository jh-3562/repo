console.log("Function 117", context);

function getInfos() {
  const date = docData.Planification_Date;
  const heureDebut = docData.CC_Récupération;

  let heureFin;
  if (docData.CC_Retour == "true") {
    heureFin = docData.CC_Arrivée ? docData.CC_Arrivée : `23:59`;
  } else {
    heureFin =
      docData.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
        "CC_Destinations|400|Début de RDV"
      ] ||
      docData?.CC_Destinations?.[docData.CC_Destinations.length - 1]?.[
        "CC_Destinations|300|Arrivée"
      ];
  }

  // Construction des Date objets sécurisés
  let dateavecHeureDebut = new Date(`${date}T${heureDebut || "00:00"}:00`);
  let dateavecHeureFin = new Date(`${date}T${heureFin || "00:00"}:00`);

  // Formater la date et l'heure selon l'heure locale
  function formatDateLocal(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Mois de 1 à 12
    const day = String(dateObj.getDate()).padStart(2, "0"); // Jour de 1 à 31
    const hours = String(dateObj.getHours()).padStart(2, "0"); // Heures de 00 à 23
    const minutes = String(dateObj.getMinutes()).padStart(2, "0"); // Minutes de 00 à 59

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  if (
    docData.Planification_Récurrence == "Une seule fois" ||
    docData.IdentifiantFormulaireRécurrence
  ) {
    if (date && heureDebut && heureFin) {
      return {
        InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
          ? `${date}T23:59:00`
          : formatDateLocal(dateavecHeureDebut),
        InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
          ? `${date}T23:59:00`
          : formatDateLocal(dateavecHeureFin),
      };
    }
  } else {
    if (docData.Planification_Récurrence == "Par semaine") {
      if (docData.Planification_DateFin) {
        const dateFin = docData.Planification_DateFin;
        dateavecHeureFin = new Date(`${dateFin}T${heureFin || "00"}:00`);
        console.log("DATE AVC HEURE ", dateavecHeureFin);
        return {
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureFin),
        };
      } else {
        return {
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
        };
      }
    } else if (docData.Planification_Récurrence == "Par jour spécifique") {
      if (docData.Planification_MultiDate) {
        const date = docData.Planification_MultiDate.split("|")[0];
        const multiDate = docData.Planification_MultiDate.split("|");
        const latestDate = multiDate.reduce((latest, current) =>
          new Date(current) > new Date(latest) ? current : latest,
        );
        const earliestDate = multiDate.reduce((earliest, current) =>
          new Date(current) < new Date(earliest) ? current : earliest,
        );

        dateavecHeureDebut = new Date(
          `${earliestDate}T${heureDebut || "00:00"}:00`,
        );
        dateavecHeureFin = new Date(`${latestDate}T${heureFin || "00:00"}:00`);

        return {
          Planification_Date: date,
          InformationsAdmin_DateHeureDébut: isNaN(dateavecHeureDebut)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureDebut),
          InformationsAdmin_DateHeureFin: isNaN(dateavecHeureFin)
            ? `${date}T23:59:00`
            : formatDateLocal(dateavecHeureFin),
        };
      }
    }
  }

  // Fallback final
  return {
    InformationsAdmin_DateHeureDébut: `${date}T00:01:00`,
    InformationsAdmin_DateHeureFin: `${date}T23:59:00`,
  };
}

const result = getInfos();
console.log("result ========", result);
return result;
